import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/lib/store/auth-store'

export const useProtectedRoute = () => {
  const { isAuthenticated, user } = useAuthStore()

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to="/auth/login" replace />
    }
    return <>{children}</>
  }

  const RoleProtectedRoute = ({
    children,
    allowedRoles,
  }: {
    children: React.ReactNode
    allowedRoles: string[]
  }) => {
    if (!isAuthenticated) {
      return <Navigate to="/auth/login" replace />
    }
    if (!allowedRoles.includes(user?.role || '')) {
      return <Navigate to="/dashboard" replace />
    }
    return <>{children}</>
  }

  return { ProtectedRoute, RoleProtectedRoute }
} 