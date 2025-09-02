import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { eventsApi } from '@/lib/api/events'
import type { Event } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ParticipationDialog from '@/components/events/ParticipationDialog'

export default function EventDetailPage() {
  const { id } = useParams()
  const eventId = Number(id)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['event', eventId],
    enabled: Number.isFinite(eventId) && eventId > 0,
    queryFn: () => eventsApi.get(eventId),
  })

  if (!Number.isFinite(eventId)) return <p className="text-destructive">ID invalide</p>
  if (isLoading) return <p className="text-muted-foreground">Chargement...</p>
  if (isError || !data) return <p className="text-destructive">Événement introuvable.</p>

  const e = data as Event

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{e.title}</h2>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/events">Retour</Link></Button>
          <ParticipationDialog eventId={e.id} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><span className="text-muted-foreground">Date:</span> {new Date(e.date).toLocaleString()}</div>
          <div><span className="text-muted-foreground">Lieu:</span> {e.location}</div>
          {typeof e.price === 'number' && <div><span className="text-muted-foreground">Prix:</span> {e.price} €</div>}
          <div className="text-muted-foreground">{e.description}</div>
        </CardContent>
      </Card>
    </div>
  )
} 