import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import './Navbar.css'

const IconBriefcase = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="7" width="19" height="13" rx="2" />
        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        <path d="M2.5 12h19" />
    </svg>
)

const IconDocument = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6" />
        <path d="M9 17h6" />
    </svg>
)

const IconBell = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8" />
        <path d="M10 21a2 2 0 0 0 4 0" />
    </svg>
)

const IconUser = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
    </svg>
)

const SEEKER_SECTIONS = [
    {
        icon: IconBriefcase,
        title: 'Quản lý tìm việc',
        items: [
            { to: '/dashboard/saved-jobs', label: 'Việc làm đã lưu' },
            { to: '/dashboard/applied-jobs', label: 'Việc làm đã ứng tuyển' },
            { to: '/dashboard/job-suggestions', label: 'Việc làm phù hợp với bạn' },
            { to: '/dashboard/job-suggestions/settings', label: 'Cài đặt gợi ý việc làm' },
        ],
    },
    {
        icon: IconDocument,
        title: 'Quản lý CV & Cover letter',
        items: [
            { to: '/dashboard/cvs', label: 'CV của tôi' },
            { to: '/dashboard/cover-letters', label: 'Cover Letter của tôi' },
            { to: '/dashboard/recruiter-connections', label: 'Nhà tuyển dụng muốn kết nối với bạn' },
            { to: '/dashboard/profile-views', label: 'Nhà tuyển dụng xem hồ sơ' },
        ],
    },
    {
        icon: IconBell,
        title: 'Cài đặt email & thông báo',
        items: [
            { to: '/dashboard/notifications#jobs', label: 'Cài đặt thông báo việc làm' },
            { to: '/dashboard/notifications#email', label: 'Cài đặt nhận email' },
        ],
    },
    {
        icon: IconUser,
        title: 'Cá nhân & Bảo mật',
        items: [
            { to: '/dashboard/profile', label: 'Cài đặt thông tin cá nhân' },
            { to: '/dashboard/security', label: 'Cài đặt bảo mật' },
            { to: '/dashboard/security#password', label: 'Đổi mật khẩu' },
            { to: '/dashboard/security#2fa', label: 'Xác thực 2 yếu tố', hint: 'Chưa kích hoạt' },
        ],
    },
]

export default function Navbar() {
    const navigate = useNavigate()
    const { isAuthenticated, isAdmin, isRecruiter, user, logout } = useAuth()
    const toast = useToast()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [expanded, setExpanded] = useState(() => new Set())
    const menuRef = useRef(null)

    useEffect(() => {
        if (!menuOpen) {
            setExpanded(new Set())
            return
        }
        function onClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false)
            }
        }
        function onKey(e) {
            if (e.key === 'Escape') setMenuOpen(false)
        }
        document.addEventListener('mousedown', onClickOutside)
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('mousedown', onClickOutside)
            document.removeEventListener('keydown', onKey)
        }
    }, [menuOpen])

    const toggleSection = (title) => {
        setExpanded((prev) => {
            const next = new Set(prev)
            if (next.has(title)) next.delete(title)
            else next.add(title)
            return next
        })
    }

    const displayName = user?.full_name?.trim() || user?.email || ''
    const initial = (displayName || '?').charAt(0).toUpperCase()
    const verifiedLabel = user?.is_verified ? 'Tài khoản đã xác thực' : 'Tài khoản chưa xác thực'
    const closeMenu = () => setMenuOpen(false)

    const handleLogout = async () => {
        closeMenu()
        await logout()
        toast?.addToast('Đã đăng xuất', 'info')
        navigate('/')
    }

    const renderSeekerPanel = () => (
        <div className="user-panel">
            <div className="user-panel-header">
                <div className="user-panel-avatar">{initial}</div>
                <div className="user-panel-info">
                    <div className="user-panel-name">{displayName}</div>
                    <div className={`user-panel-status ${user?.is_verified ? 'verified' : 'unverified'}`}>
                        {verifiedLabel}
                    </div>
                    {user?.public_id && (
                        <div className="user-panel-id">ID {user.public_id}</div>
                    )}
                    {user?.email && user?.full_name && (
                        <div className="user-panel-email">{user.email}</div>
                    )}
                </div>
            </div>

            <div className="user-panel-body">
                {SEEKER_SECTIONS.map((section) => {
                    const Icon = section.icon
                    const isOpen = expanded.has(section.title)
                    return (
                        <div key={section.title} className={`user-section ${isOpen ? 'open' : ''}`}>
                            <button
                                type="button"
                                className="user-section-header"
                                onClick={() => toggleSection(section.title)}
                                aria-expanded={isOpen}
                            >
                                <span className="user-section-icon"><Icon /></span>
                                <span className="user-section-title">{section.title}</span>
                                <span className="user-section-chevron" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </span>
                            </button>
                            {isOpen && (
                                <ul className="user-section-items">
                                    {section.items.map((it) => (
                                        <li key={it.to}>
                                            <Link to={it.to} onClick={closeMenu} className="user-section-link">
                                                <span>{it.label}</span>
                                                {it.hint && <span className="user-section-hint">({it.hint})</span>}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )
                })}
            </div>

            <div className="user-panel-footer">
                <button type="button" className="user-panel-logout" onClick={handleLogout}>
                    Đăng xuất
                </button>
            </div>
        </div>
    )

    const renderSimplePanel = (primaryLink) => (
        <div className="navbar-user-menu" role="menu">
            <Link to={primaryLink.to} className="navbar-user-item" onClick={closeMenu} role="menuitem">
                {primaryLink.label}
            </Link>
            <button
                type="button"
                className="navbar-user-item navbar-user-item-danger"
                onClick={handleLogout}
                role="menuitem"
            >
                Đăng xuất
            </button>
        </div>
    )

    return (
        <nav className="navbar">
            <div className="container">
                <Link to="/" className="navbar-logo">
                    JobBridge
                </Link>

                <div className={`navbar-menu ${mobileOpen ? 'open' : ''}`}>
                    <NavLink to="/jobs" onClick={() => setMobileOpen(false)}>Việc làm</NavLink>
                    <NavLink to="/companies" onClick={() => setMobileOpen(false)}>Công ty</NavLink>
                    <a href="/#tools" onClick={() => setMobileOpen(false)}>Công cụ</a>
                    <NavLink to="/cv-templates" onClick={() => setMobileOpen(false)}>Tạo CV</NavLink>
                </div>

                <div className="navbar-actions">
                    {!isAuthenticated ? (
                        <>
                            <Link to="/login" className="btn btn-outline btn-sm">Đăng nhập</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Đăng ký</Link>
                        </>
                    ) : (
                        <div className="navbar-user" ref={menuRef}>
                            <button
                                type="button"
                                className="navbar-user-trigger"
                                onClick={() => setMenuOpen((s) => !s)}
                                aria-haspopup="menu"
                                aria-expanded={menuOpen}
                            >
                                <span className="navbar-user-avatar">{initial}</span>
                                <span className="navbar-user-email">{displayName}</span>
                                <span className="navbar-user-chevron" aria-hidden="true">▾</span>
                            </button>
                            {menuOpen && (
                                isAdmin
                                    ? renderSimplePanel({ to: '/admin', label: 'Trang quản trị' })
                                    : isRecruiter
                                        ? renderSimplePanel({ to: '/dashboard', label: 'Trang quản lý' })
                                        : renderSeekerPanel()
                            )}
                        </div>
                    )}
                </div>

                <button className="navbar-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
                    {mobileOpen ? '✕' : '☰'}
                </button>
            </div>
        </nav>
    )
}
