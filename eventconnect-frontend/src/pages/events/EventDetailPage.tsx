import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { eventsApi } from '@/lib/api/events'
import type { Event } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ParticipationDialog from '@/components/events/ParticipationDialog'
import { Users, MapPin, Calendar, Clock, CalendarX } from 'lucide-react'
import { getDefaultImage } from '@/lib/constants/images'

export default function EventDetailPage() {
  const { id } = useParams()
  const eventId = Number(id)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['event', eventId],
    enabled: Number.isFinite(eventId) && eventId > 0,
    queryFn: () => eventsApi.get(eventId),
  })

  if (!Number.isFinite(eventId)) return <p className="text-destructive">ID invalide</p>
  if (isLoading) return <p className="text-muted-foreground">Chargement...</p>
  if (isError || !data) return <p className="text-destructive">Événement introuvable.</p>

  const e = data as Event
  
  // Vérifier si l'événement est expiré
  const isExpired = new Date(e.date) < new Date()
  
  const imageUrl = e.image || ''
  const statusColor = e.status === 'publié' ? 'bg-green-100 text-green-700' : e.status === 'annulé' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-lg overflow-hidden border">
        {imageUrl ? (
          <img src={imageUrl} alt={e.title} className="w-full h-64 object-cover" />
        ) : e.category?.name ? (
          <img 
            src={getDefaultImage(e.category.name)} 
            alt={`${e.category.name} - ${e.title}`}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/10" />
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold flex items-center gap-3">
          {e.title}
          <span className={`text-xs px-2 py-1 rounded ${statusColor} capitalize`}>{e.status}</span>
          {/* Badge d'événement expiré */}
          {isExpired && (
            <span className="text-xs px-2 py-1 rounded bg-red-500 text-white flex items-center gap-1">
              <CalendarX className="h-3 w-3" />
              Expiré
            </span>
          )}
        </h2>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/events">Retour</Link></Button>
          <ParticipationDialog eventId={e.id} event={e} />
        </div>
      </div>

      {/* Places disponibles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Places disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary">
              {e.available_spots || 0} / {e.capacity}
            </div>
            <div className="text-sm text-muted-foreground">
              {e.participants_count || 0} participants inscrits
            </div>
          </div>
          {e.is_full && !isExpired && (
            <div className="mt-2 text-sm text-orange-600 font-medium">
              ⚠️ Événement complet - Liste d'attente disponible
            </div>
          )}
          {isExpired && (
            <div className="mt-2 text-sm text-red-600 font-medium">
              ❌ Cet événement a déjà eu lieu
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Date:</span> 
            <span className={isExpired ? 'text-red-600 font-medium' : ''}>
              {new Date(e.date).toLocaleString()}
            </span>
            {isExpired && (
              <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 ml-2">
                Événement passé
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Lieu:</span> {e.location}
          </div>
          {typeof e.latitude === 'number' && typeof e.longitude === 'number' && (
            <div><span className="text-muted-foreground">Coordonnées:</span> {e.latitude}, {e.longitude}</div>
          )}
          <div><span className="text-muted-foreground">Capacité:</span> {e.capacity}</div>
          {typeof e.price === 'number' && <div><span className="text-muted-foreground">Prix:</span> {e.price} €</div>}
          <div><span className="text-muted-foreground">Créé le:</span> {new Date(e.created_at).toLocaleString()}</div>
          <div><span className="text-muted-foreground">Mis à jour le:</span> {new Date(e.updated_at).toLocaleString()}</div>
          {Array.isArray(e.tags) && e.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-muted-foreground">Tags:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {e.tags.map((t, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded bg-muted">{t}</span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Catégorie et organisateur */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Catégorie</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <span className="text-2xl">{e.category?.icon || '���'}</span>
            <span className="font-medium">{e.category?.name || 'Non catégorisé'}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organisateur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div className="font-medium">{e.organizer?.name || 'Organisateur inconnu'}</div>
              <div className="text-muted-foreground">{e.organizer?.email || 'Email non disponible'}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
