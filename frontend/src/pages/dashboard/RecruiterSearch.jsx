import { useState, useEffect } from 'react'

const MOCK_CANDIDATES = [
  { id: 1, name: 'Nguyễn Văn A', title: 'Frontend Developer', skills: ['React', 'JavaScript', 'CSS'], experience: 3, location: 'Hà Nội' },
  { id: 2, name: 'Trần Thị B', title: 'Backend Engineer', skills: ['Node.js', 'PostgreSQL', 'Redis'], experience: 5, location: 'TP. HCM' },
  { id: 3, name: 'Lê Văn C', title: 'Full-stack Developer', skills: ['React', 'Node.js', 'TypeScript'], experience: 4, location: 'Hà Nội' },
  { id: 4, name: 'Phạm Thị D', title: 'Data Analyst', skills: ['Python', 'SQL', 'Tableau'], experience: 2, location: 'Đà Nẵng' },
]

export default function RecruiterSearch() {
  const [keyword, setKeyword] = useState('')
  const [skillFilter, setSkillFilter] = useState('')
  const [results, setResults] = useState([])

  useEffect(() => {
    setResults(MOCK_CANDIDATES)
  }, [])

  const handleSearch = () => {
    let filtered = MOCK_CANDIDATES
    if (keyword) {
      const k = keyword.toLowerCase()
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(k) || c.title.toLowerCase().includes(k)
      )
    }
    if (skillFilter) {
      filtered = filtered.filter((c) =>
        c.skills.some((s) => s.toLowerCase().includes(skillFilter.toLowerCase()))
      )
    }
    setResults(filtered)
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <h1>Tìm ứng viên</h1>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Tên hoặc vị trí..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <input
          type="text"
          placeholder="Kỹ năng (React, Python...)"
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
        />
        <button onClick={handleSearch} className="btn btn-primary">Tìm</button>
      </div>

      <div className="search-results">
        {results.length === 0 ? (
          <div className="dashboard-empty">Không tìm thấy ứng viên phù hợp</div>
        ) : (
          results.map((c) => (
            <div key={c.id} className="candidate-card">
              <div className="candidate-name">{c.name}</div>
              <div className="candidate-title">{c.title}</div>
              <div className="candidate-meta">
                <span>{c.experience} năm KN</span>
                <span>{c.location}</span>
              </div>
              <div className="candidate-skills">
                {c.skills.map((s) => (
                  <span key={s} className="candidate-skill">{s}</span>
                ))}
              </div>
              <div className="candidate-actions">
                <button>Xem hồ sơ</button>
                <button>Liên hệ</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
