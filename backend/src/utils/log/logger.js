const pino = require("pino")
const path = require("path")
const { Worker } = require("worker_threads")

const logFile = process.env.LOG_FILE || path.join(__dirname, "../../../logs/app.log")
const level = process.env.LOG_LEVEL || "info"

const transport = pino.transport({
    targets: [
        { target: "pino/file", options: { destination: logFile, mkdir: true } },
        { target: "pino-pretty", options: { colorize: true } },
    ],
})

const logger = pino({ level }, transport)

let worker = null

function startWorker() {
    if (worker) return
    worker = new Worker(path.join(__dirname, "loggerWorker.js"))
    worker.on("error", (err) => {
        logger.error({ err }, "Logger worker error")
    })
}

function close() {
    if (worker) {
        worker.terminate()
        worker = null
    }
    return new Promise((resolve) => transport.end(() => resolve()))
}

startWorker()

module.exports = logger
module.exports.close = close
