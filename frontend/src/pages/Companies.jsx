import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { companies as companiesApi } from '../services/api'
import './Companies.css'

const QUICK_INDUSTRIES = ['IT - Phần mềm', 'Marketing', 'Tài chính - Ngân hàng', 'Sản xuất', 'Bán lẻ', 'Logistics']
const PAGE_SIZE = 24

function CompanyCard({ company, large = false }) {
    const initial = (company.name || '?').charAt(0).toUpperCase()
    return (
        <Link to={`/companies/${company.id}`} className={`comp-card ${large ? 'comp-card-large' : ''}`}>
            <div className="comp-card-logo">
                {company.logo_url
                    ? <img src={company.logo_url} alt={company.name} />
                    : <span>{initial}</span>
                }
            </div>
            <div className="comp-card-body">
                <h3 className="comp-card-name">{company.name}</h3>
                {company.description && <p className="comp-card-desc">{company.description}</p>}
                <div className="comp-card-tags">
                    {company.industry && <span className="comp-tag">{company.industry}</span>}
                    {company.location && <span className="comp-tag comp-tag-soft">{company.location}</span>}
                    {company.company_size && <span className="comp-tag comp-tag-soft">{company.company_size} người</span>}
                </div>
                {typeof company.active_jobs === 'number' && company.active_jobs > 0 && (
                    <div className="comp-card-jobs">{company.active_jobs} việc làm đang tuyển</div>
                )}
            </div>
        </Link>
    )
}

export default function Companies() {
    const [query, setQuery] = useState('')
    const [activeIndustry, setActiveIndustry] = useState('all')
    const [activeSize, setActiveSize] = useState('all')
    const [activeLocation, setActiveLocation] = useState('all')

    const [featured, setFeatured] = useState([])
    const [list, setList] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [searching, setSearching] = useState(false)
    const [error, setError] = useState('')
    const [filters, setFilters] = useState({ industries: [], sizes: [], locations: [] })

    const debounceRef = useRef(null)

    useEffect(() => {
        let cancelled = false
        Promise.all([
            companiesApi.featured(8).catch(() => []),
            companiesApi.filters().catch(() => ({ industries: [], sizes: [], locations: [] })),
        ]).then(([feat, filt]) => {
            if (cancelled) return
            setFeatured(feat || [])
            setFilters(filt || { industries: [], sizes: [], locations: [] })
        })
        return () => { cancelled = true }
    }, [])

    const fetchList = async (targetPage = page, opts = {}) => {
        const params = { page: targetPage, limit: PAGE_SIZE }
        const q = opts.q !== undefined ? opts.q : query
        const ind = opts.industry !== undefined ? opts.industry : activeIndustry
        const sz = opts.size !== undefined ? opts.size : activeSize
        const loc = opts.location !== undefined ? opts.location : activeLocation
        if (q) params.q = q
        if (ind && ind !== 'all') params.industry = ind
        if (sz && sz !== 'all') params.size = sz
        if (loc && loc !== 'all') params.location = loc

        setSearching(true)
        setError('')
        try {
            const data = await companiesApi.list(params)
            setList(data.companies || [])
            setTotal(data.total || 0)
            setPage(data.page || targetPage)
        } catch (err) {
            setError(err.message || 'Không tải được danh sách công ty')
        } finally {
            setSearching(false)
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchList(1)
    }, [])

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            fetchList(1, { q: query })
        }, 350)
        return () => clearTimeout(debounceRef.current)
    }, [query])

    useEffect(() => {
        fetchList(1, { industry: activeIndustry, size: activeSize, location: activeLocation })
    }, [activeIndustry, activeSize, activeLocation])

    const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total])

    const goPage = (p) => {
        if (p < 1 || p > totalPages || p === page) return
        fetchList(p)
        window.scrollTo({ top: 300, behavior: 'smooth' })
    }

    return (
        <div className="comp-page">
            <section className="comp-hero">
                <div className="container">
                    <h1 className="comp-hero-title">Khám phá công ty hàng đầu</h1>
                    <p className="comp-hero-subtitle">Tìm hiểu văn hóa, môi trường và cơ hội việc làm tại các công ty đang tuyển dụng.</p>
                    <div className="comp-search-box">
                        <span className="comp-search-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="7" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </span>
                        <input
                            type="search"
                            placeholder="Tìm tên công ty..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <div className="comp-quick-chips">
                        <span className="comp-quick-label">Phổ biến:</span>
                        {QUICK_INDUSTRIES.map((ind) => (
                            <button
                                key={ind}
                                type="button"
                                className={`comp-quick-chip ${activeIndustry === ind ? 'active' : ''}`}
                                onClick={() => setActiveIndustry(activeIndustry === ind ? 'all' : ind)}
                            >
                                {ind}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {featured.length > 0 && !query && activeIndustry === 'all' && activeSize === 'all' && activeLocation === 'all' && (
                <section className="comp-featured-wrap">
                    <div className="container">
                        <h2 className="comp-section-title">Công ty nổi bật</h2>
                        <div className="comp-featured-grid">
                            {featured.map((c) => <CompanyCard key={c.id} company={c} large />)}
                        </div>
                    </div>
                </section>
            )}

            <section className="comp-list-wrap">
                <div className="container">
                    <div className="comp-filters">
                        <div className="comp-filter-group">
                            <label>Ngành</label>
                            <select value={activeIndustry} onChange={(e) => setActiveIndustry(e.target.value)}>
                                <option value="all">Tất cả</option>
                                {filters.industries.map((i) => <option key={i} value={i}>{i}</option>)}
                            </select>
                        </div>
                        <div className="comp-filter-group">
                            <label>Quy mô</label>
                            <select value={activeSize} onChange={(e) => setActiveSize(e.target.value)}>
                                <option value="all">Tất cả</option>
                                {filters.sizes.map((s) => <option key={s} value={s}>{s} người</option>)}
                            </select>
                        </div>
                        <div className="comp-filter-group">
                            <label>Địa điểm</label>
                            <select value={activeLocation} onChange={(e) => setActiveLocation(e.target.value)}>
                                <option value="all">Tất cả</option>
                                {filters.locations.map((l) => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div className="comp-result-count">
                            {searching ? 'Đang tìm...' : `${total} công ty`}
                        </div>
                    </div>

                    {error && <div className="comp-error">{error}</div>}

                    {loading ? (
                        <div className="comp-grid">
                            {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="comp-skeleton" />)}
                        </div>
                    ) : list.length === 0 ? (
                        <div className="comp-empty">
                            <h3>Không tìm thấy công ty phù hợp</h3>
                            <p>Thử bỏ bớt bộ lọc hoặc tìm với từ khóa khác.</p>
                        </div>
                    ) : (
                        <>
                            <div className="comp-grid">
                                {list.map((c) => <CompanyCard key={c.id} company={c} />)}
                            </div>

                            {totalPages > 1 && (
                                <div className="comp-pagination">
                                    <button type="button" className="page-btn" onClick={() => goPage(page - 1)} disabled={page <= 1 || searching}>← Trước</button>
                                    <span className="page-info">Trang {page} / {totalPages}</span>
                                    <button type="button" className="page-btn" onClick={() => goPage(page + 1)} disabled={page >= totalPages || searching}>Sau →</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    )
}
