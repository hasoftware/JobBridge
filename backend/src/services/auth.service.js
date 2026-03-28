const bcrypt = require("bcrypt")
const crypto = require("crypto")
const jwt = require("jsonwebtoken")

const pool = require("../../config/db")
const { jwt: jwtConfig } = require("../../config")

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
        const result = await client.query(
            "INSERT INTO users(email, password_hash, role) VALUES($1,$2,$3) RETURNING id, email, role",
            [email, hash, role],
        )

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
    const result = await pool.query(
        "SELECT id, email, role, password_hash, is_verified FROM users WHERE email=$1",
        [email],
    )

    const user = result.rows[0]
    if (!user) throw { status: 401, message: "Invalid credentials" }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) throw { status: 401, message: "Invalid credentials" }

    const accessToken = jwt.sign(
        { id: user.id, role: user.role, jti: crypto.randomUUID() },
        jwtConfig.secret,
        { expiresIn: jwtConfig.accessExpiry },
    )

    return {
        access_token: accessToken,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
    }
}

const logoutUser = async (userId) => {
    await pool.query("DELETE FROM refresh_tokens WHERE user_id=$1", [userId])
    return { success: true }
}

module.exports = { registerUser, loginUser, logoutUser }
