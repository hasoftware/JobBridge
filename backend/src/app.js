require("dotenv").config({ path: require("path").join(__dirname, "../../.env") })

const path = require("path")
const express = require("express")
const cors = require("cors")
const rateLimit = require("express-rate-limit")

const { cors: corsConfig } = require("../config")
const { errorHandler, notFoundHandler } = require("./middleware/error")
const authRoutes = require("./routes/auth")
const jobsRoutes = require("./routes/jobs")
const adminRoutes = require("./routes/admin")
const templatesRoutes = require("./routes/templates")
const cvsRoutes = require("./routes/cvs")
const applicationsRoutes = require("./routes/applications")
const coverLettersRoutes = require("./routes/coverLetters")
const companiesRoutes = require("./routes/companies")
const searchRoutes = require("./routes/search")

const app = express()

app.use(cors(corsConfig))
app.use(express.json({ limit: "1mb" }))
app.use("/uploads",
    (req, res, next) => { res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"); next() },
    express.static(path.join(__dirname, "..", "uploads")),
)

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
})
app.use("/api", apiLimiter)

app.get("/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() })
})

app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/jobs", jobsRoutes)
app.use("/api/v1/admin", adminRoutes)
app.use("/api/v1/templates/preview", templatesRoutes)
app.use("/api/v1/cvs", cvsRoutes)
app.use("/api/v1/applications", applicationsRoutes)
app.use("/api/v1/cover-letters", coverLettersRoutes)
app.use("/api/v1/companies", companiesRoutes)
app.use("/api/v1/search", searchRoutes)

app.use("/api", notFoundHandler)
app.use(errorHandler)

const PORT = Number(process.env.PORT || 5001)
const server = app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`)
})

process.on("SIGTERM", () => server.close())
process.on("SIGINT", () => server.close())

module.exports = app
