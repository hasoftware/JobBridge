const express = require("express")
const pool = require("../../config/db")
const { industries } = require("../../config")
const auth = require("../middleware/auth")
const { requireRole } = auth

const router = express.Router()

router.get("/candidates", auth, requireRole("recruiter", "admin"), async (req, res, next) => {
    const q = String(req.query.q || "").trim()
    const gender = String(req.query.gender || "").trim()
    const location = String(req.query.location || "").trim()
    const skill = String(req.query.skill || "").trim()
    const limit = Math.min(40, Math.max(1, Number(req.query.limit) || 20))

    const where = ["u.role = 'job_seeker'"]
    const values = []

    if (q) {
        values.push(`%${q}%`)
        where.push(`(u.full_name ILIKE $${values.length} OR u.email ILIKE $${values.length} OR u.bio ILIKE $${values.length})`)
    }
    if (gender) {
        values.push(gender)
        where.push(`u.gender = $${values.length}`)
    }
    if (location) {
        values.push(`%${location}%`)
        where.push(`(u.address->>'province_name' ILIKE $${values.length} OR u.address->>'district_name' ILIKE $${values.length})`)
    }
    if (skill) {
        values.push(`%${skill.toLowerCase()}%`)
        where.push(`EXISTS (
            SELECT 1 FROM cvs cv, jsonb_array_elements(cv.data->'skills') s
            WHERE cv.user_id = u.id AND lower(s->>'name') LIKE $${values.length}
        )`)
    }

    try {
        values.push(limit)
        const { rows } = await pool.query(
            `SELECT u.id, u.public_id, u.full_name, u.email, u.gender,
                    u.address->>'province_name' AS location, u.bio,
                    COALESCE(
                        (SELECT jsonb_agg(DISTINCT s->>'name')
                         FROM cvs cv, jsonb_array_elements(cv.data->'skills') s
                         WHERE cv.user_id = u.id AND s->>'name' <> ''),
                        '[]'::jsonb
                    ) AS skills
             FROM users u
             WHERE ${where.join(" AND ")}
             ORDER BY u.created_at DESC
             LIMIT $${values.length}`,
            values,
        )
        res.json(rows)
    } catch (err) {
        next(err)
    }
})

router.get("/candidates/:id", auth, requireRole("recruiter", "admin"), async (req, res, next) => {
    try {
        const userRes = await pool.query(
            `SELECT id, public_id, full_name, email, phone, date_of_birth, gender, address, bio
             FROM users WHERE id = $1 AND role = 'job_seeker'`,
            [req.params.id],
        )
        if (userRes.rows.length === 0) return res.status(404).json({ message: "Không tìm thấy ứng viên" })

        const cvsRes = await pool.query(
            `SELECT id, title, data->'skills' AS skills, created_at
             FROM cvs WHERE user_id = $1 ORDER BY updated_at DESC`,
            [req.params.id],
        )

        const appsRes = await pool.query(
            `SELECT a.id, a.status, a.created_at,
                    j.title AS job_title,
                    c.name AS company_name
             FROM applications a
             JOIN jobs j ON j.id = a.job_id
             LEFT JOIN companies c ON c.id = j.company_id
             WHERE a.user_id = $1
             ORDER BY a.created_at DESC
             LIMIT 20`,
            [req.params.id],
        )

        res.json({
            ...userRes.rows[0],
            cvs: cvsRes.rows,
            applications: appsRes.rows,
        })
    } catch (err) {
        next(err)
    }
})

