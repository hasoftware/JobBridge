import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import JobCard from '../components/job/JobCard'
import './CompanyPage.css'

const MOCK_COMPANY = {
  name: 'Tech Corp',
  description: 'Công ty công nghệ hàng đầu Việt Nam, chuyên phát triển các sản phẩm fintech và e-commerce phục vụ thị trường Đông Nam Á.',
  industry: 'Công nghệ thông tin',
  company_size: '201-500',
  founded_year: 2015,
  website: 'https://techcorp.example.com',
  location: 'Hà Nội',
  logo_url: '/images/company.png',
  banner_url: '/images/company-banner.png',
}

const MOCK_JOBS = [
  { id: 1, title: 'Frontend Developer', company_name: 'Tech Corp', location: 'Hà Nội', salary_min: 1500, salary_max: 2500, currency: 'USD', job_type: 'Full-time' },
  { id: 2, title: 'Backend Engineer', company_name: 'Tech Corp', location: 'Hà Nội', salary_min: 2000, salary_max: 3500, currency: 'USD', job_type: 'Full-time' },
  { id: 3, title: 'DevOps Engineer', company_name: 'Tech Corp', location: 'Hà Nội', salary_min: 2500, salary_max: 4000, currency: 'USD', job_type: 'Full-time' },
]

export default function CompanyPage() {
  const { name } = useParams()
  const [company, setCompany] = useState(null)
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    setCompany(MOCK_COMPANY)
    setJobs(MOCK_JOBS)
  }, [name])

  if (!company) return <div className="container">Đang tải...</div>

  return (
    <div className="company-page">
      <div
        className="company-page-banner"
        style={{ backgroundImage: `url(${company.banner_url})` }}
      />

      <div className="container">
        <div className="company-page-header">
          <img src={company.logo_url} alt={company.name} className="company-page-logo" />
          <div className="company-page-info">
            <h1 className="company-page-name">{company.name}</h1>
            <div className="company-page-meta">
              <span>{company.industry}</span>
              <span>{company.company_size} nhân viên</span>
              <span>{company.location}</span>
            </div>
          </div>
        </div>

        <div className="company-page-grid">
          <div className="company-page-main">
            <section className="company-section">
              <h2>Giới thiệu</h2>
              <p>{company.description}</p>
            </section>

            <section className="company-section">
              <h2>Việc làm đang tuyển ({jobs.length})</h2>
              <div className="company-jobs-grid">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </section>
          </div>

          <aside className="company-page-side">
            <div className="company-side-card">
              <h3>Thông tin</h3>
              <ul>
                <li><strong>Năm thành lập:</strong> {company.founded_year}</li>
                <li><strong>Quy mô:</strong> {company.company_size} người</li>
                <li><strong>Lĩnh vực:</strong> {company.industry}</li>
                <li><strong>Địa điểm:</strong> {company.location}</li>
                {company.website && (
                  <li>
                    <strong>Website:</strong>{' '}
                    <a href={company.website} target="_blank" rel="noreferrer">
                      {company.website}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
