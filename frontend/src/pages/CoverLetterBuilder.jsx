import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import html2pdf from 'html2pdf.js'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { auth as authApi, coverLetters as clApi } from '../services/api'
import CoverLetterPreview from '../components/cover-letter/CoverLetterPreview'
import './CoverLetterBuilder.css'

const EMPTY_DATA = {
    recipient: '',
    company: '',
    subject: '',
    greeting: 'Kính gửi anh/chị,',
    body: '',
    closing: 'Trân trọng,',
    sender: { full_name: '', email: '', phone: '', address: '' },
}

function flattenAddress(addr) {
    if (!addr || typeof addr !== 'object') return ''
    const parts = [addr.street, addr.ward_name, addr.district_name, addr.province_name].filter(Boolean)
    return parts.join(', ')
}

export default function CoverLetterBuilder() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const clId = searchParams.get('id')
    const { isAuthenticated } = useAuth()
    const { addToast } = useToast()

    const [title, setTitle] = useState('Cover Letter của tôi')
    const [data, setData] = useState(EMPTY_DATA)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [exporting, setExporting] = useState(false)
    const previewRef = useRef(null)

    useEffect(() => {
        if (!isAuthenticated) {
            const target = `/cover-letter-builder${window.location.search}`
            navigate(`/login?redirect=${encodeURIComponent(target)}`, { replace: true })
        }
    }, [isAuthenticated, navigate])

    useEffect(() => {
        let cancelled = false
        async function init() {
            try {
                if (clId) {
                    const cl = await clApi.get(clId)
                    if (cancelled) return
                    setTitle(cl.title)
                    setData({ ...EMPTY_DATA, ...(cl.data || {}), sender: { ...EMPTY_DATA.sender, ...(cl.data?.sender || {}) } })
                } else {
                    const me = await authApi.me()
                    if (cancelled) return
                    setData({
                        ...EMPTY_DATA,
                        sender: {
                            full_name: me.full_name || '',
                            email: me.email || '',
                            phone: me.phone || '',
                            address: flattenAddress(me.address),
                        },
                    })
                }
            } catch (err) {
                if (!cancelled) addToast(err.message || 'Không tải được dữ liệu', 'error')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        init()
        return () => { cancelled = true }
    }, [clId, addToast])

    const update = (field, value) => setData((prev) => ({ ...prev, [field]: value }))
    const updateSender = (field, value) => setData((prev) => ({ ...prev, sender: { ...prev.sender, [field]: value } }))

    const handleSave = async () => {
        if (!title.trim()) {
            addToast('Vui lòng nhập tiêu đề', 'error')
            return
        }
        setSaving(true)
        try {
            const payload = { title: title.trim(), data }
            if (clId) {
                await clApi.update(clId, payload)
                addToast('Đã lưu Cover Letter', 'success')
            } else {
                const created = await clApi.create(payload)
                addToast('Đã tạo Cover Letter mới', 'success')
                navigate(`/cover-letter-builder?id=${created.id}`, { replace: true })
            }
        } catch (err) {
            addToast(err.message || 'Lưu thất bại', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleExport = async () => {
        if (!previewRef.current) return
        setExporting(true)
        try {
            await html2pdf()
                .from(previewRef.current)
                .set({
                    margin: 0,
                    filename: `${title || 'cover-letter'}.pdf`,
                    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                })
                .save()
        } catch {
            addToast('Xuất PDF thất bại', 'error')
        } finally {
            setExporting(false)
        }
    }

    if (loading) return <div className="clb-loading">Đang tải...</div>

    return (
        <div className="clb-page">
            <header className="clb-topbar">
                <input
                    type="text"
                    className="clb-title-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Tên Cover Letter..."
                    maxLength={100}
                />
                <div className="clb-topbar-actions">
                    <button type="button" className="btn btn-outline" onClick={handleExport} disabled={exporting}>
                        {exporting ? 'Đang xuất...' : 'Tải PDF'}
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>
            </header>

            <div className="clb-body">
                <aside className="clb-form">
                    <section className="clb-section">
                        <h2 className="clb-section-title">Người nhận</h2>
                        <div className="clb-row">
                            <div className="clb-field">
                                <label>Người nhận</label>
                                <input value={data.recipient} onChange={(e) => update('recipient', e.target.value)} placeholder="Anh/Chị HR Team" />
                            </div>
                            <div className="clb-field">
                                <label>Công ty</label>
                                <input value={data.company} onChange={(e) => update('company', e.target.value)} placeholder="Tech Corp" />
                            </div>
                        </div>
                        <div className="clb-field">
                            <label>Tiêu đề thư (V/v)</label>
                            <input value={data.subject} onChange={(e) => update('subject', e.target.value)} placeholder="Đơn ứng tuyển vị trí Frontend Developer" />
                        </div>
                    </section>

                    <section className="clb-section">
                        <h2 className="clb-section-title">Nội dung</h2>
                        <div className="clb-field">
                            <label>Lời chào</label>
                            <input value={data.greeting} onChange={(e) => update('greeting', e.target.value)} />
                        </div>
                        <div className="clb-field">
                            <label>Nội dung chính</label>
                            <textarea
                                rows={14}
                                value={data.body}
                                onChange={(e) => update('body', e.target.value)}
                                placeholder="Đoạn 1: Giới thiệu bản thân + vị trí ứng tuyển.&#10;Đoạn 2: Kinh nghiệm và kỹ năng phù hợp.&#10;Đoạn 3: Lý do muốn gia nhập công ty.&#10;Đoạn 4: Cảm ơn và mong nhận phản hồi."
                            />
                        </div>
                        <div className="clb-field">
                            <label>Lời chào kết</label>
                            <input value={data.closing} onChange={(e) => update('closing', e.target.value)} />
                        </div>
                    </section>

                    <section className="clb-section">
                        <h2 className="clb-section-title">Người gửi</h2>
                        <div className="clb-field">
                            <label>Họ và tên</label>
                            <input value={data.sender.full_name} onChange={(e) => updateSender('full_name', e.target.value)} />
                        </div>
                        <div className="clb-row">
                            <div className="clb-field">
                                <label>Email</label>
                                <input type="email" value={data.sender.email} onChange={(e) => updateSender('email', e.target.value)} />
                            </div>
                            <div className="clb-field">
                                <label>Số điện thoại</label>
                                <input type="tel" value={data.sender.phone} onChange={(e) => updateSender('phone', e.target.value)} />
                            </div>
                        </div>
                        <div className="clb-field">
                            <label>Địa chỉ</label>
                            <input value={data.sender.address} onChange={(e) => updateSender('address', e.target.value)} />
                        </div>
                    </section>
                </aside>

                <main className="clb-preview">
                    <div className="clb-preview-wrap">
                        <CoverLetterPreview data={data} ref={previewRef} />
                    </div>
                </main>
            </div>
        </div>
    )
}
