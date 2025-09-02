import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-6 py-8 text-sm text-muted-foreground grid gap-4 md:grid-cols-3">
        <div>
          <div className="font-semibold text-foreground">EventConnect</div>
          <p className="mt-2">Connectez-vous aux meilleurs événements près de chez vous.</p>
        </div>
        <div className="flex gap-6">
          <div>
            <div className="font-medium text-foreground">Produit</div>
            <ul className="space-y-1 mt-2">
              <li><Link to="/events">Événements</Link></li>
              <li><Link to="/home/about">À propos</Link></li>
              <li><Link to="/home/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-foreground">Compte</div>
            <ul className="space-y-1 mt-2">
              <li><Link to="/auth/login">Connexion</Link></li>
              <li><Link to="/auth/register">Inscription</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
            </ul>
          </div>
        </div>
        <div className="md:text-right">© {new Date().getFullYear()} EventConnect. Tous droits réservés.</div>
      </div>
    </footer>
  )
} 