const nodemailer = require("nodemailer")
const pool = require("../../config/db")
const { render } = require("./templates")

let cachedConfig = null
let cachedTransporter = null

async function loadConfig() {
    const { rows } = await pool.query("SELECT value FROM app_settings WHERE key=$1", ["email"])
    return rows[0]?.value || null
}

function configKey(c) {
    if (!c) return ""
    return [c.smtp_host, c.smtp_port, c.encryption, c.smtp_user, c.smtp_pass, c.from_email].join("|")
}

function buildTransporter(config) {
    return nodemailer.createTransport({
        host: config.smtp_host,
        port: Number(config.smtp_port || 587),
        secure: config.encryption === "ssl",
        requireTLS: config.encryption === "tls",
        auth: {
            user: config.smtp_user,
            pass: config.smtp_pass,
        },
    })
}

async function getTransporter() {
    const config = await loadConfig()
    if (!config || !config.smtp_host || !config.smtp_user || !config.smtp_pass) {
        const err = new Error("SMTP chưa được cấu hình")
        err.code = "SMTP_NOT_CONFIGURED"
        throw err
    }

    if (cachedTransporter && configKey(cachedConfig) === configKey(config)) {
        return { transporter: cachedTransporter, config }
    }

    cachedTransporter = buildTransporter(config)
    cachedConfig = config
    return { transporter: cachedTransporter, config }
}

function invalidateCache() {
    cachedTransporter = null
    cachedConfig = null
}

async function sendMail({ to, subject, html }) {
    const { transporter, config } = await getTransporter()
    const fromAddr = config.from_email || config.smtp_user
    return transporter.sendMail({
        from: `"JobBridge" <${fromAddr}>`,
        to,
        subject,
        html,
    })
}

async function sendVerifyEmailOtp(email, otp) {
    const html = render("verify-email", { otp, email })
    return sendMail({
        to: email,
        subject: "Xác thực email JobBridge",
        html,
    })
}

module.exports = { sendMail, sendVerifyEmailOtp, invalidateCache }
