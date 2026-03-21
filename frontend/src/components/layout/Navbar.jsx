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
          <NavLink to="/viec-lam" onClick={() => setMobileOpen(false)}>Việc làm</NavLink>
          <a href="/#cong-ty" onClick={() => setMobileOpen(false)}>Công ty</a>
          <a href="/#cong-cu" onClick={() => setMobileOpen(false)}>Công cụ</a>
          <NavLink to="/tao-cv" onClick={() => setMobileOpen(false)}>Tạo CV</NavLink>
        </div>

        <div className="navbar-actions">
          <Link to="/dang-nhap" className="btn btn-outline btn-sm">Đăng nhập</Link>
          <Link to="/dang-ky" className="btn btn-primary btn-sm">Đăng ký</Link>
        </div>

        <button className="navbar-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  )
}
