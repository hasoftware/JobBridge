const express = require("express")
const pool = require("../../config/db")
const auth = require("../middleware/auth")
const { requireRole } = auth

const router = express.Router()

router.get("/", async (req, res, next) => {
    const { q, location, type, industry, page = 1, limit = 20 } = req.query
    const offset = (Number(page) - 1) * Number(limit)
    const conditions = []
    const values = []

    if (q) {
        values.push(`%${q}%`)
        conditions.push(`j.title ILIKE $${values.length}`)
    }
    if (location) {
        values.push(`%${location}%`)
        conditions.push(`j.location ILIKE $${values.length}`)
    }
    if (type) {
        values.push(type)
        conditions.push(`j.job_type = $${values.length}`)
    }
    if (industry) {
        values.push(industry)
        conditions.push(`c.industry = $${values.length}`)
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    try {
        values.push(Number(limit), offset)
        const { rows } = await pool.query(
            `SELECT j.id, j.title, j.location, j.salary_min, j.salary_max, j.currency,
                    j.job_type, j.publishing_date, j.created_by,
                    c.name AS company_name, c.logo_url AS company_logo, c.industry
             FROM jobs j
             LEFT JOIN companies c ON c.id = j.company_id
             ${where}
             ORDER BY j.publishing_date DESC
             LIMIT $${values.length - 1} OFFSET $${values.length}`,
            values,
        )

        const countResult = await pool.query(
            `SELECT COUNT(*) FROM jobs j LEFT JOIN companies c ON c.id = j.company_id ${where}`,
            values.slice(0, values.length - 2),
        )

        res.json({
            jobs: rows,
            total: Number(countResult.rows[0].count),
            page: Number(page),
            limit: Number(limit),
        })
    } catch (err) {
        next(err)
    }
})

router.get("/mine", auth, requireRole("recruiter", "admin"), async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `SELECT j.*, c.name AS company_name, c.logo_url AS company_logo
             FROM jobs j
             LEFT JOIN companies c ON c.id = j.company_id
             WHERE j.created_by = $1
             ORDER BY j.created_at DESC`,
            [req.user.id],
        )
        res.json(rows)
    } catch (err) {
        next(err)
    }
})

router.get("/saved", auth, async (req, res, next) => {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20))
    const offset = (page - 1) * limit

    try {
        const { rows } = await pool.query(
            `SELECT j.id, j.title, j.location, j.salary_min, j.salary_max, j.currency,
                    j.job_type, j.publishing_date, j.application_deadline,
                    c.name AS company_name, c.logo_url AS company_logo,
                    s.created_at AS saved_at
             FROM saved_jobs s
             INNER JOIN jobs j ON j.id = s.job_id
             LEFT JOIN companies c ON c.id = j.company_id
             WHERE s.user_id = $1
             ORDER BY s.created_at DESC
             LIMIT $2 OFFSET $3`,
            [req.user.id, limit, offset],
        )

        const countResult = await pool.query(
            "SELECT COUNT(*) FROM saved_jobs WHERE user_id = $1",
            [req.user.id],
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

router.post("/:id/save", auth, async (req, res, next) => {
    try {
        const exists = await pool.query("SELECT 1 FROM jobs WHERE id=$1", [req.params.id])
        if (exists.rows.length === 0) return res.status(404).json({ message: "Job not found" })

        const { rows } = await pool.query(
            `INSERT INTO saved_jobs(user_id, job_id) VALUES($1, $2)
             ON CONFLICT (user_id, job_id) DO UPDATE SET user_id = EXCLUDED.user_id
             RETURNING created_at`,
            [req.user.id, req.params.id],
        )
        res.json({ success: true, saved_at: rows[0].created_at })
    } catch (err) {
        next(err)
    }
})

router.delete("/:id/save", auth, async (req, res, next) => {
    try {
        const result = await pool.query(
            "DELETE FROM saved_jobs WHERE user_id=$1 AND job_id=$2",
            [req.user.id, req.params.id],
        )
        res.json({ success: true, removed: result.rowCount > 0 })
    } catch (err) {
        next(err)
    }
})

router.get("/:id", async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `SELECT j.*, c.name AS company_name, c.logo_url AS company_logo, c.location AS company_location
             FROM jobs j
             LEFT JOIN companies c ON c.id = j.company_id
             WHERE j.id = $1`,
            [req.params.id],
        )
        if (rows.length === 0) return res.status(404).json({ message: "Job not found" })

        await pool.query(
            "UPDATE jobs SET view_count = COALESCE(view_count,0) + 1 WHERE id=$1",
            [req.params.id],
        )

        res.json(rows[0])
    } catch (err) {
        next(err)
    }
})

router.post("/", auth, requireRole("recruiter", "admin"), async (req, res, next) => {
    const {
        title, description, responsibilities, required_qualifications,
        salary_min, salary_max, currency, location, job_type, application_deadline,
    } = req.body

    if (!title) return res.status(400).json({ message: "Title is required" })

    try {
        const company = await pool.query("SELECT id FROM companies WHERE user_id=$1", [req.user.id])
        const company_id = company.rows[0]?.id || null

        const { rows } = await pool.query(
            `INSERT INTO jobs(title, description, responsibilities, required_qualifications,
                              salary_min, salary_max, currency, location, job_type,
                              application_deadline, company_id, created_by)
             VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
             RETURNING *`,
            [title, description, responsibilities, required_qualifications,
             salary_min, salary_max, currency, location, job_type,
             application_deadline, company_id, req.user.id],
        )

        res.status(201).json(rows[0])
    } catch (err) {
        next(err)
    }
})

router.put("/:id", auth, requireRole("recruiter", "admin"), async (req, res, next) => {
    try {
        const job = await pool.query("SELECT created_by FROM jobs WHERE id=$1", [req.params.id])
        if (job.rows.length === 0) return res.status(404).json({ message: "Job not found" })
        if (req.user.role !== "admin" && job.rows[0].created_by !== req.user.id) {
            return res.status(403).json({ message: "Forbidden" })
        }

        const fields = ["title", "description", "responsibilities", "required_qualifications",
                        "salary_min", "salary_max", "currency", "location", "job_type", "application_deadline"]
        const updates = []
        const values = []

        for (const f of fields) {
            if (req.body[f] !== undefined) {
                values.push(req.body[f])
                updates.push(`${f} = $${values.length}`)
            }
        }

        if (updates.length === 0) return res.status(400).json({ message: "No fields to update" })

        values.push(req.params.id)
        const { rows } = await pool.query(
            `UPDATE jobs SET ${updates.join(", ")}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
            values,
        )

        res.json(rows[0])
    } catch (err) {
        next(err)
    }
})

router.delete("/:id", auth, requireRole("recruiter", "admin"), async (req, res, next) => {
    try {
        const job = await pool.query("SELECT created_by FROM jobs WHERE id=$1", [req.params.id])
        if (job.rows.length === 0) return res.status(404).json({ message: "Job not found" })
        if (req.user.role !== "admin" && job.rows[0].created_by !== req.user.id) {
            return res.status(403).json({ message: "Forbidden" })
        }

        await pool.query("DELETE FROM jobs WHERE id=$1", [req.params.id])
        res.json({ success: true })
    } catch (err) {
        next(err)
    }
})

module.exports = router
