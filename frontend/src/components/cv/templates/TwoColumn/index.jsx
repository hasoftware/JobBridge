import { formatDate, periodText } from '../utils'
import './styles.css'

export default function TwoColumn({ data }) {
    const personal = data?.personal || {}
    const summary = data?.summary || ''
    const experience = Array.isArray(data?.experience) ? data.experience : []
    const education = Array.isArray(data?.education) ? data.education : []
    const skills = Array.isArray(data?.skills) ? data.skills : []
    const links = Array.isArray(personal.links) ? personal.links.filter((l) => l.url) : []

    return (
        <div className="tpl-two-column">
            <aside className="cv-side">
                <h1 className="cv-name">{personal.full_name || 'Họ và tên'}</h1>
                {personal.headline && <div className="cv-headline">{personal.headline}</div>}

                <div className="cv-side-section">
                    <h2 className="cv-side-title">Liên hệ</h2>
                    <ul className="cv-side-list">
                        {personal.email && <li>✉ {personal.email}</li>}
                        {personal.phone && <li>☎ {personal.phone}</li>}
                        {personal.address && <li>📍 {personal.address}</li>}
                        {personal.date_of_birth && <li>🎂 {formatDate(personal.date_of_birth)}</li>}
                    </ul>
                </div>

                {links.length > 0 && (
                    <div className="cv-side-section">
                        <h2 className="cv-side-title">Liên kết</h2>
                        <ul className="cv-side-list">
                            {links.map((l, i) => (
                                <li key={i}>{l.label || 'Link'}: {l.url}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {skills.length > 0 && (
                    <div className="cv-side-section">
                        <h2 className="cv-side-title">Kỹ năng</h2>
                        {skills.filter((s) => s.name).map((s, i) => (
                            <div key={i} className="cv-side-skill">
                                <span className="cv-side-skill-name">{s.name}</span>
                                {s.level && <span className="cv-side-skill-level">{s.level}</span>}
                            </div>
                        ))}
                    </div>
                )}
            </aside>

            <main className="cv-main">
                {summary && (
                    <section className="cv-main-section">
                        <h2 className="cv-main-title">Giới thiệu</h2>
                        <p className="cv-summary">{summary}</p>
                    </section>
                )}

                {experience.length > 0 && (
                    <section className="cv-main-section">
                        <h2 className="cv-main-title">Kinh nghiệm</h2>
                        {experience.map((it, i) => (
                            <div key={i} className="cv-item">
                                <div className="cv-item-head">
                                    <div className="cv-item-title">{it.position || 'Vị trí'}</div>
                                    <div className="cv-item-sub">{it.company || ''}</div>
                                    <div className="cv-item-period">{periodText(it.from, it.to)}</div>
                                </div>
                                {it.description && <div className="cv-item-desc">{it.description}</div>}
                            </div>
                        ))}
                    </section>
                )}

                {education.length > 0 && (
                    <section className="cv-main-section">
                        <h2 className="cv-main-title">Học vấn</h2>
                        {education.map((it, i) => (
                            <div key={i} className="cv-item">
                                <div className="cv-item-head">
                                    <div className="cv-item-title">{it.degree || 'Bằng cấp'}</div>
                                    <div className="cv-item-sub">{it.school || ''}</div>
                                    <div className="cv-item-period">{periodText(it.from, it.to)}</div>
                                </div>
                                {it.description && <div className="cv-item-desc">{it.description}</div>}
                            </div>
                        ))}
                    </section>
                )}
            </main>
        </div>
    )
}
