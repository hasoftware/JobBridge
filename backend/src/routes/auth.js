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

router.post("/register", validate(schemas.register), async (req, res, next) => {
    const { email, password, role } = req.body
    try {
        const existing = await pool.query("SELECT id FROM users WHERE email=$1", [email])
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: "Email đã được đăng ký" })
        }

        const hash = await bcrypt.hash(password, 10)
        const result = await pool.query(
            "INSERT INTO users(email, password_hash, role) VALUES($1,$2,$3) RETURNING id, email, role",
            [email, hash, role || "job_seeker"],
        )

        const user = result.rows[0]
        if (user.role === "recruiter") {
            await pool.query("INSERT INTO companies(user_id) VALUES($1)", [user.id])
        }

        res.status(201).json(user)
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
