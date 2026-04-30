const jwt = require("jsonwebtoken")
const { jwt: jwtConfig } = require("../../config")

function authMiddleware(req, res, next) {
    const header = req.headers.authorization
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" })
    }

    const token = header.slice(7)
    try {
        const payload = jwt.verify(token, jwtConfig.secret)
        req.user = { id: payload.id, role: payload.role }
        return next()
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" })
        }
        return res.status(401).json({ message: "Invalid token" })
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden" })
        }
        next()
    }
}

module.exports = authMiddleware
module.exports.requireRole = requireRole
