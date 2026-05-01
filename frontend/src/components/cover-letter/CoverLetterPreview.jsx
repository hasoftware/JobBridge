import { forwardRef } from 'react'
import './CoverLetterPreview.css'

function formatDate(value) {
    const d = value ? new Date(value) : new Date()
    if (Number.isNaN(d.getTime())) return ''
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `Ngày ${dd} tháng ${mm} năm ${yyyy}`
}

const CoverLetterPreview = forwardRef(function CoverLetterPreview({ data }, ref) {
    const recipient = data?.recipient || ''
    const company = data?.company || ''
    const subject = data?.subject || ''
    const greeting = data?.greeting || 'Kính gửi anh/chị,'
    const body = data?.body || ''
    const closing = data?.closing || 'Trân trọng,'
    const sender = data?.sender || {}

    return (
        <div className="cl-preview" ref={ref}>
            <header className="cl-header">
                <div className="cl-sender-name">{sender.full_name || 'Họ và tên của bạn'}</div>
                <div className="cl-sender-meta">
                    {sender.email && <span>{sender.email}</span>}
                    {sender.phone && <span>{sender.phone}</span>}
                    {sender.address && <span>{sender.address}</span>}
                </div>
            </header>

            <div className="cl-date">{formatDate()}</div>

            {(recipient || company) && (
                <div className="cl-recipient">
                    {recipient && <div>{recipient}</div>}
                    {company && <div>{company}</div>}
                </div>
            )}

            {subject && (
                <div className="cl-subject"><strong>V/v: </strong>{subject}</div>
            )}

            <div className="cl-greeting">{greeting}</div>

            <div className="cl-body">
                {body || 'Nội dung thư xin việc của bạn sẽ hiển thị ở đây. Hãy bắt đầu bằng việc giới thiệu bản thân và vị trí ứng tuyển, kế đến trình bày kinh nghiệm/kỹ năng phù hợp, lý do muốn vào công ty, kết thúc bằng lời cảm ơn và mong nhận được phản hồi.'}
            </div>

            <div className="cl-closing">{closing}</div>
            <div className="cl-signature">{sender.full_name || ''}</div>
        </div>
    )
})

export default CoverLetterPreview
