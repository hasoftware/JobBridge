const pool = require("./db")

const jwt = {
    secret: process.env.JWT_SECRET || "dev_secret_change_me",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_change_me",
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || "30d",
}

const upload = {
    base_path: process.env.UPLOAD_BASE_PATH || "uploads",
    max_size: Number(process.env.UPLOAD_MAX_SIZE || 10 * 1024 * 1024),
}

const cors = {
    origin: (process.env.CORS_ORIGIN || "http://localhost:5173").split(","),
    credentials: true,
}

module.exports = { pool, jwt, upload, cors }
