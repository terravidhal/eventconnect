import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Administration — Vue d'ensemble</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Modération des événements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Approuver, annuler ou supprimer des événements problématiques.</p>
            <Button asChild size="sm"><Link to="/dashboard/admin/events">Ouvrir</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gestion des utilisateurs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Consulter, bloquer, promouvoir les utilisateurs.</p>
            <Button asChild size="sm"><Link to="/dashboard/admin/users">Ouvrir</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Statistiques globales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Vue globale: nombre d'événements, participations, taux de remplissage.</p>
            <Button asChild size="sm"><Link to="/dashboard/admin/stats">Ouvrir</Link></Button>
          </CardContent>
        </Card>
        {/*<Card>
          <CardHeader>
            <CardTitle className="text-base">Maintenance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Actions techniques: nettoyage, vérifications.</p>
            <Button asChild size="sm"><Link to="/dashboard/admin/maintenance">Ouvrir</Link></Button>
          </CardContent>
        </Card>*/}
      </div>
    </div>
  )
} 