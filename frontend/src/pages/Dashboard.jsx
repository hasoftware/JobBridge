import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import './Dashboard.css'

const CANDIDATE_NAV = [
  { path: 'profile', label: 'Hồ sơ' },
  { path: 'security', label: 'Bảo mật' },
  { path: 'cvs', label: 'CV của tôi' },
  { path: 'applied-jobs', label: 'Đã ứng tuyển' },
  { path: 'saved-jobs', label: 'Đã lưu' },
  { path: 'job-suggestions', label: 'Việc phù hợp' },
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
  const toast = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = isRecruiter ? RECRUITER_NAV : CANDIDATE_NAV
  const displayName = user?.full_name?.trim() || user?.email || ''

  const handleLogout = async () => {
    await logout()
    toast?.addToast('Đã đăng xuất', 'info')
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
            <div className="dashboard-user-name">{displayName}</div>
            {user?.email && user?.full_name && (
              <div className="dashboard-user-email">{user.email}</div>
            )}
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
