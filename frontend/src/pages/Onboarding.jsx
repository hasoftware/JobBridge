import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Icon from '../components/common/Icon'
import './Login.css'

export default function Onboarding() {
  const navigate = useNavigate()
  const { completeOnboarding } = useAuth()
  const [role, setRole] = useState('job_seeker')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await completeOnboarding(role)
      navigate(role === 'recruiter' ? '/dashboard' : '/jobs')
    } catch (err) {
      alert(err.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Chào mừng tới JobBridge</h1>
          <p className="auth-subtitle">Hoàn tất một bước cuối để bắt đầu</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
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

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Tiếp tục'}
          </button>
        </form>
      </div>
    </div>
  )
}
