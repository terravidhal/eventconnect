import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import ProfilePage from '@/pages/dashboard/ProfilePage'
import CreateEventPage from '@/pages/dashboard/events/CreateEventPage'
import EditEventPage from '@/pages/dashboard/events/EditEventPage'
import ManageEventsPage from '@/pages/dashboard/events/ManageEventsPage'
import ParticipationsPage from '@/pages/dashboard/ParticipationsPage'
import CheckInPage from '@/pages/dashboard/events/CheckInPage'
import NotificationsPage from '@/pages/dashboard/NotificationsPage'
import AdminDashboardPage from '@/pages/dashboard/admin/AdminDashboardPage'
import ModerateEventsPage from '@/pages/dashboard/admin/ModerateEventsPage'
import UsersAdminPage from '@/pages/dashboard/admin/UsersAdminPage'
import GlobalStatsPage from '@/pages/dashboard/admin/GlobalStatsPage'


export default function DashboardRoutes() {
  const { RoleProtectedRoute } = useProtectedRoute()
  return (
    <Routes>
      <Route element={<DashboardLayout><Outlet /></DashboardLayout>}>
        <Route path="" element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="participations" element={<ParticipationsPage />} />
        <Route
          path="events"
          element={
            <RoleProtectedRoute allowedRoles={["organisateur", "admin"]}>
              <ManageEventsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="events/create"
          element={
            <RoleProtectedRoute allowedRoles={["organisateur", "admin"]}>
              <CreateEventPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="events/:id/edit"
          element={
            <RoleProtectedRoute allowedRoles={["organisateur", "admin"]}>
              <EditEventPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="events/checkin"
          element={
            <RoleProtectedRoute allowedRoles={["organisateur", "admin"]}>
              <CheckInPage />
            </RoleProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="admin"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboardPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="admin/events"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <ModerateEventsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <UsersAdminPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="admin/stats"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <GlobalStatsPage />
            </RoleProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
} 