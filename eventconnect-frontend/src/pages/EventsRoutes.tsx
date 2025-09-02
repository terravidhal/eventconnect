import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import EventsListPage from './events/EventsListPage'
import EventDetailPage from './events/EventDetailPage'
import MainLayout from '@/components/layout/MainLayout'
import SearchPage from '@/pages/events/SearchPage'

export default function EventsRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout><Outlet /></MainLayout>}>
        <Route path="" element={<EventsListPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path=":id" element={<EventDetailPage />} />
        <Route path="*" element={<Navigate to="/events" replace />} />
      </Route>
    </Routes>
  )
} 