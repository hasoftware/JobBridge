import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import html2pdf from 'html2pdf.js'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { auth as authApi, cvs as cvsApi } from '../services/api'
import CVPreview from '../components/cv/CVPreview'
import './CVBuilder.css'

const EMPTY_DATA = {
    personal: { full_name: '', headline: '', email: '', phone: '', address: '', date_of_birth: '', links: [] },
    summary: '',
    experience: [],
    education: [],
    skills: [],
}

const SECTION_TABS = [
    { key: 'personal', label: 'Thông tin' },
    { key: 'summary', label: 'Giới thiệu' },
    { key: 'experience', label: 'Kinh nghiệm' },
    { key: 'education', label: 'Học vấn' },
    { key: 'skills', label: 'Kỹ năng' },
]

function flattenAddress(addr) {
    if (!addr || typeof addr !== 'object') return ''
    const parts = [addr.street, addr.ward_name, addr.district_name, addr.province_name].filter(Boolean)
    return parts.join(', ')
}

function isoToDdmmyyyy(value) {
    if (!value) return ''
    const m = value.toString().slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!m) return value
    return `${m[3]}/${m[2]}/${m[1]}`
}

export default function CVBuilder() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const cvId = searchParams.get('id')
    const { isAuthenticated } = useAuth()
    const { addToast } = useToast()

    const [title, setTitle] = useState('CV của tôi')
    const [data, setData] = useState(EMPTY_DATA)
    const [activeTab, setActiveTab] = useState('personal')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [exporting, setExporting] = useState(false)
    const previewRef = useRef(null)

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login?redirect=/cv-builder', { replace: true })
        }
    }, [isAuthenticated, navigate])

    useEffect(() => {
        let cancelled = false
        async function init() {
            try {
                if (cvId) {
                    const cv = await cvsApi.get(cvId)
                    if (cancelled) return
                    setTitle(cv.title)
                    setData({ ...EMPTY_DATA, ...(cv.data || {}) })
                } else {
                    const me = await authApi.me()
                    if (cancelled) return
                    setData({
                        ...EMPTY_DATA,
                        personal: {
                            ...EMPTY_DATA.personal,
                            full_name: me.full_name || '',
                            email: me.email || '',
                            phone: me.phone || '',
                            address: flattenAddress(me.address),
                            date_of_birth: isoToDdmmyyyy(me.date_of_birth),
                        },
                        summary: me.bio || '',
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
    }, [cvId, addToast])

    const updatePersonal = (field, value) => {
        setData((prev) => ({ ...prev, personal: { ...prev.personal, [field]: value } }))
    }

    const updateLink = (idx, field, value) => {
        setData((prev) => {
            const links = [...(prev.personal.links || [])]
            links[idx] = { ...links[idx], [field]: value }
            return { ...prev, personal: { ...prev.personal, links } }
        })
    }

    const addLink = () => {
        setData((prev) => ({
            ...prev,
            personal: { ...prev.personal, links: [...(prev.personal.links || []), { label: '', url: '' }] },
        }))
    }

    const removeLink = (idx) => {
        setData((prev) => ({
            ...prev,
            personal: { ...prev.personal, links: (prev.personal.links || []).filter((_, i) => i !== idx) },
        }))
    }

    const updateListItem = (key, idx, field, value) => {
        setData((prev) => {
            const list = [...(prev[key] || [])]
            list[idx] = { ...list[idx], [field]: value }
            return { ...prev, [key]: list }
        })
    }

    const addListItem = (key, template) => {
        setData((prev) => ({ ...prev, [key]: [...(prev[key] || []), { ...template }] }))
    }

    const removeListItem = (key, idx) => {
        setData((prev) => ({ ...prev, [key]: (prev[key] || []).filter((_, i) => i !== idx) }))
    }

    const handleSave = async () => {
        if (!title.trim()) {
            addToast('Vui lòng nhập tiêu đề CV', 'error')
            return
        }
        setSaving(true)
        try {
            if (cvId) {
                await cvsApi.update(cvId, { title: title.trim(), data })
                addToast('Đã lưu CV', 'success')
            } else {
                const created = await cvsApi.create({ title: title.trim(), data })
                addToast('Đã tạo CV mới', 'success')
                navigate(`/cv-builder?id=${created.id}`, { replace: true })
            }
        } catch (err) {
            addToast(err.message || 'Lưu thất bại', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleExportPdf = async () => {
        if (!previewRef.current) return
        setExporting(true)
        try {
            await html2pdf()
                .from(previewRef.current)
                .set({
                    margin: 0,
                    filename: `${title || 'cv'}.pdf`,
                    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                })
                .save()
        } catch (err) {
            addToast('Xuất PDF thất bại', 'error')
        } finally {
            setExporting(false)
        }
    }

    const personal = data.personal || {}
    const links = personal.links || []
    const experience = data.experience || []
    const education = data.education || []
    const skills = data.skills || []

    if (loading) {
        return <div className="cvb-loading">Đang tải...</div>
    }

    return (
        <div className="cvb-page">
            <header className="cvb-topbar">
                <input
                    type="text"
                    className="cvb-title-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Tên CV..."
                    maxLength={100}
                />
                <div className="cvb-topbar-actions">
                    <button type="button" className="btn btn-outline" onClick={handleExportPdf} disabled={exporting}>
                        {exporting ? 'Đang xuất...' : 'Tải PDF'}
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? 'Đang lưu...' : 'Lưu CV'}
                    </button>
                </div>
            </header>

            <div className="cvb-body">
                <aside className="cvb-form">
                    <nav className="cvb-tabs">
                        {SECTION_TABS.map((t) => (
                            <button
                                key={t.key}
                                type="button"
                                className={`cvb-tab ${activeTab === t.key ? 'active' : ''}`}
                                onClick={() => setActiveTab(t.key)}
                            >
                                {t.label}
                            </button>
                        ))}
                    </nav>

                    {activeTab === 'personal' && (
                        <div className="cvb-section">
                            <div className="cvb-field">
                                <label>Họ và tên</label>
                                <input value={personal.full_name || ''} onChange={(e) => updatePersonal('full_name', e.target.value)} />
                            </div>
                            <div className="cvb-field">
                                <label>Vị trí mong muốn</label>
                                <input value={personal.headline || ''} onChange={(e) => updatePersonal('headline', e.target.value)} placeholder="Frontend Developer" />
                            </div>
                            <div className="cvb-row">
                                <div className="cvb-field">
                                    <label>Email</label>
                                    <input type="email" value={personal.email || ''} onChange={(e) => updatePersonal('email', e.target.value)} />
                                </div>
                                <div className="cvb-field">
                                    <label>Số điện thoại</label>
                                    <input type="tel" value={personal.phone || ''} onChange={(e) => updatePersonal('phone', e.target.value)} />
                                </div>
                            </div>
                            <div className="cvb-field">
                                <label>Địa chỉ</label>
                                <input value={personal.address || ''} onChange={(e) => updatePersonal('address', e.target.value)} />
                            </div>
                            <div className="cvb-field">
                                <label>Ngày sinh</label>
                                <input value={personal.date_of_birth || ''} onChange={(e) => updatePersonal('date_of_birth', e.target.value)} placeholder="dd/mm/yyyy" />
                            </div>

                            <div className="cvb-subhead">
                                <span>Liên kết mạng xã hội</span>
                                <button type="button" className="cvb-mini" onClick={addLink}>+ Thêm</button>
                            </div>
                            {links.map((l, i) => (
                                <div key={i} className="cvb-row cvb-link-row">
                                    <div className="cvb-field">
                                        <input value={l.label || ''} onChange={(e) => updateLink(i, 'label', e.target.value)} placeholder="LinkedIn / GitHub..." />
                                    </div>
                                    <div className="cvb-field">
                                        <input value={l.url || ''} onChange={(e) => updateLink(i, 'url', e.target.value)} placeholder="https://..." />
                                    </div>
                                    <button type="button" className="cvb-remove" onClick={() => removeLink(i)} aria-label="Xóa">✕</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'summary' && (
                        <div className="cvb-section">
                            <div className="cvb-field">
                                <label>Giới thiệu / Mục tiêu nghề nghiệp</label>
                                <textarea
                                    rows={6}
                                    value={data.summary}
                                    onChange={(e) => setData((prev) => ({ ...prev, summary: e.target.value }))}
                                    placeholder="Vài câu mô tả về kinh nghiệm, điểm mạnh và mục tiêu của bạn..."
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'experience' && (
                        <div className="cvb-section">
                            <div className="cvb-subhead">
                                <span>Kinh nghiệm làm việc</span>
                                <button type="button" className="cvb-mini" onClick={() => addListItem('experience', { position: '', company: '', from: '', to: '', description: '' })}>+ Thêm</button>
                            </div>
                            {experience.map((it, i) => (
                                <div key={i} className="cvb-card">
                                    <div className="cvb-card-head">
                                        <span>#{i + 1}</span>
                                        <button type="button" className="cvb-remove" onClick={() => removeListItem('experience', i)} aria-label="Xóa">✕</button>
                                    </div>
                                    <div className="cvb-row">
                                        <div className="cvb-field">
                                            <label>Vị trí</label>
                                            <input value={it.position || ''} onChange={(e) => updateListItem('experience', i, 'position', e.target.value)} />
                                        </div>
                                        <div className="cvb-field">
                                            <label>Công ty</label>
                                            <input value={it.company || ''} onChange={(e) => updateListItem('experience', i, 'company', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="cvb-row">
                                        <div className="cvb-field">
                                            <label>Từ</label>
                                            <input type="month" value={it.from || ''} onChange={(e) => updateListItem('experience', i, 'from', e.target.value)} />
                                        </div>
                                        <div className="cvb-field">
                                            <label>Đến</label>
                                            <input type="month" value={it.to || ''} onChange={(e) => updateListItem('experience', i, 'to', e.target.value)} placeholder="Để trống nếu hiện tại" />
                                        </div>
                                    </div>
                                    <div className="cvb-field">
                                        <label>Mô tả công việc</label>
                                        <textarea rows={3} value={it.description || ''} onChange={(e) => updateListItem('experience', i, 'description', e.target.value)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'education' && (
                        <div className="cvb-section">
                            <div className="cvb-subhead">
                                <span>Học vấn</span>
                                <button type="button" className="cvb-mini" onClick={() => addListItem('education', { degree: '', school: '', from: '', to: '', description: '' })}>+ Thêm</button>
                            </div>
                            {education.map((it, i) => (
                                <div key={i} className="cvb-card">
                                    <div className="cvb-card-head">
                                        <span>#{i + 1}</span>
                                        <button type="button" className="cvb-remove" onClick={() => removeListItem('education', i)} aria-label="Xóa">✕</button>
                                    </div>
                                    <div className="cvb-row">
                                        <div className="cvb-field">
                                            <label>Bằng cấp / Ngành</label>
                                            <input value={it.degree || ''} onChange={(e) => updateListItem('education', i, 'degree', e.target.value)} />
                                        </div>
                                        <div className="cvb-field">
                                            <label>Trường</label>
                                            <input value={it.school || ''} onChange={(e) => updateListItem('education', i, 'school', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="cvb-row">
                                        <div className="cvb-field">
                                            <label>Từ</label>
                                            <input type="month" value={it.from || ''} onChange={(e) => updateListItem('education', i, 'from', e.target.value)} />
                                        </div>
                                        <div className="cvb-field">
                                            <label>Đến</label>
                                            <input type="month" value={it.to || ''} onChange={(e) => updateListItem('education', i, 'to', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="cvb-field">
                                        <label>Ghi chú</label>
                                        <textarea rows={2} value={it.description || ''} onChange={(e) => updateListItem('education', i, 'description', e.target.value)} placeholder="GPA, hoạt động, thành tích..." />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'skills' && (
                        <div className="cvb-section">
                            <div className="cvb-subhead">
                                <span>Kỹ năng</span>
                                <button type="button" className="cvb-mini" onClick={() => addListItem('skills', { name: '', level: '' })}>+ Thêm</button>
                            </div>
                            {skills.map((it, i) => (
                                <div key={i} className="cvb-row cvb-link-row">
                                    <div className="cvb-field">
                                        <input value={it.name || ''} onChange={(e) => updateListItem('skills', i, 'name', e.target.value)} placeholder="React, Node.js..." />
                                    </div>
                                    <div className="cvb-field">
                                        <select value={it.level || ''} onChange={(e) => updateListItem('skills', i, 'level', e.target.value)}>
                                            <option value="">— Mức độ —</option>
                                            <option value="Cơ bản">Cơ bản</option>
                                            <option value="Trung bình">Trung bình</option>
                                            <option value="Khá">Khá</option>
                                            <option value="Thành thạo">Thành thạo</option>
                                        </select>
                                    </div>
                                    <button type="button" className="cvb-remove" onClick={() => removeListItem('skills', i)} aria-label="Xóa">✕</button>
                                </div>
                            ))}
                        </div>
                    )}
                </aside>

                <main className="cvb-preview">
                    <div className="cvb-preview-wrap">
                        <CVPreview data={data} ref={previewRef} />
                    </div>
                </main>
            </div>
        </div>
    )
}
