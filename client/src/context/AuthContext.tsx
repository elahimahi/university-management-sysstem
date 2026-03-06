import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthResponse } from '@/types'
import { authAPI } from '@/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (token) {
          const response = await authAPI.me()
          setUser((response.data as { user: User }).user)
        }
      } catch {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password)
      const { token, user: userData } = response.data as AuthResponse
      
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      throw error
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authAPI.register({ name, email, password })
      const { token, user: userData } = response.data as AuthResponse
      
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      throw error
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch {
      // Continue logout even if API call fails
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
