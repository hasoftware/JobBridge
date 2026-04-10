const emptyItem = { company: '', position: '', startDate: '', endDate: '', current: false, description: '' }

export default function CVFormExperience({ data, onChange }) {
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
      <h3 className="cv-form-step-title">Kinh nghiệm làm việc</h3>
      <p className="cv-form-step-desc">Liệt kê kinh nghiệm, bắt đầu từ công việc gần nhất</p>

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
              <label>Công ty</label>
              <input
                type="text"
                value={item.company}
                onChange={(e) => update(index, 'company', e.target.value)}
              />
            </div>
            <div className="cv-form-group">
              <label>Vị trí</label>
              <input
                type="text"
                value={item.position}
                onChange={(e) => update(index, 'position', e.target.value)}
              />
            </div>
          </div>

          <div className="cv-form-row">
            <div className="cv-form-group">
              <label>Từ tháng</label>
              <input
                type="month"
                value={item.startDate}
                onChange={(e) => update(index, 'startDate', e.target.value)}
              />
            </div>
            <div className="cv-form-group">
              <label>Đến tháng</label>
              <input
                type="month"
                value={item.endDate}
                disabled={item.current}
                onChange={(e) => update(index, 'endDate', e.target.value)}
              />
              <label className="cv-form-checkbox">
                <input
                  type="checkbox"
                  checked={item.current}
                  onChange={(e) => update(index, 'current', e.target.checked)}
                />
                Đang làm việc tại đây
              </label>
            </div>
          </div>

          <div className="cv-form-group">
            <label>Mô tả công việc</label>
            <textarea
              rows={4}
              value={item.description}
              onChange={(e) => update(index, 'description', e.target.value)}
              placeholder="Trách nhiệm, thành tích nổi bật..."
            />
          </div>
        </div>
      ))}

      <button type="button" className="cv-form-add-btn" onClick={add}>
        + Thêm kinh nghiệm
      </button>
    </div>
  )
}
