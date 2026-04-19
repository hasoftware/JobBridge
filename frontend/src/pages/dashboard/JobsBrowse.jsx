import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const MOCK_JOBS = [
  { id: 1, title: 'Frontend Developer', company: 'Tech Corp', location: 'Hà Nội', salary: 'USD 1500 - 2500', match_score: 0.92, saved: false },
  { id: 2, title: 'Senior React Developer', company: 'Global IT', location: 'TP. HCM', salary: 'USD 2500 - 4000', match_score: 0.85, saved: true },
  { id: 3, title: 'UI Engineer', company: 'Brand VN', location: 'Hà Nội', salary: 'USD 1200 - 2000', match_score: 0.78, saved: false },
  { id: 4, title: 'Full-stack Developer', company: 'StartupHub', location: 'Đà Nẵng', salary: 'Thoả thuận', match_score: 0.71, saved: false },
]

export default function JobsBrowse() {
  const [jobs, setJobs] = useState([])
  const [sortBy, setSortBy] = useState('match')

  useEffect(() => {
    setJobs(MOCK_JOBS)
  }, [])

  const sorted = [...jobs].sort((a, b) => {
    if (sortBy === 'match') return b.match_score - a.match_score
    if (sortBy === 'salary') return parseInt(b.salary) - parseInt(a.salary)
    return 0
  })

  const toggleSave = (id) => {
    setJobs((prev) => prev.map((j) => j.id === id ? { ...j, saved: !j.saved } : j))
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <h1>Việc làm phù hợp với bạn</h1>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="match">Phù hợp nhất</option>
          <option value="salary">Lương cao nhất</option>
        </select>
      </div>

      <div className="browse-list">
        {sorted.map((job) => (
          <div key={job.id} className="browse-item">
            <div className="browse-info">
              <Link to={`/viec-lam/${job.id}`} className="browse-title">{job.title}</Link>
              <div className="browse-company">{job.company}</div>
              <div className="browse-meta">
                <span>{job.location}</span>
                <span>{job.salary}</span>
              </div>
            </div>
            <div className="browse-side">
              <div className="browse-match">{Math.round(job.match_score * 100)}% phù hợp</div>
              <button onClick={() => toggleSave(job.id)}>
                {job.saved ? 'Đã lưu' : 'Lưu'}
              </button>
              <Link to={`/viec-lam/${job.id}`} className="btn btn-primary">Ứng tuyển</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
