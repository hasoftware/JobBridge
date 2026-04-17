const pool = require("../../config/db")

const getCandidateById = async (userId) => {
    const { rows } = await pool.query(
        "SELECT * FROM candidate_profiles WHERE user_id=$1",
        [userId],
    )
    return rows[0] || null
}

const updateCandidate = async (userId, data) => {
    const fields = ["full_name", "phone", "address", "bio", "title", "experience_years", "avatar_url"]
    const updates = []
    const values = []

    for (const f of fields) {
        if (data[f] !== undefined) {
            values.push(data[f])
            updates.push(`${f} = $${values.length}`)
        }
    }

    if (updates.length === 0) return getCandidateById(userId)

    values.push(userId)
    const { rows } = await pool.query(
        `UPDATE candidate_profiles SET ${updates.join(", ")}, updated_at = NOW() WHERE user_id = $${values.length} RETURNING *`,
        values,
    )
    return rows[0]
}

const getCompanyByUserId = async (userId) => {
    const { rows } = await pool.query(
        "SELECT * FROM companies WHERE user_id=$1",
        [userId],
    )
    return rows[0] || null
}

const updateCompany = async (userId, data) => {
    const fields = ["name", "description", "industry", "company_size", "founded_year", "phone", "website", "logo_url", "location"]
    const updates = []
    const values = []

    for (const f of fields) {
        if (data[f] !== undefined) {
            values.push(data[f])
            updates.push(`${f} = $${values.length}`)
        }
    }

    if (updates.length === 0) return getCompanyByUserId(userId)

    values.push(userId)
    const { rows } = await pool.query(
        `UPDATE companies SET ${updates.join(", ")} WHERE user_id = $${values.length} RETURNING *`,
        values,
    )
    return rows[0]
}

module.exports = {
    getCandidateById,
    updateCandidate,
    getCompanyByUserId,
    updateCompany,
}
