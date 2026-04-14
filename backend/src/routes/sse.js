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

    const old = clients.get(userId)
    if (old && old !== res) {
        try { old.end() } catch {}
    }
    clients.set(userId, res)

    const heartbeat = setInterval(() => {
        try {
            res.write(": ping\n\n")
        } catch {
            clearInterval(heartbeat)
        }
    }, 30000)

    const cleanup = () => {
        clearInterval(heartbeat)
        if (clients.get(userId) === res) clients.delete(userId)
    }

    req.on("close", cleanup)
    req.on("aborted", cleanup)
})

module.exports = { router, broadcast, broadcastAll }
