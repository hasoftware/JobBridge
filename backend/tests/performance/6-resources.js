const { getRequest } = require("./helpers")

const DURATION_MS = Number(process.env.PERF_DURATION || 30000)

function snapshot() {
    const mem = process.memoryUsage()
    return {
        rssMb: mem.rss / 1024 / 1024,
        heapUsedMb: mem.heapUsed / 1024 / 1024,
        external: mem.external / 1024 / 1024,
    }
}

async function run() {
    const endpoint = "/jobs"
    const deadline = Date.now() + DURATION_MS

    const samples = []
    let count = 0

    const interval = setInterval(() => {
        samples.push(snapshot())
    }, 1000)

    while (Date.now() < deadline) {
        await getRequest(endpoint)
        count++
    }

    clearInterval(interval)

    const peakRss = Math.max(...samples.map((s) => s.rssMb))
    const peakHeap = Math.max(...samples.map((s) => s.heapUsedMb))

    console.log("=== Resources test ===")
    console.log(`Requests: ${count}`)
    console.log(`Peak RSS: ${peakRss.toFixed(1)}MB`)
    console.log(`Peak heap: ${peakHeap.toFixed(1)}MB`)
}

run().catch((err) => {
    console.error(err)
    process.exit(1)
})
