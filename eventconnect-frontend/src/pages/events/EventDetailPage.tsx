import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { eventsApi } from '@/lib/api/events'
import type { Event } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ParticipationDialog from '@/components/events/ParticipationDialog'
import { Users, MapPin, Calendar, CalendarX, XCircle, CircleDollarSign } from 'lucide-react'
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
  
  // Vérifier si l'événement est expiré ou annulé
  const isExpired = new Date(e.date) < new Date()
  const isCancelled = e.status === 'annulé'
  
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
          {/* Badge d'événement annulé */}
          {isCancelled && (
            <span className="text-xs px-2 py-1 rounded bg-red-600 text-white flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              Annulé
            </span>
          )}
          {/* Badge d'événement expiré */}
          {isExpired && !isCancelled && (
            <span className="text-xs px-2 py-1 rounded bg-red-500 text-white flex items-center gap-1">
              <CalendarX className="h-3 w-3" />
              Expiré
            </span>
          )}
        </h2>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/events">Retour</Link></Button>
          {!isCancelled && <ParticipationDialog eventId={e.id} event={e} />}
        </div>
      </div>

      {/* Message d'annulation */}
      {isCancelled && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <XCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Cet événement a été annulé</p>
                <p className="text-sm text-red-600">Nous nous excusons pour la gêne occasionnée.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message d'expiration */}
      {isExpired && !isCancelled && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-orange-700">
              <CalendarX className="h-5 w-5" />
              <div>
                <p className="font-medium">Cet événement a déjà eu lieu</p>
                <p className="text-sm text-orange-600">Les inscriptions sont fermées.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Places disponibles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Places disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{e.available_spots || 0}</div>
              <div className="text-sm text-muted-foreground">Places libres</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{e.capacity}</div>
              <div className="text-sm text-muted-foreground">Capacité totale</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{e.participation_rate || 0}%</div>
              <div className="text-sm text-muted-foreground">Taux de participation</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations détaillées */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Date et heure</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(e.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Lieu</div>
                <div className="text-sm text-muted-foreground">{e.location}</div>
              </div>
            </div>
            
            {e.price && (
              <div className="flex items-center gap-3">
                <CircleDollarSign className="h-4 w-4 text-muted-foreground"/>
                <div>
                  <div className="font-medium">Prix</div>
                  <div className="text-sm text-muted-foreground">{e.price}€</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organisateur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {e.organizer.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-medium">{e.organizer.name}</div>
                <div className="text-sm text-muted-foreground">{e.organizer.email}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{e.description}</p>
        </CardContent>
      </Card>

      {/* Tags */}
      {e.tags && e.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {e.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
