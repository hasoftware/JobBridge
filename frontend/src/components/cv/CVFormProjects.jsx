const emptyItem = { name: '', description: '', techStack: '', link: '', startDate: '', endDate: '' }

export default function CVFormProjects({ data, onChange }) {
  const items = data.length > 0 ? data : [{ ...emptyItem }]

  const update = (index, field, value) => {
    const updated = items.map((item, i) => i === index ? { ...item, [field]: value } : item)
    onChange(updated)
  }

  const add = () => onChange([...items, { ...emptyItem }])

  const remove = (index) => {
    if (items.length <= 1) return
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div className="cv-form-step">
      <h3 className="cv-form-step-title">Dự án</h3>
      <p className="cv-form-step-desc">Các dự án cá nhân hoặc dự án công ty đã tham gia</p>

      {items.map((item, index) => (
        <div key={index} className="cv-form-entry">
          <div className="cv-form-entry-header">
            <span>#{index + 1}</span>
            {items.length > 1 && (
              <button type="button" onClick={() => remove(index)}>Xoá</button>
            )}
          </div>

          <div className="cv-form-group">
            <label>Tên dự án</label>
            <input
              type="text"
              value={item.name}
              onChange={(e) => update(index, 'name', e.target.value)}
            />
          </div>

          <div className="cv-form-group">
            <label>Mô tả</label>
            <textarea
              rows={3}
              value={item.description}
              onChange={(e) => update(index, 'description', e.target.value)}
            />
          </div>

          <div className="cv-form-row">
            <div className="cv-form-group">
              <label>Công nghệ sử dụng</label>
              <input
                type="text"
                value={item.techStack}
                onChange={(e) => update(index, 'techStack', e.target.value)}
                placeholder="React, Node.js, PostgreSQL..."
              />
            </div>
            <div className="cv-form-group">
              <label>Link dự án</label>
              <input
                type="url"
                value={item.link}
                onChange={(e) => update(index, 'link', e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}

      <button type="button" className="cv-form-add-btn" onClick={add}>+ Thêm dự án</button>
    </div>
  )
}
