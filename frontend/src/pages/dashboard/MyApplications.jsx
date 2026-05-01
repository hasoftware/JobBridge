import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../../hooks/useToast'
import { applications as appsApi } from '../../services/api'
import './MyApplications.css'

const PAGE_SIZE = 12

const STATUS_FILTERS = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Đang chờ' },
    { id: 'reviewed', label: 'Đã xem' },
    { id: 'interview', label: 'Phỏng vấn' },
    { id: 'accepted', label: 'Trúng tuyển' },
    { id: 'rejected', label: 'Bị từ chối' },
    { id: 'withdrawn', label: 'Đã rút' },
]

const STATUS_META = {
    pending: { label: 'Đang chờ', cls: 'pending' },
    submitted: { label: 'Đang chờ', cls: 'pending' },
    reviewed: { label: 'Đã xem', cls: 'reviewed' },
    interview: { label: 'Phỏng vấn', cls: 'interview' },
    accepted: { label: 'Trúng tuyển', cls: 'accepted' },
    rejected: { label: 'Bị từ chối', cls: 'rejected' },
    withdrawn: { label: 'Đã rút', cls: 'withdrawn' },
}

function statusInfo(s) {
    return STATUS_META[s] || { label: s || '—', cls: 'pending' }
}

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

function canWithdraw(status) {
    return ['pending', 'submitted', 'reviewed'].includes(status)
}

export default function MyApplications() {
    const { addToast } = useToast()
    const [items, setItems] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [filter, setFilter] = useState('all')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [busyId, setBusyId] = useState(null)

    const load = async (targetPage = 1, statusId = filter) => {
        setLoading(true)
        setError('')
        try {
            const params = { page: targetPage, limit: PAGE_SIZE }
            if (statusId !== 'all') params.status = statusId
            const data = await appsApi.listMine(params)
            setItems(data.applications || [])
            setTotal(data.total || 0)
            setPage(data.page || targetPage)
        } catch (err) {
            setError(err.message || 'Không tải được danh sách')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load(1, filter)
    }, [filter])

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

    const handleWithdraw = async (item) => {
        const ok = window.confirm(`Rút đơn ứng tuyển vị trí "${item.title}"?`)
        if (!ok) return
        setBusyId(item.id)
        try {
            await appsApi.withdraw(item.id)
            addToast('Đã rút đơn ứng tuyển', 'info')
            load(page, filter)
        } catch (err) {
            addToast(err.message || 'Rút đơn thất bại', 'error')
        } finally {
            setBusyId(null)
        }
    }

    const goPage = (p) => {
        if (p < 1 || p > totalPages || p === page) return
        load(p, filter)
    }

    if (loading && items.length === 0) {
        return (
            <div className="apps-page">
                <header className="apps-header">
                    <h1>Việc làm đã ứng tuyển</h1>
                </header>
                <div className="apps-loading">
                    <div className="apps-skeleton" />
                    <div className="apps-skeleton" />
                    <div className="apps-skeleton" />
                </div>
            </div>
        )
    }

    return (
        <div className="apps-page">
            <header className="apps-header">
                <div>
                    <h1>Việc làm đã ứng tuyển</h1>
                    <p>{total} đơn ứng tuyển</p>
                </div>
            </header>

            <div className="apps-filters">
                {STATUS_FILTERS.map((f) => (
                    <button
                        key={f.id}
                        type="button"
                        className={`apps-chip ${filter === f.id ? 'active' : ''}`}
                        onClick={() => setFilter(f.id)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {error && <div className="apps-error">{error}</div>}

            {!loading && items.length === 0 && !error ? (
                <div className="apps-empty">
                    <h2>{filter === 'all' ? 'Bạn chưa ứng tuyển việc nào' : 'Không có đơn nào ở trạng thái này'}</h2>
                    <p>Khám phá các tin tuyển dụng và bấm "Ứng tuyển" trên trang chi tiết để bắt đầu.</p>
                    <Link to="/jobs" className="btn btn-primary">Tìm việc làm</Link>
                </div>
            ) : (
                <ul className="apps-list">
                    {items.map((it) => {
                        const st = statusInfo(it.status)
                        return (
                            <li key={it.id} className="apps-card">
                                <Link to={`/jobs/${it.job_id}`} className="apps-card-main">
                                    <div className="apps-card-logo">
                                        {it.company_logo
                                            ? <img src={it.company_logo} alt={it.company_name || ''} />
                                            : <span>{(it.company_name || '?').charAt(0).toUpperCase()}</span>
                                        }
                                    </div>
                                    <div className="apps-card-body">
                                        <div className="apps-card-head">
                                            <h3 className="apps-card-title">{it.title}</h3>
                                            <span className={`apps-status apps-status-${st.cls}`}>{st.label}</span>
                                        </div>
                                        <div className="apps-card-company">{it.company_name || 'Công ty đang cập nhật'}</div>
                                        <div className="apps-card-meta">
                                            <span>{formatSalary(it.salary_min, it.salary_max, it.currency)}</span>
                                            {it.location && <span>· {it.location}</span>}
                                            {it.job_type && <span>· {it.job_type}</span>}
                                        </div>
                                        <div className="apps-card-foot">
                                            <span>Ứng tuyển {formatRelative(it.created_at)}</span>
                                            {it.cv_title && <span>· CV: {it.cv_title}</span>}
                                        </div>
                                    </div>
                                </Link>
                                {canWithdraw(it.status) && (
                                    <button
                                        type="button"
                                        className="apps-card-withdraw"
                                        onClick={() => handleWithdraw(it)}
                                        disabled={busyId === it.id}
                                    >
                                        {busyId === it.id ? 'Đang xử lý...' : 'Rút đơn'}
                                    </button>
                                )}
                            </li>
                        )
                    })}
                </ul>
            )}

            {totalPages > 1 && (
                <div className="apps-pagination">
                    <button type="button" className="page-btn" onClick={() => goPage(page - 1)} disabled={page <= 1 || loading}>← Trước</button>
                    <span className="page-info">Trang {page} / {totalPages}</span>
                    <button type="button" className="page-btn" onClick={() => goPage(page + 1)} disabled={page >= totalPages || loading}>Sau →</button>
                </div>
            )}
        </div>
    )
}
