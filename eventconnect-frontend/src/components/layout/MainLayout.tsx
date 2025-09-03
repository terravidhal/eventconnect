import { Link, NavLink } from 'react-router-dom'
import { ModeToggle } from '@/components/mode-toggle'
import SearchBar from '@/components/events/SearchBar'
import { Calendar } from 'lucide-react'
import NavBar from '@/components/layout/NavBar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar />
      <main className="container mx-auto px-6 py-10 flex-1">
        {children}
      </main>
    </div>
  )
} 