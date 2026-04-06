import { useState } from 'react'
import './CVBuilder.css'

const STEPS = [
  { id: 'personal', label: 'Thông tin cá nhân' },
  { id: 'education', label: 'Học vấn' },
  { id: 'experience', label: 'Kinh nghiệm' },
  { id: 'skills', label: 'Kỹ năng' },
  { id: 'projects', label: 'Dự án' },
  { id: 'languages', label: 'Ngoại ngữ' },
  { id: 'certificates', label: 'Chứng chỉ' },
]

const DEFAULT_DATA = {
  personal: { name: '', email: '', phone: '', avatar: '' },
  education: [],
  experience: [],
  skills: [],
  projects: [],
  languages: [],
  certificates: [],
}

export default function CVBuilder() {
  const [data, setData] = useState(DEFAULT_DATA)
  const [activeStep, setActiveStep] = useState('personal')

  const updateSection = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="cv-builder">
      <div className="cv-builder-sidebar">
        <h2 className="cv-builder-sidebar-title">Tạo CV</h2>
        <ul className="cv-builder-steps">
          {STEPS.map((s) => (
            <li
              key={s.id}
              className={activeStep === s.id ? 'active' : ''}
              onClick={() => setActiveStep(s.id)}
            >
              {s.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="cv-builder-form">
        <div className="cv-builder-form-placeholder">
          Form: {STEPS.find((s) => s.id === activeStep)?.label}
        </div>
      </div>

      <div className="cv-builder-preview">
        <div className="cv-builder-preview-placeholder">
          Preview CV
        </div>
      </div>
    </div>
  )
}
