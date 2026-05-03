import LegalPageLayout from '../components/legal/LegalPageLayout'

const SECTIONS = [
    {
        id: 'accept',
        title: 'Chấp nhận điều khoản',
        content: (
            <>
                <p>
                    Khi truy cập, đăng ký hoặc sử dụng dịch vụ tại <strong>jobbridge.vn</strong> ("JobBridge", "chúng tôi", "dịch vụ"), bạn xác nhận đã đọc, hiểu và đồng ý chịu sự ràng buộc bởi các điều khoản dưới đây.
                </p>
                <p>
                    Nếu không đồng ý với bất kỳ điều khoản nào, vui lòng ngừng sử dụng dịch vụ. Việc tiếp tục sử dụng sau khi điều khoản được cập nhật đồng nghĩa với việc bạn chấp nhận các thay đổi.
                </p>
            </>
        ),
    },
    {
        id: 'account',
        title: 'Tài khoản',
        content: (
            <>
                <p><strong>Đăng ký tài khoản:</strong></p>
                <ul>
                    <li>Bạn phải đủ 16 tuổi trở lên để đăng ký tài khoản.</li>
                    <li>Cung cấp thông tin chính xác, đầy đủ và cập nhật khi có thay đổi.</li>
                    <li>Mỗi cá nhân/doanh nghiệp chỉ được tạo một tài khoản chính.</li>
                </ul>
                <p><strong>Bảo mật tài khoản:</strong></p>
                <ul>
                    <li>Bạn chịu trách nhiệm bảo mật mật khẩu và mọi hoạt động trên tài khoản của mình.</li>
                    <li>Khuyến khích bật xác thực 2 yếu tố (2FA) trong cài đặt bảo mật.</li>
                    <li>Thông báo ngay cho chúng tôi nếu phát hiện truy cập trái phép.</li>
                </ul>
                <p><strong>Ngừng hoạt động tài khoản:</strong> Bạn có thể yêu cầu xóa tài khoản bất kỳ lúc nào. Sau khi xóa, dữ liệu sẽ được giữ lại tối đa 30 ngày để xử lý các nghĩa vụ phát sinh, sau đó xóa vĩnh viễn.</p>
            </>
        ),
    },
    {
        id: 'content',
        title: 'Quy định nội dung',
        content: (
            <>
                <p>Khi đăng tải bất kỳ nội dung nào lên JobBridge (CV, Cover Letter, tin tuyển dụng, đánh giá, tin nhắn), bạn cam kết:</p>
                <ul>
                    <li>Nội dung là của bạn hoặc bạn có quyền sử dụng hợp pháp.</li>
                    <li>Thông tin chính xác, không gian dối, không gây hiểu lầm.</li>
                    <li>Không xâm phạm quyền của bên thứ ba (sở hữu trí tuệ, danh dự, riêng tư).</li>
                    <li>Tuân thủ pháp luật Việt Nam và quy định của JobBridge.</li>
                </ul>
                <p>
                    Bạn cấp cho JobBridge quyền không độc quyền, miễn phí bản quyền để hiển thị, lưu trữ, sao lưu, phân phối nội dung của bạn trên nền tảng nhằm mục đích vận hành dịch vụ.
                </p>
            </>
        ),
    },
    {
        id: 'prohibited',
        title: 'Hành vi cấm',
        content: (
            <>
                <p>Khi sử dụng JobBridge, bạn KHÔNG được:</p>
                <ul>
                    <li>Đăng tin tuyển dụng giả mạo, đa cấp, hoặc vi phạm Bộ luật Lao động.</li>
                    <li>Yêu cầu ứng viên đặt cọc, trả phí trước khi ký hợp đồng lao động.</li>
                    <li>Sử dụng tài khoản của người khác hoặc giả mạo danh tính.</li>
                    <li>Đăng nội dung khiêu dâm, bạo lực, kỳ thị, phân biệt chủng tộc/giới tính/tôn giáo.</li>
                    <li>Spam, quấy rối ứng viên hoặc nhà tuyển dụng khác qua tin nhắn.</li>
                    <li>Thu thập thông tin người dùng bằng công cụ tự động (scraping, bot).</li>
                    <li>Tải lên virus, malware, mã độc.</li>
                    <li>Cố ý gây quá tải, gián đoạn hệ thống.</li>
                    <li>Thực hiện hành vi gian lận, lừa đảo dưới mọi hình thức.</li>
                </ul>
                <p>
                    Vi phạm có thể dẫn đến cảnh cáo, đình chỉ hoặc xóa vĩnh viễn tài khoản, đồng thời chúng tôi có quyền báo cáo cho cơ quan chức năng có thẩm quyền.
                </p>
            </>
        ),
    },
    {
        id: 'ip',
        title: 'Quyền sở hữu trí tuệ',
        content: (
            <>
                <p>
                    Toàn bộ giao diện, mã nguồn, thiết kế, logo, thương hiệu "JobBridge", văn bản hướng dẫn, biểu tượng và các tài sản khác trên nền tảng (trừ nội dung do người dùng đăng tải) là tài sản của JobBridge và được pháp luật bảo vệ.
                </p>
                <p>
                    Không được sao chép, phân phối, sửa đổi, xuất bản hoặc khai thác thương mại bất kỳ phần nào của dịch vụ mà không có sự đồng ý bằng văn bản từ JobBridge.
                </p>
                <p>
                    Đối với nội dung do người dùng đăng tải, quyền sở hữu thuộc về người dùng. JobBridge chỉ có giấy phép sử dụng giới hạn để vận hành dịch vụ như mô tả ở mục 3.
                </p>
            </>
        ),
    },
    {
        id: 'liability',
        title: 'Giới hạn trách nhiệm',
        content: (
            <>
                <p>
                    JobBridge cung cấp nền tảng kết nối ứng viên và nhà tuyển dụng. Chúng tôi <strong>không phải là bên tuyển dụng</strong> và không tham gia trực tiếp vào quá trình thỏa thuận, ký kết, thực hiện hợp đồng lao động giữa các bên.
                </p>
                <p>JobBridge không chịu trách nhiệm về:</p>
                <ul>
                    <li>Tính xác thực, đầy đủ của thông tin tin tuyển dụng hoặc hồ sơ ứng viên.</li>
                    <li>Quá trình phỏng vấn, đàm phán, hợp đồng giữa ứng viên và nhà tuyển dụng.</li>
                    <li>Tổn thất phát sinh từ giao dịch ngoài nền tảng.</li>
                    <li>Sự cố kỹ thuật bất khả kháng (mất điện, lỗi nhà cung cấp internet, thiên tai...).</li>
                </ul>
                <p>
                    Trong mọi trường hợp, trách nhiệm của JobBridge đối với người dùng (nếu có) không vượt quá tổng số phí mà người dùng đã thanh toán cho dịch vụ trong 12 tháng gần nhất.
                </p>
            </>
        ),
    },
    {
        id: 'termination',
        title: 'Chấm dứt',
        content: (
            <>
                <p>
                    Chúng tôi có quyền tạm ngừng hoặc chấm dứt tài khoản của bạn nếu phát hiện vi phạm điều khoản này, theo quyết định của JobBridge.
                </p>
                <p>
                    Bạn có thể chấm dứt sử dụng dịch vụ bất kỳ lúc nào bằng cách xóa tài khoản trong cài đặt. Sau khi chấm dứt, các điều khoản về sở hữu trí tuệ, giới hạn trách nhiệm vẫn tiếp tục có hiệu lực.
                </p>
            </>
        ),
    },
    {
        id: 'law',
        title: 'Luật áp dụng',
        content: (
            <>
                <p>
                    Điều khoản này được điều chỉnh và giải thích theo pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.
                </p>
                <p>
                    Mọi tranh chấp phát sinh sẽ được ưu tiên giải quyết bằng thương lượng. Nếu không đạt được thỏa thuận, tranh chấp sẽ được giải quyết tại Tòa án nhân dân có thẩm quyền tại Hà Nội, Việt Nam.
                </p>
            </>
        ),
    },
    {
        id: 'contact',
        title: 'Liên hệ',
        content: (
            <>
                <p>Mọi thắc mắc liên quan đến Điều khoản sử dụng, vui lòng liên hệ:</p>
                <ul>
                    <li><strong>Email:</strong> <a href="mailto:hotro@jobbridge.vn">hotro@jobbridge.vn</a></li>
                    <li><strong>Hotline:</strong> (024) 6680 5588</li>
                    <li><strong>Địa chỉ:</strong> Tầng 5, Tòa nhà JobBridge, Cầu Giấy, Hà Nội</li>
                </ul>
            </>
        ),
    },
]

export default function Terms() {
    return (
        <LegalPageLayout
            title="Điều khoản sử dụng"
            lastUpdated="01/05/2026"
            sections={SECTIONS}
            otherPage={{ to: '/privacy', label: 'Chính sách bảo mật' }}
        />
    )
}
