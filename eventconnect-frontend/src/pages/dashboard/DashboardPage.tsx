import { useAuthStore } from '@/lib/store/auth-store'
import { useQuery } from '@tanstack/react-query'
import { eventsApi } from '@/lib/api/events'
import { participationsApi } from '@/lib/api/participations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role || 'participant'

  const { data: myEvents } = useQuery({
    queryKey: ['my-events'],
    queryFn: () => eventsApi.myEvents(),
    enabled: role !== 'participant', // Seuls les organisateurs/admin voient leurs événements
  })

  const { data: myParts } = useQuery({
    queryKey: ['my-participations'],
    queryFn: () => participationsApi.myParticipations(),
    enabled: true,
  })

  // Calculer le nombre d'événements organisés (seulement pour organisateurs/admin)
  const eventsCount = Array.isArray(myEvents) ? myEvents.length : 0
  
  // Calculer le nombre de participations (pour tous les utilisateurs)
  // La réponse de l'API est: { participations: [...] }
  const partsArray = Array.isArray((myParts as any)?.participations) 
    ? (myParts as any).participations 
    : []
  const partsCount = partsArray.length

  return (
    <div className="space-y-6">
      {/* Bouton retour vers la page events */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link to="/events" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour aux événements
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Card Profil */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profil</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <div><span className="text-muted-foreground">Nom:</span> {user?.name}</div>
            <div><span className="text-muted-foreground">Email:</span> {user?.email}</div>
            <div><span className="text-muted-foreground">Rôle:</span> {role}</div>
            <div className="pt-3">
              <Button asChild size="sm" variant="outline">
                <Link to="/dashboard/profile">Modifier le profil</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card Participations - Visible pour tous */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mes participations</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>Total: {partsCount}</div>
            <Button asChild size="sm" variant="outline">
              <Link to="/dashboard/participations">Voir</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Card Événements - Seulement pour organisateurs et admin */}
        {(role === 'organisateur' || role === 'admin') && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Mes événements</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div>Total: {eventsCount}</div>
              <div className="flex gap-2">
                <Button asChild size="sm">
                  <Link to="/dashboard/events/create">Créer un événement</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/dashboard/events">Gérer</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
