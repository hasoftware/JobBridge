const bcrypt = require("bcrypt")
const crypto = require("crypto")
const jwt = require("jsonwebtoken")

const pool = require("../../config/db")
const { jwt: jwtConfig } = require("../../config")
const { sendEmail, otpEmailHtml } = require("../utils/email")

const VALID_OTP_PURPOSES = ["email_verify", "password_reset", "2fa_login"]

const toPostgresInterval = (expiry) => {
    const units = {
        s: "seconds",
        m: "minutes",
        h: "hours",
        d: "days",
    }
    const value = parseInt(expiry)
    const unit = expiry.slice(-1)
    return `${value} ${units[unit]}`
}

const registerUser = async ({ email, password, role }) => {
    let client
    try {
        client = await pool.connect()
        await client.query("BEGIN")

        const existing = await client.query("SELECT id FROM users WHERE email=$1", [email])

        if (existing.rows.length > 0) {
            throw { status: 400, message: "Email already registered" }
        }

        const hash = await bcrypt.hash(password, 10)
        const result = await client.query("INSERT INTO users(email, password_hash, role) VALUES($1,$2,$3) RETURNING id, email, role", [
            email,
            hash,
            role,
        ])

        const userId = result.rows[0].id

        if (role === "job_seeker") {
            await client.query("INSERT INTO candidate_profiles (user_id) VALUES ($1)", [userId])
        } else if (role === "recruiter") {
            await client.query("INSERT INTO companies (user_id) VALUES ($1)", [userId])
        }

        await client.query("COMMIT")
        return result.rows[0]
    } catch (err) {
        if (client) await client.query("ROLLBACK")
        throw err
    } finally {
        if (client) client.release()
    }
}

const loginUser = async ({ email, password }) => {
    const result = await pool.query("SELECT id, email, role, password_hash, is_verified FROM users WHERE email=$1", [email])

    const user = result.rows[0]
    if (!user) throw { status: 401, message: "Invalid credentials" }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) throw { status: 401, message: "Invalid credentials" }

    const accessToken = jwt.sign({ id: user.id, role: user.role, jti: crypto.randomUUID() }, jwtConfig.secret, { expiresIn: jwtConfig.accessExpiry })

    const refreshToken = jwt.sign({ id: user.id, jti: crypto.randomUUID() }, jwtConfig.refreshSecret, { expiresIn: jwtConfig.refreshExpiry })

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")

    await pool.query(
        `INSERT INTO refresh_tokens(user_id, token, expires_at)
        VALUES($1, $2, NOW() + INTERVAL '${toPostgresInterval(jwtConfig.refreshExpiry)}')`,
        [user.id, refreshTokenHash],
    )

    return {
        access_token: accessToken,
        refresh_token: refreshToken,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
    }
}

const googleLoginUser = async ({ code, redirect_uri }) => {
    const googleConfig = {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirect_uri,
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code,
            client_id: googleConfig.client_id,
            client_secret: googleConfig.client_secret,
            redirect_uri: googleConfig.redirect_uri,
            grant_type: "authorization_code",
        }),
    })
    const { access_token: googleAccessToken } = await tokenResponse.json()

    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v1/userinfo", {
        headers: { Authorization: `Bearer ${googleAccessToken}` },
    })

    const { id: provider_uid, email } = await userInfoResponse.json()

    let userProviderQuery = await pool.query(`
        SELECT user_id, provider_email 
        FROM user_providers
        WHERE provider_uid = $1
    `, [provider_uid])
    let user = null

    if (userProviderQuery.rows.length !== 0) {
        let { user_id, provider_email } = userProviderQuery.rows[0]

        if (provider_email !== email) {
            await pool.query(`
                UPDATE user_providers
                SET provider_email = $1
                WHERE provider_uid = $2`,
            [email, provider_uid],
            )
        }
        
        user = await pool.query("SELECT id, email, role FROM users WHERE id=$1", [user_id])

        if (user.rows.length === 0) {
            throw Error(`Problem during OAuth login with email ${email} via Google, possibly because of errors during login process in the past`)
        }
    } else {
        user = await pool.query("SELECT id, email, role FROM users WHERE email=$1", [email])

        if (user.rows.length === 0) {
            user = await pool.query("INSERT INTO users(email, is_verified) VALUES($1, true) RETURNING id, email, role", [email])
            let {id: user_id} = user.rows[0]
            await pool.query(`
                INSERT INTO user_providers(user_id, provider, provider_uid, provider_email) 
                VALUES ($1, $2, $3, $4)`
            , [user_id, 'google', provider_uid, email])
        }
    }


    const accessToken = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role, jti: crypto.randomUUID() }, jwtConfig.secret, {
        expiresIn: jwtConfig.accessExpiry,
    })

    const refreshToken = jwt.sign({ id: user.rows[0].id, jti: crypto.randomUUID() }, jwtConfig.refreshSecret, { expiresIn: jwtConfig.refreshExpiry })

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")

    await pool.query(
        `INSERT INTO refresh_tokens(user_id, token, expires_at)
        VALUES($1, $2, NOW() + INTERVAL '${toPostgresInterval(jwtConfig.refreshExpiry)}')`,
        [user.rows[0].id, refreshTokenHash],
    )

    return {
        access_token: accessToken,
        refresh_token: refreshToken,
        email: user.rows[0].email,
        role: user.rows[0].role,
        is_verified: user.rows[0].is_verified,
    }
}

