import { useQuery } from '@tanstack/react-query'
import { participationsApi } from '@/lib/api/participations'
import { Link, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth-store'

export default function ParticipationsPage() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role || 'participant'

  // Rediriger les non-participants
  if (role !== 'participant') {
    return <Navigate to="/dashboard" replace />
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-participations'],
    queryFn: () => participationsApi.myParticipations(),
    enabled: role === 'participant',
  })

  if (isLoading) return <p className="text-muted-foreground">Chargement...</p>
  if (isError) return <p className="text-destructive">Erreur de chargement.</p>

  // La réponse de l'API est: { participations: [...] }
  const items = Array.isArray((data as any)?.participations)
    ? (data as any).participations
    : []

  return (
    <div className="space-y-6">
      {/* Bouton retour */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link to="/events" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour aux événements
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Mes participations</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Vous n'êtes inscrit à aucun événement pour le moment.</p>
          <Button asChild>
            <Link to="/events">Découvrir les événements</Link>
          </Button>
        </div>
      ) : (
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
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      p.status === 'inscrit' 
                        ? 'bg-green-100 text-green-800' 
                        : p.status === 'en_attente'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-2">
                    {p.event?.id && (
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/events/${p.event.id}`}>Voir</Link>
                      </Button>
                    )}
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
