const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const { authenticator } = require("otplib")

const pool = require("../../config/db")
const { jwt: jwtConfig } = require("../../config")
const { validate, schemas } = require("../utils/validate")
const { sendVerifyEmailOtp } = require("../utils/email")
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

async function generateUniquePublicId() {
    for (let attempt = 0; attempt < 6; attempt++) {
        const candidate = Math.floor(10000000 + Math.random() * 90000000)
        const { rows } = await pool.query("SELECT 1 FROM users WHERE public_id=$1", [candidate])
        if (rows.length === 0) return candidate
    }
    throw new Error("Không sinh được public_id duy nhất")
}

function signPendingToken(payload) {
    return jwt.sign(
        { ...payload, purpose: PENDING_PURPOSE },
        jwtConfig.secret,
        { expiresIn: OTP_TTL_SEC },
    )
}

function emailErrorResponse(res, err, label, target) {
    console.error(`[${label}] Gửi OTP thất bại tới ${target}:`, err.message)
    if (err.code === "SMTP_NOT_CONFIGURED") {
        return res.status(503).json({
            message: "Hệ thống email chưa được cấu hình. Vui lòng liên hệ quản trị viên",
        })
    }
    return res.status(502).json({
        message: "Không gửi được email xác thực, vui lòng thử lại sau",
    })
}

router.post("/register", validate(schemas.register), async (req, res, next) => {
    const { email, password, role, full_name } = req.body
    try {
        const existing = await pool.query("SELECT id FROM users WHERE email=$1", [email])
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: "Email đã được đăng ký" })
        }

        const passwordHash = await bcrypt.hash(password, 10)
        const otp = generateOtp()
        const otpHash = await bcrypt.hash(otp, 8)

        try {
            await sendVerifyEmailOtp(email, otp)
        } catch (err) {
            return emailErrorResponse(res, err, "REGISTER", email)
        }

        const pendingToken = signPendingToken({
            email,
            password_hash: passwordHash,
            role: role || "job_seeker",
            full_name: full_name.trim(),
            otp_hash: otpHash,
        })

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

        const publicId = await generateUniquePublicId()
        const result = await pool.query(
            "INSERT INTO users(email, password_hash, full_name, role, public_id, is_verified) VALUES($1, $2, $3, $4, $5, true) RETURNING id, public_id, email, full_name, role",
            [payload.email, payload.password_hash, payload.full_name || null, payload.role, publicId],
        )
        const user = result.rows[0]

        if (user.role === "recruiter") {
            await pool.query("INSERT INTO companies(user_id) VALUES($1)", [user.id])
        }

        res.json({
            success: true,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
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

        try {
            await sendVerifyEmailOtp(payload.email, otp)
        } catch (err) {
            return emailErrorResponse(res, err, "REGISTER RESEND", payload.email)
        }

        const newPendingToken = signPendingToken({
            email: payload.email,
            password_hash: payload.password_hash,
            role: payload.role,
            otp_hash: otpHash,
        })

        res.json({ pending_token: newPendingToken, email: payload.email, expires_in: OTP_TTL_SEC })
    } catch (err) {
        next(err)
    }
})

const TWO_FA_PENDING_PURPOSE = "2fa_pending"
const TWO_FA_PENDING_TTL_SEC = 5 * 60
const BACKUP_CODE_COUNT = 10
const BACKUP_CODE_LENGTH = 8

function signTwoFAPendingToken(userId) {
    return jwt.sign(
        { id: userId, purpose: TWO_FA_PENDING_PURPOSE },
        jwtConfig.secret,
        { expiresIn: TWO_FA_PENDING_TTL_SEC },
    )
}

function generateBackupCodes() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    const codes = []
    for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
        let c = ""
        for (let j = 0; j < BACKUP_CODE_LENGTH; j++) {
            c += chars[crypto.randomInt(0, chars.length)]
        }
        codes.push(c)
    }
    return codes
}

async function hashBackupCodes(codes) {
    return Promise.all(codes.map((c) => bcrypt.hash(c, 10)))
}

async function issueLoginTokens(user, res) {
    const { accessToken, refreshToken } = signTokens(user)
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")
    await pool.query(
        "INSERT INTO refresh_tokens(user_id, token, expires_at) VALUES($1, $2, NOW() + INTERVAL '30 days')",
        [user.id, tokenHash],
    )
    res.json({
        access_token: accessToken,
        refresh_token: refreshToken,
        public_id: user.public_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_verified: user.is_verified,
    })
}

