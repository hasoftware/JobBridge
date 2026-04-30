import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Dashboard.css'

const CANDIDATE_NAV = [
  { path: 'cv', label: 'CV của tôi' },
  { path: 'applications', label: 'Đơn ứng tuyển' },
  { path: 'saved-jobs', label: 'Việc đã lưu' },
  { path: 'profile', label: 'Hồ sơ' },
]

const RECRUITER_NAV = [
  { path: 'jobs', label: 'Tin tuyển dụng' },
  { path: 'applicants', label: 'Ứng viên' },
  { path: 'companies', label: 'Hồ sơ công ty' },
  { path: 'search', label: 'Tìm ứng viên' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, isRecruiter, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = isRecruiter ? RECRUITER_NAV : CANDIDATE_NAV

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="dashboard">
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="dashboard-sidebar-header">
          <Link to="/" className="dashboard-logo">JobBridge</Link>
        </div>

        <nav className="dashboard-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `dashboard-nav-item ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="dashboard-sidebar-footer">
          <div className="dashboard-user">
            <div className="dashboard-user-name">{user?.email}</div>
            <button className="dashboard-logout" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  )
}
