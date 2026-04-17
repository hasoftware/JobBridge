import { useState, useEffect } from 'react'

const SIZES = ['1-10', '11-50', '51-200', '201-500', '500+']

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    logo_url: '',
    description: '',
    industry: '',
    company_size: '11-50',
    founded_year: 2020,
    location: '',
    website: '',
    phone: '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setProfile({
      name: 'Tech Corp',
      logo_url: '',
      description: 'Công ty công nghệ chuyên fintech.',
      industry: 'Công nghệ thông tin',
      company_size: '201-500',
      founded_year: 2015,
      location: 'Hà Nội',
      website: 'https://techcorp.example.com',
      phone: '024 1234 5678',
    })
  }, [])

  const update = (field, value) => setProfile((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setTimeout(() => {
      setMessage('Đã lưu hồ sơ công ty')
      setSaving(false)
    }, 600)
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <h1>Hồ sơ công ty</h1>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="cv-form-group">
          <label>Tên công ty</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => update('name', e.target.value)}
          />
        </div>

        <div className="cv-form-row">
          <div className="cv-form-group">
            <label>Lĩnh vực</label>
            <input
              type="text"
              value={profile.industry}
              onChange={(e) => update('industry', e.target.value)}
            />
          </div>
          <div className="cv-form-group">
            <label>Quy mô</label>
            <select
              value={profile.company_size}
              onChange={(e) => update('company_size', e.target.value)}
            >
              {SIZES.map((s) => <option key={s} value={s}>{s} nhân viên</option>)}
            </select>
          </div>
        </div>

        <div className="cv-form-row">
          <div className="cv-form-group">
            <label>Năm thành lập</label>
            <input
              type="number"
              value={profile.founded_year}
              onChange={(e) => update('founded_year', Number(e.target.value))}
            />
          </div>
          <div className="cv-form-group">
            <label>Địa điểm</label>
            <input
              type="text"
              value={profile.location}
              onChange={(e) => update('location', e.target.value)}
            />
          </div>
        </div>

        <div className="cv-form-row">
          <div className="cv-form-group">
            <label>Website</label>
            <input
              type="url"
              value={profile.website}
              onChange={(e) => update('website', e.target.value)}
            />
          </div>
          <div className="cv-form-group">
            <label>Điện thoại</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
          </div>
        </div>

        <div className="cv-form-group">
          <label>Mô tả công ty</label>
          <textarea
            rows={4}
            value={profile.description}
            onChange={(e) => update('description', e.target.value)}
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
