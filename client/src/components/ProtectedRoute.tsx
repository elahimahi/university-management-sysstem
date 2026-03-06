import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { User } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: User['role'] | User['role'][]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-brand-primary border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary dark:text-text-dark-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole) {
    const rolesArray = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!rolesArray.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return <>{children}</>
}
