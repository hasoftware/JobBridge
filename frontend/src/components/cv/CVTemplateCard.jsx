import { useState } from 'react'
import CVPreview from './CVPreview'
import { SAMPLE_DATA } from './templates/utils'
import './CVTemplateCard.css'

export default function CVTemplateCard({ meta, onSelect }) {
    const [color, setColor] = useState(meta.defaultColor)

    return (
        <div className="tpl-card">
            <div className="tpl-card-thumb" onClick={() => onSelect(meta.id, color)}>
                <div className="tpl-card-thumb-inner">
                    <CVPreview data={SAMPLE_DATA} template={meta.id} color={color} />
                </div>
                <div className="tpl-card-overlay">
                    <span className="tpl-card-cta">Dùng mẫu này</span>
                </div>
            </div>

            <div className="tpl-card-palette">
                {meta.palette.map((p) => (
                    <button
                        key={p.hex}
                        type="button"
                        className={`tpl-color-dot ${color.toLowerCase() === p.hex.toLowerCase() ? 'active' : ''}`}
                        style={{ background: p.hex }}
                        onClick={(e) => { e.stopPropagation(); setColor(p.hex) }}
                        aria-label={p.name}
                        title={p.name}
                    />
                ))}
            </div>

            <div className="tpl-card-info">
                <h3 className="tpl-card-name">{meta.name}</h3>
                <div className="tpl-card-tags">
                    {meta.tags.map((t) => (
                        <span key={t} className="tpl-card-tag">{tagLabel(t)}</span>
                    ))}
                </div>
            </div>
        </div>
    )
}

function tagLabel(id) {
    const map = {
        simple: 'Đơn giản',
        professional: 'Chuyên nghiệp',
        modern: 'Hiện đại',
        creative: 'Sáng tạo',
        ats: 'ATS',
        harvard: 'Harvard',
    }
    return map[id] || id
}
