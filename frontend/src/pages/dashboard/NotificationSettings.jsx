import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useToast } from '../../hooks/useToast'
import { auth as authApi } from '../../services/api'
import './NotificationSettings.css'

const FREQUENCY_OPTIONS = [
    { value: 'daily', label: 'Hàng ngày' },
    { value: 'weekly', label: 'Hàng tuần' },
    { value: 'off', label: 'Tắt' },
]

const IN_APP_TOGGLES = [
    { key: 'jobMatches', label: 'Việc làm phù hợp với bạn', hint: 'Thông báo khi có việc mới khớp với hồ sơ.' },
    { key: 'savedJobs', label: 'Cập nhật việc đã lưu', hint: 'Thay đổi mức lương, hạn ứng tuyển hoặc trạng thái tin.' },
    { key: 'applicationStatus', label: 'Trạng thái đơn ứng tuyển', hint: 'Khi nhà tuyển dụng cập nhật đơn của bạn.' },
    { key: 'profileViews', label: 'Nhà tuyển dụng xem hồ sơ', hint: 'Có nhà tuyển dụng vừa mở hồ sơ của bạn.' },
    { key: 'recruiterMessages', label: 'Tin nhắn từ nhà tuyển dụng', hint: 'Nhà tuyển dụng nhắn tin trực tiếp với bạn.' },
]

const EMAIL_TOGGLES = [
    { key: 'applicationUpdates', label: 'Cập nhật đơn ứng tuyển qua email' },
    { key: 'recruiterEmail', label: 'Email từ nhà tuyển dụng' },
    { key: 'newsletter', label: 'Tin tức & mẹo nghề nghiệp' },
]

function ToggleSwitch({ checked, onChange, label, hint }) {
    return (
        <label className="toggle-row">
            <div className="toggle-text">
                <span className="toggle-label">{label}</span>
                {hint && <span className="toggle-hint">{hint}</span>}
            </div>
            <span className={`toggle-track ${checked ? 'on' : ''}`}>
                <input
                    type="checkbox"
                    className="toggle-input"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <span className="toggle-thumb" />
            </span>
        </label>
    )
}

export default function NotificationSettings() {
    const { addToast } = useToast()
    const location = useLocation()
    const [settings, setSettings] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [apiError, setApiError] = useState('')
    const [dirty, setDirty] = useState(false)

    useEffect(() => {
        let cancelled = false
        authApi.getNotificationSettings()
            .then((data) => { if (!cancelled) setSettings(data) })
            .catch((err) => { if (!cancelled) setApiError(err.message || 'Không tải được cài đặt') })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [])

    useEffect(() => {
        const target = location.hash === '#email' ? 'section-email' : location.hash === '#jobs' ? 'section-jobs' : null
        if (target) {
            const el = document.getElementById(target)
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }, [location.hash, loading])

    const updateInApp = (key, value) => {
        setSettings((prev) => ({ ...prev, inApp: { ...prev.inApp, [key]: value } }))
        setDirty(true)
    }

    const updateEmail = (key, value) => {
        setSettings((prev) => ({ ...prev, email: { ...prev.email, [key]: value } }))
        setDirty(true)
    }

    const handleSave = async () => {
        setSaving(true)
        setApiError('')
        try {
            const data = await authApi.updateNotificationSettings(settings)
            setSettings(data)
            setDirty(false)
            addToast('Đã lưu cài đặt thông báo', 'success')
        } catch (err) {
            if (err.errors?.length) setApiError(err.errors.join('; '))
            else setApiError(err.message || 'Lưu thất bại')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="notif-loading">Đang tải...</div>
    if (!settings) return <div className="notif-loading">{apiError || 'Không có dữ liệu'}</div>

    return (
        <div className="notif-page">
            <header className="notif-header">
                <h1>Cài đặt email & thông báo</h1>
                <p>Chọn loại thông báo bạn muốn nhận trong ứng dụng và qua email.</p>
            </header>

            <section id="section-jobs" className="notif-card">
                <div className="notif-card-head">
                    <h2>Thông báo trong ứng dụng</h2>
                    <p>Hiển thị ở chuông thông báo bên cạnh ảnh đại diện.</p>
                </div>
                <div className="notif-toggles">
                    {IN_APP_TOGGLES.map((t) => (
                        <ToggleSwitch
                            key={t.key}
                            label={t.label}
                            hint={t.hint}
                            checked={!!settings.inApp[t.key]}
                            onChange={(v) => updateInApp(t.key, v)}
                        />
                    ))}
                </div>
            </section>

            <section id="section-email" className="notif-card">
                <div className="notif-card-head">
                    <h2>Nhận email</h2>
                    <p>Email được gửi tới địa chỉ bạn dùng đăng ký.</p>
                </div>

                <div className="notif-frequency">
                    <label htmlFor="job_freq">Tần suất gợi ý việc làm qua email</label>
                    <select
                        id="job_freq"
                        value={settings.email.jobSuggestions}
                        onChange={(e) => updateEmail('jobSuggestions', e.target.value)}
                    >
                        {FREQUENCY_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>

                <div className="notif-toggles">
                    {EMAIL_TOGGLES.map((t) => (
                        <ToggleSwitch
                            key={t.key}
                            label={t.label}
                            checked={!!settings.email[t.key]}
                            onChange={(v) => updateEmail(t.key, v)}
                        />
                    ))}
                </div>
            </section>

            {apiError && <div className="notif-api-error">{apiError}</div>}

            <div className="notif-actions">
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={!dirty || saving}
                >
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </div>
        </div>
    )
}
