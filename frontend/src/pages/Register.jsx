import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Icon from '../components/common/Icon'
import './Login.css'

export default function Register() {
    const navigate = useNavigate()
    const { register } = useAuth()
    const [step, setStep] = useState(1)
    const [role, setRole] = useState('job_seeker')
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [apiError, setApiError] = useState('')

    const validate = () => {
        const newErrors = {}
        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập email'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ'
        }
        if (!formData.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu'
        } else if (formData.password.length < 8) {
            newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự'
        }
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu'
        } else if (formData.confirmPassword !== formData.password) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
        if (apiError) setApiError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (step === 1) {
            setStep(2)
            return
        }
        if (!validate()) return

        setLoading(true)
        setApiError('')
        try {
            await register(formData.email, formData.password, role)
            navigate('/')
        } catch (err) {
            setApiError(err.message || 'Đăng ký thất bại')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">{step === 1 ? 'Tạo tài khoản' : 'Thông tin đăng ký'}</h1>
                    <p className="auth-subtitle">
                        {step === 1 ? 'Tham gia JobBridge để tìm việc làm mơ ước' : 'Điền thông tin để hoàn tất đăng ký'}
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    {step === 1 && (
                        <>
                            <div className="role-section">
                                <h2 className="role-section-title">Bạn muốn dùng JobBridge với vai trò gì?</h2>
                                <p className="role-section-desc">Chọn vai trò để chúng tôi cá nhân hoá trải nghiệm phù hợp với bạn.</p>

                                <div className="role-grid">
                                    <button
                                        type="button"
                                        className={`role-card ${role === 'job_seeker' ? 'active' : ''}`}
                                        onClick={() => setRole('job_seeker')}
                                    >
                                        <div className="role-icon-wrap">
                                            <Icon name="user" />
                                        </div>
                                        <div className="role-text">
                                            <div className="role-name">Ứng viên</div>
                                            <div className="role-hint">Tạo CV, ứng tuyển và theo dõi đơn</div>
                                        </div>
                                        <span className="role-radio" aria-hidden="true" />
                                    </button>
                                    <button
                                        type="button"
                                        className={`role-card ${role === 'recruiter' ? 'active' : ''}`}
                                        onClick={() => setRole('recruiter')}
                                    >
                                        <div className="role-icon-wrap">
                                            <Icon name="briefcase" />
                                        </div>
                                        <div className="role-text">
                                            <div className="role-name">Nhà tuyển dụng</div>
                                            <div className="role-hint">Đăng tin và tìm ứng viên phù hợp</div>
                                        </div>
                                        <span className="role-radio" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary auth-submit">
                                Tiếp tục
                            </button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                {errors.email && <span className="form-error">{errors.email}</span>}
                            </div>

                            <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
                                <label htmlFor="password">Mật khẩu</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="Ít nhất 8 ký tự"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                {errors.password && <span className="form-error">{errors.password}</span>}
                            </div>

                            <div className={`form-group ${errors.confirmPassword ? 'has-error' : ''}`}>
                                <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="Nhập lại mật khẩu"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                                {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
                            </div>

                            {apiError && <div className="auth-api-error">{apiError}</div>}

                            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                                {loading ? 'Đang xử lý...' : 'Đăng ký'}
                            </button>
                        </>
                    )}
                </form>

                <p className="auth-footer">
                    Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </p>
            </div>
        </div>
    )
}
