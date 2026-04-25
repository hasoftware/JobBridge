import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

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
      navigate(role === 'recruiter' ? '/dashboard' : '/viec-lam')
    } catch (err) {
      alert(err.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Chào mừng tới JobBridge</h1>
        <p>Bạn muốn dùng JobBridge với vai trò gì?</p>

        <form onSubmit={handleSubmit}>
          <div className="role-grid">
            <button
              type="button"
              className={`role-card ${role === 'job_seeker' ? 'active' : ''}`}
              onClick={() => setRole('job_seeker')}
            >
              <div className="role-name">Ứng viên</div>
              <div className="role-hint">Tìm việc làm phù hợp</div>
            </button>
            <button
              type="button"
              className={`role-card ${role === 'recruiter' ? 'active' : ''}`}
              onClick={() => setRole('recruiter')}
            >
              <div className="role-name">Nhà tuyển dụng</div>
              <div className="role-hint">Đăng tin tuyển dụng</div>
            </button>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Tiếp tục'}
          </button>
        </form>
      </div>
    </div>
  )
}
