const { getRequest, summary } = require("./helpers")

const STAGES = [10, 25, 50, 100, 200]
const DURATION_PER_STAGE = Number(process.env.PERF_STAGE_MS || 5000)

async function workerLoop(endpoint, deadline, latencies) {
    while (Date.now() < deadline) {
        const start = Date.now()
        try {
            await getRequest(endpoint)
            latencies.push(Date.now() - start)
        } catch {}
    }
}

async function run() {
    const endpoint = "/jobs"

    console.log("=== Scalability test ===")
    console.log("Stage\tRPS\tp95\tavg")

    for (const concurrency of STAGES) {
        const deadline = Date.now() + DURATION_PER_STAGE
        const latencies = []
        const workers = Array.from({ length: concurrency }, () => workerLoop(endpoint, deadline, latencies))
        await Promise.all(workers)

        const s = summary(latencies)
        const rps = latencies.length / (DURATION_PER_STAGE / 1000)

        console.log(`${concurrency}\t${rps.toFixed(0)}\t${s.p95.toFixed(0)}ms\t${s.avg.toFixed(0)}ms`)
    }
}

run().catch((err) => {
    console.error(err)
    process.exit(1)
})
