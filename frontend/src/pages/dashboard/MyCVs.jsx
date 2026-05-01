import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useToast } from '../../hooks/useToast'
import { cvs as cvsApi } from '../../services/api'
import './MyCVs.css'

function formatDate(value) {
    if (!value) return '—'
    try {
        const d = new Date(value)
        const dd = String(d.getDate()).padStart(2, '0')
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const yyyy = d.getFullYear()
        return `${dd}/${mm}/${yyyy}`
    } catch {
        return '—'
    }
}

export default function MyCVs() {
    const navigate = useNavigate()
    const { addToast } = useToast()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [busyId, setBusyId] = useState(null)
    const [error, setError] = useState('')

    const load = async () => {
        try {
            const list = await cvsApi.list()
            setItems(list)
        } catch (err) {
            setError(err.message || 'Không tải được danh sách CV')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const handleDelete = async (cv) => {
        const ok = window.confirm(`Xóa CV "${cv.title}"?`)
        if (!ok) return
        setBusyId(cv.id)
        try {
            await cvsApi.remove(cv.id)
            setItems((prev) => prev.filter((it) => it.id !== cv.id))
            addToast('Đã xóa CV', 'info')
        } catch (err) {
            addToast(err.message || 'Xóa thất bại', 'error')
        } finally {
            setBusyId(null)
        }
    }

    const handleSetDefault = async (cv) => {
        if (cv.is_default) return
        setBusyId(cv.id)
        try {
            await cvsApi.setDefault(cv.id)
            setItems((prev) => prev.map((it) => ({ ...it, is_default: it.id === cv.id })))
            addToast(`Đã đặt "${cv.title}" làm CV mặc định`, 'success')
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
                    <h1>CV của tôi</h1>
                    <p>{items.length} CV</p>
                </div>
                <Link to="/cv-templates" className="btn btn-primary">+ Tạo CV mới</Link>
            </header>

            {error && <div className="cvs-error">{error}</div>}

            {items.length === 0 ? (
                <div className="cvs-empty">
                    <h2>Bạn chưa có CV nào</h2>
                    <p>Tạo CV đầu tiên để ứng tuyển nhanh hơn vào các tin tuyển dụng.</p>
                    <Link to="/cv-templates" className="btn btn-primary">Tạo CV mới</Link>
                </div>
            ) : (
                <ul className="cvs-list">
                    {items.map((cv) => (
                        <li key={cv.id} className="cv-row">
                            <div className="cv-row-main">
                                <div className="cv-row-title">
                                    <span>{cv.title}</span>
                                    {cv.is_default && <span className="cv-badge">Mặc định</span>}
                                </div>
                                <div className="cv-row-meta">
                                    Cập nhật: {formatDate(cv.updated_at)}
                                </div>
                            </div>
                            <div className="cv-row-actions">
                                {!cv.is_default && (
                                    <button
                                        type="button"
                                        className="cv-action"
                                        onClick={() => handleSetDefault(cv)}
                                        disabled={busyId === cv.id}
                                    >
                                        Đặt mặc định
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="cv-action"
                                    onClick={() => navigate(`/cv-builder?id=${cv.id}`)}
                                >
                                    Sửa
                                </button>
                                <button
                                    type="button"
                                    className="cv-action cv-action-danger"
                                    onClick={() => handleDelete(cv)}
                                    disabled={busyId === cv.id}
                                >
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
