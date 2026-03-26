import { createContext, useContext, useState, useCallback } from 'react'

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
  const isVerified = !!user?.is_verified

  const login = useCallback((userData) => {
    setUser(userData)
    localStorage.setItem('jb_user', JSON.stringify(userData))
    return userData
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('jb_user')
    setUser(null)
  }, [])

  const getUser = useCallback(() => user, [user])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isRecruiter, isVerified, login, logout, getUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
