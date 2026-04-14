const pool = require("../../config/db")

const recentViews = new Map()
const DEBOUNCE_MS = 30 * 60 * 1000

function makeKey(jobId, sessionKey) {
    return `${jobId}:${sessionKey}`
}

function shouldCount(jobId, sessionKey) {
    const key = makeKey(jobId, sessionKey)
    const last = recentViews.get(key)
    const now = Date.now()
    if (last && now - last < DEBOUNCE_MS) return false
    recentViews.set(key, now)
    return true
}

async function increment(jobId, sessionKey) {
    if (!shouldCount(jobId, sessionKey)) return null
    try {
        const { rows } = await pool.query(
            "UPDATE jobs SET view_count = COALESCE(view_count, 0) + 1 WHERE id = $1 RETURNING view_count",
            [jobId],
        )
        return rows[0]?.view_count || null
    } catch (err) {
        console.error("View counter error:", err.message)
        return null
    }
}

setInterval(() => {
    const now = Date.now()
    for (const [key, time] of recentViews.entries()) {
        if (now - time > DEBOUNCE_MS) {
            recentViews.delete(key)
        }
    }
}, 5 * 60 * 1000)

module.exports = { increment, shouldCount }
