import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getCurrentUser } from '../api/authApi'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(sessionStorage.getItem('token') || '')

  const refreshUserProfile = useCallback(async () => {
    const currentToken = sessionStorage.getItem('token')
    if (!currentToken) return
    try {
      const res = await getCurrentUser()
      if (res.data) {
        const dbUser = res.data
        const normalizedRole = typeof dbUser.role === 'object' && dbUser.role !== null
          ? dbUser.role.roleName
          : dbUser.role
        setUser(prev => {
          const merged = {
            ...prev,
            ...dbUser,
            userId: dbUser.userId || prev?.userId,
            role: normalizedRole || prev?.role || 'ROLE_CUSTOMER'
          }
          sessionStorage.setItem('user', JSON.stringify(merged))
          return merged
        })
      }
    } catch (e) {
      console.warn('Unable to sync live user profile from database:', e.message)
    }
  }, [])

  useEffect(() => {
    const savedUser = sessionStorage.getItem('user')
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        console.error('Failed to parse user from sessionStorage', e)
      }
    }
    if (token) {
      refreshUserProfile()
    }
    // Also clean up any legacy persistent localStorage to prevent stale account persistence across shutdowns
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }, [token, refreshUserProfile])

  const login = (authToken, userData) => {
    sessionStorage.setItem('token', authToken)
    sessionStorage.setItem('user', JSON.stringify(userData))
    setToken(authToken)
    setUser(userData)
    // Also trigger background database sync to get full phone, address, etc.
    setTimeout(() => {
      refreshUserProfile()
    }, 100)
  }

  const logout = () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('guestCart')
    setToken('')
    setUser(null)
  }

  const updateUser = (updatedData) => {
    const normalizedRole = typeof updatedData?.role === 'object' && updatedData.role !== null
      ? updatedData.role.roleName
      : updatedData?.role
    const merged = {
      ...user,
      ...updatedData,
      ...(normalizedRole ? { role: normalizedRole } : {})
    }
    sessionStorage.setItem('user', JSON.stringify(merged))
    setUser(merged)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoggedIn: !!token, 
      login, 
      logout, 
      updateUser,
      refreshUserProfile 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
