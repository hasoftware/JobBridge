const express = require("express")
const { render } = require("../utils/templates")

const router = express.Router()

router.get("/verify-email", (req, res) => {
    try {
        const html = render("verify-email", {
            otp: req.query.otp || "123456",
            email: req.query.email || "preview@example.com",
        })
        res.set("Content-Type", "text/html; charset=utf-8")
        res.send(html)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

module.exports = router
