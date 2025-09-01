import { Routes, Route, Navigate } from 'react-router-dom'
import { ModeToggle } from '@/components/mode-toggle'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">EventConnect</h1>
          <ModeToggle />
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Bienvenue sur EventConnect
          </h2>
          <p className="text-muted-foreground mb-8">
            La plateforme de gestion d'événements
          </p>
          
          <div className="space-y-4">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-medium mb-2">Phase 1 Terminée ✅</h3>
              <p className="text-sm text-muted-foreground">
                Configuration et structure de base avec Vite + React + TypeScript + Shadcn/ui
              </p>
            </div>
            
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-medium mb-2">Prochaine étape</h3>
              <p className="text-sm text-muted-foreground">
                Phase 2 : Authentification et gestion d'état
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
