import { useState, useEffect } from 'react'

const MOCK_STATS = {
  totalUsers: 1248,
  totalJobs: 387,
  totalApplications: 2156,
  pendingVerifications: 12,
  newUsersToday: 24,
  newJobsToday: 8,
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setStats(MOCK_STATS)
      setLoading(false)
    }, 300)
  }, [])

  if (loading) return <div>Đang tải...</div>

  return (
    <div className="admin-dashboard">
      <h1>Tổng quan</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Người dùng</div>
          <div className="stat-value">{stats.totalUsers.toLocaleString()}</div>
          <div className="stat-trend">+{stats.newUsersToday} hôm nay</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Tin tuyển dụng</div>
          <div className="stat-value">{stats.totalJobs.toLocaleString()}</div>
          <div className="stat-trend">+{stats.newJobsToday} hôm nay</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Đơn ứng tuyển</div>
          <div className="stat-value">{stats.totalApplications.toLocaleString()}</div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-label">Chờ xác thực</div>
          <div className="stat-value">{stats.pendingVerifications}</div>
          <div className="stat-trend">Doanh nghiệp chờ duyệt</div>
        </div>
      </div>

      <div className="admin-section">
        <h2>Hoạt động gần đây</h2>
        <p className="text-muted">Chưa có dữ liệu (cần wire backend).</p>
      </div>

      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }
        .stat-card {
          background: var(--jb-surface-1);
          border: 1px solid var(--jb-border);
          border-radius: 12px;
          padding: 20px;
        }
        .stat-card.stat-warning {
          border-left: 4px solid #f59e0b;
        }
        .stat-label {
          font-size: 13px;
          color: var(--jb-text-tertiary);
          margin-bottom: 8px;
        }
        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: var(--jb-text-primary);
          margin-bottom: 6px;
        }
        .stat-trend {
          font-size: 12px;
          color: var(--jb-text-secondary);
        }
        .admin-section {
          margin-top: 32px;
        }
        .admin-section h2 {
          font-size: 18px;
          margin-bottom: 12px;
        }
        .text-muted {
          color: var(--jb-text-tertiary);
        }
      `}</style>
    </div>
  )
}
