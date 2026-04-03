const request = require("supertest")
const app = require("../../src/app")
const pool = require("../../config/db")

const registerUser = (data = {}) =>
    request(app)
        .post("/api/v1/auth/register")
        .send({
            email: "john@test.com",
            password: "Password1!",
            role: "job_seeker",
            ...data,
        })

const loginUser = (data = {}) =>
    request(app)
        .post("/api/v1/auth/login")
        .send({
            email: "john@test.com",
            password: "Password1!",
            ...data,
        })

afterEach(async () => {
    await pool.query("DELETE FROM refresh_tokens")
    await pool.query("DELETE FROM users")
})

describe("POST /auth/register", () => {
    test("register job_seeker", async () => {
        const res = await registerUser()
        expect(res.statusCode).toBe(201)
        expect(res.body.email).toBe("john@test.com")
    })

    test("trả 400 nếu email không hợp lệ", async () => {
        const res = await registerUser({ email: "notemail" })
        expect(res.statusCode).toBe(400)
    })
})

describe("POST /auth/login", () => {
    test("login OK", async () => {
        await registerUser()
        const res = await loginUser()
        expect(res.statusCode).toBe(200)
        expect(res.body.access_token).toBeDefined()
    })

    test("trả 401 nếu sai password", async () => {
        await registerUser()
        const res = await loginUser({ password: "WrongPass1!" })
        expect(res.statusCode).toBe(401)
    })
})
