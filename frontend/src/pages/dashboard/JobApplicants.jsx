import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import Icon from '../../components/common/Icon'
import { applications as applicationsApi } from '../../services/api'
import { useToast } from '../../hooks/useToast'
import { STATUS_OPTIONS } from '../../services/constants'
import './JobApplicants.css'

export default function JobApplicants() {
  const { id: jobId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const jobTitle = state?.jobTitle || 'Ứng viên'
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

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
                <tr key={a.id}>
                  <td className="ja-name">{a.candidate_name || `Ứng viên #${a.user_id}`}</td>
                  <td>{a.email || '—'}</td>
                  <td>{a.created_at ? new Date(a.created_at).toLocaleDateString('vi-VN') : '—'}</td>
                  <td>
                    {a.cv_url
                      ? <a href={a.cv_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm"><Icon name="file-text" size="sm" />Xem CV</a>
                      : '—'}
                  </td>
                  <td>
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
    </div>
  )
}
