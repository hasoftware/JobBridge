import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import JobCard from '../components/job/JobCard'
import SlideOver from '../components/common/SlideOver'
import Icon from '../components/common/Icon'
import { jobs as jobsApi, companies as companiesApi } from '../services/api'
import { useToast } from '../hooks/useToast'
import { GICS_SECTORS, JOB_TYPES } from '../services/constants'
import './Jobs.css'

const PAGE_SIZE = 12

function CompanyPopup({ id, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => {
    if (!id) return
    setData(null)
    setLoading(true)
    companiesApi.get(id)
      .then(setData)
      .catch(() => addToast('Không thể tải thông tin công ty', 'error'))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <SlideOver open={!!id} onClose={onClose} title="Thông tin công ty" width={480}>
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--jb-text-tertiary)' }}>Đang tải...</div>
      ) : !data ? null : (
        <div className="jobs-company-popup">
          <div className="jobs-company-popup-header">
            <div className="jobs-company-popup-logo">
              {data.logo_url ? (
                <img src={data.logo_url} alt={data.name} />
              ) : (
                <span>{data.name?.[0]?.toUpperCase() || 'C'}</span>
              )}
            </div>
            <div>
              <div className="jobs-company-popup-name">{data.name}</div>
              {data.verification_status === 'verified' && (
                <span className="jobs-company-popup-badge">Đã xác minh</span>
              )}
            </div>
          </div>

          <div className="jobs-company-popup-rows">
            {data.industry && (
              <div className="jobs-company-popup-row">
                <span>Ngành nghề</span><span>{data.industry}</span>
              </div>
            )}
            {data.location && (
              <div className="jobs-company-popup-row">
                <span>Địa điểm</span><span>{data.location}</span>
              </div>
            )}
            {data.company_size && (
              <div className="jobs-company-popup-row">
                <span>Quy mô</span><span>{data.company_size}</span>
              </div>
            )}
            {data.founded_year && (
              <div className="jobs-company-popup-row">
                <span>Thành lập</span><span>{data.founded_year}</span>
              </div>
            )}
            {data.phone && (
              <div className="jobs-company-popup-row">
                <span>Điện thoại</span><span>{data.phone}</span>
              </div>
            )}
            {data.website && (
              <div className="jobs-company-popup-row">
                <span>Website</span>
                <a href={data.website} target="_blank" rel="noopener noreferrer">{data.website}</a>
              </div>
            )}
          </div>

          {data.description && (
            <p className="jobs-company-popup-desc">{data.description}</p>
          )}
        </div>
      )}
    </SlideOver>
  )
}

export default function Jobs() {
  const { addToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  const [keyword, setKeyword] = useState(searchParams.get('q') || '')
  const [location, setLocation] = useState(searchParams.get('loc') || '')
  const [jobType, setJobType] = useState(searchParams.get('type') || '')
  const [industry, setIndustry] = useState(searchParams.get('industry') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest')
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)

  const [jobs, setJobs] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedCompanyId, setSelectedCompanyId] = useState(null)

  useEffect(() => {
    setLoading(true)
    const params = { page, limit: PAGE_SIZE }
    if (keyword) params.q = keyword
    if (location) params.location = location
    if (jobType) params.type = jobType
    if (industry) params.industry = industry

    jobsApi.list(params)
      .then(({ jobs: rows, total: t }) => {
        if (sort === 'salary') {
          rows = [...rows].sort((a, b) => (b.salary_max || b.salary_min || 0) - (a.salary_max || a.salary_min || 0))
        }
        setJobs(rows)
        setTotal(t)
      })
      .catch((err) => addToast(err.message || 'Không thể tải việc làm', 'error'))
      .finally(() => setLoading(false))
  }, [keyword, location, jobType, industry, sort, page])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const handleSearch = (e) => {
    e.preventDefault()
    const params = {}
    if (keyword) params.q = keyword
    if (location) params.loc = location
    if (jobType) params.type = jobType
    if (industry) params.industry = industry
    if (sort !== 'newest') params.sort = sort
    setSearchParams(params)
    setPage(1)
  }

  const setFilter = (key, val, setter) => {
    setter(val)
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
          <input
            type="text"
            placeholder="Địa điểm..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="jobs-search-location"
          />
          <button type="submit" className="btn btn-primary">
            <Icon name="search" size="sm" /> Tìm kiếm
          </button>
        </form>

        <div className="jobs-layout">
          <aside className="jobs-sidebar">
            <div className="jobs-filter-section">
              <div className="jobs-filter-title">Loại hình</div>
              <label className="jobs-filter-radio">
                <input type="radio" name="type" checked={jobType === ''} onChange={() => setFilter('type', '', setJobType)} />
                Tất cả
              </label>
              {JOB_TYPES.map((t) => (
                <label key={t} className="jobs-filter-radio">
                  <input type="radio" name="type" checked={jobType === t} onChange={() => setFilter('type', t, setJobType)} />
                  {t}
                </label>
              ))}
            </div>

            <div className="jobs-filter-section">
              <div className="jobs-filter-title">Ngành nghề</div>
              <label className="jobs-filter-radio">
                <input type="radio" name="industry" checked={industry === ''} onChange={() => setFilter('industry', '', setIndustry)} />
                Tất cả
              </label>
              {GICS_SECTORS.map((s) => (
                <label key={s} className="jobs-filter-radio">
                  <input type="radio" name="industry" checked={industry === s} onChange={() => setFilter('industry', s, setIndustry)} />
                  {s}
                </label>
              ))}
            </div>
          </aside>

          <main className="jobs-main">
            <div className="jobs-toolbar">
              <div className="jobs-result-count">{total} việc làm</div>
              <select className="jobs-sort" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1) }}>
                <option value="newest">Mới nhất</option>
                <option value="salary">Lương cao nhất</option>
              </select>
            </div>

            {loading ? (
              <div className="jobs-loading">Đang tải...</div>
            ) : jobs.length === 0 ? (
              <div className="jobs-empty">
                <Icon name="briefcase" size="lg" />
                <p>Không tìm thấy việc làm phù hợp</p>
              </div>
            ) : (
              <>
                <div className="jobs-grid">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} onCompanyClick={setSelectedCompanyId} />
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
          </main>
        </div>
      </div>

      <CompanyPopup id={selectedCompanyId} onClose={() => setSelectedCompanyId(null)} />
    </div>
  )
}
