const { getRequest, summary } = require("./helpers")

const DURATION_MS = Number(process.env.PERF_DURATION || 30000)
const RPS_TARGET = Number(process.env.PERF_RPS || 50)

async function run() {
    const endpoint = "/jobs"
    const interval = 1000 / RPS_TARGET
    const deadline = Date.now() + DURATION_MS

    let success = 0
    let failures = 0
    const latencies = []

    while (Date.now() < deadline) {
        const start = Date.now()
        try {
            const res = await getRequest(endpoint)
            const dur = Date.now() - start
            if (res.status >= 200 && res.status < 300) {
                success++
                latencies.push(dur)
            } else {
                failures++
            }
        } catch {
            failures++
        }

        const elapsed = Date.now() - start
        if (elapsed < interval) {
            await new Promise((r) => setTimeout(r, interval - elapsed))
        }
    }

    const total = success + failures
    const rate = (success / total) * 100
    const stat = summary(latencies)

    console.log(`=== Reliability test ${endpoint} ===`)
    console.log(`Total: ${total}, Success: ${success}, Failures: ${failures}`)
    console.log(`Success rate: ${rate.toFixed(2)}%`)
    console.log(`Latency avg=${stat.avg.toFixed(1)}ms p95=${stat.p95.toFixed(1)}ms`)
}

run().catch((err) => {
    console.error(err)
    process.exit(1)
})
