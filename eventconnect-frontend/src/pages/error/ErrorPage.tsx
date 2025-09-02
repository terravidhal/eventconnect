import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function ErrorPage() {
  return (
    <div className="text-center space-y-6 py-16">
      <div>
        <h2 className="text-4xl font-bold">404</h2>
        <p className="text-muted-foreground mt-2">La page demandée n'existe pas.</p>
      </div>
      <div className="flex items-center justify-center gap-3">
        <Button asChild>
          <Link to="/home">Retour à l'accueil</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/events">Voir les événements</Link>
        </Button>
      </div>
    </div>
  )
} 