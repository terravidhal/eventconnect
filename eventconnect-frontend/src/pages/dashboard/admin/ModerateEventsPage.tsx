import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { eventsApi } from '@/lib/api/events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'

export default function ModerateEventsPage() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const current = Object.fromEntries(searchParams.entries())

  const page = Number(current.page || 1)
  const perPage = Number(current.per_page || 6)
  const q = current.q || ''

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-events', page, perPage],
    queryFn: () => eventsApi.list({ page, per_page: perPage }),
    placeholderData: keepPreviousData,
  })

  const removeMutation = useMutation({
    mutationFn: (id: number) => eventsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-events'] })
    }
  })

  if (isLoading) return <p className="text-muted-foreground">Chargement...</p>
  if (isError || !data) return <p className="text-destructive">Erreur de chargement.</p>

  const items = data.data || []
  const lastPage = data.meta?.last_page || 1

  const filtered = (() => {
    if (!q) return items
    const term = q.toLowerCase()
    return items.filter((e: any) =>
      (e.title || '').toLowerCase().includes(term) ||
      (e.location || '').toLowerCase().includes(term)
    )
  })()

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">Modération des événements</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Rechercher (titre, lieu)"
            defaultValue={q}
            onChange={(e) => {
              const next = new URLSearchParams(current)
              const val = e.target.value
              if (val) next.set('q', val); else next.delete('q')
              next.set('page', '1')
              navigate({ search: next.toString() })
            }}
          />
          <Select value={String(perPage)} onValueChange={(v) => {
            const next = new URLSearchParams(current)
            next.set('per_page', v)
            next.set('page', '1')
            navigate({ search: next.toString() })
          }}>
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Par page" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="24">24</SelectItem>
              <SelectItem value="48">48</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
            {filtered.map((e: any) => (
              <tr key={e.id} className="border-t">
                <td className="p-2">{e.title}</td>
                <td className="p-2">{new Date(e.date).toLocaleString()}</td>
                <td className="p-2">{e.location}</td>
                <td className="p-2">{e.status}</td>
                <td className="p-2 flex gap-2">
                  <Button asChild size="sm" variant="outline"><Link to={`/events/${e.id}`}>Détails</Link></Button>
                  <Button size="sm" variant="destructive" disabled={removeMutation.isPending} onClick={() => removeMutation.mutate(e.id)}>
                    {removeMutation.isPending ? 'Suppression...' : 'Supprimer'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {lastPage > 1 && (
        <div className="flex items-center flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => {
              const next = new URLSearchParams(current)
              next.set('page', String(Math.max(1, page - 1)))
              navigate({ search: next.toString() })
            }}
          >
            Précédent
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: lastPage }).slice(0, 7).map((_, i) => {
              const p = i + 1
              return (
                <Button
                  key={p}
                  size="sm"
                  variant={p === page ? 'default' : 'outline'}
                  onClick={() => {
                    const next = new URLSearchParams(current)
                    next.set('page', String(p))
                    navigate({ search: next.toString() })
                  }}
                >
                  {p}
                </Button>
              )
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= lastPage}
            onClick={() => {
              const next = new URLSearchParams(current)
              next.set('page', String(Math.min(lastPage, page + 1)))
              navigate({ search: next.toString() })
            }}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  )
} 