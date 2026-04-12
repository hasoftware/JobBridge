const express = require("express")
const net = require("net")

const router = express.Router()
const auth = require("../middleware/auth")

const RANKING_HOST = process.env.RANKING_HOST || "localhost"
const RANKING_PORT = Number(process.env.RANKING_PORT || 8000)

function callPython(payload) {
    return new Promise((resolve, reject) => {
        const client = net.createConnection({ host: RANKING_HOST, port: RANKING_PORT })
        let buffer = ""

        client.on("connect", () => {
            client.write(JSON.stringify(payload) + "\n")
        })

        client.on("data", (data) => {
            buffer += data.toString()
        })

        client.on("end", () => {
            try {
                resolve(JSON.parse(buffer))
            } catch (err) {
                reject(new Error("Invalid response from ranking daemon"))
            }
        })

        client.on("error", reject)
    })
}

router.post("/", auth, async (req, res) => {
    const { job, resumes } = req.body

    if (!job || !Array.isArray(resumes)) {
        return res.status(400).json({ message: "Missing job or resumes" })
    }

    try {
        const ranking = await callPython({ job, resumes })
        res.json({ ranking })
    } catch (err) {
        console.error("Ranking error:", err)
        res.status(500).json({ message: err.message })
    }
})

module.exports = router
