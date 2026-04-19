import { useState } from 'react'

export default function VerificationPage() {
  const [docs, setDocs] = useState([])
  const [status, setStatus] = useState('unverified')
  const [uploading, setUploading] = useState(false)

  const handleUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('File không được vượt quá 5MB')
      return
    }

    setUploading(true)
    setTimeout(() => {
      setDocs((prev) => [...prev, {
        id: Date.now(),
        name: file.name,
        size: file.size,
        uploaded_at: new Date().toLocaleDateString('vi-VN'),
      }])
      setStatus('pending')
      setUploading(false)
    }, 800)
  }

  const handleRemove = (id) => {
    setDocs((prev) => prev.filter((d) => d.id !== id))
  }

  return (
    <div className="dashboard-page">
      <h1>Xác thực doanh nghiệp</h1>

      <div className={`verify-status status-${status}`}>
        {status === 'unverified' && 'Chưa xác thực'}
        {status === 'pending' && 'Đang chờ duyệt'}
        {status === 'verified' && 'Đã xác thực'}
        {status === 'rejected' && 'Bị từ chối'}
      </div>

      <p className="verify-hint">
        Để xác thực doanh nghiệp, vui lòng upload các giấy tờ: ĐKKD, MST, hợp đồng dịch vụ.
        Kích thước tối đa 5MB/file. Định dạng PDF, JPG, PNG.
      </p>

      <div className="verify-upload">
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleUpload}
          disabled={uploading}
        />
        {uploading && <span>Đang tải lên...</span>}
      </div>

      {docs.length > 0 && (
        <div className="verify-docs">
          <h3>Tài liệu đã upload</h3>
          {docs.map((d) => (
            <div key={d.id} className="verify-doc">
              <div>
                <div className="verify-doc-name">{d.name}</div>
                <div className="verify-doc-meta">
                  {(d.size / 1024 / 1024).toFixed(2)} MB · {d.uploaded_at}
                </div>
              </div>
              <button onClick={() => handleRemove(d.id)}>Xoá</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
