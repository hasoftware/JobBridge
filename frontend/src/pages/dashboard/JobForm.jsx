import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship']
const CURRENCIES = ['USD', 'VND', 'EUR']

export default function JobForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [data, setData] = useState({
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
  })
  const [saving, setSaving] = useState(false)

  const update = (field, value) => setData((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      navigate('../tin-tuyen-dung')
    }, 600)
  }

  return (
    <div className="dashboard-page">
      <h1>{isEdit ? 'Sửa tin tuyển dụng' : 'Đăng tin mới'}</h1>

      <form onSubmit={handleSubmit} className="job-form">
        <div className="cv-form-group">
          <label>Tiêu đề tin</label>
          <input
            type="text"
            required
            value={data.title}
            onChange={(e) => update('title', e.target.value)}
          />
        </div>

        <div className="cv-form-group">
          <label>Mô tả công việc</label>
          <textarea
            rows={4}
            required
            value={data.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </div>

        <div className="cv-form-group">
          <label>Trách nhiệm</label>
          <textarea
            rows={3}
            value={data.responsibilities}
            onChange={(e) => update('responsibilities', e.target.value)}
          />
        </div>

        <div className="cv-form-group">
          <label>Yêu cầu</label>
          <textarea
            rows={3}
            value={data.required_qualifications}
            onChange={(e) => update('required_qualifications', e.target.value)}
          />
        </div>

        <div className="cv-form-row">
          <div className="cv-form-group">
            <label>Lương từ</label>
            <input
              type="number"
              value={data.salary_min}
              onChange={(e) => update('salary_min', e.target.value)}
            />
          </div>
          <div className="cv-form-group">
            <label>Lương đến</label>
            <input
              type="number"
              value={data.salary_max}
              onChange={(e) => update('salary_max', e.target.value)}
            />
          </div>
          <div className="cv-form-group">
            <label>Tiền tệ</label>
            <select
              value={data.currency}
              onChange={(e) => update('currency', e.target.value)}
            >
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="cv-form-row">
          <div className="cv-form-group">
            <label>Địa điểm</label>
            <input
              type="text"
              value={data.location}
              onChange={(e) => update('location', e.target.value)}
            />
          </div>
          <div className="cv-form-group">
            <label>Loại hình</label>
            <select
              value={data.job_type}
              onChange={(e) => update('job_type', e.target.value)}
            >
              {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="cv-form-group">
            <label>Hạn ứng tuyển</label>
            <input
              type="date"
              value={data.application_deadline}
              onChange={(e) => update('application_deadline', e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Đăng tin')}
        </button>
      </form>
    </div>
  )
}
