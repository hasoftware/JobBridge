import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const MOCK_JOBS = [
  { id: 1, title: 'Frontend Developer', applicants: 24, view_count: 312, status: 'active', publishing_date: '2026-04-10' },
  { id: 2, title: 'Backend Engineer', applicants: 18, view_count: 240, status: 'active', publishing_date: '2026-04-08' },
  { id: 3, title: 'DevOps Engineer', applicants: 6, view_count: 95, status: 'closed', publishing_date: '2026-03-25' },
]

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    setJobs(MOCK_JOBS)
  }, [])

  const filtered = filter === 'all' ? jobs : jobs.filter((j) => j.status === filter)

  const handleClose = (id) => {
    setJobs((prev) => prev.map((j) => j.id === id ? { ...j, status: 'closed' } : j))
  }

  const handleDelete = (id) => {
    if (!confirm('Xoá tin tuyển dụng này?')) return
    setJobs((prev) => prev.filter((j) => j.id !== id))
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <h1>Tin tuyển dụng</h1>
        <Link to="job-form" className="btn btn-primary">+ Đăng tin mới</Link>
      </div>

      <div className="recruiter-filter">
        <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>
          Tất cả ({jobs.length})
        </button>
        <button onClick={() => setFilter('active')} className={filter === 'active' ? 'active' : ''}>
          Đang tuyển ({jobs.filter((j) => j.status === 'active').length})
        </button>
        <button onClick={() => setFilter('closed')} className={filter === 'closed' ? 'active' : ''}>
          Đã đóng ({jobs.filter((j) => j.status === 'closed').length})
        </button>
      </div>

      <table className="recruiter-jobs-table">
        <thead>
          <tr>
            <th>Tin tuyển dụng</th>
            <th>Ngày đăng</th>
            <th>Lượt xem</th>
            <th>Ứng viên</th>
            <th>Trạng thái</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((job) => (
            <tr key={job.id}>
              <td>{job.title}</td>
              <td>{job.publishing_date}</td>
              <td>{job.view_count}</td>
              <td>
                <Link to={`job-applicants/${job.id}`}>{job.applicants}</Link>
              </td>
              <td>
                <span className={`status-${job.status}`}>
                  {job.status === 'active' ? 'Đang tuyển' : 'Đã đóng'}
                </span>
              </td>
              <td>
                <Link to={`job-form/${job.id}`}>Sửa</Link>
                {job.status === 'active' && (
                  <button onClick={() => handleClose(job.id)}>Đóng</button>
                )}
                <button onClick={() => handleDelete(job.id)}>Xoá</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
