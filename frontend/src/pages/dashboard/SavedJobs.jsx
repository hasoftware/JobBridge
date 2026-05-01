import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../../hooks/useToast'
import { jobs as jobsApi } from '../../services/api'
import './SavedJobs.css'

const PAGE_SIZE = 12

function formatSalary(min, max, currency) {
    if (!min && !max) return 'Thỏa thuận'
    const c = currency || 'VND'
    const fmt = (n) => Number(n).toLocaleString('vi-VN')
    if (min && max) return `${fmt(min)} - ${fmt(max)} ${c}`
    if (min) return `Từ ${fmt(min)} ${c}`
    return `Tới ${fmt(max)} ${c}`
}

function formatRelative(value) {
    if (!value) return ''
    const d = new Date(value)
    const diff = Date.now() - d.getTime()
    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour
    if (diff < hour) return `${Math.max(1, Math.floor(diff / minute))} phút trước`
    if (diff < day) return `${Math.floor(diff / hour)} giờ trước`
    if (diff < 7 * day) return `${Math.floor(diff / day)} ngày trước`
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    return `${dd}/${mm}/${d.getFullYear()}`
}

export default function SavedJobs() {
    const { addToast } = useToast()
    const [items, setItems] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [removingId, setRemovingId] = useState(null)

    const loadList = async (targetPage = page) => {
        setLoading(true)
        setError('')
        try {
            const data = await jobsApi.getSaved({ page: targetPage, limit: PAGE_SIZE })
            setItems(data.jobs || [])
            setTotal(data.total || 0)
            setPage(data.page || targetPage)
        } catch (err) {
            setError(err.message || 'Không tải được danh sách')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadList(1)
    }, [])

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return items
        return items.filter((it) =>
            (it.title || '').toLowerCase().includes(q)
            || (it.company_name || '').toLowerCase().includes(q),
        )
    }, [items, search])

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

    const handleUnsave = async (id, title) => {
        const ok = window.confirm(`Bỏ lưu "${title}"?`)
        if (!ok) return
        setRemovingId(id)
        try {
            await jobsApi.unsave(id)
            setItems((prev) => prev.filter((it) => it.id !== id))
            setTotal((t) => Math.max(0, t - 1))
            addToast('Đã bỏ lưu việc làm', 'info')
        } catch (err) {
            addToast(err.message || 'Bỏ lưu thất bại', 'error')
        } finally {
            setRemovingId(null)
        }
    }

    const goPage = (p) => {
        if (p < 1 || p > totalPages || p === page) return
        loadList(p)
    }

    if (loading && items.length === 0) {
        return (
            <div className="saved-jobs-page">
                <div className="saved-jobs-loading">
                    <div className="saved-jobs-skeleton" />
                    <div className="saved-jobs-skeleton" />
                    <div className="saved-jobs-skeleton" />
                </div>
            </div>
        )
    }

    if (!loading && items.length === 0 && !error) {
        return (
            <div className="saved-jobs-page">
                <header className="saved-jobs-header">
                    <h1>Việc làm đã lưu</h1>
                    <p>0 việc làm</p>
                </header>
                <div className="saved-jobs-empty">
                    <div className="saved-jobs-empty-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <h2>Bạn chưa lưu việc làm nào</h2>
                    <p>Khi tìm thấy tin tuyển dụng phù hợp, bấm nút "Lưu" để xem lại sau.</p>
                    <Link to="/jobs" className="btn btn-primary">Khám phá việc làm</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="saved-jobs-page">
            <header className="saved-jobs-header">
                <div>
                    <h1>Việc làm đã lưu</h1>
                    <p>{total} việc làm</p>
                </div>
                <input
                    type="search"
                    className="saved-jobs-search"
                    placeholder="Tìm theo tiêu đề hoặc công ty..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </header>

            {error && <div className="saved-jobs-error">{error}</div>}

            <ul className="saved-jobs-list">
                {filtered.map((job) => (
                    <li key={job.id} className="saved-job-card">
                        <Link to={`/jobs/${job.id}`} className="saved-job-main">
                            <div className="saved-job-logo">
                                {job.company_logo
                                    ? <img src={job.company_logo} alt={job.company_name || ''} />
                                    : <span>{(job.company_name || '?').charAt(0).toUpperCase()}</span>
                                }
                            </div>
                            <div className="saved-job-content">
                                <h3 className="saved-job-title">{job.title}</h3>
                                <div className="saved-job-company">{job.company_name || 'Công ty đang cập nhật'}</div>
                                <div className="saved-job-meta">
                                    <span>{formatSalary(job.salary_min, job.salary_max, job.currency)}</span>
                                    {job.location && <span>· {job.location}</span>}
                                    {job.job_type && <span>· {job.job_type}</span>}
                                </div>
                                <div className="saved-job-saved-at">Đã lưu {formatRelative(job.saved_at)}</div>
                            </div>
                        </Link>
                        <button
                            type="button"
                            className="saved-job-unsave"
                            onClick={() => handleUnsave(job.id, job.title)}
                            disabled={removingId === job.id}
                            aria-label="Bỏ lưu"
                        >
                            {removingId === job.id ? 'Đang xóa...' : 'Bỏ lưu'}
                        </button>
                    </li>
                ))}
            </ul>

            {filtered.length === 0 && search && (
                <div className="saved-jobs-no-match">
                    Không có việc làm nào khớp với từ khóa <strong>{search}</strong>
                </div>
            )}

            {totalPages > 1 && (
                <div className="saved-jobs-pagination">
                    <button
                        type="button"
                        className="page-btn"
                        onClick={() => goPage(page - 1)}
                        disabled={page <= 1 || loading}
                    >
                        ← Trước
                    </button>
                    <span className="page-info">Trang {page} / {totalPages}</span>
                    <button
                        type="button"
                        className="page-btn"
                        onClick={() => goPage(page + 1)}
                        disabled={page >= totalPages || loading}
                    >
                        Sau →
                    </button>
                </div>
            )}
        </div>
    )
}
