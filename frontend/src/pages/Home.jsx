import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/common/Icon'
import { SkeletonCard } from '../components/common/Skeleton'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useToast } from '../hooks/useToast'
import { jobs as jobsApi, fileUrl } from '../services/api'
import { GICS_SECTORS } from '../services/constants'
import './Home.css'

const CATEGORY_META = {
  'Energy':                  { icon: 'sun',         color: 'red' },
  'Materials':               { icon: 'layers',      color: 'teal' },
  'Industrials':             { icon: 'factory',     color: 'yellow' },
  'Consumer Discretionary':  { icon: 'gift',        color: 'pink' },
  'Consumer Staples':        { icon: 'star',        color: 'green' },
  'Health Care':             { icon: 'heart',       color: 'blue' },
  'Financials':              { icon: 'dollar-sign', color: 'purple' },
  'Information Technology':  { icon: 'code',        color: 'blue' },
  'Communication Services':  { icon: 'megaphone',   color: 'orange' },
  'Utilities':               { icon: 'settings',    color: 'teal' },
  'Real Estate':             { icon: 'home',        color: 'green' },
}

const BANNER_COLORS = [
  ['#DBEAFE','#EFF6FF'], ['#FEE2E2','#FEF2F2'], ['#D1FAE5','#ECFDF5'],
  ['#FEF3C7','#FFFBEB'], ['#E0E7FF','#EEF2FF'], ['#FCE7F3','#FDF2F8'],
  ['#CFFAFE','#ECFEFF'], ['#FDE68A','#FEF9C3'],
]

const TOOLS = [
  { icon: 'file-text', name: 'Tạo CV', title: 'Tạo CV chuyên nghiệp', desc: 'Tạo CV ấn tượng với hàng trăm mẫu có sẵn, giúp bạn nổi bật trước nhà tuyển dụng.', to: '/cv-templates' },
  { icon: 'brain', name: 'MBTI', title: 'Trắc nghiệm MBTI', desc: 'Khám phá tính cách bản thân và tìm hiểu những ngành nghề phù hợp với bạn.', to: '#' },
  { icon: 'dollar-sign', name: 'Gross-Net', title: 'Tính lương Gross-Net', desc: 'Công cụ tính lương chính xác, giúp bạn biết thu nhập thực nhận hàng tháng.', to: '#' },
  { icon: 'compass', name: 'Định hướng', title: 'Định hướng nghề nghiệp', desc: 'Phân tích xu hướng thị trường và gợi ý lộ trình phát triển sự nghiệp cho bạn.', to: '#' },
  { icon: 'piggy-bank', name: 'Tiết kiệm', title: 'Lập kế hoạch tài chính', desc: 'Quản lý chi tiêu và tiết kiệm hiệu quả với công cụ lập kế hoạch tài chính cá nhân.', to: '#' },
  { icon: 'shield', name: 'Bảo hiểm', title: 'Tra cứu bảo hiểm', desc: 'Kiểm tra thông tin bảo hiểm xã hội, y tế và các quyền lợi bảo hiểm của bạn.', to: '#' },
]

const SEARCH_TAGS = ['Frontend Developer', 'Marketing', 'Kế toán', 'Data Analyst', 'UX/UI Design']

const LOCATIONS = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Bình Dương', 'Đồng Nai', 'Bắc Ninh', 'Nha Trang']

function formatSalary(job) {
  if (!job.salary_min && !job.salary_max) return null
  const cur = job.currency || 'USD'
  const fmt = (v) => Number(v).toLocaleString()
  if (job.salary_min && job.salary_max) return `${cur} ${fmt(job.salary_min)} – ${fmt(job.salary_max)}`
  if (job.salary_min) return `${cur} ${fmt(job.salary_min)}+`
  return `${cur} lên đến ${fmt(job.salary_max)}`
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${Math.max(1, mins)} phút trước`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} giờ trước`
  const days = Math.floor(hrs / 24)
  return `${days} ngày trước`
}

function unwrapJobs(res) {
  if (Array.isArray(res)) return res
  return res?.jobs || res?.data || []
}

