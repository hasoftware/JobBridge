const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")

const pool = require("../../config/db")
const { jwt: jwtConfig } = require("../../config")
const { validate, schemas } = require("../utils/validate")
const auth = require("../middleware/auth")

const router = express.Router()

function signTokens(user) {
    const accessToken = jwt.sign(
        { id: user.id, role: user.role, jti: crypto.randomUUID() },
        jwtConfig.secret,
        { expiresIn: jwtConfig.accessExpiry },
    )
    const refreshToken = jwt.sign(
        { id: user.id, jti: crypto.randomUUID() },
        jwtConfig.refreshSecret,
        { expiresIn: jwtConfig.refreshExpiry },
    )
    return { accessToken, refreshToken }
}

const PENDING_PURPOSE = "register"
const OTP_TTL_SEC = 10 * 60

function generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000))
}

function signPendingToken(payload) {
    return jwt.sign(
        { ...payload, purpose: PENDING_PURPOSE },
        jwtConfig.secret,
        { expiresIn: OTP_TTL_SEC },
    )
}

router.post("/register", validate(schemas.register), async (req, res, next) => {
    const { email, password, role } = req.body
    try {
        const existing = await pool.query("SELECT id FROM users WHERE email=$1", [email])
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: "Email đã được đăng ký" })
        }

        const passwordHash = await bcrypt.hash(password, 10)
        const otp = generateOtp()
        const otpHash = await bcrypt.hash(otp, 8)

        const pendingToken = signPendingToken({
            email,
            password_hash: passwordHash,
            role: role || "job_seeker",
            otp_hash: otpHash,
        })

        console.log(`[REGISTER OTP] ${email}: ${otp}`)

        res.json({ pending_token: pendingToken, email, expires_in: OTP_TTL_SEC })
    } catch (err) {
        next(err)
    }
})

router.post("/verify-email", async (req, res, next) => {
    const { pending_token, code } = req.body
    if (!pending_token || !code) {
        return res.status(400).json({ message: "Thiếu pending_token hoặc code" })
    }

    try {
        let payload
        try {
            payload = jwt.verify(pending_token, jwtConfig.secret)
        } catch {
            return res.status(400).json({ message: "Phiên đăng ký đã hết hạn, vui lòng đăng ký lại" })
        }

        if (payload.purpose !== PENDING_PURPOSE) {
            return res.status(400).json({ message: "Token không hợp lệ" })
        }

        const ok = await bcrypt.compare(String(code), payload.otp_hash)
        if (!ok) {
            return res.status(400).json({ message: "Mã OTP không đúng" })
        }

        const existing = await pool.query("SELECT id FROM users WHERE email=$1", [payload.email])
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: "Email đã được đăng ký" })
        }

        const result = await pool.query(
            "INSERT INTO users(email, password_hash, role, is_verified) VALUES($1, $2, $3, true) RETURNING id, email, role",
            [payload.email, payload.password_hash, payload.role],
        )
        const user = result.rows[0]

        if (user.role === "recruiter") {
            await pool.query("INSERT INTO companies(user_id) VALUES($1)", [user.id])
        }

        const { accessToken, refreshToken } = signTokens(user)
        const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")

        await pool.query(
            "INSERT INTO refresh_tokens(user_id, token, expires_at) VALUES($1, $2, NOW() + INTERVAL '30 days')",
            [user.id, tokenHash],
        )

        res.json({
            access_token: accessToken,
            refresh_token: refreshToken,
            email: user.email,
            role: user.role,
            is_verified: true,
        })
    } catch (err) {
        next(err)
    }
})

router.post("/resend-otp", async (req, res, next) => {
    const { pending_token } = req.body
    if (!pending_token) return res.status(400).json({ message: "Thiếu pending_token" })

    try {
        let payload
        try {
            payload = jwt.verify(pending_token, jwtConfig.secret, { ignoreExpiration: true })
        } catch {
            return res.status(400).json({ message: "Token không hợp lệ" })
        }

        if (payload.purpose !== PENDING_PURPOSE) {
            return res.status(400).json({ message: "Token không hợp lệ" })
        }

        const otp = generateOtp()
        const otpHash = await bcrypt.hash(otp, 8)

        const newPendingToken = signPendingToken({
            email: payload.email,
            password_hash: payload.password_hash,
            role: payload.role,
            otp_hash: otpHash,
        })

        console.log(`[REGISTER OTP RESEND] ${payload.email}: ${otp}`)

        res.json({ pending_token: newPendingToken, email: payload.email, expires_in: OTP_TTL_SEC })
    } catch (err) {
        next(err)
    }
})

router.post("/login", validate(schemas.login), async (req, res, next) => {
    const { email, password } = req.body
    try {
        const result = await pool.query(
            "SELECT id, email, role, password_hash, is_verified FROM users WHERE email=$1",
            [email],
        )
        const user = result.rows[0]
        if (!user) return res.status(401).json({ message: "Sai email hoặc mật khẩu" })

        const valid = await bcrypt.compare(password, user.password_hash)
        if (!valid) return res.status(401).json({ message: "Sai email hoặc mật khẩu" })

        const { accessToken, refreshToken } = signTokens(user)
        const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")

        await pool.query(
            "INSERT INTO refresh_tokens(user_id, token, expires_at) VALUES($1, $2, NOW() + INTERVAL '30 days')",
            [user.id, tokenHash],
        )

        res.json({
            access_token: accessToken,
            refresh_token: refreshToken,
            email: user.email,
            role: user.role,
            is_verified: user.is_verified,
        })
    } catch (err) {
        next(err)
    }
})

router.post("/refresh", async (req, res, next) => {
    const { refresh_token } = req.body
    if (!refresh_token) return res.status(400).json({ message: "Missing refresh_token" })

    try {
        const payload = jwt.verify(refresh_token, jwtConfig.refreshSecret)
        const tokenHash = crypto.createHash("sha256").update(refresh_token).digest("hex")

        const stored = await pool.query(
            "SELECT id FROM refresh_tokens WHERE user_id=$1 AND token=$2 AND expires_at > NOW()",
            [payload.id, tokenHash],
        )
        if (stored.rows.length === 0) {
            return res.status(401).json({ message: "Refresh token invalid" })
        }

        const userResult = await pool.query("SELECT id, role FROM users WHERE id=$1", [payload.id])
        const user = userResult.rows[0]
        if (!user) return res.status(401).json({ message: "User not found" })

        const accessToken = jwt.sign(
            { id: user.id, role: user.role, jti: crypto.randomUUID() },
            jwtConfig.secret,
            { expiresIn: jwtConfig.accessExpiry },
        )

        res.json({ access_token: accessToken })
    } catch (err) {
        if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Refresh token invalid" })
        }
        next(err)
    }
})

router.post("/logout", auth, async (req, res, next) => {
    try {
        await pool.query("DELETE FROM refresh_tokens WHERE user_id=$1", [req.user.id])
        res.json({ success: true })
    } catch (err) {
        next(err)
    }
})

router.get("/me", auth, async (req, res, next) => {
    try {
        const result = await pool.query(
            "SELECT id, email, role, is_verified, created_at FROM users WHERE id=$1",
            [req.user.id],
        )
        if (result.rows.length === 0) return res.status(404).json({ message: "Not found" })
        res.json(result.rows[0])
    } catch (err) {
        next(err)
    }
})

module.exports = router
