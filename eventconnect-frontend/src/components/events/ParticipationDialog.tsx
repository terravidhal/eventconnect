import { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { participationsApi } from '@/lib/api/participations'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import type { Event, Participation } from '@/types'
import { CheckCircle, Clock, Users, X } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth-store'
import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/lib/api/auth'

interface ParticipationDialogProps {
  eventId: number
  event: Event
}

export default function ParticipationDialog({ eventId, event }: ParticipationDialogProps) {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [unsubscribeLoading, setUnsubscribeLoading] = useState(false)
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const token = localStorage.getItem('token')

  // Récupérer les données utilisateur si le token existe mais pas l'utilisateur
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: authApi.getUser,
    enabled: !!token && !user,
    retry: false
  })

  // Utiliser l'utilisateur du store ou celui récupéré via API
  const currentUser = user || userData

  const handleConfirm = async () => {
    try {
      setLoading(true)
      const response = await participationsApi.participate(eventId, notes || undefined)
      
      // Afficher le message approprié selon le statut
      if (response.participation?.status === 'inscrit') {
        toast.success('Inscription confirmée ! Vous recevrez un email de confirmation.')
      } else if (response.participation?.status === 'en_attente') {
        toast.success('Vous êtes sur la liste d\'attente. Vous serez notifié si une place se libère.')
      } else {
        toast.success('Inscription enregistrée')
      }
      
      setOpen(false)
      setNotes('')
      
      // Rafraîchir les données de l'événement
      queryClient.invalidateQueries({ queryKey: ['event', eventId] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    } catch (e: any) {
      const message = e?.response?.data?.message || "Échec de l'inscription"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    try {
      setUnsubscribeLoading(true)
      await participationsApi.cancel(eventId)
      
      toast.success('Désinscription effectuée avec succès')
      
      // Rafraîchir les données de l'événement
      queryClient.invalidateQueries({ queryKey: ['event', eventId] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    } catch (e: any) {
      const message = e?.response?.data?.message || "Échec de la désinscription"
      toast.error(message)
    } finally {
      setUnsubscribeLoading(false)
    }
  }

  // Debug: Afficher les valeurs pour vérifier
  console.log('Event data:', {
    is_participating: event.is_participating,
    participation_status: event.participation_status,
    eventId,
    participations: event.participations,
    user: currentUser?.id,
    token: !!token
  })

  // Détecter si l'utilisateur est inscrit en vérifiant les participations
  const userParticipation = event.participations?.find((p: Participation) => p.user?.id === currentUser?.id)
  const isParticipating = event.is_participating || !!userParticipation
  const participationStatus = event.participation_status || userParticipation?.status

  // Si l'utilisateur est déjà inscrit - Design amélioré avec bouton de désinscription
  if (isParticipating) {
    const statusColor = participationStatus === 'inscrit' 
      ? 'bg-green-500 text-white' 
      : participationStatus === 'en_attente'
      ? 'bg-orange-500 text-white'
      : 'bg-gray-500 text-white'
    
    const statusText = participationStatus === 'inscrit' 
      ? 'Vous êtes inscrit' 
      : participationStatus === 'en_attente'
      ? 'Sur liste d\'attente'
      : 'Statut inconnu'

    const statusIcon = participationStatus === 'inscrit' 
      ? <CheckCircle className="h-5 w-5" />
      : <Clock className="h-5 w-5" />

    return (
      <div className="flex items-center gap-3">
        {/* Badge de statut */}
        <div className={`px-4 py-2 rounded-lg ${statusColor} flex items-center gap-2 text-sm font-medium shadow-sm`}>
          {statusIcon}
          {statusText}
        </div>
        
        {/* Bouton de désinscription */}
        <Button 
          onClick={handleUnsubscribe}
          disabled={unsubscribeLoading}
          variant="destructive"
          size="sm"
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          {unsubscribeLoading ? 'Désinscription...' : 'Se désinscrire'}
        </Button>
      </div>
    )
  }

  // Si l'événement est complet
  if (event.is_full) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Liste d'attente
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejoindre la liste d'attente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                ⚠️ Cet événement est complet. En vous inscrivant, vous rejoignez la liste d'attente. 
                Vous serez automatiquement inscrit si une place se libère.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Notes (optionnel)</label>
              <Input 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Allergies, préférences..." 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={handleConfirm} disabled={loading} className="bg-orange-600 hover:bg-orange-700">
              {loading ? 'Inscription...' : 'Rejoindre la liste d\'attente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Inscription normale
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>S'inscrire</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer votre inscription</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ Il reste {event.available_spots} place(s) disponible(s) pour cet événement.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Notes (optionnel)</label>
            <Input 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Allergies, préférences..." 
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? 'Validation...' : 'Confirmer l\'inscription'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
