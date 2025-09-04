import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSearchParams, useNavigate } from 'react-router-dom'

export default function UsersAdminPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const current = Object.fromEntries(searchParams.entries())

  const page = Number(current.page || 1)
  const perPage = Number(current.per_page || 12)
  const q = current.q || ''

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await api.get('/users')
      return data
    },
    staleTime: 30_000,
  })

  if (isLoading) return <p className="text-muted-foreground">Chargement...</p>
  if (isError || !data) return <p className="text-destructive">Erreur de chargement.</p>

  const all = Array.isArray(data?.users) ? data.users : (Array.isArray(data) ? data : [])

  // Filtrage local
  const filtered = (() => {
    if (!q) return all
    const term = q.toLowerCase()
    return all.filter((u: any) =>
      (u.name || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (u.role || '').toLowerCase().includes(term)
    )
  })()

  // Pagination locale
  const total = filtered.length
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const start = (page - 1) * perPage
  const end = start + perPage
  const items = filtered.slice(start, end)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">Gestion des utilisateurs</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Rechercher (nom, email, rôle)"
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
              <th className="p-2">Nom</th>
              <th className="p-2">Email</th>
              <th className="p-2">Rôle</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u: any) => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2 flex gap-2">
                  <Button size="sm" variant="outline">Détails</Button>
                  <Button size="sm" variant="destructive">Supprimer</Button>
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