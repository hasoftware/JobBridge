import ModernClean from './ModernClean'
import ModernCleanMeta from './ModernClean/meta'
import TwoColumn from './TwoColumn'
import TwoColumnMeta from './TwoColumn/meta'
import ClassicSerif from './ClassicSerif'
import ClassicSerifMeta from './ClassicSerif/meta'
import CreativeColor from './CreativeColor'
import CreativeColorMeta from './CreativeColor/meta'

export const TEMPLATES = {
    [ModernCleanMeta.id]: { Component: ModernClean, meta: ModernCleanMeta },
    [TwoColumnMeta.id]: { Component: TwoColumn, meta: TwoColumnMeta },
    [ClassicSerifMeta.id]: { Component: ClassicSerif, meta: ClassicSerifMeta },
    [CreativeColorMeta.id]: { Component: CreativeColor, meta: CreativeColorMeta },
}

export const TEMPLATE_LIST = [
    ModernCleanMeta,
    TwoColumnMeta,
    ClassicSerifMeta,
    CreativeColorMeta,
]

export const TEMPLATE_TAGS = [
    { id: 'all', label: 'Tất cả' },
    { id: 'simple', label: 'Đơn giản' },
    { id: 'professional', label: 'Chuyên nghiệp' },
    { id: 'modern', label: 'Hiện đại' },
    { id: 'creative', label: 'Sáng tạo' },
    { id: 'ats', label: 'ATS' },
    { id: 'harvard', label: 'Harvard' },
]

export function getTemplate(id) {
    return TEMPLATES[id] || TEMPLATES.modern_clean
}

export function getDefaultColor(templateId) {
    return getTemplate(templateId).meta.defaultColor
}

export function isValidColor(templateId, color) {
    const tpl = getTemplate(templateId)
    return tpl.meta.palette.some((p) => p.hex.toLowerCase() === (color || '').toLowerCase())
}
