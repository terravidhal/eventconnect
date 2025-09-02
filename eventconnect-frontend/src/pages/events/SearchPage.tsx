import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { eventsApi } from '@/lib/api/events'
import type { Event } from '@/types'
import SearchBar from '@/components/events/SearchBar'
import FilterPanel from '@/components/events/FilterPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SearchPage() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const category_id = params.get('category_id')
  const min_price = params.get('min_price')
  const max_price = params.get('max_price')
  const date_from = params.get('date_from')
  const date_to = params.get('date_to')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['search', { q, category_id, min_price, max_price, date_from, date_to }],
    queryFn: async () => {
      const res = await eventsApi.search(q, {
        category_id: category_id ? Number(category_id) : undefined,
        min_price: min_price ? Number(min_price) : undefined,
        max_price: max_price ? Number(max_price) : undefined,
        date_from: date_from || undefined,
        date_to: date_to || undefined,
      })
      return Array.isArray(res) ? res : (res?.data || [])
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <SearchBar />
        <FilterPanel />
      </div>

      {isLoading && <p className="text-muted-foreground">Chargement...</p>}
      {isError && <p className="text-destructive">Erreur de recherche.</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(data as Event[] || []).map((e) => (
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
    </div>
  )
} 