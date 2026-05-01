import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import CVTemplateCard from '../components/cv/CVTemplateCard'
import { TEMPLATE_LIST, TEMPLATE_TAGS } from '../components/cv/templates'
import './CVTemplates.css'

export default function CVTemplates() {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const [activeTag, setActiveTag] = useState('all')

    const filtered = useMemo(() => {
        if (activeTag === 'all') return TEMPLATE_LIST
        return TEMPLATE_LIST.filter((t) => t.tags.includes(activeTag))
    }, [activeTag])

    const handleSelect = (templateId, color) => {
        const params = new URLSearchParams({ template: templateId, color })
        const target = `/cv-builder?${params.toString()}`
        if (!isAuthenticated) {
            navigate(`/login?redirect=${encodeURIComponent(target)}`)
            return
        }
        navigate(target)
    }

    return (
        <div className="tpls-page">
            <div className="container">
                <header className="tpls-header">
                    <h1>Mẫu CV xin việc 2026</h1>
                    <p>Chọn một mẫu phù hợp để bắt đầu tạo CV của bạn — miễn phí, xuất PDF nhanh chóng.</p>
                </header>

                <div className="tpls-filters">
                    {TEMPLATE_TAGS.map((tag) => (
                        <button
                            key={tag.id}
                            type="button"
                            className={`tpls-chip ${activeTag === tag.id ? 'active' : ''}`}
                            onClick={() => setActiveTag(tag.id)}
                        >
                            {tag.label}
                        </button>
                    ))}
                </div>

                {filtered.length === 0 ? (
                    <div className="tpls-empty">Không có mẫu nào trong nhóm này.</div>
                ) : (
                    <div className="tpls-grid">
                        {filtered.map((meta) => (
                            <CVTemplateCard
                                key={meta.id}
                                meta={meta}
                                onSelect={handleSelect}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
