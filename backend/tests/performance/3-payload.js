const { timed, getRequest, postRequest, summary } = require("./helpers")

const SIZES = [1, 10, 50, 100, 500]

async function testPayload(sizeKb) {
    const payload = "x".repeat(sizeKb * 1024)
    const samples = []

    for (let i = 0; i < 50; i++) {
        const { durationMs } = await timed(() => postRequest("/echo", { data: payload }))
        samples.push(durationMs)
    }

    return summary(samples)
}

async function run() {
    console.log("=== Payload size test ===")

    for (const size of SIZES) {
        const result = await testPayload(size)
        console.log(`${size}KB\tavg=${result.avg.toFixed(1)}ms p95=${result.p95.toFixed(1)}ms`)
    }
}

run().catch((err) => {
    console.error(err)
    process.exit(1)
})
