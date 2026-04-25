const errorHandler = (err, req, res, next) => {
    if (res.headersSent) return next(err)

    const status = err.status || 500
    const message = err.message || "Internal server error"

    if (status >= 500) {
        console.error("Error:", err)
    }

    res.status(status).json({
        success: false,
        message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    })
}

const notFoundHandler = (req, res) => {
    res.status(404).json({ success: false, message: "Not found" })
}

module.exports = { errorHandler, notFoundHandler }
