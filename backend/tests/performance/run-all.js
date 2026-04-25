const { spawnSync } = require("child_process")
const path = require("path")

const TESTS = [
    "1-latency.js",
    "2-throughput.js",
    "3-payload.js",
    "4-reliability.js",
    "5-database.js",
    "6-resources.js",
    "7-scalability.js",
]

function runTest(file) {
    console.log(`\n>>> Running ${file}`)
    const result = spawnSync("node", [path.join(__dirname, file)], {
        stdio: "inherit",
        env: process.env,
    })
    return result.status === 0
}

let passed = 0
let failed = 0

for (const test of TESTS) {
    if (runTest(test)) passed++
    else failed++
}

console.log(`\n=== Summary: ${passed} passed, ${failed} failed ===`)
process.exit(failed === 0 ? 0 : 1)
