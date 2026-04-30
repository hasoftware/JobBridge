import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

const FEATURED_JOBS = [
    { id: 1, title: 'Frontend Developer', company: 'Tech Corp', location: 'Hà Nội', salary: 'USD 1500 – 2500' },
    { id: 2, title: 'Backend Engineer', company: 'StartupHub', location: 'TP. HCM', salary: 'USD 2000 – 3500' },
    { id: 3, title: 'Marketing Manager', company: 'Brand Vietnam', location: 'Hà Nội', salary: 'Thoả thuận' },
    { id: 4, title: 'Data Analyst', company: 'FinTech Co', location: 'TP. HCM', salary: 'USD 1200 – 2000' },
]

const SEARCH_TAGS = ['Frontend Developer', 'Marketing', 'Kế toán', 'Data Analyst', 'UX/UI Design']

export default function Home() {
    const navigate = useNavigate()
    const [keyword, setKeyword] = useState('')
    const [location, setLocation] = useState('')

    const handleSearch = (e) => {
        e.preventDefault()
        const params = new URLSearchParams()
        if (keyword) params.set('q', keyword)
        if (location) params.set('loc', location)
        navigate(`/jobs?${params.toString()}`)
    }

    return (
        <div className="home">
            <section className="hero">
                <div className="container">
                    <h1 className="hero-title">Tìm công việc mơ ước của bạn</h1>
                    <p className="hero-subtitle">Hơn 10.000 cơ hội việc làm đang chờ bạn khám phá</p>

                    <form className="hero-search" onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Vị trí, công ty, kỹ năng..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Địa điểm"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary">Tìm việc</button>
                    </form>

                    <div className="hero-tags">
                        <span>Phổ biến:</span>
                        {SEARCH_TAGS.map((tag) => (
                            <button
                                key={tag}
                                className="hero-tag"
                                onClick={() => { setKeyword(tag); }}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="featured-jobs">
                <div className="container">
                    <h2 className="section-title">Việc làm nổi bật</h2>
                    <div className="jobs-grid">
                        {FEATURED_JOBS.map((job) => (
                            <div key={job.id} className="job-card">
                                <div className="job-card-title">{job.title}</div>
                                <div className="job-card-company">{job.company}</div>
                                <div className="job-card-meta">
                                    <span>{job.location}</span>
                                    <span>{job.salary}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="cta">
                <div className="container">
                    <h2>Bạn là nhà tuyển dụng?</h2>
                    <p>Đăng tin tuyển dụng và tiếp cận hàng ngàn ứng viên chất lượng</p>
                    <button className="btn btn-primary" onClick={() => navigate('/register')}>Đăng tin ngay</button>
                </div>
            </section>
        </div>
    )
}
