const pool = require('../config/db')
const { randomUUID, randomInt } = require('crypto')

afterAll(async () => {
    await pool.end()
})

const generateTestingEmail = () => {
    return `testuser_${Date.now()}_${randomInt(1000)}_${randomUUID()}@example.com`
}

module.exports = { generateTestingEmail }
