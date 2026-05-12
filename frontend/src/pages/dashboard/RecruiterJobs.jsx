import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SlideOver from '../../components/common/SlideOver'
import Icon from '../../components/common/Icon'
import { jobs as jobsApi } from '../../services/api'
import { useToast } from '../../hooks/useToast'
import './RecruiterJobs.css'

function JobDetail({ job, onClose, onEdit, onViewApplicants }) {
  if (!job) return null

  const salary = job.salary_min
    ? `${job.currency || 'USD'} ${Number(job.salary_min).toLocaleString()}${job.salary_max ? ` – ${Number(job.salary_max).toLocaleString()}` : ''}`
    : 'Thỏa thuận'

  return (
    <SlideOver open={!!job} onClose={onClose} title={job.title} width={520}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {job.job_type && <span className="rj-tag">{job.job_type}</span>}
          {job.location && <span className="rj-tag">{job.location}</span>}
          <span className="rj-tag">{salary}</span>
        </div>

        {job.application_deadline && (
          <p style={{ fontSize: 13, color: 'var(--jb-text-tertiary)', margin: 0 }}>
            Hạn ứng tuyển: {new Date(job.application_deadline).toLocaleDateString('vi-VN')}
          </p>
        )}

        {job.description && (
          <div>
            <h4 className="rj-detail-label">Mô tả</h4>
            <p className="rj-detail-text">{job.description}</p>
          </div>
        )}

        {job.responsibilities && (
          <div>
            <h4 className="rj-detail-label">Trách nhiệm</h4>
            <p className="rj-detail-text">{job.responsibilities}</p>
          </div>
        )}

        {job.required_qualifications && (
          <div>
            <h4 className="rj-detail-label">Yêu cầu</h4>
            <p className="rj-detail-text">{job.required_qualifications}</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={onViewApplicants} style={{ flex: 1 }}>
            <Icon name="users" size="sm" />Xem ứng viên
          </button>
          <button className="btn btn-outline btn-sm" onClick={onEdit}>
            <Icon name="edit" size="sm" />Chỉnh sửa
          </button>
        </div>
      </div>
    </SlideOver>
  )
}

export default function RecruiterJobs() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    jobsApi.getMine()
      .then(setList)
      .catch(() => addToast('Không thể tải danh sách tin tuyển dụng', 'error'))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(e, id) {
    e.stopPropagation()
    if (!window.confirm('Bạn có chắc muốn xóa tin tuyển dụng này?')) return
    try {
      await jobsApi.delete(id)
      setList((prev) => prev.filter((j) => j.id !== id))
      if (selected?.id === id) setSelected(null)
      addToast('Đã xóa tin tuyển dụng', 'success')
    } catch (err) {
      addToast(err.message || 'Xóa thất bại', 'error')
    }
  }

  function handleEdit(e, job) {
    e.stopPropagation()
    navigate(`/dashboard/jobs/${job.id}/edit`, { state: { job } })
  }

  function handleViewApplicants(job) {
    navigate(`/dashboard/jobs/${job.id}/applicants`, { state: { jobTitle: job.title } })
  }

  if (loading) {
    return <div className="rj-loading">Đang tải...</div>
  }

  return (
    <div className="rj-page">
      <div className="rj-header">
        <div>
          <h1>Tin tuyển dụng</h1>
          <p>Quản lý các tin đã đăng</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard/jobs/create')}>
          <Icon name="plus" size="sm" />Đăng tin mới
        </button>
      </div>

      {list.length === 0 ? (
        <div className="rj-empty">
          <Icon name="megaphone" size="lg" />
          <h3>Chưa có tin tuyển dụng</h3>
          <p>Tạo tin mới để bắt đầu tuyển dụng</p>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard/jobs/create')}>
            Đăng tin đầu tiên
          </button>
        </div>
      ) : (
        <div className="rj-table-wrap">
          <table className="rj-table">
            <thead>
              <tr>
                <th>Vị trí</th>
                <th>Loại</th>
                <th>Địa điểm</th>
                <th>Lương</th>
                <th>Ngày đăng</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {list.map((job) => (
                <tr key={job.id} onClick={() => setSelected(job)}>
                  <td className="rj-title">{job.title}</td>
                  <td>{job.job_type || '—'}</td>
                  <td>{job.location || '—'}</td>
                  <td>{job.salary_min ? `${job.currency || 'USD'} ${Number(job.salary_min).toLocaleString()}` : '—'}</td>
                  <td>{job.created_at ? new Date(job.created_at).toLocaleDateString('vi-VN') : '—'}</td>
                  <td>
                    <div className="rj-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="btn btn-outline btn-sm" title="Xem ứng viên" onClick={() => handleViewApplicants(job)}>
                        <Icon name="users" size="sm" />
                      </button>
                      <button className="btn btn-outline btn-sm" title="Chỉnh sửa" onClick={(e) => handleEdit(e, job)}>
                        <Icon name="edit" size="sm" />
                      </button>
                      <button className="btn btn-outline btn-sm rj-btn-danger" title="Xóa" onClick={(e) => handleDelete(e, job.id)}>
                        <Icon name="trash" size="sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <JobDetail
        job={selected}
        onClose={() => setSelected(null)}
        onEdit={() => { setSelected(null); navigate(`/dashboard/jobs/${selected.id}/edit`, { state: { job: selected } }) }}
        onViewApplicants={() => { setSelected(null); handleViewApplicants(selected) }}
      />
    </div>
  )
}
