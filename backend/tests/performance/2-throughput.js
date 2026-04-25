const { getRequest, summary } = require("./helpers")

const DURATION_MS = Number(process.env.PERF_DURATION || 10000)
const CONCURRENCY = Number(process.env.PERF_CONCURRENCY || 20)

async function worker(endpoint, deadline) {
    let count = 0
    let errors = 0
    while (Date.now() < deadline) {
        try {
            const res = await getRequest(endpoint)
            if (res.status >= 400) errors++
            count++
        } catch {
            errors++
        }
    }
    return { count, errors }
}

async function run() {
    const endpoint = "/jobs"
    const deadline = Date.now() + DURATION_MS

    const workers = Array.from({ length: CONCURRENCY }, () => worker(endpoint, deadline))
    const results = await Promise.all(workers)

    const total = results.reduce((sum, r) => sum + r.count, 0)
    const errors = results.reduce((sum, r) => sum + r.errors, 0)
    const rps = total / (DURATION_MS / 1000)

    console.log(`=== Throughput test ${endpoint} ===`)
    console.log(`Concurrency: ${CONCURRENCY}, Duration: ${DURATION_MS}ms`)
    console.log(`Total: ${total}, Errors: ${errors}, RPS: ${rps.toFixed(1)}`)
}

run().catch((err) => {
    console.error(err)
    process.exit(1)
})
