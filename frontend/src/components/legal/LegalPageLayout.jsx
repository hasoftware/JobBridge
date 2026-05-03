import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './LegalPageLayout.css'

export default function LegalPageLayout({ title, lastUpdated, sections, otherPage }) {
    const [activeId, setActiveId] = useState(sections[0]?.id || '')
    const [tocOpen, setTocOpen] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveId(entry.target.id)
                })
            },
            { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
        )
        sections.forEach((s) => {
            const el = document.getElementById(s.id)
            if (el) observer.observe(el)
        })
        return () => observer.disconnect()
    }, [sections])

    const handleAnchorClick = (id) => (e) => {
        e.preventDefault()
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setTocOpen(false)
    }

    return (
        <div className="legal-page">
            <div className="container legal-container">
                <header className="legal-header">
                    <h1>{title}</h1>
                    <p className="legal-updated">Cập nhật lần cuối: {lastUpdated}</p>
                </header>

                <button
                    type="button"
                    className="legal-toc-toggle"
                    onClick={() => setTocOpen((v) => !v)}
                >
                    {tocOpen ? 'Ẩn mục lục ▲' : 'Hiện mục lục ▼'}
                </button>

                <div className="legal-body">
                    <aside className={`legal-toc ${tocOpen ? 'open' : ''}`}>
                        <div className="legal-toc-title">Mục lục</div>
                        <nav>
                            <ol>
                                {sections.map((s) => (
                                    <li key={s.id}>
                                        <a
                                            href={`#${s.id}`}
                                            className={activeId === s.id ? 'active' : ''}
                                            onClick={handleAnchorClick(s.id)}
                                        >
                                            {s.title}
                                        </a>
                                    </li>
                                ))}
                            </ol>
                        </nav>
                    </aside>

                    <main className="legal-content">
                        {sections.map((s, i) => (
                            <section key={s.id} id={s.id} className="legal-section">
                                <h2>{i + 1}. {s.title}</h2>
                                {s.content}
                            </section>
                        ))}
                    </main>
                </div>

                {otherPage && (
                    <div className="legal-footer-cross">
                        <span>Xem thêm:</span>
                        <Link to={otherPage.to}>{otherPage.label}</Link>
                        <span>·</span>
                        <a href="mailto:hotro@jobbridge.vn">hotro@jobbridge.vn</a>
                    </div>
                )}
            </div>
        </div>
    )
}
