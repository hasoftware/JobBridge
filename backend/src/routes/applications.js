const express = require("express")
const pool = require("../../config/db")
const auth = require("../middleware/auth")

const router = express.Router()

const VALID_STATUSES = ["pending", "submitted", "reviewed", "interview", "accepted", "rejected", "withdrawn"]

router.get("/mine", auth, async (req, res, next) => {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12))
    const offset = (page - 1) * limit
    const status = req.query.status

    const conditions = ["a.user_id = $1"]
    const values = [req.user.id]

    if (status && VALID_STATUSES.includes(status)) {
        if (status === "pending") {
            conditions.push("a.status IN ('pending', 'submitted')")
        } else {
            values.push(status)
            conditions.push(`a.status = $${values.length}`)
        }
    }

    const where = `WHERE ${conditions.join(" AND ")}`

    try {
        const countResult = await pool.query(
            `SELECT COUNT(*) FROM applications a ${where}`,
            values,
        )

        values.push(limit, offset)
        const { rows } = await pool.query(
            `SELECT a.id, a.status, a.created_at, a.updated_at, a.cv_id, a.cv_url,
                    j.id AS job_id, j.title, j.location, j.salary_min, j.salary_max, j.currency, j.job_type,
                    c.name AS company_name, c.logo_url AS company_logo,
                    cv.title AS cv_title
             FROM applications a
             INNER JOIN jobs j ON j.id = a.job_id
             LEFT JOIN companies c ON c.id = j.company_id
             LEFT JOIN cvs cv ON cv.id = a.cv_id
             ${where}
             ORDER BY a.created_at DESC
             LIMIT $${values.length - 1} OFFSET $${values.length}`,
            values,
        )

        res.json({
            applications: rows,
            total: Number(countResult.rows[0].count),
            page,
            limit,
        })
    } catch (err) {
        next(err)
    }
})

router.post("/:id/withdraw", auth, async (req, res, next) => {
    try {
        const own = await pool.query(
            "SELECT status FROM applications WHERE id=$1 AND user_id=$2",
            [req.params.id, req.user.id],
        )
        if (own.rows.length === 0) return res.status(404).json({ message: "Không tìm thấy đơn ứng tuyển" })

        const current = own.rows[0].status
        if (!["pending", "submitted", "reviewed"].includes(current)) {
            return res.status(400).json({ message: "Đơn này không thể rút ở trạng thái hiện tại" })
        }

        await pool.query(
            "UPDATE applications SET status='withdrawn', updated_at=NOW() WHERE id=$1",
            [req.params.id],
        )
        res.json({ success: true })
    } catch (err) {
        next(err)
    }
})

module.exports = router
