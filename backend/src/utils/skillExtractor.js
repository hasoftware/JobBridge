const { spawn } = require("child_process")
const path = require("path")

function callDaemon(data) {
    return new Promise((resolve, reject) => {
        const jsonStr = JSON.stringify(data)
        const payload = Buffer.from(jsonStr, 'utf8').toString('base64')
        const py = spawn("python", [path.join(__dirname, "../../bridge.py")], { env: { ...process.env, PYTHONUTF8: "1" } })
        
        let stdout = ""
        let stderr = ""
        
        py.stdout.on("data", (d) => (stdout += d.toString()))
        py.stderr.on("data", (d) => (stderr += d.toString()))
        py.on("close", (code) => {
            if (code !== 0) return reject(new Error(`Daemon error: ${stderr}`))
            try {
                resolve(JSON.parse(stdout))
            } catch {
                reject(new Error("Invalid response from daemon"))
            }
        })
        
        py.stdin.write(payload)
        py.stdin.end()
    })
}

/**
 * Extracts skills from an array of texts using the Python NER daemon.
 * @param {string[]} texts - Array of text strings to parse (e.g. descriptions)
 * @returns {Promise<string[][]>} - Array of extracted skills for each text
 */
async function extractSkillsBatch(texts) {
    if (!texts || texts.length === 0) return []
    
    try {
        const response = await callDaemon({
            type: "extract_skills",
            texts: texts
        })
        return response.skills || []
    } catch (err) {
        console.error("Error extracting skills via daemon:", err)
        return texts.map(() => []) // return empty skills on error to avoid breaking main flow
    }
}

/**
 * Extracts skills from a CV PDF file using the Python daemon.
 * @param {string} pdfPath - The relative path to the PDF file (e.g. from backend/uploads/...)
 * @returns {Promise<string[]>} - Extracted skills
 */
async function extractCvSkills(pdfPath) {
    if (!pdfPath) return []
    
    try {
        const response = await callDaemon({
            type: "extract_cv_skills",
            pdf_path: pdfPath
        })
        return response.skills || []
    } catch (err) {
        console.error("Error extracting CV skills via daemon:", err)
        return []
    }
}

/**
 * Extracts skills from a single text string using the Python NER daemon.
 * @param {string} text - The text string to parse
 * @returns {Promise<string[]>} - Extracted skills
 */
async function extractSkills(text) {
    if (!text) return []
    const results = await extractSkillsBatch([text])
    return results[0] || []
}

/**
 * Calls the TF-IDF recommendation engine inside the Python daemon.
 * @param {Object} user - {id, profile_description, search_queries, applied_titles}
 * @param {Array} appliedJobIds - [1, 2, 3]
 * @returns {Promise<Array>} - Array of [job_id, score]
 */
async function recommendJobs(user, appliedJobIds) {
    if (!user) return []
    
    try {
        const response = await callDaemon({
            type: "recommend",
            user: user,
            applied_job_ids: appliedJobIds || [],
            top_k: 200
        })
        return response.recommendations || []
    } catch (err) {
        console.error("Error recommending jobs via daemon:", err)
        return []
    }
}

/**
 * Pushes jobs to Python daemon to update the TF-IDF matrix.
 * @param {Array} jobs - Jobs array
 */
async function syncTfIdfMatrix(jobs) {
    if (!jobs || jobs.length === 0) return
    try {
        await callDaemon({
            type: "sync_matrix",
            jobs: jobs
        })
    } catch (err) {
        console.error("Error syncing matrix to daemon:", err)
    }
}

module.exports = {
    extractSkills,
    extractSkillsBatch,
    extractCvSkills,
    recommendJobs,
    syncTfIdfMatrix
}
