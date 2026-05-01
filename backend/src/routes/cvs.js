const express = require("express")
const pool = require("../../config/db")
const auth = require("../middleware/auth")

const router = express.Router()

router.use(auth)

router.get("/", async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            "SELECT id, title, is_default, created_at, updated_at FROM cvs WHERE user_id=$1 ORDER BY updated_at DESC",
            [req.user.id],
        )
        res.json(rows)
    } catch (err) {
        next(err)
    }
})

router.post("/", async (req, res, next) => {
    const { title, data } = req.body
    if (!title || typeof title !== "string" || title.trim().length === 0) {
        return res.status(400).json({ message: "Vui lòng nhập tiêu đề CV" })
    }
    if (title.length > 100) {
        return res.status(400).json({ message: "Tiêu đề không vượt quá 100 ký tự" })
    }
    try {
        const payload = data && typeof data === "object" ? data : {}
        const { rows } = await pool.query(
            `INSERT INTO cvs(user_id, title, data) VALUES($1, $2, $3::jsonb)
             RETURNING id, title, data, is_default, created_at, updated_at`,
            [req.user.id, title.trim(), JSON.stringify(payload)],
        )
        res.status(201).json(rows[0])
    } catch (err) {
        next(err)
    }
})

router.get("/:id", async (req, res, next) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ message: "ID không hợp lệ" })
    try {
        const { rows } = await pool.query(
            "SELECT id, title, data, is_default, created_at, updated_at FROM cvs WHERE id=$1 AND user_id=$2",
            [id, req.user.id],
        )
        if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy CV" })
        res.json(rows[0])
    } catch (err) {
        next(err)
    }
})

router.put("/:id", async (req, res, next) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ message: "ID không hợp lệ" })
    const { title, data } = req.body
    if (title !== undefined) {
        if (typeof title !== "string" || title.trim().length === 0) {
            return res.status(400).json({ message: "Tiêu đề không hợp lệ" })
        }
        if (title.length > 100) {
            return res.status(400).json({ message: "Tiêu đề không vượt quá 100 ký tự" })
        }
    }
    try {
        const sets = []
        const params = []
        let idx = 1
        if (title !== undefined) {
            sets.push(`title=$${idx++}`)
            params.push(title.trim())
        }
        if (data !== undefined) {
            sets.push(`data=$${idx++}::jsonb`)
            params.push(JSON.stringify(data || {}))
        }
        if (sets.length === 0) return res.status(400).json({ message: "Không có trường để cập nhật" })
        sets.push(`updated_at=NOW()`)
        params.push(id, req.user.id)
        const { rows } = await pool.query(
            `UPDATE cvs SET ${sets.join(", ")} WHERE id=$${idx++} AND user_id=$${idx}
             RETURNING id, title, data, is_default, created_at, updated_at`,
            params,
        )
        if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy CV" })
        res.json(rows[0])
    } catch (err) {
        next(err)
    }
})

router.delete("/:id", async (req, res, next) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ message: "ID không hợp lệ" })
    try {
        const result = await pool.query(
            "DELETE FROM cvs WHERE id=$1 AND user_id=$2",
            [id, req.user.id],
        )
        if (result.rowCount === 0) return res.status(404).json({ message: "Không tìm thấy CV" })
        res.json({ success: true })
    } catch (err) {
        next(err)
    }
})

router.post("/:id/set-default", async (req, res, next) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ message: "ID không hợp lệ" })
    const client = await pool.connect()
    try {
        await client.query("BEGIN")
        const own = await client.query("SELECT 1 FROM cvs WHERE id=$1 AND user_id=$2", [id, req.user.id])
        if (own.rows.length === 0) {
            await client.query("ROLLBACK")
            return res.status(404).json({ message: "Không tìm thấy CV" })
        }
        await client.query("UPDATE cvs SET is_default=false WHERE user_id=$1", [req.user.id])
        await client.query("UPDATE cvs SET is_default=true, updated_at=NOW() WHERE id=$1", [id])
        await client.query("COMMIT")
        res.json({ success: true })
    } catch (err) {
        await client.query("ROLLBACK")
        next(err)
    } finally {
        client.release()
    }
})

module.exports = router
