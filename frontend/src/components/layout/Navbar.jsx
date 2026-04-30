import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

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
          <Link to="/login" className="btn btn-outline btn-sm">Đăng nhập</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Đăng ký</Link>
        </div>

        <button className="navbar-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  )
}
