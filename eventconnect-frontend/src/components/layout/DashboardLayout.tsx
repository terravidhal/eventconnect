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
            {role === 'admin' && (
              <>
                <div className="px-3 pt-3 text-xs uppercase text-muted-foreground">Administration</div>
                <NavLink to="/dashboard/admin" className={({ isActive }) => (isActive ? 'block px-3 py-2 rounded bg-muted text-foreground' : 'block px-3 py-2 rounded')}>Vue d'ensemble</NavLink>
                <NavLink to="/dashboard/admin/events" className={({ isActive }) => (isActive ? 'block px-3 py-2 rounded bg-muted text-foreground' : 'block px-3 py-2 rounded')}>Modération des événements</NavLink>
                <NavLink to="/dashboard/admin/users" className={({ isActive }) => (isActive ? 'block px-3 py-2 rounded bg-muted text-foreground' : 'block px-3 py-2 rounded')}>Gestion des utilisateurs</NavLink>
                <NavLink to="/dashboard/admin/stats" className={({ isActive }) => (isActive ? 'block px-3 py-2 rounded bg-muted text-foreground' : 'block px-3 py-2 rounded')}>Statistiques globales</NavLink>
              </>
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
