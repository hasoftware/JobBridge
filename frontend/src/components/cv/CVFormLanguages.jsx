const levels = ['Cơ bản', 'Trung cấp', 'Khá', 'Thành thạo', 'Bản ngữ']

const emptyItem = { language: '', level: 'Trung cấp' }

export default function CVFormLanguages({ data, onChange }) {
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
      <h3 className="cv-form-step-title">Ngoại ngữ</h3>
      <p className="cv-form-step-desc">Các ngôn ngữ và mức độ thành thạo</p>

      {items.map((item, index) => (
        <div key={index} className="cv-form-row">
          <div className="cv-form-group">
            <label>Ngôn ngữ</label>
            <input
              type="text"
              value={item.language}
              onChange={(e) => update(index, 'language', e.target.value)}
              placeholder="Tiếng Anh, Tiếng Nhật..."
            />
          </div>
          <div className="cv-form-group">
            <label>Mức độ</label>
            <select
              value={item.level}
              onChange={(e) => update(index, 'level', e.target.value)}
            >
              {levels.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          {items.length > 1 && (
            <button type="button" onClick={() => remove(index)}>Xoá</button>
          )}
        </div>
      ))}

      <button type="button" className="cv-form-add-btn" onClick={add}>+ Thêm ngôn ngữ</button>
    </div>
  )
}
