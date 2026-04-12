import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const MOCK_SAVED = [
  { id: 1, title: 'Frontend Developer', company: 'Tech Corp', location: 'Hà Nội', salary: 'USD 1500 - 2500', saved_at: '2026-04-10' },
  { id: 2, title: 'UX Designer', company: 'Brand VN', location: 'TP. HCM', salary: 'USD 1200 - 1800', saved_at: '2026-04-09' },
  { id: 3, title: 'Product Manager', company: 'Global IT', location: 'Hà Nội', salary: 'Thoả thuận', saved_at: '2026-04-05' },
]

export default function SavedJobs() {
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    setJobs(MOCK_SAVED)
  }, [])

  const handleRemove = (id) => {
    setJobs((prev) => prev.filter((j) => j.id !== id))
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <h1>Việc đã lưu ({jobs.length})</h1>
      </div>

      {jobs.length === 0 ? (
        <div className="dashboard-empty">
          <p>Bạn chưa lưu công việc nào</p>
          <Link to="/viec-lam" className="btn btn-primary">Tìm việc</Link>
        </div>
      ) : (
        <div className="saved-list">
          {jobs.map((job) => (
            <div key={job.id} className="saved-item">
              <div className="saved-info">
                <Link to={`/viec-lam/${job.id}`} className="saved-title">{job.title}</Link>
                <div className="saved-company">{job.company}</div>
                <div className="saved-meta">
                  <span>{job.location}</span>
                  <span>{job.salary}</span>
                </div>
                <div className="saved-date">Đã lưu {job.saved_at}</div>
              </div>
              <button onClick={() => handleRemove(job.id)} className="saved-remove">
                Bỏ lưu
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
