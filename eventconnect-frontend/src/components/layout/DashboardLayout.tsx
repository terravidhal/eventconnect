import { Link, NavLink } from 'react-router-dom'
import { useAuthStore } from '@/lib/store/auth-store'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const role = user?.role || 'participant'

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="w-64 border-r hidden md:block">
          <div className="p-4 font-semibold text-lg">
            <Link to="/dashboard">Dashboard</Link>
          </div>
          <nav className="p-2 space-y-1 text-sm text-muted-foreground">
            <NavLink to="/dashboard" end className={({ isActive }) => (isActive ? 'block px-3 py-2 rounded bg-muted text-foreground' : 'block px-3 py-2 rounded')}>Aperçu</NavLink>
            <NavLink to="/dashboard/profile" className={({ isActive }) => (isActive ? 'block px-3 py-2 rounded bg-muted text-foreground' : 'block px-3 py-2 rounded')}>Profil</NavLink>
            {role === 'participant' && (
              <NavLink to="/dashboard/participations" className={({ isActive }) => (isActive ? 'block px-3 py-2 rounded bg-muted text-foreground' : 'block px-3 py-2 rounded')}>Mes participations</NavLink>
            )}
            {/* Section Événements - Seulement pour organisateurs et admin */}
            {(role === 'organisateur' || role === 'admin') && (
              <NavLink to="/dashboard/events" className={({ isActive }) => (isActive ? 'block px-3 py-2 rounded bg-muted text-foreground' : 'block px-3 py-2 rounded')}>Événements</NavLink>
            )}
          </nav>
        </aside>
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  )
}
