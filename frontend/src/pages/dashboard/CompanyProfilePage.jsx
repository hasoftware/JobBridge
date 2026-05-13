import { useState, useEffect } from 'react'
import { companies as companiesApi, fileUrl } from '../../services/api'
import { useToast } from '../../hooks/useToast'
import { GICS_SECTORS } from '../../services/constants'
import './CompanyProfilePage.css'

const SIZES = ['1-10', '11-50', '51-200', '201-500', '500+']

const EMPTY = {
  name: '',
  website: '',
  location: '',
  industry: '',
  company_size: '',
  description: '',
}

export default function CompanyProfilePage() {
  const { addToast } = useToast()
  const [form, setForm] = useState(EMPTY)
  const [logoUrl, setLogoUrl] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    companiesApi.getMine()
      .then((p) => {
        if (p) {
          setForm({
            name: p.name || '',
            website: p.website || '',
            location: p.location || '',
            industry: p.industry || '',
            company_size: p.company_size || '',
            description: p.description || '',
          })
          setLogoUrl(p.logo_url || '')
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  function handleLogoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim()) { addToast('Tên công ty là bắt buộc', 'error'); return }
    setSaving(true)
    try {
      if (logoFile) {
        const res = await companiesApi.uploadLogo(logoFile)
        setLogoUrl(res.logo_url)
        setLogoFile(null)
      }
      await companiesApi.updateMine(form)
      addToast('Đã cập nhật hồ sơ công ty', 'success')
    } catch (err) {
      addToast(err.message || 'Lưu thất bại', 'error')
    } finally {
      setSaving(false)
    }
  }

  const displayLogo = logoPreview || fileUrl(logoUrl)

  if (loading) return <div className="cp-loading">Đang tải...</div>

  return (
    <div className="cp-page">
      <div className="cp-header">
        <h1>Hồ sơ công ty</h1>
        <p>Quản lý thông tin công ty</p>
      </div>

      <form className="cp-card" onSubmit={handleSave}>
        <div className="cp-logo-upload">
          <div className="cp-logo-preview">
            {displayLogo
              ? <img src={displayLogo} alt="logo" onError={(e) => { e.target.style.display = 'none' }} />
              : <span className="cp-logo-placeholder">{form.name?.[0]?.toUpperCase() || 'C'}</span>
            }
          </div>
          <label className="cp-logo-btn btn btn-outline btn-sm">
            Tải lên logo
            <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" style={{ display: 'none' }} onChange={handleLogoChange} />
          </label>
          <span className="cp-logo-hint">PNG, JPG, WEBP — tối đa 2MB</span>
        </div>

        <div className="cp-group">
          <label>Tên công ty *</label>
          <input className="cp-input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="VD: Tech Corp" required />
        </div>

        <div className="cp-row">
          <div className="cp-group">
            <label>Website</label>
            <input className="cp-input" value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://example.com" />
          </div>
          <div className="cp-group">
            <label>Địa điểm</label>
            <input className="cp-input" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="VD: Hồ Chí Minh" />
          </div>
        </div>

        <div className="cp-row">
          <div className="cp-group">
            <label>Ngành nghề</label>
            <select className="cp-select" value={form.industry} onChange={(e) => set('industry', e.target.value)}>
              <option value="">Chọn ngành</option>
              {GICS_SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="cp-group">
            <label>Quy mô</label>
            <select className="cp-select" value={form.company_size} onChange={(e) => set('company_size', e.target.value)}>
              <option value="">Chọn quy mô</option>
              {SIZES.map((s) => <option key={s} value={s}>{s} nhân viên</option>)}
            </select>
          </div>
        </div>

        <div className="cp-group">
          <label>Mô tả</label>
          <textarea className="cp-textarea" rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Giới thiệu về công ty..." />
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </form>
    </div>
  )
}
