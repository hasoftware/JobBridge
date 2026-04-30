import { Link } from 'react-router-dom'
import './JobCard.css'

const formatSalary = (job) => {
  if (!job.salary_min && !job.salary_max) return 'Thoả thuận'
  const cur = job.currency || 'USD'
  const fmt = (v) => Number(v).toLocaleString()
  if (job.salary_min && job.salary_max) {
    return `${cur} ${fmt(job.salary_min)} - ${fmt(job.salary_max)}`
  }
  if (job.salary_min) return `${cur} ${fmt(job.salary_min)}+`
  return `${cur} đến ${fmt(job.salary_max)}`
}

export default function JobCard({ job }) {
  return (
    <Link to={`/jobs/${job.id}`} className="job-card">
      <div className="job-card-header">
        <div className="job-card-logo">
          {job.company_logo ? (
            <img src={job.company_logo} alt={job.company_name} />
          ) : (
            <div className="job-card-logo-placeholder">
              {job.company_name?.[0]?.toUpperCase() || 'J'}
            </div>
          )}
        </div>
        <div className="job-card-info">
          <h3 className="job-card-title">{job.title}</h3>
          <div className="job-card-company">{job.company_name}</div>
        </div>
      </div>

      <div className="job-card-meta">
        <span className="job-card-salary">{formatSalary(job)}</span>
        <span className="job-card-location">{job.location || 'Toàn quốc'}</span>
      </div>

      {job.job_type && (
        <div className="job-card-tags">
          <span className="job-card-tag">{job.job_type}</span>
        </div>
      )}
    </Link>
  )
}
