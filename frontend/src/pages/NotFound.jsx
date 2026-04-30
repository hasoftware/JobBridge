import { Link, useNavigate } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="notfound">
      <div className="notfound-content">
        <div className="notfound-code">404</div>
        <div className="notfound-divider" />
        <div className="notfound-message">
          <h1>Không tìm thấy trang</h1>
          <p>Đường dẫn bạn truy cập có thể đã bị thay đổi hoặc không còn tồn tại.</p>
          <div className="notfound-actions">
            <button onClick={() => navigate(-1)} className="notfound-btn ghost">
              ← Quay lại
            </button>
            <Link to="/" className="notfound-btn primary">
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
