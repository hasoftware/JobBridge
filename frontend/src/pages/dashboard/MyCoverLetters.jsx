import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useToast } from '../../hooks/useToast'
import { coverLetters as clApi } from '../../services/api'
import './MyCVs.css'

function formatDate(value) {
    if (!value) return '—'
    const d = new Date(value)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    return `${dd}/${mm}/${d.getFullYear()}`
}

function snippet(data) {
    const text = (data?.body || '').trim().replace(/\s+/g, ' ')
    if (!text) return data?.subject || 'Chưa có nội dung'
    return text.length > 140 ? text.slice(0, 140) + '...' : text
}

export default function MyCoverLetters() {
    const navigate = useNavigate()
    const { addToast } = useToast()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [busyId, setBusyId] = useState(null)
    const [error, setError] = useState('')

    const load = async () => {
        try {
            const list = await clApi.list()
            setItems(list)
        } catch (err) {
            setError(err.message || 'Không tải được danh sách')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const handleDelete = async (cl) => {
        const ok = window.confirm(`Xóa Cover Letter "${cl.title}"?`)
        if (!ok) return
        setBusyId(cl.id)
        try {
            await clApi.remove(cl.id)
            setItems((prev) => prev.filter((it) => it.id !== cl.id))
            addToast('Đã xóa Cover Letter', 'info')
        } catch (err) {
            addToast(err.message || 'Xóa thất bại', 'error')
        } finally {
            setBusyId(null)
        }
    }

    const handleSetDefault = async (cl) => {
        if (cl.is_default) return
        setBusyId(cl.id)
        try {
            await clApi.setDefault(cl.id)
            setItems((prev) => prev.map((it) => ({ ...it, is_default: it.id === cl.id })))
            addToast(`Đã đặt "${cl.title}" làm Cover Letter mặc định`, 'success')
        } catch (err) {
            addToast(err.message || 'Cập nhật thất bại', 'error')
        } finally {
            setBusyId(null)
        }
    }

    if (loading) return <div className="cvs-loading">Đang tải...</div>

    return (
        <div className="cvs-page">
            <header className="cvs-header">
                <div>
                    <h1>Cover Letter của tôi</h1>
                    <p>{items.length} Cover Letter</p>
                </div>
                <Link to="/cover-letter-builder" className="btn btn-primary">+ Tạo Cover Letter mới</Link>
            </header>

            {error && <div className="cvs-error">{error}</div>}

            {items.length === 0 ? (
                <div className="cvs-empty">
                    <h2>Bạn chưa có Cover Letter nào</h2>
                    <p>Tạo Cover Letter để gửi kèm khi ứng tuyển vào các tin tuyển dụng.</p>
                    <Link to="/cover-letter-builder" className="btn btn-primary">Tạo Cover Letter mới</Link>
                </div>
            ) : (
                <ul className="cvs-list">
                    {items.map((cl) => (
                        <li key={cl.id} className="cv-row">
                            <div className="cv-row-main">
                                <div className="cv-row-title">
                                    <span>{cl.title}</span>
                                    {cl.is_default && <span className="cv-badge">Mặc định</span>}
                                </div>
                                <div className="cv-row-meta" style={{ marginTop: 4 }}>{snippet(cl.data)}</div>
                                <div className="cv-row-meta">Cập nhật: {formatDate(cl.updated_at)}</div>
                            </div>
                            <div className="cv-row-actions">
                                {!cl.is_default && (
                                    <button type="button" className="cv-action" onClick={() => handleSetDefault(cl)} disabled={busyId === cl.id}>
                                        Đặt mặc định
                                    </button>
                                )}
                                <button type="button" className="cv-action" onClick={() => navigate(`/cover-letter-builder?id=${cl.id}`)}>
                                    Sửa
                                </button>
                                <button type="button" className="cv-action cv-action-danger" onClick={() => handleDelete(cl)} disabled={busyId === cl.id}>
                                    Xóa
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
