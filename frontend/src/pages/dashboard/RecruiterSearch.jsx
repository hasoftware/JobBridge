import { useState } from 'react'
import SlideOver from '../../components/common/SlideOver'
import Icon from '../../components/common/Icon'
import { search as searchApi } from '../../services/api'
import { useToast } from '../../hooks/useToast'
import './RecruiterSearch.css'

const GENDER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
]

function formatAddress(address) {
  if (!address) return '—'
  const parts = [address.province_name, address.district_name, address.ward_name].filter(Boolean)
  return parts.join(', ') || '—'
}

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('vi-VN')
}

function CandidatePopup({ id, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  useState(() => {
    if (!id) return
    searchApi.candidateDetail(id)
      .then(setData)
      .catch(() => addToast('Không thể tải thông tin ứng viên', 'error'))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <SlideOver open={!!id} onClose={onClose} title="Hồ sơ ứng viên" width={540}>
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--jb-text-tertiary)' }}>Đang tải...</div>
      ) : !data ? null : (
        <div className="rs-popup">
          <section className="rs-popup-section">
            <h3 className="rs-popup-name">{data.full_name || '—'}</h3>
            <div className="rs-popup-rows">
              <div className="rs-popup-row"><span>Email</span><span>{data.email || '—'}</span></div>
              <div className="rs-popup-row"><span>Điện thoại</span><span>{data.phone || '—'}</span></div>
              <div className="rs-popup-row"><span>Ngày sinh</span><span>{formatDate(data.date_of_birth)}</span></div>
              <div className="rs-popup-row"><span>Giới tính</span><span>{GENDER_OPTIONS.find(g => g.value === data.gender)?.label || '—'}</span></div>
              <div className="rs-popup-row"><span>Địa chỉ</span><span>{formatAddress(data.address)}</span></div>
            </div>
            {data.bio && <p className="rs-popup-bio">{data.bio}</p>}
          </section>

          {data.cvs?.length > 0 && (
            <section className="rs-popup-section">
              <h4 className="rs-popup-section-title">CV</h4>
              {data.cvs.map((cv) => {
                const skills = Array.isArray(cv.skills) ? cv.skills.filter(s => s) : []
                return (
                  <div key={cv.id} className="rs-popup-cv">
                    <div className="rs-popup-cv-title">
                      <Icon name="file-text" size="sm" />{cv.title || 'CV'}
                      <span className="rs-popup-cv-date">{formatDate(cv.created_at)}</span>
                    </div>
                    {skills.length > 0 && (
                      <div className="rs-popup-skills">
                        {skills.map((s, i) => <span key={i} className="rs-skill-tag">{s}</span>)}
                      </div>
                    )}
                  </div>
                )
              })}
            </section>
          )}

          {data.applications?.length > 0 && (
            <section className="rs-popup-section">
              <h4 className="rs-popup-section-title">Lịch sử ứng tuyển</h4>
              <div className="rs-popup-apps">
                {data.applications.map((a) => (
                  <div key={a.id} className="rs-popup-app">
                    <div className="rs-popup-app-job">{a.job_title}</div>
                    <div className="rs-popup-app-meta">
                      {a.company_name && <span>{a.company_name}</span>}
                      <span>{formatDate(a.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </SlideOver>
  )
}

export default function RecruiterSearch() {
  const { addToast } = useToast()
  const [filters, setFilters] = useState({ q: '', gender: '', location: '', skill: '' })
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  const set = (k, v) => setFilters((p) => ({ ...p, [k]: v }))

  async function handleSearch(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const params = {}
      if (filters.q) params.q = filters.q
      if (filters.gender) params.gender = filters.gender
      if (filters.location) params.location = filters.location
      if (filters.skill) params.skill = filters.skill
      const rows = await searchApi.candidates(params)
      setResults(rows)
      setSearched(true)
    } catch (err) {
      addToast(err.message || 'Tìm kiếm thất bại', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rs-page">
      <div className="rs-header">
        <h1>Tìm ứng viên</h1>
        <p>Tìm kiếm ứng viên phù hợp</p>
      </div>

      <form className="rs-filters" onSubmit={handleSearch}>
        <div className="rs-filters-row">
          <div className="rs-filter-group rs-filter-main">
            <Icon name="search" size="sm" />
            <input
              className="rs-filter-input"
              placeholder="Tên, email, giới thiệu..."
              value={filters.q}
              onChange={(e) => set('q', e.target.value)}
            />
          </div>
          <div className="rs-filter-group">
            <input
              className="rs-filter-input"
              placeholder="Địa điểm"
              value={filters.location}
              onChange={(e) => set('location', e.target.value)}
            />
          </div>
          <div className="rs-filter-group">
            <input
              className="rs-filter-input"
              placeholder="Kỹ năng (React, Python...)"
              value={filters.skill}
              onChange={(e) => set('skill', e.target.value)}
            />
          </div>
          <div className="rs-filter-group">
            <select className="rs-filter-select" value={filters.gender} onChange={(e) => set('gender', e.target.value)}>
              {GENDER_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </div>
      </form>

      {searched && (
        results.length === 0 ? (
          <div className="rs-empty">
            <Icon name="users" size="lg" />
            <h3>Không tìm thấy ứng viên</h3>
            <p>Thử thay đổi từ khóa hoặc bộ lọc</p>
          </div>
        ) : (
          <div className="rs-results-head">{results.length} ứng viên</div>
        )
      )}

      <div className="rs-grid">
        {results.map((c) => {
          const skills = Array.isArray(c.skills) ? c.skills.filter(Boolean) : []
          return (
            <div key={c.id} className="rs-card" onClick={() => setSelectedId(c.id)}>
              <div className="rs-card-name">{c.full_name || c.email || '—'}</div>
              {c.location && <div className="rs-card-location"><Icon name="briefcase" size="sm" />{c.location}</div>}
              {c.bio && <p className="rs-card-bio">{c.bio}</p>}
              {skills.length > 0 && (
                <div className="rs-card-skills">
                  {skills.slice(0, 5).map((s, i) => <span key={i} className="rs-skill-tag">{s}</span>)}
                  {skills.length > 5 && <span className="rs-skill-more">+{skills.length - 5}</span>}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <CandidatePopup id={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  )
}
