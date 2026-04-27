const pool = require("../../config/db")

const buildUpdateQuery = (table, fields, data, idField, idValue, includeUpdatedAt = false) => {
    const updates = []
    const values = []

    for (const f of fields) {
        if (data[f] !== undefined) {
            values.push(data[f])
            updates.push(`${f} = $${values.length}`)
        }
    }

    if (updates.length === 0) return null

    if (includeUpdatedAt) updates.push("updated_at = NOW()")
    values.push(idValue)

    return {
        sql: `UPDATE ${table} SET ${updates.join(", ")} WHERE ${idField} = $${values.length} RETURNING *`,
        values,
    }
}

const getCandidateById = async (userId) => {
    const { rows } = await pool.query(
        "SELECT * FROM candidate_profiles WHERE user_id=$1",
        [userId],
    )
    return rows[0] || null
}

const updateCandidate = async (userId, data) => {
    const fields = ["full_name", "phone", "address", "bio", "title", "experience_years", "avatar_url"]
    const query = buildUpdateQuery("candidate_profiles", fields, data, "user_id", userId, true)

    if (!query) return getCandidateById(userId)

    const { rows } = await pool.query(query.sql, query.values)
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
    const query = buildUpdateQuery("companies", fields, data, "user_id", userId)

    if (!query) return getCompanyByUserId(userId)

    const { rows } = await pool.query(query.sql, query.values)
    return rows[0]
}

module.exports = {
    getCandidateById,
    updateCandidate,
    getCompanyByUserId,
    updateCompany,
}
