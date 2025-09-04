import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '@/lib/api/events'
import type { Event } from '@/types'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

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

  if (isLoading) return <p className="text-muted-foreground">Chargement...</p>
  if (isError) return <p className="text-destructive">Erreur de chargement.</p>

  // Extraire le tableau d'événements de la réponse API (garde contre les formes différentes)
  const items = Array.isArray(data)
    ? (data as Event[])
    : (Array.isArray((data as any)?.events) ? ((data as any).events as Event[]) : [])

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
                  <td className="p-2 flex gap-2">
                    <Button asChild size="sm" variant="outline"><Link to={`/dashboard/events/${e.id}/edit`}>Éditer</Link></Button>
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
    </div>
  )
}
