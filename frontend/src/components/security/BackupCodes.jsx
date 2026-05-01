import { useToast } from '../../hooks/useToast'
import './BackupCodes.css'

export default function BackupCodes({ codes }) {
    const { addToast } = useToast()

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(codes.join('\n'))
            addToast('Đã sao chép tất cả mã', 'success')
        } catch {
            addToast('Không sao chép được', 'error')
        }
    }

    const handleDownload = () => {
        const blob = new Blob(
            [`JobBridge — Mã khôi phục 2FA\nNgày tạo: ${new Date().toLocaleString('vi-VN')}\n\n${codes.join('\n')}\n\nMỗi mã chỉ dùng được 1 lần. Lưu ở nơi an toàn.\n`],
            { type: 'text/plain' },
        )
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'jobbridge-backup-codes.txt'
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="backup-codes">
            <div className="backup-codes-warning">
                ⚠ Lưu ngay 10 mã khôi phục dưới đây. Mỗi mã chỉ dùng được 1 lần khi bạn không có app authenticator. Sau khi đóng cửa sổ bạn sẽ không xem lại được.
            </div>

            <div className="backup-codes-grid">
                {codes.map((c, i) => (
                    <code key={i}>{c}</code>
                ))}
            </div>

            <div className="backup-codes-actions">
                <button type="button" className="btn btn-outline" onClick={handleCopy}>Sao chép</button>
                <button type="button" className="btn btn-outline" onClick={handleDownload}>Tải file .txt</button>
            </div>
        </div>
    )
}
