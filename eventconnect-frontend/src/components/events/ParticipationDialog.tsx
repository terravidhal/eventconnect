import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { participationsApi } from '@/lib/api/participations'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { LogIn, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth-store'
import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/lib/api/auth'
import type { Event } from '@/types'

interface ParticipationDialogProps {
  eventId: number
  event: Event
}

export default function ParticipationDialog({ eventId, event }: ParticipationDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [unsubscribeLoading, setUnsubscribeLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const queryClient = useQueryClient()
  
  const user = useAuthStore((s) => s.user)
  const token = localStorage.getItem('token')
  
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: authApi.getUser,
    enabled: !!token && !user,
    retry: false
  })

  const currentUser = user || userData

  // Vérifier si l'utilisateur est connecté
  const isLoggedIn = !!currentUser
  const isExpired = new Date(event.date) < new Date()
  const isCancelled = event.status === 'annulé'
  const isNonParticipantRole = !!currentUser && currentUser.role !== 'participant'

  const handleConfirm = async () => {
    if (!currentUser) {
      toast.error('Vous devez être connecté pour vous inscrire')
      return
    }
    if (isNonParticipantRole) {
      toast.error('Seuls les participants peuvent s\'inscrire aux événements')
      return
    }
    
    setLoading(true)
    try {
      await participationsApi.participate(eventId, notes)
      toast.success('Inscription confirmée !')
      queryClient.invalidateQueries({ queryKey: ['event', eventId] })
      queryClient.invalidateQueries({ queryKey: ['participations'] })
      setOpen(false)
      setNotes('')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    if (!currentUser) return
    
    setUnsubscribeLoading(true)
    try {
      await participationsApi.cancel(eventId)
      toast.success('Désinscription confirmée')
      queryClient.invalidateQueries({ queryKey: ['event', eventId] })
      queryClient.invalidateQueries({ queryKey: ['participations'] })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la désinscription')
    } finally {
      setUnsubscribeLoading(false)
    }
  }

  // Si l'utilisateur n'est pas connecté, afficher le bouton désactivé avec message
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col gap-2">
        <Button disabled className="w-full">
          <LogIn className="h-4 w-4 mr-2" />
          S'inscrire
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Veuillez vous inscrire ou vous connecter en tant que participant pour pouvoir vous inscrire à l'événement
        </p>
      </div>
    )
  }

  // Si l'utilisateur n'est pas un participant
  if (isNonParticipantRole) {
    return (
      <div className="flex flex-col gap-2">
        <Button disabled className="w-full">
          S'inscrire
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Seuls les participants peuvent s'inscrire aux événements
        </p>
      </div>
    )
  }

  // Vérifier si l'utilisateur est déjà inscrit
  // Utiliser les propriétés enrichies de l'événement
  const isParticipating = event.is_participating || false
  const participationStatus = event.participation_status
  
  // Si l'utilisateur est déjà inscrit
  if (isParticipating) {
    return (
      <div className="flex flex-col gap-2">
        <Button 
          variant="outline" 
          onClick={handleUnsubscribe}
          disabled={unsubscribeLoading || isExpired || isCancelled}
          className="w-full bg-red-600 text-white"
        >
          {unsubscribeLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Désinscription...
            </>
          ) : (
            'Se désinscrire'
          )}
        </Button>
        <p className="text-xs text-green-600 text-center font-medium">
          ✓ Vous êtes inscrit à cet événement
        </p>
        {participationStatus === 'en_attente' && (
          <p className="text-xs text-orange-600 text-center">
            Vous êtes sur la liste d'attente
          </p>
        )}
        {participationStatus === 'annulé' && (
          <p className="text-xs text-red-600 text-center">
            Votre participation a été annulée
          </p>
        )}
      </div>
    )
  }

  // Si l'événement est expiré ou annulé
  if (isExpired || isCancelled) {
    return (
      <Button disabled className="w-full">
        {isCancelled ? 'Événement annulé' : 'Événement expiré'}
      </Button>
    )
  }

  // Si l'événement est complet
  if (event.available_spots === 0) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            Rejoindre la liste d'attente
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejoindre la liste d'attente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Cet événement est complet, mais vous pouvez rejoindre la liste d'attente. 
              Vous serez automatiquement inscrit si une place se libère.
            </p>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Ajoutez des notes pour l'organisateur..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Annuler
              </Button>
              <Button onClick={handleConfirm} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Inscription...
                  </>
                ) : (
                  'Rejoindre la liste d\'attente'
                )}
              </Button>
            </div>
            {loading && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Patientez s'il vous plaît, cela prendra un peu de temps...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Événement avec places disponibles
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          S'inscrire
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>S'inscrire à l'événement</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Vous êtes sur le point de vous inscrire à cet événement.
          </p>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Ajoutez des notes pour l'organisateur..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Annuler
            </Button>
            <Button onClick={handleConfirm} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Inscription...
                </>
              ) : (
                'Confirmer l\'inscription'
              )}
            </Button>
          </div>
          {loading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Patientez s'il vous plaît, cela prendra un peu de temps...</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
