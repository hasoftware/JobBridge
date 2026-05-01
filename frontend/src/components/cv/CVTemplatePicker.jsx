import { useEffect } from 'react'
import CVTemplateCard from './CVTemplateCard'
import { TEMPLATE_LIST } from './templates'
import './CVTemplatePicker.css'

export default function CVTemplatePicker({ open, currentTemplate, onSelect, onClose }) {
    useEffect(() => {
        if (!open) return
        const handler = (e) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [open, onClose])

    if (!open) return null

    return (
        <div className="picker-backdrop" onClick={onClose}>
            <div className="picker-modal" onClick={(e) => e.stopPropagation()}>
                <header className="picker-head">
                    <h2>Chọn mẫu CV</h2>
                    <button type="button" className="picker-close" onClick={onClose} aria-label="Đóng">✕</button>
                </header>
                <div className="picker-body">
                    <div className="picker-grid">
                        {TEMPLATE_LIST.map((meta) => (
                            <div key={meta.id} className={meta.id === currentTemplate ? 'picker-card current' : 'picker-card'}>
                                <CVTemplateCard meta={meta} onSelect={onSelect} />
                                {meta.id === currentTemplate && <div className="picker-current-badge">Đang dùng</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
