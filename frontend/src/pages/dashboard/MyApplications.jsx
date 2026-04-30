import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const MOCK_APPLICATIONS = [
  { id: 1, job_title: 'Frontend Developer', company: 'Tech Corp', status: 'submitted', applied_at: '2026-04-09' },
  { id: 2, job_title: 'Backend Engineer', company: 'StartupHub', status: 'under_review', applied_at: '2026-04-07' },
  { id: 3, job_title: 'Data Analyst', company: 'FinTech Co', status: 'rejected', applied_at: '2026-04-02' },
]

const STATUS_LABELS = {
  submitted: 'Đã gửi',
  under_review: 'Đang xét',
  shortlisted: 'Vào shortlist',
  interview_scheduled: 'Đã hẹn phỏng vấn',
  rejected: 'Bị từ chối',
}

const STATUS_COLORS = {
  submitted: '#3b82f6',
  under_review: '#f59e0b',
  shortlisted: '#10b981',
  interview_scheduled: '#8b5cf6',
  rejected: '#ef4444',
}

export default function MyApplications() {
  const [applications, setApplications] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    setApplications(MOCK_APPLICATIONS)
  }, [])

  const filtered = filter === 'all' ? applications : applications.filter((a) => a.status === filter)

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <h1>Đơn ứng tuyển</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Tất cả</option>
          <option value="submitted">Đã gửi</option>
          <option value="under_review">Đang xét</option>
          <option value="shortlisted">Vào shortlist</option>
          <option value="rejected">Bị từ chối</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="dashboard-empty">Bạn chưa có đơn ứng tuyển nào</div>
      ) : (
        <div className="application-list">
          {filtered.map((app) => (
            <div key={app.id} className="application-item">
              <div className="application-info">
                <Link to={`/jobs/${app.id}`} className="application-title">
                  {app.job_title}
                </Link>
                <div className="application-company">{app.company}</div>
                <div className="application-date">Ứng tuyển {app.applied_at}</div>
              </div>
              <span
                className="application-status"
                style={{ background: STATUS_COLORS[app.status] }}
              >
                {STATUS_LABELS[app.status]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
