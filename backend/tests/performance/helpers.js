const fetch = require("node-fetch")

const BASE_URL = process.env.PERF_BASE_URL || "http://localhost:3000/api/v1"

async function timed(fn) {
    const start = process.hrtime.bigint()
    const result = await fn()
    const end = process.hrtime.bigint()
    return { result, durationMs: Number(end - start) / 1e6 }
}

async function getRequest(path, headers = {}) {
    const res = await fetch(`${BASE_URL}${path}`, { headers })
    return { status: res.status, body: await res.text() }
}

async function postRequest(path, payload, headers = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(payload),
    })
    return { status: res.status, body: await res.text() }
}

function summary(samples) {
    const sorted = [...samples].sort((a, b) => a - b)
    const n = sorted.length
    const sum = sorted.reduce((a, b) => a + b, 0)
    return {
        n,
        avg: sum / n,
        p50: sorted[Math.floor(n * 0.5)],
        p95: sorted[Math.floor(n * 0.95)],
        p99: sorted[Math.floor(n * 0.99)],
        min: sorted[0],
        max: sorted[n - 1],
    }
}

module.exports = { timed, getRequest, postRequest, summary, BASE_URL }
