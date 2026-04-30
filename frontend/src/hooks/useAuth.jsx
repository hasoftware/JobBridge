import { createContext, useContext, useState, useCallback } from 'react'
import { auth, token } from '../services/api'

const AuthContext = createContext(null)

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
      email: data.email,
      role: data.role,
      is_verified: !!data.is_verified,
    })
  }, [persist])

  const register = useCallback(async (email, password, role) => {
    await auth.register(email, password, role)
    return login(email, password)
  }, [login])

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
      logout,
      getUser,
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
