const pool = require("../../config/db")

const pendingCounts = new Map()

const getUTCHourBucket = (date = new Date()) => {
    const d = new Date(date)
    d.setUTCMinutes(0, 0, 0)
    return d.toISOString()
}

const recordJobView = (jobID) => {
    const bucket = getUTCHourBucket()
    const key = `${jobID}|${bucket}`
    pendingCounts.set(key, (pendingCounts.get(key) || 0) + 1)

    console.log("Job view recored") 
    console.log(pendingCounts)
}

const flushViewCounts = async () => {
    if (pendingCounts.size === 0) return

    const snapshot = new Map(pendingCounts)
    pendingCounts.clear()

    const client = await pool.connect()

    try {
        await client.query("BEGIN")

        const values = []
        const params = []
        let i = 1

        for (const [key, count] of snapshot.entries()) {
            const [jobId, statHour] = key.split("|")
            values.push(`($${i++}::uuid, $${i++}::timestamptz, $${i++})`)
            params.push(jobId, statHour, count)
        }

        await client.query(
            `
            INSERT INTO job_views (job_id, date, view_count)
            VALUES ${values.join(", ")}
            ON CONFLICT (job_id, date)
            DO UPDATE
            SET view_count = job_views.view_count + EXCLUDED.view_count
            `,
            params,
        )

        await client.query("COMMIT")
    } catch (err) {
        await client.query("ROLLBACK")

        for (const [key, count] of snapshot.entries()) {
            pendingCounts.set(key, (pendingCounts.get(key) || 0) + count)
        }

        console.error("Failed to flush view counts:", err)
    } finally {
        client.release()
    }
}

function startViewCountFlushWorker(intervalMs = 60000) {
    setInterval(async () => {
        try {
            await flushViewCounts()
        } catch (err) {
            console.error("View count worker error:", err)
        }
    }, intervalMs)
}

module.exports = {
    recordJobView,
    startViewCountFlushWorker,
}