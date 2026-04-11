const emptyItem = { name: '', issuer: '', issueDate: '', expireDate: '', credentialId: '', link: '' }

export default function CVFormCertificates({ data, onChange }) {
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
      <h3 className="cv-form-step-title">Chứng chỉ</h3>
      <p className="cv-form-step-desc">Các chứng chỉ chuyên môn đã đạt được</p>

      {items.map((item, index) => (
        <div key={index} className="cv-form-entry">
          <div className="cv-form-entry-header">
            <span>#{index + 1}</span>
            {items.length > 1 && (
              <button type="button" onClick={() => remove(index)}>Xoá</button>
            )}
          </div>

          <div className="cv-form-row">
            <div className="cv-form-group">
              <label>Tên chứng chỉ</label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => update(index, 'name', e.target.value)}
              />
            </div>
            <div className="cv-form-group">
              <label>Tổ chức cấp</label>
              <input
                type="text"
                value={item.issuer}
                onChange={(e) => update(index, 'issuer', e.target.value)}
              />
            </div>
          </div>

          <div className="cv-form-row">
            <div className="cv-form-group">
              <label>Ngày cấp</label>
              <input
                type="month"
                value={item.issueDate}
                onChange={(e) => update(index, 'issueDate', e.target.value)}
              />
            </div>
            <div className="cv-form-group">
              <label>Ngày hết hạn</label>
              <input
                type="month"
                value={item.expireDate}
                onChange={(e) => update(index, 'expireDate', e.target.value)}
              />
            </div>
          </div>

          <div className="cv-form-group">
            <label>Link chứng chỉ</label>
            <input
              type="url"
              value={item.link}
              onChange={(e) => update(index, 'link', e.target.value)}
            />
          </div>
        </div>
      ))}

      <button type="button" className="cv-form-add-btn" onClick={add}>+ Thêm chứng chỉ</button>
    </div>
  )
}
