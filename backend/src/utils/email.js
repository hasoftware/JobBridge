const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

async function sendEmail(to, subject, html) {
    const email = await transporter.sendMail({
        from: `"JobBridge" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
    })
    
    console.log(email)  
}

function otpEmailHtml(code, purpose) {
    const purposeText = {
        email_verify: "xác thực email",
        password_reset: "đặt lại mật khẩu",
        "2fa_login": "xác minh đăng nhập",
    }

    return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px">
        <h2 style="color:#1e293b;margin:0 0 8px">JobBridge</h2>
        <p style="color:#64748b;margin:0 0 24px">Mã OTP để ${purposeText[purpose] || purpose}</p>
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:24px;text-align:center">
            <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#2563eb">${code}</span>
        </div>
        <p style="color:#94a3b8;font-size:13px;margin:16px 0 0">Mã có hiệu lực trong 5 phút. Không chia sẻ mã này với bất kỳ ai.</p>
    </div>`
}

module.exports = { sendEmail, otpEmailHtml }
