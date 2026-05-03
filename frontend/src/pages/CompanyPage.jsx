import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import JobCard from '../components/job/JobCard'
import { companies as companiesApi } from '../services/api'
import './CompanyPage.css'

const TABS = [
    { id: 'about', label: 'Giới thiệu' },
    { id: 'jobs', label: 'Việc làm đang tuyển' },
]

export default function CompanyPage() {
    const { id } = useParams()
    const [company, setCompany] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('about')
    const [jobs, setJobs] = useState([])
    const [jobsTotal, setJobsTotal] = useState(0)
    const [jobsLoading, setJobsLoading] = useState(false)

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        companiesApi.get(id)
            .then((c) => { if (!cancelled) setCompany(c) })
            .catch((err) => { if (!cancelled) setError(err.message || 'Không tìm thấy công ty') })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [id])

    useEffect(() => {
        if (activeTab !== 'jobs' || !id) return
        let cancelled = false
        setJobsLoading(true)
        companiesApi.jobs(id, { limit: 24 })
            .then((data) => {
                if (cancelled) return
                setJobs(data.jobs || [])
                setJobsTotal(data.total || 0)
            })
            .catch(() => { if (!cancelled) setJobs([]) })
            .finally(() => { if (!cancelled) setJobsLoading(false) })
        return () => { cancelled = true }
    }, [activeTab, id])

    if (loading) return <div className="cp-loading">Đang tải thông tin công ty...</div>
    if (error || !company) {
        return (
            <div className="cp-loading">
                <p>{error || 'Không tìm thấy công ty'}</p>
                <Link to="/companies" className="btn btn-primary">Quay lại danh sách</Link>
            </div>
        )
    }

    const initial = (company.name || '?').charAt(0).toUpperCase()

    return (
        <div className="cp-page">
            <div className="container">
                <nav className="cp-breadcrumb">
                    <Link to="/">Trang chủ</Link>
                    <span>›</span>
                    <Link to="/companies">Công ty</Link>
                    <span>›</span>
                    <span className="cp-breadcrumb-current">{company.name}</span>
                </nav>

                <header className="cp-header">
                    <div className="cp-header-logo">
                        {company.logo_url
                            ? <img src={company.logo_url} alt={company.name} />
                            : <span>{initial}</span>
                        }
                    </div>
                    <div className="cp-header-body">
                        <h1 className="cp-name">{company.name}</h1>
                        {company.description && <p className="cp-tagline">{company.description.split('\n')[0]}</p>}
                        <div className="cp-meta">
                            {company.industry && <span><strong>Ngành:</strong> {company.industry}</span>}
                            {company.company_size && <span><strong>Quy mô:</strong> {company.company_size} người</span>}
                            {company.location && <span><strong>Địa điểm:</strong> {company.location}</span>}
                            {company.founded_year && <span><strong>Thành lập:</strong> {company.founded_year}</span>}
                            {company.website && (
                                <span>
                                    <strong>Website:</strong>{' '}
                                    <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer">
                                        {company.website.replace(/^https?:\/\//, '')}
                                    </a>
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="cp-header-stats">
                        <div className="cp-stat">
                            <div className="cp-stat-value">{company.active_jobs || 0}</div>
                            <div className="cp-stat-label">việc làm đang tuyển</div>
                        </div>
                    </div>
                </header>

                <div className="cp-tabs">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            className={`cp-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                            {tab.id === 'jobs' && company.active_jobs > 0 && (
                                <span className="cp-tab-badge">{company.active_jobs}</span>
                            )}
                        </button>
                    ))}
                </div>

                {activeTab === 'about' && (
                    <section className="cp-content">
                        <h2>Giới thiệu công ty</h2>
                        {company.description ? (
                            <div className="cp-description">{company.description}</div>
                        ) : (
                            <p className="cp-empty">Chưa có thông tin giới thiệu.</p>
                        )}
                    </section>
                )}

                {activeTab === 'jobs' && (
                    <section className="cp-content">
                        <h2>Việc làm đang tuyển ({jobsTotal})</h2>
                        {jobsLoading ? (
                            <div className="cp-jobs-loading">Đang tải...</div>
                        ) : jobs.length === 0 ? (
                            <p className="cp-empty">Hiện chưa có vị trí tuyển dụng nào.</p>
                        ) : (
                            <div className="cp-jobs-grid">
                                {jobs.map((job) => (
                                    <JobCard key={job.id} job={{ ...job, company_name: company.name, company_logo: company.logo_url }} />
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    )
}
