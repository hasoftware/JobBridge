import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="navbar-logo">JobBridge</Link>
            <p>Nền tảng kết nối việc làm hàng đầu Việt Nam, giúp ứng viên tìm được công việc mơ ước và doanh nghiệp tìm được nhân tài phù hợp.</p>
            <div className="footer-contact">
              <p>(024) 88888888</p>
              <p>hotro@jobbridge.vn</p>
            </div>
          </div>

          <div>
            <div className="footer-col-title">Về JobBridge</div>
            <div className="footer-links">
              <a href="#">Giới thiệu</a>
              <a href="#">Góc báo chí</a>
              <a href="#">Tuyển dụng</a>
              <a href="#">Liên hệ</a>
              <a href="#">Hỏi đáp</a>
            </div>
          </div>

          <div>
            <div className="footer-col-title">Dành cho ứng viên</div>
            <div className="footer-links">
              <Link to="/jobs">Việc làm mới nhất</Link>
              <a href="#">Việc làm tốt nhất</a>
              <a href="#">Việc làm lương cao</a>
              <a href="#">Việc làm IT</a>
            </div>
          </div>

          <div>
            <div className="footer-col-title">Hồ sơ & Công cụ</div>
            <div className="footer-links">
              <a href="#">Quản lý CV</a>
              <a href="#">Hướng dẫn viết CV</a>
              <a href="#">Tính lương Gross - Net</a>
              <a href="#">Trắc nghiệm MBTI</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>&copy; 2024 JobBridge Vietnam. All rights reserved.</div>
          <div className="footer-bottom-links">
            <Link to="/privacy">Chính sách bảo mật</Link>
            <Link to="/terms">Điều khoản sử dụng</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
