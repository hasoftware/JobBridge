const jwt = require('jsonwebtoken')
const auth = require('../../src/middleware/auth')
const { jwt: jwtConfig } = require('../../config/index')

const mockReqRes = (authHeader) => {
    const req  = { headers: { authorization: authHeader } }
    const res  = {
        status: jest.fn().mockReturnThis(),
        json:   jest.fn(),
    }
    const next = jest.fn()
    return { req, res, next }
}

describe('auth middleware', () => {
    test('next() khi token hợp lệ', () => {
        const token = jwt.sign({ id: 1, role: 'job_seeker' }, jwtConfig.secret, { expiresIn: '15m' })
        const { req, res, next } = mockReqRes(`Bearer ${token}`)
        auth(req, res, next)
        expect(next).toHaveBeenCalled()
    })

    test('trả 401 khi không có token', () => {
        const { req, res, next } = mockReqRes(null)
        auth(req, res, next)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(next).not.toHaveBeenCalled()
    })

    test('trả 401 khi token sai', () => {
        const { req, res, next } = mockReqRes('Bearer invalidtoken')
        auth(req, res, next)
        expect(res.status).toHaveBeenCalledWith(401)
        expect(next).not.toHaveBeenCalled()
    })
})
