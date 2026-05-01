import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useToast } from '../../hooks/useToast'
import { auth as authApi, token as tokenStore } from '../../services/api'
import Setup2FAModal from '../../components/security/Setup2FAModal'
import './SecuritySettings.css'

const PASSWORD_RULES = [
    { key: 'length', label: 'Ít nhất 8 ký tự', test: (p) => p.length >= 8 },
    { key: 'upper', label: 'Có chữ HOA', test: (p) => /[A-Z]/.test(p) },
    { key: 'lower', label: 'Có chữ thường', test: (p) => /[a-z]/.test(p) },
    { key: 'number', label: 'Có chữ số', test: (p) => /[0-9]/.test(p) },
    { key: 'special', label: 'Có ký tự đặc biệt', test: (p) => /[!@#$%^&*()_+\-=]/.test(p) },
]

function formatDate(value) {
    if (!value) return '—'
    try {
        const d = new Date(value)
        const dd = String(d.getDate()).padStart(2, '0')
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const yyyy = d.getFullYear()
        const hh = String(d.getHours()).padStart(2, '0')
        const mi = String(d.getMinutes()).padStart(2, '0')
        return `${dd}/${mm}/${yyyy} ${hh}:${mi}`
    } catch {
        return '—'
    }
}

export default function SecuritySettings() {
    const { addToast } = useToast()
    const location = useLocation()

    const [editingPassword, setEditingPassword] = useState(false)
    const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
    const [pwErrors, setPwErrors] = useState({})
    const [pwApiError, setPwApiError] = useState('')
    const [pwSaving, setPwSaving] = useState(false)

    const [sessions, setSessions] = useState([])
    const [sessionsLoading, setSessionsLoading] = useState(true)
    const [revoking, setRevoking] = useState(false)

    const [twoFAStatus, setTwoFAStatus] = useState({ enabled: false, backup_remaining: 0 })
    const [twoFALoading, setTwoFALoading] = useState(true)
    const [setupOpen, setSetupOpen] = useState(false)
    const [disableOpen, setDisableOpen] = useState(false)
    const [disablePassword, setDisablePassword] = useState('')
    const [disableCode, setDisableCode] = useState('')
    const [disableBusy, setDisableBusy] = useState(false)
    const [disableErr, setDisableErr] = useState('')

    const loadTwoFAStatus = async () => {
        try {
            const data = await authApi.twoFA.status()
            setTwoFAStatus(data)
        } catch {
            setTwoFAStatus({ enabled: false, backup_remaining: 0 })
        } finally {
            setTwoFALoading(false)
        }
    }

    useEffect(() => { loadTwoFAStatus() }, [])

    const handleDisable2FA = async (e) => {
        e.preventDefault()
        if (!disablePassword || !/^\d{6}$/.test(disableCode)) {
            setDisableErr('Vui lòng nhập đầy đủ mật khẩu và 6 chữ số mã 2FA')
            return
        }
        setDisableBusy(true)
        setDisableErr('')
        try {
            await authApi.twoFA.disable(disablePassword, disableCode)
            addToast('Đã tắt xác thực 2 bước', 'info')
            setDisableOpen(false)
            setDisablePassword('')
            setDisableCode('')
            loadTwoFAStatus()
        } catch (err) {
            setDisableErr(err.message || 'Tắt 2FA thất bại')
        } finally {
            setDisableBusy(false)
        }
    }

    const passwordChecks = useMemo(
        () => PASSWORD_RULES.map((r) => ({ ...r, ok: r.test(pwForm.next) })),
        [pwForm.next],
    )

    const loadSessions = async () => {
        try {
            const list = await authApi.getSessions()
            setSessions(list)
        } catch {
            setSessions([])
        } finally {
            setSessionsLoading(false)
        }
    }

    useEffect(() => {
        loadSessions()
    }, [])

    useEffect(() => {
        if (location.hash === '#password') {
            setEditingPassword(true)
            const el = document.getElementById('section-password')
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else if (location.hash === '#2fa') {
            const el = document.getElementById('section-2fa')
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else if (location.hash === '#sessions') {
            const el = document.getElementById('section-sessions')
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }, [location.hash])

    const validatePw = () => {
        const errs = {}
        if (!pwForm.current) errs.current = 'Vui lòng nhập mật khẩu hiện tại'
        if (!pwForm.next) errs.next = 'Vui lòng nhập mật khẩu mới'
        else if (passwordChecks.some((c) => !c.ok)) errs.next = 'Mật khẩu chưa đáp ứng đủ yêu cầu'
        if (!pwForm.confirm) errs.confirm = 'Vui lòng xác nhận mật khẩu'
        else if (pwForm.confirm !== pwForm.next) errs.confirm = 'Mật khẩu xác nhận không khớp'
        if (pwForm.current && pwForm.next && pwForm.current === pwForm.next) {
            errs.next = 'Mật khẩu mới phải khác mật khẩu hiện tại'
        }
        setPwErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handlePwChange = (field) => (e) => {
        setPwForm((prev) => ({ ...prev, [field]: e.target.value }))
        if (pwErrors[field]) setPwErrors((prev) => ({ ...prev, [field]: '' }))
        if (pwApiError) setPwApiError('')
    }

    const cancelEditPassword = () => {
        setEditingPassword(false)
        setPwForm({ current: '', next: '', confirm: '' })
        setPwErrors({})
        setPwApiError('')
    }

    const submitChangePassword = async (e) => {
        e.preventDefault()
        if (!validatePw()) return
        setPwSaving(true)
        setPwApiError('')
        try {
            const data = await authApi.changePassword(pwForm.current, pwForm.next)
            tokenStore.set(data.access_token, data.refresh_token)
            addToast('Đổi mật khẩu thành công', 'success')
            cancelEditPassword()
            loadSessions()
        } catch (err) {
            if (err.errors?.length) setPwApiError(err.errors.join('; '))
            else setPwApiError(err.message || 'Đổi mật khẩu thất bại')
        } finally {
            setPwSaving(false)
        }
    }

    const handleRevokeOther = async () => {
        const ok = window.confirm('Đăng xuất tất cả thiết bị khác? Phiên hiện tại sẽ được giữ lại.')
        if (!ok) return
        setRevoking(true)
        try {
            const refresh = tokenStore.getRefresh()
            const data = await authApi.revokeOtherSessions(refresh)
            addToast(`Đã đăng xuất ${data.revoked} phiên khác`, 'success')
            loadSessions()
        } catch (err) {
            addToast(err.message || 'Đăng xuất thất bại', 'error')
        } finally {
            setRevoking(false)
        }
    }

    return (
        <div className="security-page">
            <header className="security-header">
                <h1>Cài đặt bảo mật</h1>
                <p>Quản lý mật khẩu, xác minh 2 bước và các phiên đăng nhập của bạn.</p>
            </header>

            <section id="section-password" className="security-card">
                <div className="security-card-head">
                    <div>
                        <h2>Mật khẩu</h2>
                        <p>Đã thiết lập. Đổi mật khẩu định kỳ để bảo mật tài khoản tốt hơn.</p>
                    </div>
                    {!editingPassword && (
                        <button type="button" className="btn btn-outline" onClick={() => setEditingPassword(true)}>
                            Đổi mật khẩu
                        </button>
                    )}
                </div>

                {editingPassword && (
                    <form className="security-form" onSubmit={submitChangePassword} noValidate>
                        <div className={`security-field ${pwErrors.current ? 'has-error' : ''}`}>
                            <label htmlFor="current">Mật khẩu hiện tại</label>
                            <input
                                type="password"
                                id="current"
                                value={pwForm.current}
                                onChange={handlePwChange('current')}
                                autoComplete="current-password"
                            />
                            {pwErrors.current && <span className="security-error">{pwErrors.current}</span>}
                        </div>

                        <div className={`security-field ${pwErrors.next ? 'has-error' : ''}`}>
                            <label htmlFor="next">Mật khẩu mới</label>
                            <input
                                type="password"
                                id="next"
                                value={pwForm.next}
                                onChange={handlePwChange('next')}
                                autoComplete="new-password"
                            />
                            {pwForm.next && (
                                <ul className="password-rules">
                                    {passwordChecks.map((c) => (
                                        <li key={c.key} className={c.ok ? 'ok' : ''}>
                                            <span className="password-rule-mark">{c.ok ? '✓' : '○'}</span>
                                            {c.label}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {pwErrors.next && <span className="security-error">{pwErrors.next}</span>}
                        </div>

                        <div className={`security-field ${pwErrors.confirm ? 'has-error' : ''}`}>
                            <label htmlFor="confirm">Xác nhận mật khẩu mới</label>
                            <input
                                type="password"
                                id="confirm"
                                value={pwForm.confirm}
                                onChange={handlePwChange('confirm')}
                                autoComplete="new-password"
                            />
                            {pwErrors.confirm && <span className="security-error">{pwErrors.confirm}</span>}
                        </div>

                        {pwApiError && <div className="security-api-error">{pwApiError}</div>}

                        <div className="security-form-actions">
                            <button type="button" className="btn btn-outline" onClick={cancelEditPassword} disabled={pwSaving}>
                                Hủy
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={pwSaving}>
                                {pwSaving ? 'Đang lưu...' : 'Lưu mật khẩu mới'}
                            </button>
                        </div>
                    </form>
                )}
            </section>

            <section id="section-2fa" className="security-card">
                <div className="security-card-head">
                    <div>
                        <h2>Xác minh 2 bước (2FA)</h2>
                        <p>Bảo vệ tài khoản bằng mã xác thực một lần từ app như Google Authenticator, Authy.</p>
                    </div>
                    {twoFALoading ? (
                        <span className="security-hint">Đang tải...</span>
                    ) : twoFAStatus.enabled ? (
                        <span className="security-badge security-badge-success">Đã kích hoạt</span>
                    ) : (
                        <span className="security-badge security-badge-warning">Chưa kích hoạt</span>
                    )}
                </div>
                {!twoFALoading && (
                    <div className="security-2fa-body">
                        {twoFAStatus.enabled ? (
                            <>
                                <span className="security-hint">Còn {twoFAStatus.backup_remaining} mã khôi phục.</span>
                                <button type="button" className="btn btn-outline btn-danger" onClick={() => setDisableOpen(true)}>
                                    Tắt 2FA
                                </button>
                            </>
                        ) : (
                            <button type="button" className="btn btn-primary" onClick={() => setSetupOpen(true)}>
                                Kích hoạt 2FA
                            </button>
                        )}
                    </div>
                )}

                {disableOpen && (
                    <form className="security-form" onSubmit={handleDisable2FA} noValidate>
                        <div className="security-field">
                            <label>Mật khẩu hiện tại</label>
                            <input
                                type="password"
                                value={disablePassword}
                                onChange={(e) => { setDisablePassword(e.target.value); setDisableErr('') }}
                                autoComplete="current-password"
                            />
                        </div>
                        <div className="security-field">
                            <label>Mã 2FA (6 chữ số)</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={disableCode}
                                onChange={(e) => { setDisableCode(e.target.value.replace(/\D/g, '')); setDisableErr('') }}
                                autoComplete="one-time-code"
                            />
                        </div>
                        {disableErr && <div className="security-api-error">{disableErr}</div>}
                        <div className="security-form-actions">
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => { setDisableOpen(false); setDisableErr(''); setDisablePassword(''); setDisableCode('') }}
                                disabled={disableBusy}
                            >
                                Hủy
                            </button>
                            <button type="submit" className="btn btn-primary btn-danger" disabled={disableBusy}>
                                {disableBusy ? 'Đang xử lý...' : 'Xác nhận tắt 2FA'}
                            </button>
                        </div>
                    </form>
                )}
            </section>

            <Setup2FAModal
                open={setupOpen}
                onClose={() => setSetupOpen(false)}
                onSuccess={loadTwoFAStatus}
            />

            <section id="section-sessions" className="security-card">
                <div className="security-card-head">
                    <div>
                        <h2>Phiên đăng nhập</h2>
                        <p>Tất cả thiết bị đang đăng nhập vào tài khoản của bạn.</p>
                    </div>
                    {sessions.length > 1 && (
                        <button type="button" className="btn btn-outline btn-danger" onClick={handleRevokeOther} disabled={revoking}>
                            {revoking ? 'Đang xử lý...' : 'Đăng xuất thiết bị khác'}
                        </button>
                    )}
                </div>

                {sessionsLoading ? (
                    <div className="security-empty">Đang tải...</div>
                ) : sessions.length === 0 ? (
                    <div className="security-empty">Không có phiên nào đang hoạt động.</div>
                ) : (
                    <ul className="session-list">
                        {sessions.map((s) => (
                            <li key={s.id} className="session-item">
                                <div className="session-info">
                                    <div className="session-title">Phiên #{s.id}</div>
                                    <div className="session-meta">
                                        Đăng nhập: {formatDate(s.created_at)} · Hết hạn: {formatDate(s.expires_at)}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    )
}
