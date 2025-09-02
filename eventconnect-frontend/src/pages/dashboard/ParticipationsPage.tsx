import { useQuery } from '@tanstack/react-query'
import { participationsApi } from '@/lib/api/participations'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function ParticipationsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-participations'],
    queryFn: () => participationsApi.myParticipations(),
  })

  if (isLoading) return <p className="text-muted-foreground">Chargement...</p>
  if (isError) return <p className="text-destructive">Erreur de chargement.</p>

  const items = Array.isArray(data?.data) ? data.data : (data || [])

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Mes participations</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="p-2">Événement</th>
              <th className="p-2">Date</th>
              <th className="p-2">Statut</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p: any) => (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.event?.title || p.event_id}</td>
                <td className="p-2">{p.event?.date ? new Date(p.event.date).toLocaleString() : '-'}</td>
                <td className="p-2">{p.status}</td>
                <td className="p-2">
                  {p.event?.id && (
                    <Button asChild size="sm" variant="outline"><Link to={`/events/${p.event.id}`}>Voir</Link></Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 