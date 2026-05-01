import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import './Navbar.css'

export default function Navbar() {
  const navigate = useNavigate()
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const toast = useToast()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [menuOpen])

  const initial = (user?.email || '?').charAt(0).toUpperCase()

  const handleLogout = async () => {
    setMenuOpen(false)
    await logout()
    toast?.addToast('Đã đăng xuất', 'info')
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-logo">
          JobBridge
        </Link>

        <div className={`navbar-menu ${mobileOpen ? 'open' : ''}`}>
          <NavLink to="/jobs" onClick={() => setMobileOpen(false)}>Việc làm</NavLink>
          <a href="/#companies" onClick={() => setMobileOpen(false)}>Công ty</a>
          <a href="/#tools" onClick={() => setMobileOpen(false)}>Công cụ</a>
          <NavLink to="/cv-builder" onClick={() => setMobileOpen(false)}>Tạo CV</NavLink>
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
                <span className="navbar-user-email">{user?.email}</span>
                <span className="navbar-user-chevron" aria-hidden="true">▾</span>
              </button>
              {menuOpen && (
                <div className="navbar-user-menu" role="menu">
                  {isAdmin ? (
                    <Link
                      to="/admin"
                      className="navbar-user-item"
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                    >
                      Trang quản trị
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="navbar-user-item"
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                    >
                      Bảng điều khiển
                    </Link>
                  )}
                  <button
                    type="button"
                    className="navbar-user-item navbar-user-item-danger"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    Đăng xuất
                  </button>
                </div>
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
