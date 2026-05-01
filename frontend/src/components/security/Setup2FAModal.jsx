import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useToast } from '../../hooks/useToast'
import { auth as authApi } from '../../services/api'
import BackupCodes from './BackupCodes'
import './Setup2FAModal.css'

export default function Setup2FAModal({ open, onClose, onSuccess }) {
    const { addToast } = useToast()
    const [step, setStep] = useState('qr')
    const [secret, setSecret] = useState('')
    const [otpauthUrl, setOtpauthUrl] = useState('')
    const [code, setCode] = useState('')
    const [backupCodes, setBackupCodes] = useState([])
    const [loading, setLoading] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!open) return
        setStep('qr')
        setCode('')
        setBackupCodes([])
        setError('')
        setLoading(true)
        authApi.twoFA.setup()
            .then((data) => {
                setSecret(data.secret)
                setOtpauthUrl(data.otpauth_url)
            })
            .catch((err) => setError(err.message || 'Không khởi tạo được 2FA'))
            .finally(() => setLoading(false))
    }, [open])

    useEffect(() => {
        if (!open) return
        const handler = (e) => { if (e.key === 'Escape' && step !== 'codes') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [open, onClose, step])

    if (!open) return null

    const handleVerify = async (e) => {
        e.preventDefault()
        if (!/^\d{6}$/.test(code)) {
            setError('Vui lòng nhập đúng 6 chữ số')
            return
        }
        setVerifying(true)
        setError('')
        try {
            const data = await authApi.twoFA.enable(secret, code)
            setBackupCodes(data.backup_codes)
            setStep('codes')
            addToast('Đã kích hoạt xác thực 2 bước', 'success')
        } catch (err) {
            setError(err.message || 'Mã không đúng')
        } finally {
            setVerifying(false)
        }
    }

    const handleFinish = () => {
        onSuccess?.()
        onClose()
    }

    return (
        <div className="modal-backdrop" onClick={() => step !== 'codes' && onClose()}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <header className="modal-head">
                    <h2>Kích hoạt xác thực 2 bước</h2>
                    {step !== 'codes' && (
                        <button type="button" className="modal-close" onClick={onClose} aria-label="Đóng">✕</button>
                    )}
                </header>

                {loading ? (
                    <div className="modal-body modal-loading">Đang tạo mã...</div>
                ) : step === 'qr' ? (
                    <form className="modal-body" onSubmit={handleVerify}>
                        <ol className="setup-steps">
                            <li>Mở app authenticator (Google Authenticator, Microsoft Authenticator, Authy...).</li>
                            <li>Quét mã QR bên dưới hoặc nhập tay mã bí mật.</li>
                            <li>Nhập 6 số hiện trên app để xác nhận.</li>
                        </ol>

                        <div className="setup-qr-box">
                            {otpauthUrl && (
                                <QRCodeSVG value={otpauthUrl} size={180} bgColor="#fff" fgColor="#0f172a" level="M" />
                            )}
                        </div>

                        <div className="setup-secret">
                            <label>Mã bí mật</label>
                            <code>{secret}</code>
                        </div>

                        <div className="setup-field">
                            <label htmlFor="totp-code">Mã từ app</label>
                            <input
                                id="totp-code"
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="123456"
                                value={code}
                                onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setError('') }}
                                autoComplete="one-time-code"
                                autoFocus
                            />
                        </div>

                        {error && <div className="setup-error">{error}</div>}

                        <div className="modal-actions">
                            <button type="button" className="btn btn-outline" onClick={onClose} disabled={verifying}>Hủy</button>
                            <button type="submit" className="btn btn-primary" disabled={verifying || code.length !== 6}>
                                {verifying ? 'Đang xác minh...' : 'Xác nhận'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="modal-body">
                        <BackupCodes codes={backupCodes} />
                        <div className="modal-actions">
                            <button type="button" className="btn btn-primary" onClick={handleFinish}>
                                Tôi đã lưu, hoàn tất
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
