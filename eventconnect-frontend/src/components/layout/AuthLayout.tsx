import { Link } from 'react-router-dom'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="container mx-auto p-4 flex items-center justify-between">
        <Link to="/home" className="text-xl font-semibold">EventConnect</Link>
        <Link to="/home" className="text-sm underline text-muted-foreground">Retour à l'accueil</Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {children}
        </div>
      </main>
    </div>
  )
} 