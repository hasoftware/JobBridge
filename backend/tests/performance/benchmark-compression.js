const zlib = require("zlib")
const { promisify } = require("util")

const gzip = promisify(zlib.gzip)
const brotli = promisify(zlib.brotliCompress)

const SIZES = [1, 10, 50, 100]

function makePayload(sizeKb) {
    const word = "javascript "
    return word.repeat(Math.ceil((sizeKb * 1024) / word.length)).slice(0, sizeKb * 1024)
}

async function bench(name, fn, payload) {
    const start = process.hrtime.bigint()
    const result = await fn(payload)
    const end = process.hrtime.bigint()
    const dur = Number(end - start) / 1e6
    const ratio = result.length / payload.length
    return { name, dur, ratio, originalKb: payload.length / 1024, compressedKb: result.length / 1024 }
}

async function run() {
    console.log("=== Compression benchmark ===")
    console.log("Size\tAlgo\tDuration\tRatio")

    for (const size of SIZES) {
        const payload = makePayload(size)
        const r1 = await bench("gzip", gzip, payload)
        const r2 = await bench("brotli", brotli, payload)
        console.log(`${size}KB\tgzip\t${r1.dur.toFixed(2)}ms\t${(r1.ratio * 100).toFixed(1)}%`)
        console.log(`${size}KB\tbrotli\t${r2.dur.toFixed(2)}ms\t${(r2.ratio * 100).toFixed(1)}%`)
    }
}

run().catch((err) => {
    console.error(err)
    process.exit(1)
})
