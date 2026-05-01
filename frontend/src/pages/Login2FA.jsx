import { useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import './Login.css'

export default function Login2FA() {
    const navigate = useNavigate()
    const location = useLocation()
    const { completeTwoFA } = useAuth()
    const { addToast } = useToast()

    const pendingToken = location.state?.pending_2fa_token
    const redirectTo = location.state?.redirectTo || '/'

    const [code, setCode] = useState('')
    const [useBackup, setUseBackup] = useState(false)
    const [loading, setLoading] = useState(false)
    const [apiError, setApiError] = useState('')

    useEffect(() => {
        if (!pendingToken) {
            navigate('/login', { replace: true })
        }
    }, [pendingToken, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        const cleanCode = code.replace(/[\s-]/g, '')
        if (!cleanCode) {
            setApiError('Vui lòng nhập mã xác thực')
            return
        }
        if (!useBackup && !/^\d{6}$/.test(cleanCode)) {
            setApiError('Mã xác thực phải là 6 chữ số')
            return
        }
        setLoading(true)
        setApiError('')
        try {
            const userData = await completeTwoFA(pendingToken, cleanCode)
            addToast('Đăng nhập thành công', 'success')
            if (userData.role === 'admin') navigate('/admin')
            else navigate(redirectTo)
        } catch (err) {
            setApiError(err.message || 'Mã không đúng')
        } finally {
            setLoading(false)
        }
    }

    if (!pendingToken) return null

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">Xác thực 2 bước</h1>
                    <p className="auth-subtitle">
                        {useBackup
                            ? 'Nhập một trong các mã khôi phục bạn đã lưu khi kích hoạt 2FA.'
                            : 'Mở app authenticator và nhập 6 số đang hiển thị.'}
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="code">{useBackup ? 'Mã khôi phục' : 'Mã 6 số'}</label>
                        <input
                            type="text"
                            id="code"
                            inputMode={useBackup ? 'text' : 'numeric'}
                            maxLength={useBackup ? 12 : 6}
                            placeholder={useBackup ? 'Vd: A4B7K2P9' : '123456'}
                            value={code}
                            onChange={(e) => {
                                const v = useBackup
                                    ? e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                                    : e.target.value.replace(/\D/g, '')
                                setCode(v)
                                if (apiError) setApiError('')
                            }}
                            autoComplete="one-time-code"
                            autoFocus
                            style={{ letterSpacing: useBackup ? '2px' : '6px', textAlign: 'center', fontFamily: 'monospace', fontSize: 18, fontWeight: 600 }}
                        />
                    </div>

                    {apiError && <div className="auth-api-error">{apiError}</div>}

                    <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                        {loading ? 'Đang xác minh...' : 'Xác minh'}
                    </button>

                    <button
                        type="button"
                        className="btn-link"
                        onClick={() => { setUseBackup((v) => !v); setCode(''); setApiError('') }}
                        style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: 13, marginTop: 8 }}
                    >
                        {useBackup ? 'Dùng mã từ app authenticator' : 'Dùng mã khôi phục thay'}
                    </button>
                </form>

                <p className="auth-footer">
                    Sai tài khoản? <Link to="/login">Đăng nhập lại</Link>
                </p>
            </div>
        </div>
    )
}
