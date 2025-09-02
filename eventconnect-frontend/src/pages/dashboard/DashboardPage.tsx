import { useAuthStore } from '@/lib/store/auth-store'
import { useQuery } from '@tanstack/react-query'
import { eventsApi } from '@/lib/api/events'
import { participationsApi } from '@/lib/api/participations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role || 'participant'

  const { data: myEvents } = useQuery({
    queryKey: ['my-events'],
    queryFn: () => eventsApi.myEvents(),
    enabled: role !== 'participant',
  })

  const { data: myParts } = useQuery({
    queryKey: ['my-participations'],
    queryFn: () => participationsApi.myParticipations(),
    enabled: true,
  })

  const eventsCount = Array.isArray(myEvents) ? myEvents.length : 0
  const partsArray = Array.isArray((myParts as any)?.data) ? (myParts as any).data : (Array.isArray(myParts) ? myParts : [])
  const partsCount = partsArray.length

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profil</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <div><span className="text-muted-foreground">Nom:</span> {user?.name}</div>
          <div><span className="text-muted-foreground">Email:</span> {user?.email}</div>
          <div><span className="text-muted-foreground">Rôle:</span> {role}</div>
          <div className="pt-3">
            <Button asChild size="sm" variant="outline"><Link to="/dashboard/profile">Modifier le profil</Link></Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mes participations</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div>Total: {partsCount}</div>
          <Button asChild size="sm" variant="outline"><Link to="/dashboard/participations">Voir</Link></Button>
        </CardContent>
      </Card>

      {(role === 'organisateur' || role === 'admin') && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Mes événements</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div>Total: {eventsCount}</div>
            <div className="flex gap-2">
              <Button asChild size="sm"><Link to="/dashboard/events/create">Créer un événement</Link></Button>
              <Button asChild size="sm" variant="outline"><Link to="/dashboard/events">Gérer</Link></Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 