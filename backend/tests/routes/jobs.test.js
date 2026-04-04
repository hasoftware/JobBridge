const request = require("supertest")
const app = require("../../src/app")
const pool = require("../../config/db")

let recruiterToken
let companyId

beforeAll(async () => {
    const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ email: "recruiter@test.com", password: "Password1!", role: "recruiter" })

    const login = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "recruiter@test.com", password: "Password1!" })

    recruiterToken = login.body.access_token

    const company = await pool.query("SELECT id FROM companies WHERE user_id=$1", [res.body.id])
    companyId = company.rows[0]?.id
})

afterEach(async () => {
    await pool.query("DELETE FROM jobs")
})

afterAll(async () => {
    await pool.query("DELETE FROM companies")
    await pool.query("DELETE FROM users")
})

describe("GET /jobs", () => {
    test("trả list rỗng khi chưa có job", async () => {
        const res = await request(app).get("/api/v1/jobs")
        expect(res.statusCode).toBe(200)
        expect(res.body.jobs).toEqual([])
    })
})

describe("POST /jobs", () => {
    test("tạo job OK", async () => {
        const res = await request(app)
            .post("/api/v1/jobs")
            .set("Authorization", `Bearer ${recruiterToken}`)
            .send({
                title: "Backend Engineer",
                description: "Mô tả job",
                company_id: companyId,
                job_type: "Full-time",
            })

        expect(res.statusCode).toBe(201)
        expect(res.body.title).toBe("Backend Engineer")
    })

    test("trả 401 nếu không có token", async () => {
        const res = await request(app)
            .post("/api/v1/jobs")
            .send({ title: "Test" })

        expect(res.statusCode).toBe(401)
    })
})
