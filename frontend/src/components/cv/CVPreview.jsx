import { useRef } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas-pro'
import './CVPreview.css'

export default function CVPreview({ data }) {
  const previewRef = useRef(null)

  const handleExport = async () => {
    if (!previewRef.current) return
    const canvas = await html2canvas(previewRef.current, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`cv-${data.personal?.name || 'profile'}.pdf`)
  }

  const { personal = {}, education = [], experience = [], skills = [], projects = [], languages = [], certificates = [] } = data || {}

  return (
    <div className="cv-preview">
      <div className="cv-preview-actions">
        <button type="button" className="btn btn-primary" onClick={handleExport}>
          Xuất PDF
        </button>
      </div>

      <div className="cv-preview-paper" ref={previewRef}>
        <header className="cv-preview-header">
          {personal.avatar && (
            <img src={personal.avatar} alt="" className="cv-preview-avatar" />
          )}
          <div>
            <h1 className="cv-preview-name">{personal.name || 'Họ và tên'}</h1>
            <div className="cv-preview-contact">
              {personal.email && <span>{personal.email}</span>}
              {personal.phone && <span>{personal.phone}</span>}
              {personal.address && <span>{personal.address}</span>}
            </div>
          </div>
        </header>

        {experience.length > 0 && (
          <section>
            <h2>Kinh nghiệm</h2>
            {experience.map((exp, i) => (
              <div key={i} className="cv-preview-item">
                <strong>{exp.position}</strong> — {exp.company}
                <div className="cv-preview-date">
                  {exp.startDate} - {exp.current ? 'Hiện tại' : exp.endDate}
                </div>
                {exp.description && <p>{exp.description}</p>}
              </div>
            ))}
          </section>
        )}

        {education.length > 0 && (
          <section>
            <h2>Học vấn</h2>
            {education.map((edu, i) => (
              <div key={i} className="cv-preview-item">
                <strong>{edu.school}</strong>
                {edu.major && <> — {edu.major}</>}
                <div className="cv-preview-date">{edu.startDate} - {edu.endDate}</div>
              </div>
            ))}
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <h2>Kỹ năng</h2>
            <div className="cv-preview-skills">
              {skills.filter((s) => s.name).map((s, i) => (
                <span key={i} className="cv-preview-skill">{s.name}</span>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && projects.some((p) => p.name) && (
          <section>
            <h2>Dự án</h2>
            {projects.filter((p) => p.name).map((p, i) => (
              <div key={i} className="cv-preview-item">
                <strong>{p.name}</strong>
                {p.techStack && <div className="cv-preview-date">{p.techStack}</div>}
                {p.description && <p>{p.description}</p>}
              </div>
            ))}
          </section>
        )}

        {languages.length > 0 && languages.some((l) => l.language) && (
          <section>
            <h2>Ngoại ngữ</h2>
            {languages.filter((l) => l.language).map((l, i) => (
              <div key={i} className="cv-preview-item">
                <strong>{l.language}</strong> — {l.level}
              </div>
            ))}
          </section>
        )}

        {certificates.length > 0 && certificates.some((c) => c.name) && (
          <section>
            <h2>Chứng chỉ</h2>
            {certificates.filter((c) => c.name).map((c, i) => (
              <div key={i} className="cv-preview-item">
                <strong>{c.name}</strong>
                {c.issuer && <> — {c.issuer}</>}
                {c.issueDate && <div className="cv-preview-date">{c.issueDate}</div>}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
