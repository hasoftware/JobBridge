import { formatDate, periodText } from '../utils'
import './styles.css'

export default function ClassicSerif({ data }) {
    const personal = data?.personal || {}
    const summary = data?.summary || ''
    const experience = Array.isArray(data?.experience) ? data.experience : []
    const education = Array.isArray(data?.education) ? data.education : []
    const skills = Array.isArray(data?.skills) ? data.skills : []
    const links = Array.isArray(personal.links) ? personal.links.filter((l) => l.url) : []

    return (
        <div className="tpl-classic-serif">
            <header className="cv-header">
                <h1 className="cv-name">{personal.full_name || 'Họ và tên'}</h1>
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
                            <span key={i}>{l.label || 'Link'}: {l.url}</span>
                        ))}
                    </div>
                )}
            </header>

            {summary && (
                <section className="cv-section">
                    <h2 className="cv-section-title">Tóm tắt</h2>
                    <p className="cv-summary">{summary}</p>
                </section>
            )}

            {experience.length > 0 && (
                <section className="cv-section">
                    <h2 className="cv-section-title">Kinh nghiệm</h2>
                    {experience.map((it, i) => (
                        <div key={i} className="cv-item">
                            <div className="cv-item-head">
                                <span className="cv-item-title">{it.position || 'Vị trí'}</span>
                                <span className="cv-item-period">{periodText(it.from, it.to)}</span>
                            </div>
                            {it.company && <div className="cv-item-sub">{it.company}</div>}
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
                                <span className="cv-item-title">{it.degree || 'Bằng cấp'}</span>
                                <span className="cv-item-period">{periodText(it.from, it.to)}</span>
                            </div>
                            {it.school && <div className="cv-item-sub">{it.school}</div>}
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
}
