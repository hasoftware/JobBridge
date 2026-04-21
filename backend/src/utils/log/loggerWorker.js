const { parentPort } = require("worker_threads")

const buffer = []
const FLUSH_INTERVAL = 5000

setInterval(() => {
    if (buffer.length === 0) return
    const batch = buffer.splice(0, buffer.length)
    parentPort?.postMessage({ type: "flush", batch })
}, FLUSH_INTERVAL)

parentPort?.on("message", (msg) => {
    if (msg?.type === "log") {
        buffer.push(msg.payload)
    }
})
