import { useState, useEffect } from 'react'
import { companies as companiesApi } from '../../services/api'
import { useToast } from '../../hooks/useToast'
import './VerificationPage.css'

const DOC_ICONS = { pdf: '📄', doc: '📝', docx: '📝', png: '🖼', jpg: '🖼', jpeg: '🖼' }

function docIcon(type) {
  return DOC_ICONS[type?.toLowerCase()] || '📎'
}

export default function VerificationPage() {
  const { addToast } = useToast()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [downloading, setDownloading] = useState(null)

  const loadDocs = () => {
    setLoading(true)
    companiesApi.getVerificationDocs()
      .then(setDocs)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadDocs() }, [])

  async function handleUpload(e) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploading(true)
    try {
      await companiesApi.submitVerification(files)
      loadDocs()
      addToast('Đã tải lên tài liệu', 'success')
    } catch (err) {
      addToast(err.message || 'Tải lên thất bại', 'error')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Xóa tài liệu này?')) return
    try {
      await companiesApi.deleteVerificationDocs(id)
      setDocs((prev) => prev.filter((d) => d.id !== id))
      addToast('Đã xóa tài liệu', 'success')
    } catch (err) {
      addToast(err.message || 'Xóa thất bại', 'error')
    }
  }

  async function handleDownload(doc) {
    setDownloading(doc.id)
    try {
      await companiesApi.downloadVerificationDoc(doc.id, doc.file_name)
    } catch {
      addToast('Tải xuống thất bại', 'error')
    } finally {
      setDownloading(null)
    }
  }

  if (loading) return <div className="vp-loading">Đang tải...</div>

  return (
    <div className="vp-page">
      <div className="vp-header">
        <div>
          <h1>Xác minh công ty</h1>
          <p>Tải lên giấy tờ để xác minh doanh nghiệp (tối đa 5 tài liệu, 10MB mỗi file)</p>
        </div>
        <label className={`btn btn-primary btn-sm vp-upload-btn${uploading ? ' disabled' : ''}`}>
          {uploading ? 'Đang tải...' : '+ Tải tài liệu'}
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            style={{ display: 'none' }}
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {docs.length === 0 ? (
        <div className="vp-empty">
          <div className="vp-empty-icon">📋</div>
          <h3>Chưa có tài liệu</h3>
          <p>Tải lên giấy đăng ký kinh doanh, giấy phép hoặc tài liệu xác minh khác</p>
        </div>
      ) : (
        <ul className="vp-list">
          {docs.map((doc) => (
            <li key={doc.id} className="vp-row">
              <span className="vp-doc-icon">{docIcon(doc.document_type)}</span>
              <div className="vp-row-main">
                <span className="vp-file-name">{doc.file_name}</span>
                <span className="vp-file-meta">
                  {doc.document_type?.toUpperCase()} · {new Date(doc.uploaded_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className="vp-row-actions">
                <button
                  className="vp-action"
                  onClick={() => handleDownload(doc)}
                  disabled={downloading === doc.id}
                >
                  {downloading === doc.id ? 'Đang tải...' : 'Tải xuống'}
                </button>
                <button
                  className="vp-action vp-action-danger"
                  onClick={() => handleDelete(doc.id)}
                >
                  Xóa
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
