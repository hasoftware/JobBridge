import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import './JobDetail.css'

const MOCK_JOB = {
  id: 1,
  title: 'Frontend Developer',
  company_name: 'Tech Corp',
  company_logo: null,
  location: 'Hà Nội',
  salary_min: 1500,
  salary_max: 2500,
  currency: 'USD',
  job_type: 'Full-time',
  description: 'Phát triển và bảo trì các ứng dụng web hiện đại sử dụng React, TypeScript và các công nghệ frontend tiên tiến.',
  responsibilities: 'Xây dựng UI components, làm việc với designer, optimise performance, code review.',
  required_qualifications: 'Tối thiểu 2 năm kinh nghiệm React. Hiểu HTML/CSS/JS sâu. Tiếng Anh giao tiếp tốt.',
  publishing_date: '2026-04-04',
  application_deadline: '2026-05-15',
}

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addToast } = useToast()
  const [job, setJob] = useState(null)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    setJob(MOCK_JOB)
  }, [id])

  const handleApply = async () => {
    if (!isAuthenticated) {
      addToast('Vui lòng đăng nhập để ứng tuyển', 'info')
      navigate(`/login?redirect=/jobs/${id}`)
      return
    }
    setApplying(true)
    setTimeout(() => {
      addToast('Đã gửi đơn ứng tuyển', 'success')
      setApplying(false)
    }, 800)
  }

  if (!job) return <div className="container">Đang tải...</div>

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return 'Thoả thuận'
    return `${job.currency} ${job.salary_min} - ${job.salary_max}`
  }

  return (
    <div className="job-detail">
      <div className="container">
        <div className="job-detail-header">
          <div className="job-detail-logo">
            {job.company_logo ? (
              <img src={job.company_logo} alt={job.company_name} />
            ) : (
              <div className="job-detail-logo-placeholder">
                {job.company_name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="job-detail-info">
            <h1 className="job-detail-title">{job.title}</h1>
            <Link to={`/companies/${job.company_name}`} className="job-detail-company">
              {job.company_name}
            </Link>
            <div className="job-detail-meta">
              <span>{job.location}</span>
              <span className="job-detail-salary">{formatSalary()}</span>
              <span>{job.job_type}</span>
            </div>
          </div>
          <button className="btn btn-primary apply-btn" onClick={handleApply} disabled={applying}>
            {applying ? 'Đang gửi...' : 'Ứng tuyển'}
          </button>
        </div>

        <div className="job-detail-body">
          <section>
            <h2>Mô tả công việc</h2>
            <p>{job.description}</p>
          </section>
          <section>
            <h2>Trách nhiệm</h2>
            <p>{job.responsibilities}</p>
          </section>
          <section>
            <h2>Yêu cầu</h2>
            <p>{job.required_qualifications}</p>
          </section>
          <section className="job-detail-deadline">
            Hạn ứng tuyển: <strong>{job.application_deadline}</strong>
          </section>
        </div>
      </div>
    </div>
  )
}
