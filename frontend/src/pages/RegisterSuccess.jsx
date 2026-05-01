import { useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import './Login.css'
import './RegisterSuccess.css'

export default function RegisterSuccess() {
    const navigate = useNavigate()
    const location = useLocation()
    const email = location.state?.email || ''

    useEffect(() => {
        if (!email) navigate('/register', { replace: true })
    }, [email, navigate])

    if (!email) return null

    return (
        <div className="auth-page">
            <div className="auth-card register-success-card">
                <div className="register-success-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12.5L10 17.5L19 8.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                <div className="auth-header">
                    <h1 className="auth-title">Đăng ký thành công</h1>
                    <p className="auth-subtitle">
                        Tài khoản <strong>{email}</strong> đã được kích hoạt. Bạn có thể đăng nhập để bắt đầu sử dụng JobBridge.
                    </p>
                </div>

                <div className="register-success-actions">
                    <Link
                        to="/login"
                        state={{ email }}
                        className="btn btn-primary auth-submit"
                    >
                        Đăng nhập ngay
                    </Link>
                    <Link to="/" className="btn btn-secondary auth-submit">
                        Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    )
}
