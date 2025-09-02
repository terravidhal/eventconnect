import { Link, NavLink } from 'react-router-dom'
import { ModeToggle } from '@/components/mode-toggle'
import SearchBar from '@/components/events/SearchBar'
import { Calendar } from 'lucide-react'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-4 h-16">
          <div className="flex items-center gap-6">
            <Link to="/home" className="flex items-center">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="ml-2 text-xl font-bold">EventConnect</span>
            </Link>
            <nav className="hidden md:flex gap-6 text-sm">
              <NavLink to="/events" className={({ isActive }) => isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}>
                Événements
              </NavLink>
              <a href="/home#features" className="text-muted-foreground hover:text-foreground">Fonctionnalités</a>
              <a href="/home#faq" className="text-muted-foreground hover:text-foreground">FAQ</a>
            </nav>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="w-[320px]"><SearchBar /></div>
            <ModeToggle />
            <Link to="/auth/register" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90">
              Créer un compte
            </Link>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <ModeToggle />
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-10 flex-1">
        {children}
      </main>
    </div>
  )
} 