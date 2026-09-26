import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '../lib/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => api.currentUser())
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(() => {
    setUser(api.currentUser())
  }, [])

  const login = useCallback(async (identifier, password) => {
    const u = api.login(identifier, password)
    setUser(u)
    return u
  }, [])

  const register = useCallback(async (payload) => {
    const u = api.register(payload)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    api.logout()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, refresh, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
