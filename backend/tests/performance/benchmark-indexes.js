const { Pool } = require("pg")
const { timed, summary } = require("./helpers")

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "jobbridge",
})

const N = 100

const QUERIES_INDEXED = [
    { name: "jobs by created_by", sql: "SELECT id FROM jobs WHERE created_by = $1 LIMIT 20", params: [1] },
    { name: "applications by user", sql: "SELECT id FROM applications WHERE user_id = $1 LIMIT 20", params: [1] },
    { name: "jobs by date range", sql: "SELECT id FROM jobs WHERE publishing_date >= NOW() - INTERVAL '7 days' LIMIT 50", params: [] },
]

async function run() {
    console.log("=== Index benchmark ===")
    console.log("Query\tavg\tp95\tmin\tmax")

    for (const q of QUERIES_INDEXED) {
        const samples = []
        for (let i = 0; i < N; i++) {
            const { durationMs } = await timed(() => pool.query(q.sql, q.params))
            samples.push(durationMs)
        }
        const s = summary(samples)
        console.log(`${q.name}\t${s.avg.toFixed(2)}ms\t${s.p95.toFixed(2)}ms\t${s.min.toFixed(2)}ms\t${s.max.toFixed(2)}ms`)
    }

    await pool.end()
}

run().catch((err) => {
    console.error(err)
    process.exit(1)
})
