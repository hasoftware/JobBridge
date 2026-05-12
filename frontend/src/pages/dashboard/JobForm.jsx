import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import Icon from '../../components/common/Icon'
import { jobs as jobsApi } from '../../services/api'
import { useToast } from '../../hooks/useToast'
import { JOB_TYPES, CURRENCIES, GICS_SECTORS } from '../../services/constants'
import './JobForm.css'

const EMPTY = {
  title: '',
  description: '',
  responsibilities: '',
  required_qualifications: '',
  salary_min: '',
  salary_max: '',
  currency: 'USD',
  location: '',
  job_type: 'Full-time',
  application_deadline: '',
}

export default function JobForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { state } = useLocation()
  const { addToast } = useToast()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit && state?.job) {
      const j = state.job
      setForm({
        title: j.title || '',
        description: j.description || '',
        responsibilities: j.responsibilities || '',
        required_qualifications: j.required_qualifications || '',
        salary_min: j.salary_min || '',
        salary_max: j.salary_max || '',
        currency: j.currency || 'USD',
        location: j.location || '',
        job_type: j.job_type || 'Full-time',
        application_deadline: j.application_deadline ? j.application_deadline.slice(0, 10) : '',
      })
    }
  }, [isEdit, state])

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) { addToast('Vui lòng nhập tiêu đề', 'error'); return }
    if (form.salary_min && form.salary_max && Number(form.salary_min) > Number(form.salary_max)) {
      addToast('Lương tối thiểu không được lớn hơn lương tối đa', 'error'); return
    }
    setSaving(true)
    try {
      if (isEdit) {
        await jobsApi.update(id, form)
        addToast('Đã cập nhật tin tuyển dụng', 'success')
      } else {
        await jobsApi.create(form)
        addToast('Đã đăng tin tuyển dụng', 'success')
      }
      navigate('/dashboard/jobs')
    } catch (err) {
      addToast(err.message || 'Lưu thất bại', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="jf-page">
      <div className="jf-header">
        <div>
          <h1>{isEdit ? 'Chỉnh sửa tin' : 'Đăng tin mới'}</h1>
          <p>{isEdit ? 'Cập nhật thông tin tin tuyển dụng' : 'Tạo tin để tìm ứng viên phù hợp'}</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/dashboard/jobs')}>
          <Icon name="arrow-left" size="sm" />Quay lại
        </button>
      </div>

      <form className="jf-card" onSubmit={handleSubmit}>
        <div className="jf-row">
          <div className="jf-group" style={{ flex: 2 }}>
            <label>Tiêu đề *</label>
            <input className="jf-input" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="VD: Frontend Developer" required />
          </div>
          <div className="jf-group">
            <label>Loại công việc</label>
            <select className="jf-select" value={form.job_type} onChange={(e) => set('job_type', e.target.value)}>
              {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="jf-group">
          <label>Mô tả công việc</label>
          <textarea className="jf-textarea" rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Mô tả chi tiết công việc..." />
        </div>

        <div className="jf-group">
          <label>Trách nhiệm</label>
          <textarea className="jf-textarea" rows={3} value={form.responsibilities} onChange={(e) => set('responsibilities', e.target.value)} placeholder="Các trách nhiệm cụ thể..." />
        </div>

        <div className="jf-group">
          <label>Yêu cầu ứng viên</label>
          <textarea className="jf-textarea" rows={3} value={form.required_qualifications} onChange={(e) => set('required_qualifications', e.target.value)} placeholder="Kỹ năng, kinh nghiệm, bằng cấp yêu cầu..." />
        </div>

        <div className="jf-row">
          <div className="jf-group">
            <label>Địa điểm</label>
            <input className="jf-input" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="VD: Hồ Chí Minh" />
          </div>
          <div className="jf-group">
            <label>Ngành nghề</label>
            <select className="jf-select" value={form.industry || ''} onChange={(e) => set('industry', e.target.value)}>
              <option value="">Chọn ngành</option>
              {GICS_SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="jf-row">
          <div className="jf-group">
            <label>Lương tối thiểu</label>
            <input className="jf-input" type="number" min={0} value={form.salary_min} onChange={(e) => set('salary_min', e.target.value)} />
          </div>
          <div className="jf-group">
            <label>Lương tối đa</label>
            <input className="jf-input" type="number" min={0} value={form.salary_max} onChange={(e) => set('salary_max', e.target.value)} />
          </div>
          <div className="jf-group">
            <label>Tiền tệ</label>
            <select className="jf-select" value={form.currency} onChange={(e) => set('currency', e.target.value)}>
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="jf-group">
          <label>Hạn ứng tuyển</label>
          <input className="jf-input" type="date" value={form.application_deadline} onChange={(e) => set('application_deadline', e.target.value)} />
        </div>

        <div className="jf-footer">
          <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard/jobs')}>Hủy</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Đăng tin'}
          </button>
        </div>
      </form>
    </div>
  )
}
