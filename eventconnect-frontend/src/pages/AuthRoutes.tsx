import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import LoginPage from './auth/LoginPage'
import RegisterPage from './auth/RegisterPage'
import AuthLayout from '@/components/layout/AuthLayout'

export default function AuthRoutes() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  )
}
