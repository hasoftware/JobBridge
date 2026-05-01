import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { auth as authApi } from '../../services/api'
import AddressSelect from '../../components/common/AddressSelect'
import './ProfileSettings.css'

const GENDER_OPTIONS = [
    { value: '', label: '— Không chọn —' },
    { value: 'male', label: 'Nam' },
    { value: 'female', label: 'Nữ' },
    { value: 'other', label: 'Khác' },
]

const EMPTY_ADDRESS = {
    street: '',
    ward_code: null,
    ward_name: '',
    district_code: null,
    district_name: '',
    province_code: null,
    province_name: '',
}

const EMPTY = {
    full_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: EMPTY_ADDRESS,
    bio: '',
}

function isoToDdmmyyyy(value) {
    if (!value) return ''
    const s = typeof value === 'string' ? value.slice(0, 10) : new Date(value).toISOString().slice(0, 10)
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!m) return ''
    return `${m[3]}/${m[2]}/${m[1]}`
}

function ddmmyyyyToIso(text) {
    const m = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (!m) return null
    const dd = Number(m[1])
    const mm = Number(m[2])
    const yyyy = Number(m[3])
    if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null
    const d = new Date(`${m[3]}-${m[2]}-${m[1]}T00:00:00`)
    if (Number.isNaN(d.getTime())) return null
    if (d.getFullYear() !== yyyy || d.getMonth() + 1 !== mm || d.getDate() !== dd) return null
    return `${m[3]}-${m[2]}-${m[1]}`
}

