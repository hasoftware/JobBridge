const emptyItem = { school: '', major: '', degree: '', startDate: '', endDate: '', description: '' }

export default function CVFormEducation({ data, onChange }) {
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
      <h3 className="cv-form-step-title">Học vấn</h3>
      <p className="cv-form-step-desc">Thêm quá trình học tập, bắt đầu từ gần nhất</p>

      {items.map((item, index) => (
        <div key={index} className="cv-form-entry">
          <div className="cv-form-entry-header">
            <span className="cv-form-entry-number">#{index + 1}</span>
            {items.length > 1 && (
              <button type="button" onClick={() => remove(index)}>Xoá</button>
            )}
          </div>

          <div className="cv-form-row">
            <div className="cv-form-group">
              <label>Trường</label>
              <input
                type="text"
                value={item.school}
                onChange={(e) => update(index, 'school', e.target.value)}
              />
            </div>
            <div className="cv-form-group">
              <label>Bằng cấp</label>
              <input
                type="text"
                value={item.degree}
                onChange={(e) => update(index, 'degree', e.target.value)}
              />
            </div>
          </div>

          <div className="cv-form-row">
            <div className="cv-form-group">
              <label>Chuyên ngành</label>
              <input
                type="text"
                value={item.major}
                onChange={(e) => update(index, 'major', e.target.value)}
              />
            </div>
          </div>

          <div className="cv-form-row">
            <div className="cv-form-group">
              <label>Thời gian bắt đầu</label>
              <input
                type="month"
                value={item.startDate}
                onChange={(e) => update(index, 'startDate', e.target.value)}
              />
            </div>
            <div className="cv-form-group">
              <label>Thời gian kết thúc</label>
              <input
                type="month"
                value={item.endDate}
                onChange={(e) => update(index, 'endDate', e.target.value)}
              />
            </div>
          </div>

          <div className="cv-form-group">
            <label>Mô tả</label>
            <textarea
              rows={3}
              value={item.description}
              onChange={(e) => update(index, 'description', e.target.value)}
            />
          </div>
        </div>
      ))}

      <button type="button" className="cv-form-add-btn" onClick={add}>
        + Thêm học vấn
      </button>
    </div>
  )
}