export default function Home() {
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const [jobs, setJobs] = useState([])
  const [companies, setCompanies] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [loadingCompanies, setLoadingCompanies] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)

  const heroRef = useScrollReveal()
  const categoriesRef = useScrollReveal()
  const jobsRef = useScrollReveal()
  const companiesRef = useScrollReveal()
  const toolsRef = useScrollReveal()
  const statsRef = useScrollReveal()
  const ctaRef = useScrollReveal()

  useEffect(() => {
    jobsApi.list({ limit: 6 })
      .then((res) => setJobs(unwrapJobs(res).slice(0, 6)))
      .catch(() => addToast('Không thể tải danh sách việc làm', 'error'))
      .finally(() => setLoadingJobs(false))

    jobsApi.list({ limit: 200 })
      .then((res) => {
        const list = unwrapJobs(res)
        const seen = new Set()
        const unique = []
        for (const j of list) {
          const name = j.company_name
          if (name && !seen.has(name)) {
            seen.add(name)
            unique.push({
              id: j.created_by || name,
              name,
              field: j.location || '',
              logo_url: j.company_logo || '',
              bannerColor: BANNER_COLORS[unique.length % BANNER_COLORS.length],
              jobCount: list.filter((x) => x.company_name === name).length,
            })
          }
        }
        setCompanies(unique.sort((a, b) => b.jobCount - a.jobCount).slice(0, 8))
      })
      .catch(() => {})
      .finally(() => setLoadingCompanies(false))

    Promise.all(
      GICS_SECTORS.map(async (sector) => {
        try {
          const res = await jobsApi.list({ industry: sector, limit: 200 })
          const list = unwrapJobs(res)
          const total = res?.total ?? list.length
          return { id: sector, name: sector, count: total, ...(CATEGORY_META[sector] || { icon: 'briefcase', color: 'blue' }) }
        } catch {
          return { id: sector, name: sector, count: 0, ...(CATEGORY_META[sector] || { icon: 'briefcase', color: 'blue' }) }
        }
      }),
    )
      .then((cats) => setCategories(cats.filter((c) => c.count > 0).sort((a, b) => b.count - a.count)))
      .catch(() => {})
      .finally(() => setLoadingCategories(false))
  }, [addToast])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (keyword.trim()) params.set('q', keyword.trim())
    if (location && location !== 'Tất cả địa điểm') params.set('location', location)
    navigate(`/jobs?${params.toString()}`)
  }

  const handleTagClick = (tag) => {
    navigate(`/jobs?q=${encodeURIComponent(tag)}`)
  }

  return (
    <div className="home-page">
      <section className="hero" ref={heroRef}>
        <div className="hero-bg" />
        <div className="container hero-content fade-in">
          <h1 className="hero-title">
            Tìm việc mơ ước,{' '}
            <br />
            xây dựng <span className="hero-accent">tương lai</span>
          </h1>
          <p className="hero-subtitle">
            Kết nối hàng triệu ứng viên với nhà tuyển dụng hàng đầu Việt Nam.
            Tìm kiếm cơ hội việc làm phù hợp với bạn ngay hôm nay.
          </p>

          <form className="hero-search" onSubmit={handleSearch}>
            <div className="hero-search-box">
              <div className="hero-search-field">
                <Icon name="search" size="sm" />
                <input
                  type="text"
                  placeholder="Vị trí, từ khóa hoặc công ty..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <div className="hero-search-divider" />
              <div className="hero-search-field">
                <Icon name="map-pin" size="sm" />
                <select value={location} onChange={(e) => setLocation(e.target.value)}>
                  <option value="">Tất cả địa điểm</option>
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="hero-search-btn">
                <Icon name="search" size="sm" />
                Tìm kiếm
              </button>
            </div>
          </form>

          <div className="hero-tags">
            <span className="hero-tags-label">Phổ biến:</span>
            {SEARCH_TAGS.map((tag) => (
              <button key={tag} className="hero-tag" onClick={() => handleTagClick(tag)}>
                {tag}
              </button>
            ))}
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-number">60,000+</span>
              <span className="hero-stat-label">Việc làm đang tuyển</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">200,000+</span>
              <span className="hero-stat-label">Ứng viên tìm việc</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">9M+</span>
              <span className="hero-stat-label">Lượt truy cập/tháng</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" ref={categoriesRef}>
        <div className="container fade-in">
          <div className="section-header">
            <h2 className="section-title">Khám phá theo danh mục</h2>
            <p className="section-desc">Tìm kiếm cơ hội việc làm theo lĩnh vực chuyên môn của bạn</p>
          </div>
          <div className="categories-grid">
            {loadingCategories
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="category-card">
                    <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12 }} />
                    <div className="skeleton" style={{ height: 16, width: '60%', marginTop: 12 }} />
                    <div className="skeleton" style={{ height: 14, width: '40%', marginTop: 6 }} />
                  </div>
                ))
              : categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="category-card"
                    onClick={() => navigate(`/jobs?industry=${encodeURIComponent(cat.id)}`)}
                  >
                    <div className={`category-icon ${cat.color}`}>
                      <Icon name={cat.icon} />
                    </div>
                    <h3 className="category-name">{cat.name}</h3>
                    <span className="category-count">{cat.count.toLocaleString()} việc làm</span>
                  </div>
                ))}
          </div>
        </div>
      </section>

      <section className="section section-gray" ref={jobsRef}>
        <div className="container fade-in">
          <div className="section-header">
            <h2 className="section-title">Việc làm nổi bật</h2>
            <p className="section-desc">Những cơ hội việc làm tốt nhất dành cho bạn</p>
          </div>
          <div className="jobs-grid">
            {loadingJobs
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : jobs.map((job) => {
                  const salary = formatSalary(job) || 'Thỏa thuận'
                  return (
                    <div key={job.id} className="job-card-v2" onClick={() => navigate(`/jobs/${job.id}`)} style={{ cursor: 'pointer' }}>
                      <div className="jcv2-header">
                        <div className="jcv2-logo">
                          {job.company_logo
                            ? <img src={fileUrl(job.company_logo)} alt="" />
                            : <Icon name="briefcase" />}
                        </div>
                        <div className="jcv2-titles">
                          <span className="jcv2-title">{job.title}</span>
                          <div className="jcv2-company">{job.company_name || 'Company'}</div>
                        </div>
                      </div>
                      <div className="jcv2-tags">
                        <span className="jcv2-tag salary"><Icon name="dollar-sign" size="sm" />{salary}</span>
                        {job.location && <span className="jcv2-tag"><Icon name="map-pin" size="sm" />{job.location}</span>}
                        {(job.job_type || job.type) && <span className="jcv2-tag"><Icon name="clock" size="sm" />{job.job_type || job.type}</span>}
                      </div>
                      <div className="jcv2-footer">
                        <span className="jcv2-time">Cập nhật {timeAgo(job.updated_at || job.publishing_date || job.created_at)}</span>
                        <span className="jcv2-apply-btn">
                          Xem chi tiết <Icon name="arrow-right" size="sm" />
                        </span>
                      </div>
                    </div>
                  )
                })}
          </div>
          <div className="section-action">
            <button className="btn btn-outline" onClick={() => navigate('/jobs')}>
              Xem tất cả việc làm
              <Icon name="arrow-right" size="sm" />
            </button>
          </div>
        </div>
      </section>

      <section className="section" ref={companiesRef}>
        <div className="container fade-in">
          <div className="section-header">
            <h2 className="section-title">Công ty hàng đầu</h2>
            <p className="section-desc">Những doanh nghiệp uy tín đang tuyển dụng</p>
          </div>
          <div className="companies-grid">
            {loadingCompanies
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : companies.map((company) => (
                  <div key={company.id} className="company-card" onClick={() => navigate(`/companies?q=${encodeURIComponent(company.name)}`)} style={{ cursor: 'pointer' }}>
                    <div className="company-banner" style={{ background: `linear-gradient(135deg, ${company.bannerColor[0]}, ${company.bannerColor[1]})` }} />
                    {company.logo_url ? (
                      <img src={fileUrl(company.logo_url)} alt={company.name} className="company-logo" loading="lazy" />
                    ) : (
                      <div className="company-logo company-logo-fallback"><Icon name="briefcase" /></div>
                    )}
                    <div className="company-body">
                      <div className="company-name">{company.name}</div>
                      <div className="company-field">{company.jobCount ? `${company.jobCount} việc làm` : company.field}</div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      <section className="section section-gray" ref={toolsRef}>
        <div className="container fade-in">
          <div className="section-header">
            <h2 className="section-title">Công cụ hữu ích</h2>
            <p className="section-desc">Hỗ trợ bạn trong hành trình phát triển sự nghiệp</p>
          </div>
          <div className="tools-grid">
            {TOOLS.map((tool) => (
              <div key={tool.name} className="tool-card">
                <div className="tool-icon">
                  <Icon name={tool.icon} />
                </div>
                <div className="tool-info">
                  <h3 className="tool-title">{tool.title}</h3>
                  <p className="tool-desc">{tool.desc}</p>
                </div>
                <a href={tool.to} className="tool-link">
                  <Icon name="arrow-right" size="sm" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="stats-section" ref={statsRef}>
        <div className="container fade-in">
          <div className="section-header section-header-light">
            <h2 className="section-title">JobBridge bằng số liệu</h2>
            <p className="section-desc">Nền tảng tuyển dụng hàng đầu Việt Nam</p>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">540K+</span>
              <span className="stat-label">Việc làm đa dạng</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">200K+</span>
              <span className="stat-label">Doanh nghiệp đối tác</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">2M+</span>
              <span className="stat-label">Ứng viên đăng ký</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">1.2M+</span>
              <span className="stat-label">Lượt ứng tuyển</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" ref={ctaRef}>
        <div className="container fade-in">
          <div className="cta-box">
            <h2 className="cta-title">Sẵn sàng cho bước tiến mới?</h2>
            <p className="cta-desc">
              Tham gia cùng hàng triệu ứng viên và doanh nghiệp trên JobBridge
              để tìm kiếm cơ hội tốt nhất cho sự nghiệp của bạn.
            </p>
            <div className="cta-buttons">
              <button className="btn btn-white" onClick={() => navigate('/jobs')}>
                Tìm việc ngay
              </button>
              <button className="btn btn-outline-white" onClick={() => navigate('/register')}>
                Đăng ký tài khoản
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
