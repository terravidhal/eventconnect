import { useQuery } from '@tanstack/react-query'
import { eventsApi } from '@/lib/api/events'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import SearchBar from '@/components/events/SearchBar'
import { CheckCircle, Clock, CalendarX, Calendar, MapPin, XCircle } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth-store'
import { useQuery as useUserQuery } from '@tanstack/react-query'
import { authApi } from '@/lib/api/auth'
import type { Event } from '@/types'
import { getDefaultImage } from '@/lib/constants/images'

export default function EventsListPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const currentParams = Object.fromEntries(searchParams.entries())
  

  
  const page = Number(currentParams.page) || 1
  const perPage = Number(currentParams.per_page) || 6  // Notez le changement: per_page au lieu de perPage
  


  const { data, isLoading, isError } = useQuery({
    queryKey: ['events', currentParams, perPage],
    queryFn: () => eventsApi.list({ ...currentParams, per_page: perPage }),
  })
  
  




  // Récupérer l'utilisateur connecté pour vérifier les participations
  const user = useAuthStore((s) => s.user)
  const token = localStorage.getItem('token')
  
  const { data: userData } = useUserQuery({
    queryKey: ['user'],
    queryFn: authApi.getUser,
    enabled: !!token && !user,
    retry: false
  })

  const currentUser = user || userData

  if (isLoading) return <p className="text-muted-foreground">Chargement...</p>
  if (isError || !data) return <p className="text-destructive">Erreur de chargement.</p>

  const events = data.data || []
  const lastPage = data.meta?.last_page || 1
 // const total = data.meta?.total || 0
  
 // console.log("total", total);
  


  // Fonction pour vérifier si l'utilisateur participe à un événement
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Événements</h1>
        <div className="flex items-center gap-4">
          <div className="w-full sm:w-80">
            <SearchBar />
          </div>
          <div className="w-[150px]">
            <Select
              value={String(perPage)}
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
          const isExpired = new Date(e.date) < new Date()
          const isCancelled = e.status === 'annulé'
          
          // Debug temporaire pour voir la structure des tags
        /* console.log('=== DEBUG TAGS ===');
          console.log('Event ID:', e.id);
          console.log('Event title:', e.title);
          console.log('Tags:', e.tags);
          console.log('Tags type:', typeof e.tags);
          console.log('Is Array:', Array.isArray(e.tags));
          console.log('Tags length:', e.tags?.length);
          console.log('Tags filtered:', e.tags && Array.isArray(e.tags) ? e.tags.filter(tag => tag && typeof tag === 'string') : 'N/A');*/
          

          
          return (
            <Card key={e.id} className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg overflow-hidden bg-gradient-to-br from-background to-muted/20 hover:scale-105">
              {/* Image en en-tête */}
              <div className="aspect-video relative overflow-hidden">
                {/* Image de l'événement ou image par défaut selon la catégorie */}
                {e.image ? (
                  <img 
                    src={e.image} 
                    alt={e.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : e.category?.name ? (
                  <img 
                    src={getDefaultImage(e.category.name)} 
                    alt={`${e.category.name} - ${e.title}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/60 via-primary/40 to-foreground/30" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/40 transition-all duration-300"></div>
                
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
                
                {/* Badge d'événement annulé */}
                {isCancelled && (
                  <div className="absolute top-3 left-3 z-10">
                    <div className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Annulé
                    </div>
                  </div>
                )}
                
                {/* Badge d'événement expiré */}
                {isExpired && !isCancelled && (
                  <div className="absolute top-3 left-3 z-10">
                    <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <CalendarX className="h-3 w-3" />
                      Expiré
                    </div>
                  </div>
                )}
                
                {/* Informations de base sur l'image */}
                <div className="absolute bottom-3 left-3 text-white">
                  <div className="flex items-center text-sm mb-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{new Date(e.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center text-sm bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{e.location}</span>
                  </div>
                </div>
              </div>
              
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-1">
                  {e.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{e.description}</p>
                
                {/* Tags */}
                {e.tags && Array.isArray(e.tags) && e.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {e.tags.filter(tag => tag && typeof tag === 'string').map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Informations sur les places */}
                {e.available_spots !== undefined && (
                  <div className="text-xs text-muted-foreground mt-2">
                    {e.available_spots} / {e.capacity} places disponibles
                  </div>
                )}
                
                <div className="mt-4">
                  <Button asChild size="sm" disabled={isExpired || isCancelled}>
                    <Link to={`/events/${e.id}`}>
                      {isCancelled ? 'Événement annulé' : isExpired ? 'Événement passé' : 'Détails'}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>


      
      {lastPage > 1 && (
        <div className="flex items-center flex-wrap gap-2">
          {page > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link to={`?${(() => { const p = new URLSearchParams(currentParams); p.set('page', String(page - 1)); return p.toString() })()}`}>Précédent</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled className="pointer-events-none">
              Précédent
            </Button>
          )}
          
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
          
          {page < lastPage ? (
            <Button asChild variant="outline" size="sm">
              <Link to={`?${(() => { const p = new URLSearchParams(currentParams); p.set('page', String(page + 1)); return p.toString() })()}`}>Suivant</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled className="pointer-events-none">
              Suivant
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
