import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '@/lib/api/events'
import type { Event } from '@/types'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState } from 'react'
import { participationsApi } from '@/lib/api/participations'

export default function ManageEventsPage() {
  const qc = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-events'],
    queryFn: () => eventsApi.myEvents(),
  })

  const removeMutation = useMutation({
    mutationFn: (id: number) => eventsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-events'] })
    }
  })

  const [participantsEvent, setParticipantsEvent] = useState<Event | null>(null)

  const { data: participantsData, isLoading: loadingParticipants } = useQuery({
    queryKey: ['event-participants', participantsEvent?.id],
    queryFn: () => participationsApi.participants(participantsEvent!.id),
    enabled: !!participantsEvent?.id,
  })

  if (isLoading) return <p className="text-muted-foreground">Chargement...</p>
  if (isError) return <p className="text-destructive">Erreur de chargement.</p>

  // Extraire le tableau d'événements de la réponse API (garde contre les formes différentes)
  const items = Array.isArray(data)
    ? (data as Event[])
    : (Array.isArray((data as any)?.events) ? ((data as any).events as Event[]) : [])

  const confirmed = Array.isArray(participantsData?.participants)
    ? participantsData.participants.filter((p: any) => p.status === 'inscrit')
    : []
  const waiting = Array.isArray(participantsData?.participants)
    ? participantsData.participants.filter((p: any) => p.status === 'en_attente')
    : []

  const fillRate = participantsEvent && participantsEvent.capacity
    ? Math.round(((confirmed.length || 0) / participantsEvent.capacity) * 100)
    : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm"><Link to="/events">Retour aux événements</Link></Button>
          <h2 className="text-2xl font-semibold">Mes événements</h2>
        </div>
        <Button asChild><Link to="/dashboard/events/create">Nouveau</Link></Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Vous n'avez créé aucun événement pour le moment.</p>
          <Button asChild><Link to="/dashboard/events/create">Créer votre premier événement</Link></Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="p-2">Titre</th>
                <th className="p-2">Date</th>
                <th className="p-2">Lieu</th>
                <th className="p-2">Statut</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="p-2">{e.title}</td>
                  <td className="p-2">{new Date(e.date).toLocaleString()}</td>
                  <td className="p-2">{e.location}</td>
                  <td className="p-2">{e.status}</td>
                  <td className="p-2 flex gap-2 flex-wrap">
                    <Button asChild size="sm" variant="outline"><Link to={`/dashboard/events/${e.id}/edit`}>Éditer</Link></Button>
                    <Button asChild size="sm" variant="outline"><Link to={`/events/${e.id}`}>Voir</Link></Button>
                    <Button size="sm" variant="outline" onClick={() => setParticipantsEvent(e)}>Participants</Button>
                    <Button size="sm" variant="destructive" disabled={removeMutation.isPending} onClick={() => removeMutation.mutate(e.id)}>
                      {removeMutation.isPending ? 'Suppression...' : 'Supprimer'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!participantsEvent} onOpenChange={(open) => !open && setParticipantsEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Participants — {participantsEvent?.title}</DialogTitle>
          </DialogHeader>
          {loadingParticipants ? (
            <p className="text-muted-foreground">Chargement...</p>
          ) : (
            <div className="space-y-4">
              <div className="text-sm">
                <div><span className="text-muted-foreground">Capacité:</span> {participantsEvent?.capacity}</div>
                <div><span className="text-muted-foreground">Confirmés:</span> {confirmed.length}</div>
                <div><span className="text-muted-foreground">Liste d'attente:</span> {waiting.length}</div>
                <div><span className="text-muted-foreground">Taux de remplissage:</span> {fillRate}%</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Participants confirmés</h4>
                  {confirmed.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun</p>
                  ) : (
                    <ul className="text-sm list-disc pl-5">
                      {confirmed.map((p: any) => (
                        <li key={p.id}>{p.user?.name || p.user_id} — inscrit</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h4 className="font-medium mb-2">Liste d'attente</h4>
                  {waiting.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun</p>
                  ) : (
                    <ul className="text-sm list-disc pl-5">
                      {waiting.map((p: any) => (
                        <li key={p.id}>{p.user?.name || p.user_id} — en attente</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
