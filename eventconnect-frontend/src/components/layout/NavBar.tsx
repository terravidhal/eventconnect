import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import SearchBar from '@/components/events/SearchBar'
import { Calendar, Menu, X, User } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth-store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const location = useLocation()
  const navigate = useNavigate()
  const onLanding = location.pathname === '/' || location.pathname === '/home'

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <div className="relative">
                <Calendar className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-200" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-primary to-foreground/80 bg-clip-text text-transparent">
                EventConnect
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="relative group px-3 py-2 text-sm font-medium transition-all duration-200 hover:text-primary">
              Accueil
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link to="/events" className="relative group px-3 py-2 text-sm font-medium transition-all duration-200 hover:text-primary">
              Événements
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
            </Link>
            {onLanding && (
              <>
                <a href="#features" className="relative group px-3 py-2 text-sm font-medium transition-all duration-200 hover:text-primary">
                  Fonctionnalités
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
                </a>
                <a href="#faq" className="relative group px-3 py-2 text-sm font-medium transition-all duration-200 hover:text-primary">
                  FAQ
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></span>
                </a>
              </>
            )}
            <div className="w-[280px]">
              <SearchBar />
            </div>
            <ModeToggle />
            {!user && (
              <Button asChild className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                <Link to="/auth/register">Créer un compte</Link>
              </Button>
            )}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name || 'Avatar'} 
                        className="w-8 h-8 rounded-full object-cover border-2 border-primary/20"
                        onError={(e) => {
                          // Fallback si l'image ne charge pas
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <div className={`w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold ${user.avatar ? 'hidden' : ''}`}>
                      {user.name?.slice(0,1)?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium max-w-[160px] truncate">{user.name || user.email}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/profile">Profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); logout(); navigate('/home', { replace: true }) }}>
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            <ModeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring rounded-lg p-2 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden animate-in slide-in-from-top-2 duration-200">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border/50 bg-background/95 backdrop-blur-md">
              <Link to="/" className="block px-3 py-2 hover:text-primary hover:bg-muted/50 rounded-md transition-colors">Accueil</Link>
              <Link to="/events" className="block px-3 py-2 hover:text-primary hover:bg-muted/50 rounded-md transition-colors">Événements</Link>
              {onLanding && (
                <>
                  <a href="#features" className="block px-3 py-2 hover:text-primary hover:bg-muted/50 rounded-md transition-colors">Fonctionnalités</a>
                  <a href="#faq" className="block px-3 py-2 hover:text-primary hover:bg-muted/50 rounded-md transition-colors">FAQ</a>
                </>
              )}
              <div className="px-3 py-2">
                <SearchBar />
              </div>
              {!user && (
                <Link to="/auth/register" className="block px-3 py-2 bg-primary text-primary-foreground rounded-md text-center font-medium">
                  Créer un compte
                </Link>
              )}
              {user && (
                <div className="px-3 py-2 space-y-1">
                  <div className="flex items-center gap-2 px-3 py-2">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name || 'Avatar'} 
                        className="w-6 h-6 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <div className={`w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold ${user.avatar ? 'hidden' : ''}`}>
                      {user.name?.slice(0,1)?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium">{user.name || user.email}</span>
                  </div>
                  <Link to="/dashboard" className="block px-3 py-2 hover:bg-muted rounded-md">Dashboard</Link>
                  <Link to="/dashboard/profile" className="block px-3 py-2 hover:bg-muted rounded-md">Profil</Link>
                  <button onClick={() => { logout(); navigate('/home', { replace: true }) }} className="w-full text-left px-3 py-2 hover:bg-muted rounded-md">Déconnexion</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
