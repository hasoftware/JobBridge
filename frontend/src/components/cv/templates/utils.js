export function formatDate(value) {
    if (!value) return ''
    if (/^\d{4}-\d{2}$/.test(value)) {
        const [y, m] = value.split('-')
        return `${m}/${y}`
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
        const [y, m, d] = value.slice(0, 10).split('-')
        return `${d}/${m}/${y}`
    }
    return value
}

export function periodText(from, to) {
    const f = formatDate(from)
    const t = to ? formatDate(to) : 'Hiện tại'
    if (!f) return t
    return `${f} → ${t}`
}

export const SAMPLE_DATA = {
    personal: {
        full_name: 'Nguyễn Văn An',
        headline: 'Frontend Developer',
        email: 'an.nguyen@example.com',
        phone: '0901 234 567',
        address: 'Quận 1, TP.HCM',
        date_of_birth: '1998-05-12',
        links: [
            { label: 'GitHub', url: 'github.com/nguyenvanan' },
            { label: 'LinkedIn', url: 'linkedin.com/in/nguyenvanan' },
        ],
    },
    summary: 'Lập trình viên Frontend với 3 năm kinh nghiệm React, đam mê tạo trải nghiệm người dùng mượt mà và sản phẩm có tác động tích cực.',
    experience: [
        {
            position: 'Senior Frontend Developer',
            company: 'TechCorp Vietnam',
            from: '2023-06',
            to: '',
            description: 'Dẫn dắt team 4 người xây dựng nền tảng e-commerce; cải thiện hiệu năng 40%.',
        },
        {
            position: 'Frontend Developer',
            company: 'StartupHub',
            from: '2021-08',
            to: '2023-05',
            description: 'Phát triển giao diện ứng dụng React Native và web responsive.',
        },
    ],
    education: [
        {
            degree: 'Kỹ sư Công nghệ Thông tin',
            school: 'Đại học Bách Khoa TP.HCM',
            from: '2017-09',
            to: '2021-06',
            description: 'GPA 3.6/4.0',
        },
    ],
    skills: [
        { name: 'React / Next.js', level: 'Thành thạo' },
        { name: 'TypeScript', level: 'Thành thạo' },
        { name: 'Node.js', level: 'Khá' },
        { name: 'Tailwind CSS', level: 'Thành thạo' },
    ],
}
