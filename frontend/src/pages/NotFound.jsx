import { Link, useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="notfound">
      <div className="notfound-code">404</div>
      <h1>Không tìm thấy trang</h1>
      <p>Đường dẫn bạn truy cập có thể đã bị thay đổi hoặc không còn tồn tại.</p>

      <div className="notfound-actions">
        <button onClick={() => navigate(-1)} className="btn btn-outline">
          Quay lại
        </button>
        <Link to="/" className="btn btn-primary">
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}
