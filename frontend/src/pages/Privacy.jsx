import LegalPageLayout from '../components/legal/LegalPageLayout'

const SECTIONS = [
    {
        id: 'intro',
        title: 'Giới thiệu',
        content: (
            <>
                <p>
                    JobBridge ("chúng tôi", "JobBridge") cam kết bảo vệ thông tin cá nhân của người dùng khi sử dụng nền tảng kết nối việc làm tại địa chỉ <strong>jobbridge.vn</strong> và các ứng dụng liên quan.
                </p>
                <p>
                    Chính sách này mô tả cách chúng tôi thu thập, sử dụng, lưu trữ và chia sẻ thông tin cá nhân của bạn khi bạn truy cập, đăng ký tài khoản hoặc sử dụng dịch vụ. Bằng việc sử dụng JobBridge, bạn đồng ý với các điều khoản trong chính sách này.
                </p>
            </>
        ),
    },
    {
        id: 'collect',
        title: 'Thông tin chúng tôi thu thập',
        content: (
            <>
                <p><strong>Thông tin bạn cung cấp trực tiếp:</strong></p>
                <ul>
                    <li>Thông tin tài khoản: họ tên, email, số điện thoại, mật khẩu (đã mã hóa).</li>
                    <li>Thông tin hồ sơ: ngày sinh, giới tính, địa chỉ, ảnh đại diện, sơ yếu lý lịch.</li>
                    <li>Nội dung CV và Cover Letter: kinh nghiệm làm việc, học vấn, kỹ năng, mục tiêu nghề nghiệp.</li>
                    <li>Thông tin doanh nghiệp (đối với nhà tuyển dụng): tên công ty, mã số thuế, địa chỉ, lĩnh vực.</li>
                    <li>Nội dung tương tác: tin nhắn với nhà tuyển dụng, đơn ứng tuyển, đánh giá.</li>
                </ul>
                <p><strong>Thông tin tự động thu thập:</strong></p>
                <ul>
                    <li>Địa chỉ IP, loại thiết bị, hệ điều hành, trình duyệt.</li>
                    <li>Lịch sử truy cập, trang đã xem, thời gian truy cập.</li>
                    <li>Thông tin từ cookies và công nghệ tracking tương tự.</li>
                    <li>Vị trí địa lý ước lượng (không phải GPS chính xác).</li>
                </ul>
            </>
        ),
    },
    {
        id: 'usage',
        title: 'Cách sử dụng thông tin',
        content: (
            <>
                <p>Chúng tôi sử dụng thông tin của bạn để:</p>
                <ul>
                    <li>Cung cấp, vận hành và cải thiện dịch vụ JobBridge.</li>
                    <li>Xác thực tài khoản, bảo mật và phòng chống gian lận.</li>
                    <li>Gợi ý việc làm phù hợp dựa trên hồ sơ và hành vi người dùng.</li>
                    <li>Kết nối ứng viên với nhà tuyển dụng quan tâm.</li>
                    <li>Gửi thông báo về trạng thái đơn ứng tuyển, tin nhắn từ nhà tuyển dụng.</li>
                    <li>Gửi email tin tức, mẹo nghề nghiệp (chỉ khi bạn đồng ý nhận).</li>
                    <li>Phân tích, thống kê để nâng cao chất lượng dịch vụ.</li>
                    <li>Tuân thủ nghĩa vụ pháp lý.</li>
                </ul>
            </>
        ),
    },
    {
        id: 'sharing',
        title: 'Chia sẻ với bên thứ ba',
        content: (
            <>
                <p>Chúng tôi <strong>không bán</strong> thông tin cá nhân của bạn cho bên thứ ba. Chúng tôi chỉ chia sẻ trong các trường hợp:</p>
                <ul>
                    <li><strong>Với nhà tuyển dụng:</strong> Khi bạn ứng tuyển, hồ sơ và CV bạn chọn sẽ được chia sẻ với nhà tuyển dụng đó.</li>
                    <li><strong>Với đối tác cung cấp dịch vụ:</strong> Hosting (AWS), email transactional, dịch vụ phân tích (Google Analytics) — chỉ thông tin cần thiết để vận hành.</li>
                    <li><strong>Theo yêu cầu pháp luật:</strong> Khi có quyết định của cơ quan nhà nước có thẩm quyền theo quy định pháp luật Việt Nam.</li>
                    <li><strong>Để bảo vệ quyền lợi:</strong> Khi cần thiết để phát hiện, ngăn chặn gian lận, lạm dụng dịch vụ.</li>
                </ul>
                <p>Tất cả đối tác đều phải cam kết bảo mật thông tin theo tiêu chuẩn không thấp hơn JobBridge.</p>
            </>
        ),
    },
    {
        id: 'cookies',
        title: 'Cookies & công nghệ tracking',
        content: (
            <>
                <p>JobBridge sử dụng cookies và công nghệ tương tự để:</p>
                <ul>
                    <li><strong>Cookies bắt buộc:</strong> Duy trì phiên đăng nhập, ghi nhớ tùy chọn ngôn ngữ.</li>
                    <li><strong>Cookies hiệu năng:</strong> Đo lường tốc độ tải trang, phát hiện lỗi.</li>
                    <li><strong>Cookies phân tích:</strong> Hiểu hành vi người dùng để cải thiện sản phẩm.</li>
                    <li><strong>Cookies cá nhân hóa:</strong> Gợi ý việc làm phù hợp với sở thích.</li>
                </ul>
                <p>
                    Bạn có thể tắt cookies trong cài đặt trình duyệt, tuy nhiên một số tính năng có thể không hoạt động đúng. JobBridge không sử dụng cookies tracking từ các mạng quảng cáo bên thứ ba.
                </p>
            </>
        ),
    },
    {
        id: 'rights',
        title: 'Quyền của người dùng',
        content: (
            <>
                <p>Bạn có các quyền sau đối với thông tin cá nhân của mình:</p>
                <ul>
                    <li><strong>Quyền truy cập:</strong> Xem toàn bộ thông tin chúng tôi đang lưu về bạn tại trang Hồ sơ.</li>
                    <li><strong>Quyền chỉnh sửa:</strong> Cập nhật thông tin tại bất kỳ thời điểm nào.</li>
                    <li><strong>Quyền xóa:</strong> Yêu cầu xóa tài khoản và toàn bộ dữ liệu liên quan.</li>
                    <li><strong>Quyền hạn chế xử lý:</strong> Tạm dừng việc sử dụng dữ liệu cho mục đích cụ thể.</li>
                    <li><strong>Quyền rút lại đồng ý:</strong> Hủy nhận email marketing, tắt thông báo bất kỳ lúc nào trong cài đặt.</li>
                    <li><strong>Quyền khiếu nại:</strong> Liên hệ <a href="mailto:hotro@jobbridge.vn">hotro@jobbridge.vn</a> nếu cho rằng quyền của bạn bị vi phạm.</li>
                </ul>
                <p>Chúng tôi sẽ phản hồi yêu cầu của bạn trong vòng 30 ngày làm việc.</p>
            </>
        ),
    },
    {
        id: 'security',
        title: 'Bảo mật dữ liệu',
        content: (
            <>
                <p>Chúng tôi áp dụng nhiều biện pháp bảo mật để bảo vệ thông tin của bạn:</p>
                <ul>
                    <li>Mã hóa mật khẩu bằng thuật toán bcrypt.</li>
                    <li>Truyền dữ liệu qua giao thức HTTPS/TLS.</li>
                    <li>Kiểm soát truy cập nội bộ theo nguyên tắc least privilege.</li>
                    <li>Giám sát log truy cập, phát hiện hành vi bất thường.</li>
                    <li>Sao lưu dữ liệu định kỳ, có kế hoạch khôi phục thảm họa.</li>
                    <li>Hỗ trợ xác thực 2 yếu tố (2FA) qua TOTP để tăng cường bảo mật tài khoản.</li>
                </ul>
                <p>
                    Mặc dù vậy, không có hệ thống nào an toàn 100%. Bạn có trách nhiệm giữ bí mật mật khẩu của mình. Nếu nghi ngờ tài khoản bị xâm nhập, vui lòng đổi mật khẩu và liên hệ ngay với chúng tôi.
                </p>
            </>
        ),
    },
    {
        id: 'updates',
        title: 'Cập nhật chính sách',
        content: (
            <>
                <p>
                    Chúng tôi có thể cập nhật chính sách này theo thời gian để phản ánh thay đổi về dịch vụ, công nghệ hoặc quy định pháp luật.
                </p>
                <p>
                    Khi có thay đổi quan trọng, chúng tôi sẽ thông báo qua email đăng ký hoặc thông báo nổi bật trên trang web ít nhất 14 ngày trước khi áp dụng. Việc bạn tiếp tục sử dụng dịch vụ sau ngày hiệu lực được xem là đồng ý với chính sách mới.
                </p>
            </>
        ),
    },
    {
        id: 'contact',
        title: 'Liên hệ',
        content: (
            <>
                <p>Mọi thắc mắc liên quan đến Chính sách bảo mật, vui lòng liên hệ:</p>
                <ul>
                    <li><strong>Email:</strong> <a href="mailto:hotro@jobbridge.vn">hotro@jobbridge.vn</a></li>
                    <li><strong>Hotline:</strong> (024) 6680 5588</li>
                    <li><strong>Địa chỉ:</strong> Tầng 5, Tòa nhà JobBridge, Cầu Giấy, Hà Nội</li>
                </ul>
            </>
        ),
    },
]

export default function Privacy() {
    return (
        <LegalPageLayout
            title="Chính sách bảo mật"
            lastUpdated="01/05/2026"
            sections={SECTIONS}
            otherPage={{ to: '/terms', label: 'Điều khoản sử dụng' }}
        />
    )
}
