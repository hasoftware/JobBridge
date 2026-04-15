import { useState, useEffect } from 'react'

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState({
    full_name: '',
    avatar_url: '',
    phone: '',
    address: '',
    bio: '',
    title: '',
    experience_years: 0,
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setProfile({
      full_name: 'Nguyễn Văn A',
      avatar_url: '',
      phone: '0901234567',
      address: 'Hà Nội',
      bio: 'Frontend Developer với 2 năm kinh nghiệm React.',
      title: 'Frontend Developer',
      experience_years: 2,
    })
  }, [])

  const update = (field, value) => setProfile((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setTimeout(() => {
      setMessage('Đã lưu hồ sơ')
      setSaving(false)
    }, 600)
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <h1>Hồ sơ ứng viên</h1>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="cv-form-row">
          <div className="cv-form-group">
            <label>Họ và tên</label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => update('full_name', e.target.value)}
            />
          </div>
          <div className="cv-form-group">
            <label>Vị trí mong muốn</label>
            <input
              type="text"
              value={profile.title}
              onChange={(e) => update('title', e.target.value)}
            />
          </div>
        </div>

        <div className="cv-form-row">
          <div className="cv-form-group">
            <label>Số điện thoại</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
          </div>
          <div className="cv-form-group">
            <label>Địa chỉ</label>
            <input
              type="text"
              value={profile.address}
              onChange={(e) => update('address', e.target.value)}
            />
          </div>
        </div>

        <div className="cv-form-group">
          <label>Số năm kinh nghiệm</label>
          <input
            type="number"
            min="0"
            value={profile.experience_years}
            onChange={(e) => update('experience_years', Number(e.target.value))}
          />
        </div>

        <div className="cv-form-group">
          <label>Giới thiệu</label>
          <textarea
            rows={4}
            value={profile.bio}
            onChange={(e) => update('bio', e.target.value)}
          />
        </div>

        {message && <div className="profile-message">{message}</div>}

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}
        </button>
      </form>
    </div>
  )
}
