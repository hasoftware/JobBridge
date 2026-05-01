const express = require("express")
const nodemailer = require("nodemailer")
const pool = require("../../config/db")
const { invalidateCache } = require("../utils/email")
const auth = require("../middleware/auth")
const { requireRole } = auth

const router = express.Router()

router.use(auth, requireRole("admin"))

const MASK = "********"

router.get("/settings/email", async (req, res, next) => {
    try {
        const { rows } = await pool.query("SELECT value FROM app_settings WHERE key=$1", ["email"])
        const config = rows[0]?.value || {}
        res.json({
            smtp_host: config.smtp_host || "",
            encryption: config.encryption || "tls",
            smtp_port: config.smtp_port || 587,
            smtp_user: config.smtp_user || "",
            from_email: config.from_email || "",
            smtp_pass: config.smtp_pass ? MASK : "",
        })
    } catch (err) {
        next(err)
    }
})

router.put("/settings/email", async (req, res, next) => {
    const { smtp_host, encryption, smtp_port, smtp_user, from_email, smtp_pass } = req.body

    if (!smtp_host || !smtp_port) {
        return res.status(400).json({ message: "Thiếu SMTP host hoặc port" })
    }
    if (!["tls", "ssl", "none"].includes(encryption)) {
        return res.status(400).json({ message: "Encryption phải là tls, ssl hoặc none" })
    }

    try {
        const existing = await pool.query("SELECT value FROM app_settings WHERE key=$1", ["email"])
        const current = existing.rows[0]?.value || {}

        const finalPass = smtp_pass && smtp_pass !== MASK ? smtp_pass : (current.smtp_pass || "")

        const next = {
            smtp_host: String(smtp_host).trim(),
            encryption,
            smtp_port: Number(smtp_port),
            smtp_user: String(smtp_user || "").trim(),
            from_email: String(from_email || "").trim(),
            smtp_pass: finalPass,
        }

        await pool.query(
            `INSERT INTO app_settings(key, value, updated_at) VALUES($1, $2, NOW())
             ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
            ["email", JSON.stringify(next)],
        )

        invalidateCache()
        res.json({ success: true })
    } catch (err) {
        next(err)
    }
})

router.post("/settings/email/test", async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT value FROM app_settings WHERE key=$1", ["email"])
        const config = rows[0]?.value || {}

        if (!config.smtp_host || !config.smtp_user || !config.smtp_pass) {
            return res.status(400).json({ success: false, message: "Cấu hình SMTP chưa đầy đủ" })
        }

        const transporter = nodemailer.createTransport({
            host: config.smtp_host,
            port: Number(config.smtp_port || 587),
            secure: config.encryption === "ssl",
            auth: {
                user: config.smtp_user,
                pass: config.smtp_pass,
            },
        })

        await transporter.verify()
        res.json({ success: true, message: "Kết nối SMTP thành công" })
    } catch (err) {
        res.status(400).json({ success: false, message: err.message || "Kết nối SMTP thất bại" })
    }
})

module.exports = router
