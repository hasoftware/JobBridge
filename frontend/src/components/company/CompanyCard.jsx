import { Link } from 'react-router-dom'
import './CompanyCard.css'

export default function CompanyCard({ company }) {
  return (
    <Link to={`/cong-ty/${company.name}`} className="company-card">
      <div
        className="company-banner"
        style={{ background: `linear-gradient(135deg, ${company.bannerColor?.[0] || '#dbeafe'}, ${company.bannerColor?.[1] || '#eff6ff'})` }}
      />
      <img
        src={company.logo || '/images/company.png'}
        alt={company.name}
        className="company-logo"
        loading="lazy"
      />
      <div className="company-body">
        <div className="company-name">{company.name}</div>
        <div className="company-field">{company.field}</div>
        <div className="company-job-count">{company.jobCount || 0} việc làm</div>
      </div>
    </Link>
  )
}
