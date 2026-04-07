import { useRef } from 'react'

export default function CVFormPersonal({ data, onChange }) {
  const fileRef = useRef(null)
  const update = (field, value) => onChange({ ...data, [field]: value })

  const handleAvatar = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('Ảnh không được vượt quá 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => update('avatar', ev.target.result)
    reader.readAsDataURL(file)
  }

  const removeAvatar = () => {
    update('avatar', '')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="cv-form-step">
      <h3 className="cv-form-step-title">Thông tin cá nhân</h3>
      <p className="cv-form-step-desc">Thông tin cơ bản giúp nhà tuyển dụng liên hệ với bạn</p>

      <div className="cv-avatar-section">
        <div className="cv-avatar-preview" onClick={() => fileRef.current?.click()}>
          {data.avatar ? (
            <img src={data.avatar} alt="Avatar" />
          ) : (
            <div className="cv-avatar-placeholder">Tải ảnh lên</div>
          )}
        </div>
        <div className="cv-avatar-info">
          <p className="cv-avatar-title">Ảnh đại diện</p>
          <p className="cv-avatar-hint">JPG, PNG. Tối đa 2MB.</p>
          <div className="cv-avatar-actions">
            <button type="button" onClick={() => fileRef.current?.click()}>Chọn ảnh</button>
            {data.avatar && (
              <button type="button" onClick={removeAvatar}>Xoá</button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatar} />
        </div>
      </div>

      <div className="cv-form-row">
        <div className="cv-form-group">
          <label>Họ và tên</label>
          <input
            type="text"
            value={data.name || ''}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Nguyễn Văn A"
          />
        </div>
        <div className="cv-form-group">
          <label>Email</label>
          <input
            type="email"
            value={data.email || ''}
            onChange={(e) => update('email', e.target.value)}
            placeholder="email@example.com"
          />
        </div>
      </div>

      <div className="cv-form-row">
        <div className="cv-form-group">
          <label>Số điện thoại</label>
          <input
            type="tel"
            value={data.phone || ''}
            onChange={(e) => update('phone', e.target.value)}
          />
        </div>
        <div className="cv-form-group">
          <label>Địa chỉ</label>
          <input
            type="text"
            value={data.address || ''}
            onChange={(e) => update('address', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