router.post("/login", validate(schemas.login), async (req, res, next) => {
    const { email, password } = req.body
    try {
        const result = await pool.query(
            "SELECT id, public_id, email, full_name, role, password_hash, is_verified, two_factor_enabled FROM users WHERE email=$1",
            [email],
        )
        const user = result.rows[0]
        if (!user) return res.status(401).json({ message: "Sai email hoặc mật khẩu" })

        const valid = await bcrypt.compare(password, user.password_hash)
        if (!valid) return res.status(401).json({ message: "Sai email hoặc mật khẩu" })

        if (user.two_factor_enabled) {
            return res.json({
                requires_2fa: true,
                pending_2fa_token: signTwoFAPendingToken(user.id),
            })
        }

        await issueLoginTokens(user, res)
    } catch (err) {
        next(err)
    }
})

router.post("/2fa/verify", async (req, res, next) => {
    const { pending_2fa_token, code } = req.body
    if (!pending_2fa_token || !code) {
        return res.status(400).json({ message: "Thiếu thông tin xác thực" })
    }
    try {
        let payload
        try {
            payload = jwt.verify(pending_2fa_token, jwtConfig.secret)
        } catch {
            return res.status(401).json({ message: "Mã xác thực đã hết hạn, vui lòng đăng nhập lại" })
        }
        if (payload.purpose !== TWO_FA_PENDING_PURPOSE) {
            return res.status(401).json({ message: "Token không hợp lệ" })
        }

        const result = await pool.query(
            "SELECT id, public_id, email, full_name, role, is_verified, two_factor_enabled, two_factor_secret, two_factor_backup_codes FROM users WHERE id=$1",
            [payload.id],
        )
        const user = result.rows[0]
        if (!user || !user.two_factor_enabled || !user.two_factor_secret) {
            return res.status(400).json({ message: "Tài khoản chưa bật 2FA" })
        }

        const cleanCode = String(code).replace(/[^A-Za-z0-9]/g, "")
        let ok = false
        let usedBackup = false

        if (/^\d{6}$/.test(cleanCode)) {
            ok = authenticator.check(cleanCode, user.two_factor_secret)
        } else {
            const codeUpper = cleanCode.toUpperCase()
            const backupCodes = user.two_factor_backup_codes || []
            for (let i = 0; i < backupCodes.length; i++) {
                if (await bcrypt.compare(codeUpper, backupCodes[i])) {
                    const remaining = backupCodes.filter((_, j) => j !== i)
                    await pool.query(
                        "UPDATE users SET two_factor_backup_codes=$1 WHERE id=$2",
                        [remaining, user.id],
                    )
                    ok = true
                    usedBackup = true
                    break
                }
            }
        }

        if (!ok) return res.status(400).json({ message: "Mã không đúng" })

        await issueLoginTokens(user, res)
    } catch (err) {
        next(err)
    }
})

router.post("/2fa/setup", auth, async (req, res, next) => {
    try {
        const result = await pool.query("SELECT email, two_factor_enabled FROM users WHERE id=$1", [req.user.id])
        const user = result.rows[0]
        if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" })
        if (user.two_factor_enabled) return res.status(400).json({ message: "Tài khoản đã bật 2FA" })

        const secret = authenticator.generateSecret()
        const otpauthUrl = authenticator.keyuri(user.email, "JobBridge", secret)
        res.json({ secret, otpauth_url: otpauthUrl })
    } catch (err) {
        next(err)
    }
})

router.post("/2fa/enable", auth, async (req, res, next) => {
    const { secret, code } = req.body
    if (!secret || !code) {
        return res.status(400).json({ message: "Thiếu thông tin" })
    }
    if (!/^\d{6}$/.test(String(code))) {
        return res.status(400).json({ message: "Mã phải là 6 chữ số" })
    }
    try {
        const result = await pool.query("SELECT two_factor_enabled FROM users WHERE id=$1", [req.user.id])
        const user = result.rows[0]
        if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" })
        if (user.two_factor_enabled) return res.status(400).json({ message: "Tài khoản đã bật 2FA" })

        const ok = authenticator.check(String(code), secret)
        if (!ok) return res.status(400).json({ message: "Mã không đúng, vui lòng thử lại" })

        const codes = generateBackupCodes()
        const codeHashes = await hashBackupCodes(codes)

        await pool.query(
            "UPDATE users SET two_factor_enabled=true, two_factor_secret=$1, two_factor_backup_codes=$2 WHERE id=$3",
            [secret, codeHashes, req.user.id],
        )

        res.json({ success: true, backup_codes: codes })
    } catch (err) {
        next(err)
    }
})

