const express = require("express")
const pool = require("../../config/db")

const router = express.Router()

router.get("/jobs", async (req, res) => {
    const { q, location, type, page = 1, limit = 20 } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    const conditions = []
    const values = []

    if (q) {
        values.push(q)
        conditions.push(`search_vector @@ plainto_tsquery('english', $${values.length})`)
    }
    if (location) {
        values.push(location)
        conditions.push(`location ILIKE '%' || $${values.length} || '%'`)
    }
    if (type) {
        values.push(type)
        conditions.push(`job_type = $${values.length}`)
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    try {
        values.push(Number(limit), offset)
        const { rows } = await pool.query(
            `SELECT id, title, location, salary_min, salary_max, currency, job_type, publishing_date
             FROM jobs ${where}
             ORDER BY publishing_date DESC
             LIMIT $${values.length - 1} OFFSET $${values.length}`,
            values,
        )

        const countRes = await pool.query(
            `SELECT COUNT(*) FROM jobs ${where}`,
            values.slice(0, values.length - 2),
        )

        res.json({
            jobs: rows,
            total: Number(countRes.rows[0].count),
            page: Number(page),
            limit: Number(limit),
        })
    } catch (err) {
        console.error("Search error:", err)
        res.status(500).json({ message: err.message })
    }
})

router.get("/companies", async (req, res) => {
    const { q } = req.query
    try {
        const { rows } = await pool.query(
            `SELECT id, name, industry, location FROM companies
             WHERE name ILIKE '%' || $1 || '%' OR industry ILIKE '%' || $1 || '%'
             LIMIT 20`,
            [q || ""],
        )
        res.json({ companies: rows })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

module.exports = router
