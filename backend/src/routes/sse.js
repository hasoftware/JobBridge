const express = require("express")
const jwt = require("jsonwebtoken")
const { jwt: jwtConfig } = require("../../config")

const router = express.Router()

const clients = new Map()

function broadcast(userId, payload) {
    const conn = clients.get(userId)
    if (!conn) return
    conn.write(`data: ${JSON.stringify(payload)}\n\n`)
}

function broadcastAll(payload) {
    const data = `data: ${JSON.stringify(payload)}\n\n`
    for (const conn of clients.values()) {
        conn.write(data)
    }
}

router.get("/", (req, res) => {
    const token = req.query.token
    if (!token) return res.status(401).end()

    let userId
    try {
        const payload = jwt.verify(token, jwtConfig.secret)
        userId = payload.id
    } catch {
        return res.status(401).end()
    }

    res.set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
    })
    res.flushHeaders()

    res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`)
    clients.set(userId, res)

    req.on("close", () => {
        clients.delete(userId)
    })
})

module.exports = { router, broadcast, broadcastAll }