router.post("/2fa/disable", auth, async (req, res, next) => {
    const { password, code } = req.body
    if (!password || !code) {
        return res.status(400).json({ message: "Vui lòng nhập mật khẩu và mã xác thực" })
    }
    try {
        const result = await pool.query(
            "SELECT password_hash, two_factor_enabled, two_factor_secret FROM users WHERE id=$1",
            [req.user.id],
        )
        const user = result.rows[0]
        if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" })
        if (!user.two_factor_enabled) return res.status(400).json({ message: "Tài khoản chưa bật 2FA" })

        const passwordOk = await bcrypt.compare(password, user.password_hash)
        if (!passwordOk) return res.status(400).json({ message: "Mật khẩu không đúng" })

        const codeOk = /^\d{6}$/.test(String(code)) && authenticator.check(String(code), user.two_factor_secret)
        if (!codeOk) return res.status(400).json({ message: "Mã 2FA không đúng" })

        await pool.query(
            "UPDATE users SET two_factor_enabled=false, two_factor_secret=NULL, two_factor_backup_codes=NULL WHERE id=$1",
            [req.user.id],
        )

        res.json({ success: true })
    } catch (err) {
        next(err)
    }
})

router.post("/2fa/regenerate-backup-codes", auth, async (req, res, next) => {
    const { code } = req.body
    if (!code) return res.status(400).json({ message: "Vui lòng nhập mã 2FA" })
    try {
        const result = await pool.query(
            "SELECT two_factor_enabled, two_factor_secret FROM users WHERE id=$1",
            [req.user.id],
        )
        const user = result.rows[0]
        if (!user || !user.two_factor_enabled) {
            return res.status(400).json({ message: "Tài khoản chưa bật 2FA" })
        }

        const ok = /^\d{6}$/.test(String(code)) && authenticator.check(String(code), user.two_factor_secret)
        if (!ok) return res.status(400).json({ message: "Mã không đúng" })

        const codes = generateBackupCodes()
        const codeHashes = await hashBackupCodes(codes)
        await pool.query(
            "UPDATE users SET two_factor_backup_codes=$1 WHERE id=$2",
            [codeHashes, req.user.id],
        )

        res.json({ backup_codes: codes })
    } catch (err) {
        next(err)
    }
})

