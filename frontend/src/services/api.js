const BASE = (import.meta.env?.VITE_API_URL || "http://localhost:3000") + "/api/v1"

export const API_BASE = BASE

export const token = {
  getAccess: () => localStorage.getItem("access_token"),
  getRefresh: () => localStorage.getItem("refresh_token"),
  setAccess: (t) => localStorage.setItem("access_token", t),
  set: (a, r) => {
    localStorage.setItem("access_token", a)
    if (r != null) localStorage.setItem("refresh_token", r)
  },
  clear: () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
  },
}

let refreshPromise = null

async function refreshAccessToken() {
  const refresh = token.getRefresh()
  if (!refresh) throw new Error("no_refresh_token")

  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("refresh_failed")
        const data = await res.json()
        token.setAccess(data.access_token)
        return data.access_token
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

function handleAuthFailure() {
  token.clear()
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login"
  }
}

async function apiFetch(path, options = {}, _retried = false) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }
  const access = token.getAccess()
  if (access) headers.Authorization = `Bearer ${access}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (res.status === 401 && access && !_retried && path !== "/auth/refresh") {
    try {
      await refreshAccessToken()
      return apiFetch(path, options, true)
    } catch {
      handleAuthFailure()
      const err = new Error("Phiên đăng nhập đã hết hạn")
      err.status = 401
      throw err
    }
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const message = data.message
      || (Array.isArray(data.errors) ? data.errors.join("; ") : null)
      || `Request failed: ${res.status}`
    const err = new Error(message)
    err.status = res.status
    err.errors = Array.isArray(data.errors) ? data.errors : []
    throw err
  }
  return data
}

export const auth = {
  login: (email, password) => apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }),
  register: (payload) => apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  logout: () => apiFetch("/auth/logout", { method: "POST" }),
  verifyEmail: (pending_token, code) => apiFetch("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ pending_token, code }),
  }),
  resendOtp: (pending_token) => apiFetch("/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({ pending_token }),
  }),
}

export const admin = {
  getEmailSettings: () => apiFetch("/admin/settings/email"),
  saveEmailSettings: (config) => apiFetch("/admin/settings/email", {
    method: "PUT",
    body: JSON.stringify(config),
  }),
  testEmailSettings: () => apiFetch("/admin/settings/email/test", { method: "POST" }),
}
