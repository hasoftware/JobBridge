const CURRENCY_SYMBOLS = {
    USD: "$",
    VND: "₫",
    EUR: "€",
    GBP: "£",
    SGD: "S$",
    JPY: "¥",
}

export function formatSalary(job) {
    if (!job) return ""
    const { salary_min, salary_max, currency } = job
    if (!salary_min && !salary_max) return "Thoả thuận"

    const cur = currency || "USD"
    const sym = CURRENCY_SYMBOLS[cur] || cur
    const fmt = (v) => Number(v).toLocaleString()

    if (salary_min && salary_max) {
        return `${sym} ${fmt(salary_min)} - ${fmt(salary_max)}`
    }
    if (salary_min) return `${sym} ${fmt(salary_min)}+`
    return `${sym} đến ${fmt(salary_max)}`
}

export function compareSalary(a, b) {
    return (b.salary_max || b.salary_min || 0) - (a.salary_max || a.salary_min || 0)
}
