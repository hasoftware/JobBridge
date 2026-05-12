const express = require("express")
const pool = require("../../config/db")
const auth = require("../middleware/auth")
const { requireRole } = auth

const router = express.Router()

router.get("/mine", auth, requireRole("recruiter", "admin"), async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            "SELECT * FROM companies WHERE user_id = $1",
            [req.user.id],
        )
        res.json(rows[0] || null)
    } catch (err) {
        next(err)
    }
})

router.put("/mine", auth, requireRole("recruiter", "admin"), async (req, res, next) => {
    const { name, description, website, logo_url, location, industry, company_size } = req.body
    if (!name || !name.trim()) return res.status(400).json({ message: "Tên công ty là bắt buộc" })

    const size = company_size && VALID_SIZES.includes(company_size) ? company_size : null

    try {
        const existing = await pool.query("SELECT id FROM companies WHERE user_id = $1", [req.user.id])
        let result
        if (existing.rows.length > 0) {
            result = await pool.query(
                `UPDATE companies SET name=$1, description=$2, website=$3, logo_url=$4,
                 location=$5, industry=$6, company_size=$7 WHERE user_id=$8 RETURNING *`,
                [name.trim(), description || null, website || null, logo_url || null,
                 location || null, industry || null, size, req.user.id],
            )
        } else {
            result = await pool.query(
                `INSERT INTO companies (user_id, name, description, website, logo_url, location, industry, company_size)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                [req.user.id, name.trim(), description || null, website || null,
                 logo_url || null, location || null, industry || null, size],
            )
        }
        res.json(result.rows[0])
    } catch (err) {
        next(err)
    }
})

const VALID_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"]

router.get("/featured", async (req, res, next) => {
    const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 8))
    try {
        const { rows } = await pool.query(
            `SELECT c.id, c.name, c.description, c.logo_url, c.location, c.industry, c.company_size, c.website,
                    COALESCE(j.cnt, 0)::int AS active_jobs,
                    COALESCE(a.cnt, 0)::int AS recent_applications
             FROM companies c
             LEFT JOIN (
                 SELECT company_id, COUNT(*) AS cnt
                 FROM jobs
                 WHERE COALESCE(application_deadline, NOW() + INTERVAL '1 year') >= NOW()
                 GROUP BY company_id
             ) j ON j.company_id = c.id
             LEFT JOIN (
                 SELECT j.company_id, COUNT(a.id) AS cnt
                 FROM applications a
                 INNER JOIN jobs j ON j.id = a.job_id
                 WHERE a.created_at >= NOW() - INTERVAL '30 days'
                 GROUP BY j.company_id
             ) a ON a.company_id = c.id
             WHERE c.name IS NOT NULL
             ORDER BY (COALESCE(j.cnt, 0) + COALESCE(a.cnt, 0) * 0.5) DESC, c.created_at DESC
             LIMIT $1`,
            [limit],
        )
        res.json(rows)
    } catch (err) {
        next(err)
    }
})

router.get("/", async (req, res, next) => {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(60, Math.max(1, Number(req.query.limit) || 24))
    const offset = (page - 1) * limit
    const q = (req.query.q || "").trim()
    const industry = (req.query.industry || "").trim()
    const size = (req.query.size || "").trim()
    const location = (req.query.location || "").trim()

    const conditions = ["c.name IS NOT NULL"]
    const values = []

    if (q) {
        values.push(`%${q}%`)
        conditions.push(`c.name ILIKE $${values.length}`)
    }
    if (industry) {
        values.push(industry)
        conditions.push(`c.industry = $${values.length}`)
    }
    if (size && VALID_SIZES.includes(size)) {
        values.push(size)
        conditions.push(`c.company_size = $${values.length}`)
    }
    if (location) {
        values.push(`%${location}%`)
        conditions.push(`c.location ILIKE $${values.length}`)
    }

    const where = `WHERE ${conditions.join(" AND ")}`

    try {
        const countResult = await pool.query(
            `SELECT COUNT(*) FROM companies c ${where}`,
            values,
        )

        values.push(limit, offset)
        const { rows } = await pool.query(
            `SELECT c.id, c.name, c.description, c.logo_url, c.location, c.industry, c.company_size, c.website,
                    COALESCE(j.cnt, 0)::int AS active_jobs
             FROM companies c
             LEFT JOIN (
                 SELECT company_id, COUNT(*) AS cnt
                 FROM jobs
                 WHERE COALESCE(application_deadline, NOW() + INTERVAL '1 year') >= NOW()
                 GROUP BY company_id
             ) j ON j.company_id = c.id
             ${where}
             ORDER BY COALESCE(j.cnt, 0) DESC, c.name ASC
             LIMIT $${values.length - 1} OFFSET $${values.length}`,
            values,
        )

        res.json({
            companies: rows,
            total: Number(countResult.rows[0].count),
            page,
            limit,
        })
    } catch (err) {
        next(err)
    }
})

router.get("/filters", async (req, res, next) => {
    try {
        const industries = await pool.query(
            "SELECT DISTINCT industry FROM companies WHERE industry IS NOT NULL AND industry <> '' ORDER BY industry",
        )
        const locations = await pool.query(
            "SELECT DISTINCT location FROM companies WHERE location IS NOT NULL AND location <> '' ORDER BY location",
        )
        res.json({
            industries: industries.rows.map((r) => r.industry),
            sizes: VALID_SIZES,
            locations: locations.rows.map((r) => r.location),
        })
    } catch (err) {
        next(err)
    }
})

router.get("/:id", async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `SELECT c.id, c.name, c.description, c.logo_url, c.location, c.industry, c.company_size, c.founded_year, c.phone, c.website, c.verification_status, c.created_at,
                    COALESCE(j.cnt, 0)::int AS active_jobs
             FROM companies c
             LEFT JOIN (
                 SELECT company_id, COUNT(*) AS cnt
                 FROM jobs
                 WHERE COALESCE(application_deadline, NOW() + INTERVAL '1 year') >= NOW()
                 GROUP BY company_id
             ) j ON j.company_id = c.id
             WHERE c.id = $1`,
            [req.params.id],
        )
        if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy công ty" })
        res.json(rows[0])
    } catch (err) {
        next(err)
    }
})

router.get("/:id/jobs", async (req, res, next) => {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12))
    const offset = (page - 1) * limit

    try {
        const countResult = await pool.query(
            "SELECT COUNT(*) FROM jobs WHERE company_id = $1",
            [req.params.id],
        )

        const { rows } = await pool.query(
            `SELECT j.id, j.title, j.location, j.salary_min, j.salary_max, j.currency,
                    j.job_type, j.publishing_date, j.application_deadline
             FROM jobs j
             WHERE j.company_id = $1
             ORDER BY j.publishing_date DESC NULLS LAST
             LIMIT $2 OFFSET $3`,
            [req.params.id, limit, offset],
        )

        res.json({
            jobs: rows,
            total: Number(countResult.rows[0].count),
            page,
            limit,
        })
    } catch (err) {
        next(err)
    }
})

module.exports = router
