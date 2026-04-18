import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

const MOCK_APPLICANTS = [
  { id: 1, name: 'Nguyễn Văn A', email: 'a@test.com', skills: ['React', 'JavaScript', 'CSS'], score: 0.92, applied_at: '2026-04-15', cv_url: '/cv/1.pdf' },
  { id: 2, name: 'Trần Thị B', email: 'b@test.com', skills: ['React', 'TypeScript'], score: 0.85, applied_at: '2026-04-14', cv_url: '/cv/2.pdf' },
  { id: 3, name: 'Lê Văn C', email: 'c@test.com', skills: ['Vue', 'JavaScript'], score: 0.62, applied_at: '2026-04-13', cv_url: '/cv/3.pdf' },
  { id: 4, name: 'Phạm Thị D', email: 'd@test.com', skills: ['Angular', 'CSS'], score: 0.48, applied_at: '2026-04-12', cv_url: '/cv/4.pdf' },
]

export default function JobApplicants() {
  const { id } = useParams()
  const [applicants, setApplicants] = useState([])
  const [sortBy, setSortBy] = useState('score')

  useEffect(() => {
    setApplicants(MOCK_APPLICANTS)
  }, [id])

  const sorted = [...applicants].sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score
    if (sortBy === 'date') return new Date(b.applied_at) - new Date(a.applied_at)
    return 0
  })

  const scoreColor = (score) => {
    if (score >= 0.8) return '#10b981'
    if (score >= 0.6) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <h1>Ứng viên ({applicants.length})</h1>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="score">Sắp xếp theo điểm phù hợp</option>
          <option value="date">Mới nhất</option>
        </select>
      </div>

      <div className="applicants-list">
        {sorted.map((app) => (
          <div key={app.id} className="applicant-card">
            <div className="applicant-info">
              <div className="applicant-name">{app.name}</div>
              <div className="applicant-email">{app.email}</div>
              <div className="applicant-skills">
                {app.skills.map((s) => (
                  <span key={s} className="applicant-skill">{s}</span>
                ))}
              </div>
              <div className="applicant-date">Ứng tuyển: {app.applied_at}</div>
            </div>

            <div className="applicant-score" style={{ borderColor: scoreColor(app.score) }}>
              <div className="applicant-score-value" style={{ color: scoreColor(app.score) }}>
                {Math.round(app.score * 100)}%
              </div>
              <div className="applicant-score-label">phù hợp</div>
            </div>

            <div className="applicant-actions">
              <a href={app.cv_url} target="_blank" rel="noreferrer">Xem CV</a>
              <button>Liên hệ</button>
              <button>Mời phỏng vấn</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
