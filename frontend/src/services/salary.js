export function salaryStepForCurrency(currency) {
  const c = String(currency || "USD").toUpperCase()
  if (c === "VND") return 500_000
  if (c === "JPY" || c === "KRW") return 100_000
  if (c === "USD" || c === "EUR" || c === "GBP" || c === "SGD") return 1_000
  return 1_000
}

export function parseSalaryNumber(raw) {
  if (raw === "" || raw == null) return null
  const n = Number(raw)
  if (Number.isNaN(n)) return null
  return n
}

export function sanitizeSalaryInput(raw) {
  if (raw === "" || raw == null) return ""
  const n = Number(raw)
  if (Number.isNaN(n)) return ""
  return String(Math.max(0, n))
}

export function validateSalaryMinMax(minRaw, maxRaw) {
  const min = parseSalaryNumber(minRaw)
  const max = parseSalaryNumber(maxRaw)
  if (min != null && max != null && max < min) {
    return "Maximum salary must be greater than or equal to minimum salary."
  }
  return null
}
