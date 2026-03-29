const pool = require('../config/db')
const { randomInt } = require('crypto')

afterAll(async () => {
    await pool.end()
})

const generateTestingEmail = () => {
    return `testuser_${Date.now()}_${randomInt(1000)}@example.com`
}

module.exports = { generateTestingEmail }
