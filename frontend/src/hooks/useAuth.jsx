import { createContext, useContext, useState, useCallback } from 'react'
import { auth, token } from '../services/api'

const AuthContext = createContext(null)

const PENDING_KEY = 'jb_pending'

function getPending() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY) || 'null')
  } catch {
    return null
  }
}

function setPending(data) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(data))
}

function clearPending() {
  localStorage.removeItem(PENDING_KEY)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('jb_user')
      return u ? JSON.parse(u) : null
    } catch {
      return null
    }
  })

  const isAuthenticated = !!user
  const isRecruiter = user?.role === 'recruiter'
  const isAdmin = user?.role === 'admin'
  const isVerified = !!user?.is_verified

  const persist = useCallback((userData) => {
    setUser(userData)
    localStorage.setItem('jb_user', JSON.stringify(userData))
    return userData
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await auth.login(email, password)
    token.set(data.access_token, data.refresh_token)
    return persist({
      public_id: data.public_id || null,
      email: data.email,
      full_name: data.full_name || '',
      role: data.role,
      is_verified: !!data.is_verified,
    })
  }, [persist])

  const register = useCallback(async ({ full_name, email, password, role }) => {
    const data = await auth.register({ full_name, email, password, role })
    setPending({
      token: data.pending_token,
      email: data.email,
      expires_at: Date.now() + (data.expires_in || 600) * 1000,
    })
    return data
  }, [])

  const verifyEmail = useCallback(async (code) => {
    const pending = getPending()
    if (!pending?.token) {
      const err = new Error('Phiên đăng ký không tồn tại, vui lòng đăng ký lại')
      err.expired = true
      throw err
    }

    const data = await auth.verifyEmail(pending.token, code)
    clearPending()
    return data
  }, [])

  const resendOtp = useCallback(async () => {
    const pending = getPending()
    if (!pending?.token) {
      throw new Error('Phiên đăng ký không tồn tại, vui lòng đăng ký lại')
    }

    const data = await auth.resendOtp(pending.token)
    setPending({
      token: data.pending_token,
      email: data.email,
      expires_at: Date.now() + (data.expires_in || 600) * 1000,
    })
    return data
  }, [])

  const cancelRegistration = useCallback(() => {
    clearPending()
  }, [])

  const syncUserFields = useCallback((data) => {
    return persist({
      public_id: data.public_id ?? null,
      email: data.email,
      full_name: data.full_name || '',
      role: data.role,
      is_verified: !!data.is_verified,
    })
  }, [persist])

  const refreshUser = useCallback(async () => {
    const data = await auth.me()
    syncUserFields(data)
    return data
  }, [syncUserFields])

  const updateProfile = useCallback(async (payload) => {
    const data = await auth.updateProfile(payload)
    syncUserFields(data)
    return data
  }, [syncUserFields])

  const getPendingEmail = useCallback(() => getPending()?.email || null, [])

  const logout = useCallback(async () => {
    try {
      await auth.logout()
    } catch {}
    token.clear()
    localStorage.removeItem('jb_user')
    setUser(null)
  }, [])

  const getUser = useCallback(() => user, [user])

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isRecruiter,
      isAdmin,
      isVerified,
      login,
      register,
      verifyEmail,
      resendOtp,
      cancelRegistration,
      getPendingEmail,
      logout,
      getUser,
      refreshUser,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
