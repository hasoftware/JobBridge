const levels = [
  { value: 20, label: 'Mới bắt đầu' },
  { value: 40, label: 'Cơ bản' },
  { value: 60, label: 'Trung bình' },
  { value: 80, label: 'Thành thạo' },
  { value: 100, label: 'Chuyên gia' },
]

const SUGGESTIONS = ['React', 'Python', 'Java', 'JavaScript', 'SQL', 'Git', 'Docker', 'Photoshop', 'Excel', 'Communication']

const emptyItem = { name: '', level: 60 }

export default function CVFormSkills({ data, onChange }) {
  const items = data.length > 0 ? data : [{ ...emptyItem }]

  const update = (index, field, value) => {
    const updated = items.map((item, i) => i === index ? { ...item, [field]: value } : item)
    onChange(updated)
  }

  const add = (skillName = '') => onChange([...items, { name: skillName, level: 60 }])

  const remove = (index) => {
    if (items.length <= 1) return
    onChange(items.filter((_, i) => i !== index))
  }

  const existingSkills = items.map(i => i.name.toLowerCase())
  const availableSuggestions = SUGGESTIONS.filter(s => !existingSkills.includes(s.toLowerCase()))

  return (
    <div className="cv-form-step">
      <h3 className="cv-form-step-title">Kỹ năng</h3>
      <p className="cv-form-step-desc">Liệt kê các kỹ năng và mức độ thành thạo</p>

      <div className="cv-skills-list">
        {items.map((item, index) => (
          <div key={index} className="cv-skill-item">
            <div className="cv-skill-input">
              <input
                type="text"
                placeholder="Ví dụ: React, Python..."
                value={item.name}
                onChange={(e) => update(index, 'name', e.target.value)}
              />
              {items.length > 1 && (
                <button type="button" onClick={() => remove(index)}>Xoá</button>
              )}
            </div>
            <div className="cv-skill-level">
              <input
                type="range"
                min="20"
                max="100"
                step="20"
                value={item.level}
                onChange={(e) => update(index, 'level', Number(e.target.value))}
              />
              <span>{levels.find((l) => l.value === item.level)?.label}</span>
            </div>
            <div className="cv-skill-bar">
              <div className="cv-skill-bar-fill" style={{ width: `${item.level}%` }} />
            </div>
          </div>
        ))}
      </div>

      {availableSuggestions.length > 0 && (
        <div className="cv-skill-suggestions">
          <span className="cv-skill-suggestions-label">Gợi ý:</span>
          {availableSuggestions.slice(0, 6).map((s) => (
            <button key={s} type="button" className="cv-skill-suggestion" onClick={() => add(s)}>
              + {s}
            </button>
          ))}
        </div>
      )}

      <button type="button" className="cv-form-add-btn" onClick={() => add()}>
        + Thêm kỹ năng
      </button>
    </div>
  )
}
