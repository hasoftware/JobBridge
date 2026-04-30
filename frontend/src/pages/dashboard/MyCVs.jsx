import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const MOCK_CVS = [
  { id: 1, name: 'CV Frontend Developer', updated_at: '2026-04-10', file_url: '/cv/cv-1.pdf' },
  { id: 2, name: 'CV Backend Engineer', updated_at: '2026-04-08', file_url: '/cv/cv-2.pdf' },
]

export default function MyCVs() {
  const [cvs, setCvs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setCvs(MOCK_CVS)
    setLoading(false)
  }, [])

  const handleDelete = (id) => {
    if (!confirm('Xoá CV này?')) return
    setCvs((prev) => prev.filter((cv) => cv.id !== id))
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <h1>CV của tôi</h1>
        <Link to="/cv-builder" className="btn btn-primary">+ Tạo CV mới</Link>
      </div>

      {loading ? (
        <div>Đang tải...</div>
      ) : cvs.length === 0 ? (
        <div className="dashboard-empty">
          <p>Bạn chưa có CV nào</p>
          <Link to="/cv-builder" className="btn btn-primary">Tạo CV đầu tiên</Link>
        </div>
      ) : (
        <div className="cv-list">
          {cvs.map((cv) => (
            <div key={cv.id} className="cv-list-item">
              <div className="cv-list-info">
                <div className="cv-list-name">{cv.name}</div>
                <div className="cv-list-date">Cập nhật {cv.updated_at}</div>
              </div>
              <div className="cv-list-actions">
                <a href={cv.file_url} target="_blank" rel="noreferrer">Xem</a>
                <Link to={`/cv-builder?id=${cv.id}`}>Sửa</Link>
                <button onClick={() => handleDelete(cv.id)}>Xoá</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
