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

async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }
  const access = token.getAccess()
  if (access) headers.Authorization = `Bearer ${access}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.status}`)
  }
  return data
}

export const auth = {
  login: (email, password) => apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }),
  register: (email, password, role) => apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  }),
  logout: () => apiFetch("/auth/logout", { method: "POST" }),
}
