import { forwardRef } from 'react'
import { getTemplate } from './templates'
import './CVPreview.css'

const CVPreview = forwardRef(function CVPreview({ data, template = 'modern_clean', color }, ref) {
    const tpl = getTemplate(template)
    const accent = color || tpl.meta.defaultColor
    const Component = tpl.Component

    return (
        <div className="cv-preview" ref={ref} style={{ '--cv-accent': accent }}>
            <Component data={data} />
        </div>
    )
})

export default CVPreview