router.get("/2fa/status", auth, async (req, res, next) => {
    try {
        const result = await pool.query(
            "SELECT two_factor_enabled, COALESCE(array_length(two_factor_backup_codes, 1), 0) AS backup_remaining FROM users WHERE id=$1",
            [req.user.id],
        )
        const user = result.rows[0]
        res.json({
            enabled: !!user?.two_factor_enabled,
            backup_remaining: Number(user?.backup_remaining || 0),
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

        const newRefreshToken = jwt.sign(
            { id: user.id, jti: crypto.randomUUID() },
            jwtConfig.refreshSecret,
            { expiresIn: jwtConfig.refreshExpiry },
        )
        const newRefreshHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex")

        await pool.query("DELETE FROM refresh_tokens WHERE user_id=$1 AND token=$2", [user.id, tokenHash])
        await pool.query(
            "INSERT INTO refresh_tokens(user_id, token, expires_at) VALUES($1, $2, NOW() + INTERVAL '30 days')",
            [user.id, newRefreshHash],
        )

        res.json({ access_token: accessToken, refresh_token: newRefreshToken })
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

const DEFAULT_NOTIFICATION_SETTINGS = {
    inApp: {
        jobMatches: true,
        savedJobs: true,
        applicationStatus: true,
        profileViews: true,
        recruiterMessages: true,
    },
    email: {
        jobSuggestions: "weekly",
        applicationUpdates: true,
        recruiterEmail: true,
        newsletter: false,
    },
}

function mergeNotificationSettings(stored, incoming) {
    const base = stored || {}
    return {
        inApp: { ...DEFAULT_NOTIFICATION_SETTINGS.inApp, ...(base.inApp || {}), ...(incoming?.inApp || {}) },
        email: { ...DEFAULT_NOTIFICATION_SETTINGS.email, ...(base.email || {}), ...(incoming?.email || {}) },
    }
}

router.get("/notification-settings", auth, async (req, res, next) => {
    try {
        const { rows } = await pool.query("SELECT notification_settings FROM users WHERE id=$1", [req.user.id])
        res.json(mergeNotificationSettings(rows[0]?.notification_settings, null))
    } catch (err) {
        next(err)
    }
})

router.patch("/notification-settings", auth, validate(schemas.notificationSettings), async (req, res, next) => {
    try {
        const { rows } = await pool.query("SELECT notification_settings FROM users WHERE id=$1", [req.user.id])
        const merged = mergeNotificationSettings(rows[0]?.notification_settings, req.body)
        await pool.query(
            "UPDATE users SET notification_settings=$1::jsonb WHERE id=$2",
            [JSON.stringify(merged), req.user.id],
        )
        res.json(merged)
    } catch (err) {
        next(err)
    }
})

router.post("/change-password", auth, validate(schemas.changePassword), async (req, res, next) => {
    const { current_password, new_password } = req.body
    try {
        const result = await pool.query("SELECT password_hash FROM users WHERE id=$1", [req.user.id])
        const user = result.rows[0]
        if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản" })

        const valid = await bcrypt.compare(current_password, user.password_hash)
        if (!valid) return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" })

        const same = await bcrypt.compare(new_password, user.password_hash)
        if (same) return res.status(400).json({ message: "Mật khẩu mới phải khác mật khẩu hiện tại" })

        const newHash = await bcrypt.hash(new_password, 10)
        await pool.query("UPDATE users SET password_hash=$1 WHERE id=$2", [newHash, req.user.id])
        await pool.query("DELETE FROM refresh_tokens WHERE user_id=$1", [req.user.id])

        const userInfo = { id: req.user.id, role: req.user.role }
        const { accessToken, refreshToken } = signTokens(userInfo)
        const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")
        await pool.query(
            "INSERT INTO refresh_tokens(user_id, token, expires_at) VALUES($1, $2, NOW() + INTERVAL '30 days')",
            [req.user.id, tokenHash],
        )

        res.json({
            success: true,
            access_token: accessToken,
            refresh_token: refreshToken,
        })
    } catch (err) {
        next(err)
    }
})

router.get("/sessions", auth, async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            "SELECT id, created_at, expires_at FROM refresh_tokens WHERE user_id=$1 AND expires_at > NOW() ORDER BY created_at DESC",
            [req.user.id],
        )
        res.json(rows)
    } catch (err) {
        next(err)
    }
})

router.delete("/sessions", auth, async (req, res, next) => {
    const { current_refresh_token } = req.body
    try {
        if (current_refresh_token) {
            const tokenHash = crypto.createHash("sha256").update(current_refresh_token).digest("hex")
            const result = await pool.query(
                "DELETE FROM refresh_tokens WHERE user_id=$1 AND token<>$2",
                [req.user.id, tokenHash],
            )
            return res.json({ success: true, revoked: result.rowCount })
        }
        const result = await pool.query("DELETE FROM refresh_tokens WHERE user_id=$1", [req.user.id])
        res.json({ success: true, revoked: result.rowCount })
    } catch (err) {
        next(err)
    }
})

router.get("/me", auth, async (req, res, next) => {
    try {
        const result = await pool.query(
            "SELECT id, public_id, email, full_name, phone, date_of_birth, gender, address, bio, role, is_verified, two_factor_enabled, created_at FROM users WHERE id=$1",
            [req.user.id],
        )
        if (result.rows.length === 0) return res.status(404).json({ message: "Not found" })
        res.json(result.rows[0])
    } catch (err) {
        next(err)
    }
})

router.patch("/me", auth, validate(schemas.profile), async (req, res, next) => {
    try {
        const allowed = ["full_name", "phone", "date_of_birth", "gender", "address", "bio"]
        const sets = []
        const params = []
        let idx = 1

        for (const field of allowed) {
            if (req.body[field] === undefined) continue
            let value = req.body[field]
            if (field === "address") {
                value = value && typeof value === "object" ? JSON.stringify(value) : null
                sets.push(`${field}=$${idx++}::jsonb`)
            } else {
                sets.push(`${field}=$${idx++}`)
                value = value === "" ? null : value
            }
            params.push(value)
        }

        if (sets.length === 0) {
            return res.status(400).json({ message: "Không có dữ liệu cần cập nhật" })
        }

        params.push(req.user.id)
        const result = await pool.query(
            `UPDATE users SET ${sets.join(", ")} WHERE id=$${idx}
             RETURNING id, public_id, email, full_name, phone, date_of_birth, gender, address, bio, role, is_verified, created_at`,
            params,
        )

        res.json(result.rows[0])
    } catch (err) {
        next(err)
    }
})

module.exports = router
