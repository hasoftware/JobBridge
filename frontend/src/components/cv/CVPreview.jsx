import { forwardRef } from 'react'
import './CVPreview.css'

function formatDate(value) {
    if (!value) return ''
    if (/^\d{4}-\d{2}$/.test(value)) {
        const [y, m] = value.split('-')
        return `${m}/${y}`
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
        const [y, m, d] = value.slice(0, 10).split('-')
        return `${d}/${m}/${y}`
    }
    return value
}

function periodText(from, to) {
    const f = formatDate(from)
    const t = to ? formatDate(to) : 'Hiện tại'
    if (!f) return t
    return `${f} → ${t}`
}

const CVPreview = forwardRef(function CVPreview({ data }, ref) {
    const personal = data?.personal || {}
    const summary = data?.summary || ''
    const experience = Array.isArray(data?.experience) ? data.experience : []
    const education = Array.isArray(data?.education) ? data.education : []
    const skills = Array.isArray(data?.skills) ? data.skills : []
    const links = Array.isArray(personal.links) ? personal.links.filter((l) => l.url) : []

    return (
        <div className="cv-preview" ref={ref}>
            <header className="cv-header">
                <h1 className="cv-name">{personal.full_name || 'Họ và tên của bạn'}</h1>
                {personal.headline && <div className="cv-headline">{personal.headline}</div>}
                <div className="cv-contact">
                    {personal.email && <span>{personal.email}</span>}
                    {personal.phone && <span>{personal.phone}</span>}
                    {personal.address && <span>{personal.address}</span>}
                    {personal.date_of_birth && <span>Ngày sinh: {formatDate(personal.date_of_birth)}</span>}
                </div>
                {links.length > 0 && (
                    <div className="cv-links">
                        {links.map((l, i) => (
                            <span key={i} className="cv-link">
                                {l.label || l.url}: <span>{l.url}</span>
                            </span>
                        ))}
                    </div>
                )}
            </header>

            {summary && (
                <section className="cv-section">
                    <h2 className="cv-section-title">Giới thiệu</h2>
                    <p className="cv-summary">{summary}</p>
                </section>
            )}

            {experience.length > 0 && (
                <section className="cv-section">
                    <h2 className="cv-section-title">Kinh nghiệm làm việc</h2>
                    {experience.map((it, i) => (
                        <div key={i} className="cv-item">
                            <div className="cv-item-head">
                                <div>
                                    <div className="cv-item-title">{it.position || 'Vị trí'}</div>
                                    <div className="cv-item-sub">{it.company || ''}</div>
                                </div>
                                <div className="cv-item-period">{periodText(it.from, it.to)}</div>
                            </div>
                            {it.description && <div className="cv-item-desc">{it.description}</div>}
                        </div>
                    ))}
                </section>
            )}

            {education.length > 0 && (
                <section className="cv-section">
                    <h2 className="cv-section-title">Học vấn</h2>
                    {education.map((it, i) => (
                        <div key={i} className="cv-item">
                            <div className="cv-item-head">
                                <div>
                                    <div className="cv-item-title">{it.degree || 'Bằng cấp / Ngành'}</div>
                                    <div className="cv-item-sub">{it.school || ''}</div>
                                </div>
                                <div className="cv-item-period">{periodText(it.from, it.to)}</div>
                            </div>
                            {it.description && <div className="cv-item-desc">{it.description}</div>}
                        </div>
                    ))}
                </section>
            )}

            {skills.length > 0 && (
                <section className="cv-section">
                    <h2 className="cv-section-title">Kỹ năng</h2>
                    <ul className="cv-skill-list">
                        {skills.filter((s) => s.name).map((s, i) => (
                            <li key={i} className="cv-skill">
                                <span className="cv-skill-name">{s.name}</span>
                                {s.level && <span className="cv-skill-level">{s.level}</span>}
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    )
})

export default CVPreview
