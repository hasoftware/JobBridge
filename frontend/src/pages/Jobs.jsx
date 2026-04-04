import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import JobCard from '../components/job/JobCard'
import './Jobs.css'

const PAGE_SIZE = 12

const MOCK_JOBS = Array.from({ length: 28 }, (_, i) => ({
  id: i + 1,
  title: ['Frontend Developer', 'Backend Engineer', 'Data Analyst', 'Product Manager', 'UX Designer'][i % 5],
  company_name: ['Tech Corp', 'StartupHub', 'Brand VN', 'FinTech Co', 'Global IT'][i % 5],
  location: ['Hà Nội', 'TP. HCM', 'Đà Nẵng', 'Toàn quốc'][i % 4],
  salary_min: 1000 + i * 100,
  salary_max: 2500 + i * 150,
  currency: 'USD',
  job_type: ['Full-time', 'Part-time', 'Contract'][i % 3],
}))

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get('q') || '')
  const [locationFilter, setLocationFilter] = useState(searchParams.get('loc') || '')
  const [jobType, setJobType] = useState(searchParams.get('type') || '')
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const filtered = MOCK_JOBS.filter((j) => {
      if (keyword && !j.title.toLowerCase().includes(keyword.toLowerCase())) return false
      if (locationFilter && j.location !== locationFilter) return false
      if (jobType && j.job_type !== jobType) return false
      return true
    })
    setJobs(filtered)
    setPage(1)
    setLoading(false)
  }, [keyword, locationFilter, jobType])

  const totalPages = Math.ceil(jobs.length / PAGE_SIZE)
  const paginatedJobs = jobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSearch = (e) => {
    e.preventDefault()
    const params = {}
    if (keyword) params.q = keyword
    if (locationFilter) params.loc = locationFilter
    if (jobType) params.type = jobType
    setSearchParams(params)
    setPage(1)
  }

  return (
    <div className="jobs-page">
      <div className="container">
        <h1 className="jobs-title">Việc làm</h1>

        <form className="jobs-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Vị trí, kỹ năng, công ty..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
            <option value="">Tất cả địa điểm</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="TP. HCM">TP. HCM</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
          </select>
          <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
            <option value="">Loại hình</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
          </select>
          <button type="submit" className="btn btn-primary">Tìm</button>
        </form>

        <div className="jobs-result">
          <div className="jobs-result-count">{jobs.length} việc làm</div>
          {loading ? (
            <div>Đang tải...</div>
          ) : (
            <>
              <div className="jobs-grid">
                {paginatedJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="jobs-pagination">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                    Trang trước
                  </button>
                  <span>Trang {page} / {totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    Trang sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
