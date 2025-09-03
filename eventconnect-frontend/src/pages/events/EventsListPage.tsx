import { useQuery } from '@tanstack/react-query'
import { eventsApi } from '@/lib/api/events'
import type { Event } from '@/types'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import SearchBar from '@/components/events/SearchBar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore } from '@/lib/store/auth-store'
import { useQuery as useAuthQuery } from '@tanstack/react-query'
import { authApi } from '@/lib/api/auth'
import { CheckCircle, Clock } from 'lucide-react'

export default function EventsListPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const category = params.get('category') || undefined
  const page = Number(params.get('page') || '1')
  const perPage = Number(params.get('per_page') || '12')
  const user = useAuthStore((state) => state.user)
  const token = localStorage.getItem('token')

  // Récupérer les données utilisateur si le token existe mais pas l'utilisateur
  const { data: userData } = useAuthQuery({
    queryKey: ['user'],
    queryFn: authApi.getUser,
    enabled: !!token && !user,
    retry: false
  })

  const currentUser = user || userData

  const { data, isLoading, isError } = useQuery({
    queryKey: ['events', { category, page, perPage }],
    queryFn: () => eventsApi.list({ page, per_page: perPage, category_id: category ? Number.isNaN(Number(category)) ? undefined : Number(category) : undefined }),
  })

  if (isLoading) return <p className="text-muted-foreground">Chargement...</p>
  if (isError) return <p className="text-destructive">Erreur lors du chargement.</p>

  const events = (data?.data || []) as Event[]
  const lastPage = (data as any)?.last_page ?? (data as any)?.meta?.last_page ?? 1
  const currentParams = new URLSearchParams(params)

  // Fonction pour vérifier si l'utilisateur est inscrit à un événement
  const isUserParticipating = (event: Event) => {
    if (!currentUser) return false
    return event.participations?.some(p => p.user?.id === currentUser.id) || false
  }

  // Fonction pour obtenir le statut de participation
  const getParticipationStatus = (event: Event) => {
    if (!currentUser) return null
    const participation = event.participations?.find(p => p.user?.id === currentUser.id)
    return participation?.status || null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-semibold">Événements</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-80">
            <SearchBar />
          </div>
          <div className="w-[150px]">
            <Select
              defaultValue={String(perPage)}
              onValueChange={(value) => {
                const next = new URLSearchParams(currentParams)
                next.set('per_page', value)
                next.set('page', '1')
                navigate({ search: next.toString() })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Par page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 / page</SelectItem>
                <SelectItem value="12">12 / page</SelectItem>
                <SelectItem value="24">24 / page</SelectItem>
                <SelectItem value="48">48 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => {
          const isParticipating = isUserParticipating(e)
          const participationStatus = getParticipationStatus(e)
          
          return (
            <Card key={e.id} className="hover:shadow-sm transition relative">
              {/* Badge de participation */}
              {isParticipating && (
                <div className="absolute top-3 right-3 z-10">
                  {participationStatus === 'inscrit' ? (
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Inscrit
                    </div>
                  ) : participationStatus === 'en_attente' ? (
                    <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      En attente
                    </div>
                  ) : null}
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-base">{e.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{e.description}</p>
                <div className="text-sm mt-2">{e.location} • {new Date(e.date).toLocaleDateString()}</div>
                
                {/* Informations sur les places */}
                {e.available_spots !== undefined && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {e.available_spots} / {e.capacity} places disponibles
                  </div>
                )}
                
                <div className="mt-4">
                  <Button asChild size="sm"><Link to={`/events/${e.id}`}>Détails</Link></Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {lastPage > 1 && (
        <div className="flex items-center flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" disabled={page <= 1}>
            <Link to={`?${(() => { const p = new URLSearchParams(currentParams); p.set('page', String(page - 1)); return p.toString() })()}`}>Précédent</Link>
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: lastPage }).slice(0, 7).map((_, i) => {
              const pageNumber = i + 1
              const p = new URLSearchParams(currentParams)
              p.set('page', String(pageNumber))
              const isActive = pageNumber === page
              return (
                <Button key={pageNumber} asChild size="sm" variant={isActive ? 'default' : 'outline'}>
                  <Link to={`?${p.toString()}`}>{pageNumber}</Link>
                </Button>
              )
            })}
          </div>
          <Button asChild variant="outline" size="sm" disabled={page >= lastPage}>
            <Link to={`?${(() => { const p = new URLSearchParams(currentParams); p.set('page', String(page + 1)); return p.toString() })()}`}>Suivant</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
