import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import './SlideOver.css'

export default function SlideOver({ open, onClose, title, children, width = 480 }) {
    useEffect(() => {
        if (!open) return

        const handleKey = (e) => {
            if (e.key === 'Escape') onClose?.()
        }

        document.addEventListener('keydown', handleKey)
        document.body.style.overflow = 'hidden'

        return () => {
            document.removeEventListener('keydown', handleKey)
            document.body.style.overflow = ''
        }
    }, [open, onClose])

    if (!open) return null

    return createPortal(
        <div className="slideover-backdrop" onClick={onClose}>
            <aside
                className="slideover-panel"
                style={{ width }}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="slideover-header">
                    <h2>{title}</h2>
                    <button className="slideover-close" onClick={onClose}>×</button>
                </header>
                <div className="slideover-body">
                    {children}
                </div>
            </aside>
        </div>,
        document.body,
    )
}
