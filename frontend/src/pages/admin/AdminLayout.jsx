import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './AdminLayout.css'

const NAV_ITEMS = [
  { path: '', label: 'Tổng quan', exact: true },
  { path: 'users', label: 'Người dùng' },
  { path: 'jobs', label: 'Tin tuyển dụng' },
  { path: 'companies', label: 'Công ty' },
  { path: 'reports', label: 'Báo cáo' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/admin" replace />
  }

  if (user?.role !== 'admin') {
    return (
      <div className="admin-forbidden">
        <h1>Không có quyền truy cập</h1>
        <p>Chỉ tài khoản quản trị viên mới có thể vào trang này.</p>
        <Link to="/" className="btn btn-primary">Về trang chủ</Link>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className={`admin-layout ${sidebarOpen ? '' : 'sidebar-closed'}`}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/admin" className="admin-logo">JobBridge Admin</Link>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <div className="admin-user-name">{user?.email}</div>
            <button className="admin-logout" onClick={handleLogout}>Đăng xuất</button>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <button className="admin-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <Link to="/" className="admin-back">← Về site</Link>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