function formatDateInput(raw) {
    const digits = raw.replace(/\D/g, '').slice(0, 8)
    if (digits.length <= 2) return digits
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export default function ProfileSettings() {
    const { updateProfile } = useAuth()
    const { addToast } = useToast()
    const [meta, setMeta] = useState({ public_id: '', email: '', is_verified: false })
    const [formData, setFormData] = useState(EMPTY)
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [apiError, setApiError] = useState('')

    useEffect(() => {
        let cancelled = false
        authApi.me()
            .then((data) => {
                if (cancelled) return
                setMeta({
                    public_id: data.public_id || '',
                    email: data.email || '',
                    is_verified: !!data.is_verified,
                })
                setFormData({
                    full_name: data.full_name || '',
                    phone: data.phone || '',
                    date_of_birth: isoToDdmmyyyy(data.date_of_birth),
                    gender: data.gender || '',
                    address: data.address && typeof data.address === 'object' ? { ...EMPTY_ADDRESS, ...data.address } : EMPTY_ADDRESS,
                    bio: data.bio || '',
                })
            })
            .catch((err) => {
                if (!cancelled) setApiError(err.message || 'Không tải được hồ sơ')
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => { cancelled = true }
    }, [])

    const validate = () => {
        const next = {}
        const name = formData.full_name.trim()
        if (!name) next.full_name = 'Vui lòng nhập họ và tên'
        else if (name.length < 2) next.full_name = 'Họ và tên phải có ít nhất 2 ký tự'

        if (formData.phone) {
            if (!/^[+\d\s\-()]+$/.test(formData.phone)) {
                next.phone = 'Số điện thoại không hợp lệ'
            } else if (formData.phone.length > 20) {
                next.phone = 'Số điện thoại không vượt quá 20 ký tự'
            }
        }

        if (formData.date_of_birth) {
            const iso = ddmmyyyyToIso(formData.date_of_birth)
            if (!iso) {
                next.date_of_birth = 'Ngày sinh phải có định dạng dd/mm/yyyy'
            } else {
                const dob = new Date(iso)
                if (dob > new Date()) next.date_of_birth = 'Ngày sinh phải nhỏ hơn ngày hiện tại'
            }
        }

        if (formData.bio && formData.bio.length > 500) {
            next.bio = 'Giới thiệu không vượt quá 500 ký tự'
        }
        if (formData.address.street && formData.address.street.length > 200) {
            next.address = 'Số nhà / đường không vượt quá 200 ký tự'
        }

        setErrors(next)
        return Object.keys(next).length === 0
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
        if (apiError) setApiError('')
    }

    const handleDobChange = (e) => {
        const formatted = formatDateInput(e.target.value)
        setFormData((prev) => ({ ...prev, date_of_birth: formatted }))
        if (errors.date_of_birth) setErrors((prev) => ({ ...prev, date_of_birth: '' }))
    }

    const handleAddressChange = (next) => {
        setFormData((prev) => ({ ...prev, address: next }))
        if (errors.address) setErrors((prev) => ({ ...prev, address: '' }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return

        setSaving(true)
        setApiError('')
        try {
            const dobIso = formData.date_of_birth ? ddmmyyyyToIso(formData.date_of_birth) : ''
            const hasAddress = formData.address.street
                || formData.address.province_code
                || formData.address.district_code
                || formData.address.ward_code

            await updateProfile({
                full_name: formData.full_name.trim(),
                phone: formData.phone.trim(),
                date_of_birth: dobIso || '',
                gender: formData.gender,
                address: hasAddress ? formData.address : null,
                bio: formData.bio.trim(),
            })
            addToast('Đã lưu thông tin cá nhân', 'success')
        } catch (err) {
            if (err.errors?.length) {
                setApiError(err.errors.join('; '))
            } else {
                setApiError(err.message || 'Lưu thất bại')
            }
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="profile-loading">Đang tải...</div>
    }

    const verifiedLabel = meta.is_verified ? 'Đã xác thực' : 'Chưa xác thực'

    return (
        <div className="profile-page">
            <header className="profile-header">
                <h1>Thông tin cá nhân</h1>
                <p>Cập nhật thông tin để hồ sơ của bạn được hoàn thiện hơn.</p>
            </header>

            <section className="profile-card profile-readonly">
                <div className="profile-readonly-row">
                    <span className="profile-readonly-label">ID</span>
                    <span className="profile-readonly-value">{meta.public_id || '—'}</span>
                </div>
                <div className="profile-readonly-row">
                    <span className="profile-readonly-label">Email</span>
                    <span className="profile-readonly-value">{meta.email}</span>
                </div>
                <div className="profile-readonly-row">
                    <span className="profile-readonly-label">Trạng thái</span>
                    <span className={`profile-status ${meta.is_verified ? 'verified' : 'unverified'}`}>
                        {verifiedLabel}
                    </span>
                </div>
            </section>

            <form className="profile-card profile-form" onSubmit={handleSubmit} noValidate>
                <div className={`profile-field ${errors.full_name ? 'has-error' : ''}`}>
                    <label htmlFor="full_name">Họ và tên</label>
                    <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        autoComplete="name"
                    />
                    {errors.full_name && <span className="profile-error">{errors.full_name}</span>}
                </div>

                <div className="profile-row">
                    <div className={`profile-field ${errors.phone ? 'has-error' : ''}`}>
                        <label htmlFor="phone">Số điện thoại</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="0901234567"
                            autoComplete="tel"
                        />
                        {errors.phone && <span className="profile-error">{errors.phone}</span>}
                    </div>

                    <div className={`profile-field ${errors.date_of_birth ? 'has-error' : ''}`}>
                        <label htmlFor="date_of_birth">Ngày sinh</label>
                        <input
                            type="text"
                            id="date_of_birth"
                            name="date_of_birth"
                            inputMode="numeric"
                            placeholder="dd/mm/yyyy"
                            value={formData.date_of_birth}
                            onChange={handleDobChange}
                            maxLength={10}
                        />
                        {errors.date_of_birth && <span className="profile-error">{errors.date_of_birth}</span>}
                    </div>
                </div>

                <div className="profile-field">
                    <label htmlFor="gender">Giới tính</label>
                    <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                    >
                        {GENDER_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>

                <div className={`profile-field ${errors.address ? 'has-error' : ''}`}>
                    <label>Địa chỉ</label>
                    <AddressSelect value={formData.address} onChange={handleAddressChange} />
                    {errors.address && <span className="profile-error">{errors.address}</span>}
                </div>

                <div className={`profile-field ${errors.bio ? 'has-error' : ''}`}>
                    <label htmlFor="bio">Giới thiệu bản thân</label>
                    <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Vài dòng mô tả về kinh nghiệm, kỹ năng, định hướng nghề nghiệp..."
                    />
                    <div className="profile-counter">{formData.bio.length}/500</div>
                    {errors.bio && <span className="profile-error">{errors.bio}</span>}
                </div>

                {apiError && <div className="profile-api-error">{apiError}</div>}

                <div className="profile-actions">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </form>
        </div>
    )
}
