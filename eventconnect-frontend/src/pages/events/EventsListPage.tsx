import { useQuery } from '@tanstack/react-query'
import { eventsApi } from '@/lib/api/events'
import type { Event } from '@/types'
import { Link, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function EventsListPage() {
  const [params] = useSearchParams()
  const category = params.get('category') || undefined
  const page = Number(params.get('page') || '1')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['events', { category, page }],
    queryFn: () => eventsApi.list({ page, category_id: category ? Number.isNaN(Number(category)) ? undefined : Number(category) : undefined }),
  })

  if (isLoading) return <p className="text-muted-foreground">Chargement...</p>
  if (isError) return <p className="text-destructive">Erreur lors du chargement.</p>

  const events = (data?.data || []) as Event[]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Événements</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => (
          <Card key={e.id} className="hover:shadow-sm transition">
            <CardHeader>
              <CardTitle className="text-base">{e.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">{e.description}</p>
              <div className="text-sm mt-2">{e.location} • {new Date(e.date).toLocaleDateString()}</div>
              <div className="mt-4">
                <Button asChild size="sm"><Link to={`/events/${e.id}`}>Détails</Link></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(data?.last_page || 1) > 1 && (
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" disabled={page <= 1}>
            <Link to={`?page=${page - 1}`}>Précédent</Link>
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} / {data?.last_page}</span>
          <Button asChild variant="outline" size="sm" disabled={page >= (data?.last_page || 1)}>
            <Link to={`?page=${page + 1}`}>Suivant</Link>
          </Button>
        </div>
      )}
    </div>
  )
} 