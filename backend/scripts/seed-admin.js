require("dotenv").config({ path: require("path").join(__dirname, "../../.env") })

const bcrypt = require("bcrypt")
const pool = require("../config/db")

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@jobbridge.local"
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@123"

async function seed() {
    try {
        const existing = await pool.query("SELECT id, role FROM users WHERE email=$1", [ADMIN_EMAIL])

        if (existing.rows.length > 0) {
            const user = existing.rows[0]
            if (user.role === "admin") {
                console.log(`Admin ${ADMIN_EMAIL} đã tồn tại (id=${user.id}). Bỏ qua.`)
            } else {
                await pool.query("UPDATE users SET role='admin', is_verified=true WHERE id=$1", [user.id])
                console.log(`Nâng quyền user ${ADMIN_EMAIL} (id=${user.id}) thành admin.`)
            }
            return
        }

        const hash = await bcrypt.hash(ADMIN_PASSWORD, 10)
        const result = await pool.query(
            "INSERT INTO users(email, password_hash, role, is_verified) VALUES($1, $2, 'admin', true) RETURNING id, email, role",
            [ADMIN_EMAIL, hash],
        )

        const user = result.rows[0]
        console.log(`Tạo admin thành công:`)
        console.log(`  Email   : ${user.email}`)
        console.log(`  Password: ${ADMIN_PASSWORD}`)
        console.log(`  ID      : ${user.id}`)
        console.log(`  Role    : ${user.role}`)
    } catch (err) {
        console.error("Seed admin lỗi:", err.message)
        process.exit(1)
    } finally {
        await pool.end()
    }
}

seed()
