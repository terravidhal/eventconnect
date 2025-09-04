import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import SearchBar from '@/components/events/SearchBar'
import { Calendar, LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react'
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
            <Link to="/" className={`relative group px-3 py-2 text-sm font-medium transition-all duration-200 hover:text-primary ${location.pathname === "/" ? "text-primary font-semibold" : ""}`}>
              Accueil
              <span className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-200 ${location.pathname === "/" ? "w-full" : "w-0 group-hover:w-full"}`}></span>
            </Link>
            <Link to="/events" className={`relative group px-3 py-2 text-sm font-medium transition-all duration-200 hover:text-primary ${location.pathname === "/events" ? "text-primary font-semibold" : ""}`}>
              Événements
              <span className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-200 ${location.pathname === "/events" ? "w-full" : "w-0 group-hover:w-full"}`}></span>
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
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent) {
                            const fallback = document.createElement('div')
                            fallback.className = 'w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-sm font-semibold'
                            fallback.textContent = (user.name || 'U').charAt(0).toUpperCase()
                            parent.appendChild(fallback)
                          }
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-sm font-semibold">
                        {(user.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium">{user.name || 'Utilisateur'}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Tableau de bord
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Mon profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-4">
            <div className="space-y-2">
              <Link 
                to="/" 
                className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${location.pathname === "/" ? "text-primary bg-primary/10" : "hover:bg-muted/50"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link 
                to="/events" 
                className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${location.pathname === "/events" ? "text-primary bg-primary/10" : "hover:bg-muted/50"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Événements
              </Link>
              {onLanding && (
                <>
                  <a 
                    href="#features" 
                    className="block px-4 py-3 text-sm font-medium rounded-lg transition-colors hover:bg-muted/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Fonctionnalités
                  </a>
                  <a 
                    href="#faq" 
                    className="block px-4 py-3 text-sm font-medium rounded-lg transition-colors hover:bg-muted/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    FAQ
                  </a>
                </>
              )}
              <div className="px-4 py-2">
                <SearchBar />
              </div>
              <div className="px-4 py-2">
                <ModeToggle />
              </div>
              {!user ? (
                <div className="px-4 py-2">
                  <Button asChild className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground">
                    <Link to="/auth/register" onClick={() => setIsMenuOpen(false)}>
                      Créer un compte
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="px-4 py-2 space-y-2">
                  <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-lg">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name || 'Avatar'} 
                        className="w-8 h-8 rounded-full object-cover border-2 border-primary/20"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent) {
                            const fallback = document.createElement('div')
                            fallback.className = 'w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-sm font-semibold'
                            fallback.textContent = (user.name || 'U').charAt(0).toUpperCase()
                            parent.appendChild(fallback)
                          }
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-sm font-semibold">
                        {(user.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium">{user.name || 'Utilisateur'}</span>
                  </div>
                  <button 
                    onClick={() => {
                      navigate('/dashboard')
                      setIsMenuOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-muted/50"
                  >
                    Tableau de bord
                  </button>
                  <button 
                    onClick={() => {
                      navigate('/profile')
                      setIsMenuOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-muted/50"
                  >
                    Mon profil
                  </button>
                  <button 
                    onClick={() => {
                      logout()
                      setIsMenuOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors text-destructive hover:bg-destructive/10"
                  >
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
