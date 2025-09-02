import { Routes, Route, Navigate } from 'react-router-dom'
import HomePageRoutes from '@/pages/HomePageRoutes'
import AuthRoutes from '@/pages/AuthRoutes'
import EventsRoutes from '@/pages/EventsRoutes'
import DashboardRoutes from '@/pages/DashboardRoutes'
import ErrorPage from '@/pages/error/ErrorPage'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'

function App() {
  const { ProtectedRoute } = useProtectedRoute()
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<Navigate replace to="/home" />} />
        <Route path="/home/*" element={<HomePageRoutes />} />
        <Route path="/auth/*" element={<AuthRoutes />} />
        <Route path="/events/*" element={<EventsRoutes />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardRoutes />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </div>
  )
}

export default App
