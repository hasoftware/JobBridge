const express = require("express")
const { v4: uuidv4} = require("uuid")
const pool = require("../../config/db")

const router = express.Router()
const auth = require("../middleware/auth")

const sseClients = new Map()

router.get("/stream", auth, async (req, res) => {
    try {
        res.setHeader("Access-Control-Allow-Origin", "*")
        res.setHeader("Content-Type", "text/event-stream")
        res.setHeader("Cache-Control", "no-cache, no-transform")
        res.setHeader("Connection", "keep-alive")
        res.setHeader("X-Accel-Buffering", "no") // disable nginx buffering
        res.flushHeaders()

        const userID = req.user.id
        const clientId = uuidv4()
        sseClients.set(clientId, { res, userID })
    
        res.write(
            `data: ${JSON.stringify({
                type: "connected",
                clientId,
                message: "SSE stream connected",
                timestamp: Date.now(),
            })}\n\n`,
        )
        
        // heartbeat every 30s to keep connection alive
        const heartbeat = setInterval(() => {
            res.write(`: heartbeat\n\n`)
        }, 30 * 1000)
    
        req.on("close", () => {
            clearInterval(heartbeat)
            sseClients.delete(clientId)
        })
    } catch (err) {
        console.log(err)
    }
})

// use for testing
router.post("/notify", auth, (req, res) => {
    const { title, message, type = "info", target } = req.body

    const notification = {
        type: "notification",
        id: uuidv4(),
        title: title || "Notification",
        message: message || "",
        notifType: type,
        timestamp: Date.now(),
    }

    let sent = 0
    for (const [id, client] of sseClients) {
        if (!target || id === target) {
            client.res.write(`data: ${JSON.stringify(notification)}\n\n`)
            sent++
        }
    }

    res.json({ success: true, sent, totalClients: sseClients.size })
})

const updateApplicantStatus = ({ user_id, status, job_title, company_name, application_id, job_id }) => {
    const messageForStatus = () => {
        const title = job_title || "vị trí này"
        const companyPart = company_name ? ` tại ${company_name}` : ""

        switch (status) {
            case "submitted":
                return `Hồ sơ ứng tuyển cho ${title}${companyPart} đã được chuyển về trạng thái Đã nộp.`
            case "under_review":
                return `Hồ sơ ứng tuyển cho ${title}${companyPart} đang được nhà tuyển dụng xem xét.`
            case "shortlisted":
                return `Chúc mừng! Hồ sơ ứng tuyển cho ${title}${companyPart} đã vào danh sách rút gọn.`
            case "interview_scheduled":
                return `Bạn đã nhận được lịch phỏng vấn cho vị trí ${title}${companyPart}.`
            case "rejected":
                return `Rất tiếc, hồ sơ ứng tuyển cho ${title}${companyPart} đã bị từ chối.`
            default:
                return `Trạng thái hồ sơ ứng tuyển cho ${title}${companyPart} đã được cập nhật: ${String(status || "").replace(/_/g, " ")}.`
        }
    }

    const event = {
        type: "notification",
        id: uuidv4(),
        notifType: "application_update",
        application_id,
        job_id: job_id || null,
        job_title: job_title || "",
        company_name: company_name || "",
        title: "Application Status Updated",
        message: messageForStatus(),
        status,
        timestamp: Date.now(),
    }

    let sent = 0

    for (const [, client] of sseClients) {
        if (client.userID === user_id) {
            client.res.write(`data: ${JSON.stringify(event)}\n\n`)
            sent++
        }
    }

    return { success: true, sent }
}

async function getSenderMeta(sender_id) {
    const { rows } = await pool.query(
        `SELECT
            COALESCE(cp.full_name, c.name, u.email, 'User ' || u.id::text) AS sender_name,
            COALESCE(cp.avatar_url, c.logo_url, '') AS sender_avatar,
            COALESCE(
                u.role,
                CASE WHEN c.user_id IS NOT NULL THEN 'recruiter' ELSE 'job_seeker' END
            ) AS sender_role
         FROM users u
         LEFT JOIN candidate_profiles cp ON cp.user_id = u.id
         LEFT JOIN companies c ON c.user_id = u.id
         WHERE u.id = $1
         LIMIT 1`,
        [sender_id],
    )

    if (!rows.length) return { sender_name: "", sender_avatar: "", sender_role: "" }
    return rows[0]
}

const notifyMessageReceived = async ({ user_id, sender_id, text, conversation_key }) => {
    let sender_name = ""
    let sender_avatar = ""
    let sender_role = ""
    try {
        const meta = await getSenderMeta(sender_id)
        sender_name = meta.sender_name || ""
        sender_avatar = meta.sender_avatar || ""
        sender_role = meta.sender_role || ""
    } catch (err) {
        console.error("[sse] getSenderMeta:", err.message)
    }

    const event = {
        type: "notification",
        id: uuidv4(),
        notifType: "message_received",
        sender_id,
        sender_name,
        sender_avatar,
        sender_role,
        conversation_key: conversation_key || "",
        title: "New Message",
        message: text ? String(text).slice(0, 120) : "You received a new message.",
        timestamp: Date.now()
    }

    let sent = 0
    for (const [, client] of sseClients) {
        if (client.userID === user_id) {
            client.res.write(`data: ${JSON.stringify(event)}\n\n`)
            sent++
        }
    }

    return { success: true, sent }
}

module.exports = { router, updateApplicantStatus, notifyMessageReceived }