router.get("/", async (req, res, next) => {
    try {
        const q = String(req.query.q || "").trim()
        const location = String(req.query.location || "").trim()
        const industry = String(req.query.industry || "").trim()
        const entity = String(req.query.entity || "all").trim().toLowerCase()
        const excludeUserId = Number(req.query.exclude_user_id)
        const hasExcludeUserId = Number.isInteger(excludeUserId) && excludeUserId > 0
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 6, 1), 20)

        if (industry && !industries.includes(industry)) {
            return res.status(400).json({ message: "industry must be a valid GICS sector" })
        }

        const canSearchJobs = entity === "all" || entity === "jobs"
        const canSearchCompanies = entity === "all" || entity === "companies"
        const canSearchCandidates = entity === "all" || entity === "candidates"

        let jobs = []
        let companies = []
        let candidates = []

        if (canSearchJobs) {
            const jobValues = []
            const jobWhere = [
                "(j.publishing_date IS NULL OR j.publishing_date <= NOW())",
                "(j.application_deadline IS NULL OR j.application_deadline >= NOW())",
            ]
            let rankExpr = "0"

            if (q) {
                jobValues.push(q)
                const qIdx = jobValues.length
                rankExpr = `ts_rank(j.search_vector, plainto_tsquery('english', $${qIdx}))`
                jobWhere.push(`(
                    j.search_vector @@ plainto_tsquery('english', $${qIdx})
                    OR j.title ILIKE '%' || $${qIdx} || '%'
                    OR COALESCE(j.description, '') ILIKE '%' || $${qIdx} || '%'
                    OR COALESCE(j.required_qualifications, '') ILIKE '%' || $${qIdx} || '%'
                    OR COALESCE(c.name, '') ILIKE '%' || $${qIdx} || '%'
                )`)
            }

            if (location) {
                jobValues.push(location)
                jobWhere.push(`COALESCE(j.location, '') ILIKE '%' || $${jobValues.length} || '%'`)
            }

            if (industry) {
                jobValues.push(industry)
                jobWhere.push(`COALESCE(c.industry, '') ILIKE '%' || $${jobValues.length} || '%'`)
            }

            if (hasExcludeUserId) {
                jobValues.push(excludeUserId)
                jobWhere.push(`j.created_by <> $${jobValues.length}`)
            }

            const jobsQuery = `
                SELECT
                    j.id,
                    j.title,
                    j.location,
                    j.job_type,
                    j.salary_min,
                    j.salary_max,
                    j.currency,
                    c.name AS company_name,
                    c.industry AS company_industry,
                    ${rankExpr} AS rank
                FROM jobs j
                LEFT JOIN users u ON u.id = j.created_by
                LEFT JOIN companies c ON c.user_id = u.id
                WHERE ${jobWhere.join(" AND ")}
                ORDER BY rank DESC, j.created_at DESC
                LIMIT ${limit}
            `
            const jobsResult = await pool.query(jobsQuery, jobValues)
            jobs = jobsResult.rows
        }

        if (canSearchCompanies) {
            const companyValues = []
            const companyWhere = []

            if (q) {
                companyValues.push(q)
                const qIdx = companyValues.length
                companyWhere.push(`(
                        c.name ILIKE '%' || $${qIdx} || '%'
                        OR COALESCE(c.description, '') ILIKE '%' || $${qIdx} || '%'
                        OR COALESCE(c.industry, '') ILIKE '%' || $${qIdx} || '%'
                        OR COALESCE(c.website, '') ILIKE '%' || $${qIdx} || '%'
                        OR COALESCE(c.phone, '') ILIKE '%' || $${qIdx} || '%'
                        OR COALESCE(u.email, '') ILIKE '%' || $${qIdx} || '%'
                        OR regexp_replace(lower(COALESCE(c.name, '')), '[^a-z0-9]+', '', 'g')
                            LIKE '%' || regexp_replace(lower($${qIdx}), '[^a-z0-9]+', '', 'g') || '%'
                    )`)
            }

            if (location) {
                companyValues.push(location)
                companyWhere.push(`COALESCE(c.location, '') ILIKE '%' || $${companyValues.length} || '%'`)
            }

            if (industry) {
                companyValues.push(industry)
                companyWhere.push(`COALESCE(c.industry, '') ILIKE '%' || $${companyValues.length} || '%'`)
            }

            if (hasExcludeUserId) {
                companyValues.push(excludeUserId)
                companyWhere.push(`c.user_id <> $${companyValues.length}`)
            }

            const companiesQuery = `
                SELECT
                    c.id,
                    c.user_id,
                    c.name,
                    c.description,
                    c.location,
                    c.logo_url,
                    c.industry,
                    c.website,
                    c.phone,
                    c.company_size,
                    c.founded_year,
                    c.verification_status
                FROM companies c
                LEFT JOIN users u ON u.id = c.user_id
                ${companyWhere.length ? `WHERE ${companyWhere.join(" AND ")}` : ""}
                ORDER BY
                    CASE WHEN c.verification_status = 'verified' THEN 0 ELSE 1 END,
                    c.created_at DESC
                LIMIT ${limit}
            `
            const companiesResult = await pool.query(companiesQuery, companyValues)
            companies = companiesResult.rows
        }

        if (canSearchCandidates) {
            const candidateValues = []
            const candidateWhere = []

            if (q) {
                candidateValues.push(q)
                const qIdx = candidateValues.length
                candidateWhere.push(`(
                        COALESCE(cp.full_name, '') ILIKE '%' || $${qIdx} || '%'
                        OR COALESCE(cp.summary, '') ILIKE '%' || $${qIdx} || '%'
                        OR COALESCE(cp.location, '') ILIKE '%' || $${qIdx} || '%'
                        OR COALESCE(u.email, '') ILIKE '%' || $${qIdx} || '%'
                        OR regexp_replace(lower(COALESCE(cp.full_name, '')), '[^a-z0-9]+', '', 'g')
                            LIKE '%' || regexp_replace(lower($${qIdx}), '[^a-z0-9]+', '', 'g') || '%'
                    )`)
            }

            if (location) {
                candidateValues.push(location)
                candidateWhere.push(`COALESCE(cp.location, '') ILIKE '%' || $${candidateValues.length} || '%'`)
            }

            if (hasExcludeUserId) {
                candidateValues.push(excludeUserId)
                candidateWhere.push(`cp.user_id <> $${candidateValues.length}`)
            }

            const candidatesQuery = `
                SELECT
                    cp.id,
                    cp.user_id,
                    cp.full_name,
                    cp.location,
                    cp.summary,
                    cp.avatar_url,
                    u.email
                FROM candidate_profiles cp
                LEFT JOIN users u ON u.id = cp.user_id
                ${candidateWhere.length ? `WHERE ${candidateWhere.join(" AND ")}` : ""}
                ORDER BY cp.created_at DESC
                LIMIT ${limit}
            `
            const candidatesResult = await pool.query(candidatesQuery, candidateValues)
            candidates = candidatesResult.rows
        }

        return res.json({
            query: q,
            jobs,
            companies,
            candidates,
        })
    } catch (err) {
        return next(err)
    }
})

module.exports = router
