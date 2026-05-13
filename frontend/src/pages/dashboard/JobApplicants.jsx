import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import Icon from '../../components/common/Icon'
import SlideOver from '../../components/common/SlideOver'
import { applications as applicationsApi, search as searchApi } from '../../services/api'
import { useToast } from '../../hooks/useToast'
import { STATUS_OPTIONS, STATUS_LABELS } from '../../services/constants'
import './JobApplicants.css'

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('vi-VN')
}

function ApplicantDrawer({ applicant, onClose, onStatusChange }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    if (!applicant) return
    setDetail(null)
    setLoading(true)
    searchApi.candidateDetail(applicant.user_id)
      .then(setDetail)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [applicant?.user_id])

  const name = detail?.full_name || applicant?.candidate_name || applicant?.email || 'Ứng viên'
  const initials = name[0]?.toUpperCase() || 'U'

  return (
    <SlideOver open={!!applicant} onClose={onClose} title="Hồ sơ ứng viên" width={480}>
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--jb-text-tertiary)' }}>Đang tải...</div>
      ) : (
        <div className="ja-drawer">
          <div className="ja-drawer-hero">
            <div className="ja-drawer-avatar">{initials}</div>
            <div>
              <div className="ja-drawer-name">{name}</div>
              <div className="ja-drawer-meta">
                {applicant?.email && <span><Icon name="mail" size="sm" />{applicant.email}</span>}
                {detail?.phone && <span><Icon name="phone" size="sm" />{detail.phone}</span>}
                <span><Icon name="clock" size="sm" />Ứng tuyển {formatDate(applicant?.created_at)}</span>
              </div>
            </div>
          </div>

          <div className="ja-drawer-status-row">
            <span className="ja-drawer-label">Trạng thái</span>
            <select
              className="ja-status-select"
              value={applicant?.status || 'submitted'}
              onChange={(e) => onStatusChange(applicant.id, e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {detail?.bio && (
            <div className="ja-drawer-section">
              <div className="ja-drawer-section-title">Giới thiệu</div>
              <p className="ja-drawer-bio">{detail.bio}</p>
            </div>
          )}

          <div className="ja-drawer-section">
            <div className="ja-drawer-section-title">CV đã gửi</div>
            {applicant?.cv_url ? (
              <a href={applicant.cv_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                <Icon name="file-text" size="sm" />Xem CV
              </a>
            ) : (
              <span style={{ fontSize: 13, color: 'var(--jb-text-tertiary)' }}>Không có CV đính kèm</span>
            )}
          </div>
        </div>
      )}
    </SlideOver>
  )
}

export default function JobApplicants() {
  const { id: jobId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const jobTitle = state?.jobTitle || 'Ứng viên'
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedApplicant, setSelectedApplicant] = useState(null)

  if (!jobId) {
    return (
      <div className="ja-page">
        <div className="ja-empty">
          <Icon name="users" size="lg" />
          <h3>Chưa chọn tin tuyển dụng</h3>
          <p>Vui lòng chọn một tin tuyển dụng từ trang <button className="ja-link-btn" onClick={() => navigate('/dashboard/jobs')}>Tin tuyển dụng</button> để xem ứng viên.</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    applicationsApi.getForJob(jobId)
      .then(setList)
      .catch(() => addToast('Không thể tải danh sách ứng viên', 'error'))
      .finally(() => setLoading(false))
  }, [jobId])

  async function handleStatusChange(appId, status) {
    try {
      await applicationsApi.updateStatus(appId, status)
      setList((prev) => prev.map((a) => a.id === appId ? { ...a, status } : a))
      if (selectedApplicant?.id === appId) {
        setSelectedApplicant((prev) => ({ ...prev, status }))
      }
      addToast('Đã cập nhật trạng thái', 'success')
    } catch (err) {
      addToast(err.message || 'Cập nhật thất bại', 'error')
    }
  }

  if (loading) return <div className="ja-loading">Đang tải...</div>

  return (
    <div className="ja-page">
      <div className="ja-header">
        <div>
          <h1>{jobTitle}</h1>
          <p>{list.length} ứng viên</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/dashboard/jobs')}>
          <Icon name="arrow-left" size="sm" />Quay lại
        </button>
      </div>

      {list.length === 0 ? (
        <div className="ja-empty">
          <Icon name="users" size="lg" />
          <h3>Chưa có ứng viên</h3>
          <p>Chưa có ai ứng tuyển vào vị trí này</p>
        </div>
      ) : (
        <div className="ja-table-wrap">
          <table className="ja-table">
            <thead>
              <tr>
                <th>Ứng viên</th>
                <th>Email</th>
                <th>Ngày ứng tuyển</th>
                <th>CV</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {list.map((a) => (
                <tr key={a.id} className="ja-row" onClick={() => setSelectedApplicant(a)}>
                  <td className="ja-name">{a.candidate_name || `Ứng viên #${a.user_id}`}</td>
                  <td>{a.email || '—'}</td>
                  <td>{formatDate(a.created_at)}</td>
                  <td>
                    {a.cv_url ? (
                      <a
                        href={a.cv_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline btn-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Icon name="file-text" size="sm" />Xem CV
                      </a>
                    ) : '—'}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select
                      className="ja-status-select"
                      value={a.status || 'submitted'}
                      onChange={(e) => handleStatusChange(a.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ApplicantDrawer
        applicant={selectedApplicant}
        onClose={() => setSelectedApplicant(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