const googleOnboardingUser = async ({ userId, role }) => {
    let client
    try {
        client = await pool.connect()
        await client.query("BEGIN")

        const userResult = await client.query("SELECT id, role FROM users WHERE id=$1", [userId])
        if (userResult.rows.length === 0) {
            throw { status: 404, message: "User not found" }
        }
        if (userResult.rows[0].role !== null) {
            throw { status: 400, message: "User has already completed onboarding" }
        }

        await client.query("UPDATE users SET role=$1 WHERE id=$2", [role, userId])

        if (role === "job_seeker") {
            await client.query("INSERT INTO candidate_profiles (user_id) VALUES ($1)", [userId])
        } else if (role === "recruiter") {
            await client.query("INSERT INTO companies (user_id) VALUES ($1)", [userId])
        }

        await client.query("COMMIT")

        const updated = await pool.query("SELECT id, email, role FROM users WHERE id=$1", [userId])
        return updated.rows[0]
    } catch (err) {
        if (client) await client.query("ROLLBACK")
        throw err
    } finally {
        if (client) client.release()
    }
}

const refreshAccessToken = async (refreshToken) => {
    let decoded
    try {
        decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret)
    } catch (err) {
        throw { status: 401, message: "Invalid refresh token" }
    }

    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")

    const result = await pool.query(
        `SELECT * FROM refresh_tokens
        WHERE token=$1
        AND user_id=$2
        AND expires_at > NOW()
        AND revoked = false`,
        [tokenHash, decoded.id],
    )

    if (result.rows.length === 0) {
        throw { status: 401, message: "Refresh token not found or expired" }
    }

    const userResult = await pool.query("SELECT id, email, role FROM users WHERE id=$1", [decoded.id])

    const user = userResult.rows[0]
    if (!user) throw { status: 401, message: "User not found" }

    const accessToken = jwt.sign({ id: user.id, role: user.role, jti: crypto.randomUUID() }, jwtConfig.secret, { expiresIn: jwtConfig.accessExpiry })

    return { access_token: accessToken }
}

const logoutUser = async ({ userId, refreshToken }) => {
    if (refreshToken) {
        const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")

        await pool.query("UPDATE refresh_tokens SET revoked=true WHERE token=$1 AND user_id=$2", [tokenHash, userId])
    }
}

const sendOtp = async ({ email, purpose }) => {
    if (!VALID_OTP_PURPOSES.includes(purpose)) {
        throw { status: 400, message: "Invalid OTP purpose" }
    }

    const user = await pool.query("SELECT id FROM users WHERE email=$1", [email])
    if (user.rows.length === 0) {
        throw { status: 404, message: "User not found" }
    }

    const code = crypto.randomInt(100000, 999999).toString()
    const codeHash = crypto.createHash("sha256").update(code).digest("hex")

    await pool.query(
        "INSERT INTO otp_codes (user_id, code_hash, purpose) VALUES ($1, $2, $3)",
        [user.rows[0].id, codeHash, purpose],
    )

    // invalidate old OTPs
    await pool.query("UPDATE otp_codes SET used = true WHERE user_id = $1 AND purpose = $2 AND used = false", [user.rows[0].id, purpose])

    await sendEmail(email, "Mã xác thực JobBridge", otpEmailHtml(code, purpose))

    return { message: "OTP sent" }
}

const verifyOtp = async ({ email, code, purpose }) => {
    const client = await pool.connect() 
   
    try {
        if (!VALID_OTP_PURPOSES.includes(purpose)) {
            throw { status: 400, message: "Invalid OTP purpose" }
        }

        await client.query('BEGIN')

        const codeHash = crypto.createHash("sha256").update(code).digest("hex")
        const result = await pool.query(
            `SELECT o.id FROM otp_codes o
            JOIN users u ON u.id = o.user_id
            WHERE u.email = $1
            AND o.code_hash = $2
            AND o.purpose = $3
            AND o.used = false
            AND o.expires_at > NOW()
            ORDER BY o.created_at DESC
            LIMIT 1`,
            [email, codeHash, purpose],
        )
    
        if (result.rows.length === 0) {
            throw { status: 400, message: "Invalid or expired OTP" }
        }
    
        await client.query("UPDATE otp_codes SET used = true WHERE id = $1", [result.rows[0].id])
    
        if (purpose === "email_verify") {
            await client.query("UPDATE users SET is_verified = true WHERE email = $1", [email])
        }
    
        if (purpose === "password_reset") {
            const resetToken = crypto.randomBytes(32).toString('hex')
            const hash = crypto.createHash('sha256').update(reset_token).digest('hex')
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5min            
        }
        
        await client.query("COMMIT");
        return { message: "OTP verified" }
    } catch (error) {

    } finally {
        client.release()
    }

}

module.exports = { registerUser, loginUser, googleLoginUser, googleOnboardingUser, refreshAccessToken, logoutUser, sendOtp, verifyOtp }
