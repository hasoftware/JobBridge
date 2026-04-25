import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const OTP_LENGTH = 6
const RESEND_SEC = 60

export default function VerifyEmail() {
  const navigate = useNavigate()
  const { user, sendVerificationOtp, verifyEmail } = useAuth()

  const [code, setCode] = useState(Array(OTP_LENGTH).fill(''))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendIn, setResendIn] = useState(0)
  const inputsRef = useRef([])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const next = [...code]
    next[index] = value.slice(-1)
    setCode(next)
    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKey = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otp = code.join('')
    if (otp.length !== OTP_LENGTH) {
      setError('Vui lòng nhập đủ mã OTP')
      return
    }

    setLoading(true)
    try {
      await verifyEmail(otp)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Mã OTP không đúng')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await sendVerificationOtp()
      setResendIn(RESEND_SEC)
      const timer = setInterval(() => {
        setResendIn((s) => {
          if (s <= 1) {
            clearInterval(timer)
            return 0
          }
          return s - 1
        })
      }, 1000)
    } catch (err) {
      setError(err.message || 'Không gửi được mã')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Xác thực email</h1>
        <p>Mã OTP đã được gửi tới {user?.email}</p>

        <form onSubmit={handleSubmit} className="otp-form">
          <div className="otp-inputs">
            {code.map((c, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={c}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKey(i, e)}
              />
            ))}
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang xác thực...' : 'Xác nhận'}
          </button>

          <button
            type="button"
            className="resend-btn"
            onClick={handleResend}
            disabled={resendIn > 0}
          >
            {resendIn > 0 ? `Gửi lại sau ${resendIn}s` : 'Gửi lại mã'}
          </button>
        </form>
      </div>
    </div>
  )
}
