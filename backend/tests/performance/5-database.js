const { Pool } = require("pg")
const { timed, summary } = require("./helpers")

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "jobbridge",
})

const N = Number(process.env.PERF_N || 200)

const QUERIES = [
    { name: "list jobs", sql: "SELECT id, title FROM jobs LIMIT 20" },
    { name: "search jobs", sql: "SELECT id, title FROM jobs WHERE search_vector @@ plainto_tsquery('english', 'developer') LIMIT 20" },
    { name: "join applications", sql: "SELECT a.id, j.title FROM applications a JOIN jobs j ON j.id = a.job_id LIMIT 20" },
    { name: "count companies", sql: "SELECT COUNT(*) FROM companies" },
]

async function run() {
    console.log("=== Database query test ===")

    for (const q of QUERIES) {
        const samples = []
        for (let i = 0; i < N; i++) {
            const { durationMs } = await timed(() => pool.query(q.sql))
            samples.push(durationMs)
        }
        const s = summary(samples)
        console.log(`${q.name}\tavg=${s.avg.toFixed(2)}ms p95=${s.p95.toFixed(2)}ms`)
    }

    await pool.end()
}

run().catch((err) => {
    console.error(err)
    process.exit(1)
})
