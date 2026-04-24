const { timed, getRequest, summary } = require("./helpers")

const N = Number(process.env.PERF_N || 100)
const ENDPOINTS = ["/jobs", "/jobs/recent", "/companies"]

async function run() {
    const results = {}

    for (const path of ENDPOINTS) {
        const samples = []
        for (let i = 0; i < N; i++) {
            const { durationMs } = await timed(() => getRequest(path))
            samples.push(durationMs)
        }
        results[path] = summary(samples)
    }

    console.log("=== Latency test ===")
    for (const path in results) {
        const s = results[path]
        console.log(`${path}\tavg=${s.avg.toFixed(1)}ms p95=${s.p95.toFixed(1)}ms p99=${s.p99.toFixed(1)}ms`)
    }
}

run().catch((err) => {
    console.error(err)
    process.exit(1)
})
