const request = require("supertest")
const app = require("../../src/app")
const pool = require("../../config/db")

let candidateToken
let userId

beforeAll(async () => {
    const reg = await request(app)
        .post("/api/v1/auth/register")
        .send({ email: "candidate@test.com", password: "Password1!", role: "job_seeker" })

    userId = reg.body.id

    const login = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "candidate@test.com", password: "Password1!" })

    candidateToken = login.body.access_token
})

afterAll(async () => {
    await pool.query("DELETE FROM candidate_profiles")
    await pool.query("DELETE FROM users")
})

describe("GET /profiles/me", () => {
    test("trả profile của user đang login", async () => {
        const res = await request(app)
            .get("/api/v1/profiles/me")
            .set("Authorization", `Bearer ${candidateToken}`)

        expect(res.statusCode).toBe(200)
        expect(res.body.user_id).toBe(userId)
    })

    test("trả 401 nếu không có token", async () => {
        const res = await request(app).get("/api/v1/profiles/me")
        expect(res.statusCode).toBe(401)
    })
})

describe("PUT /profiles/me", () => {
    test("cập nhật profile OK", async () => {
        const res = await request(app)
            .put("/api/v1/profiles/me")
            .set("Authorization", `Bearer ${candidateToken}`)
            .send({ full_name: "Nguyen Van A", phone: "0901234567" })

        expect(res.statusCode).toBe(200)
        expect(res.body.full_name).toBe("Nguyen Van A")
    })

    test("trả 400 nếu data không hợp lệ", async () => {
        const res = await request(app)
            .put("/api/v1/profiles/me")
            .set("Authorization", `Bearer ${candidateToken}`)
            .send({ phone: "abc" })

        expect(res.statusCode).toBe(400)
    })
})
