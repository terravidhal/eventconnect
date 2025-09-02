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

  const items = (data || []) as Event[]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Mes événements</h2>
        <Button asChild><Link to="/dashboard/events/create">Nouveau</Link></Button>
      </div>

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
    </div>
  )
} 