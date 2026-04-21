const logger = require("./logger")

function httpLogger(req, res, next) {
    const start = Date.now()
    const { method, originalUrl, ip } = req

    res.on("finish", () => {
        const duration = Date.now() - start
        const { statusCode } = res
        const log = { method, url: originalUrl, statusCode, duration, ip }

        if (statusCode >= 500) logger.error(log, "HTTP 5xx")
        else if (statusCode >= 400) logger.warn(log, "HTTP 4xx")
        else logger.info(log, "HTTP")
    })

    next()
}

module.exports = httpLogger
