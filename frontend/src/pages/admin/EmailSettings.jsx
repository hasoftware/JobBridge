import { useState, useEffect } from 'react'
import { admin } from '../../services/api'
import './EmailSettings.css'

const ENCRYPTION_OPTIONS = [
  { value: 'tls', label: 'TLS / STARTTLS' },
  { value: 'ssl', label: 'SSL' },
  { value: 'none', label: 'Không mã hoá' },
]

export default function EmailSettings() {
  const [config, setConfig] = useState({
    smtp_host: '',
    encryption: 'tls',
    smtp_port: 587,
    smtp_user: '',
    from_email: '',
    smtp_pass: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    admin.getEmailSettings()
      .then((data) => setConfig(data))
      .catch((err) => setMessage({ type: 'error', text: err.message }))
      .finally(() => setLoading(false))
  }, [])

  const update = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }))
    if (message) setMessage(null)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      await admin.saveEmailSettings(config)
      setMessage({ type: 'success', text: 'Đã lưu cấu hình' })
      setConfig((prev) => ({ ...prev, smtp_pass: '********' }))
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setMessage(null)
    try {
      const res = await admin.testEmailSettings()
      setMessage({ type: 'success', text: res.message || 'Kết nối SMTP thành công' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setTesting(false)
    }
  }

  if (loading) return <div>Đang tải cấu hình...</div>

  return (
    <div className="email-settings">
      <div className="settings-header">
        <h1>Cấu hình Email</h1>
        <p>Thiết lập SMTP để gửi email xác thực, OTP và thông báo cho người dùng.</p>
      </div>

      <form onSubmit={handleSave} className="settings-form">
        <div className="settings-row">
          <div className="settings-field">
            <label>SMTP Host</label>
            <input
              type="text"
              placeholder="smtp.gmail.com"
              value={config.smtp_host}
              onChange={(e) => update('smtp_host', e.target.value)}
              required
            />
          </div>
          <div className="settings-field" style={{ maxWidth: 200 }}>
            <label>Cổng</label>
            <input
              type="number"
              placeholder="587"
              value={config.smtp_port}
              onChange={(e) => update('smtp_port', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="settings-field">
          <label>Mã hoá</label>
          <select
            value={config.encryption}
            onChange={(e) => update('encryption', e.target.value)}
          >
            {ENCRYPTION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="settings-row">
          <div className="settings-field">
            <label>Email SMTP (đăng nhập)</label>
            <input
              type="email"
              placeholder="your-email@gmail.com"
              value={config.smtp_user}
              onChange={(e) => update('smtp_user', e.target.value)}
              required
            />
          </div>
          <div className="settings-field">
            <label>Email gửi đi (From)</label>
            <input
              type="email"
              placeholder="noreply@jobbridge.local"
              value={config.from_email}
              onChange={(e) => update('from_email', e.target.value)}
            />
          </div>
        </div>

        <div className="settings-field">
          <label>Mật khẩu SMTP</label>
          <input
            type="password"
            placeholder="App password 16 ký tự (Gmail)"
            value={config.smtp_pass}
            onChange={(e) => update('smtp_pass', e.target.value)}
          />
          <span className="settings-hint">Để trống nếu không muốn đổi mật khẩu hiện tại</span>
        </div>

        {message && (
          <div className={`settings-message ${message.type}`}>{message.text}</div>
        )}

        <div className="settings-actions">
          <button type="button" className="btn btn-outline" onClick={handleTest} disabled={testing || saving}>
            {testing ? 'Đang test...' : 'Test kết nối'}
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving || testing}>
            {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
          </button>
        </div>
      </form>
    </div>
  )
}
