import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { participationsApi } from '@/lib/api/participations'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CalendarX, XCircle, LogIn } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth-store'
import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/lib/api/auth'
import type { Event, Participation } from '@/types'
import { Link } from 'react-router-dom'

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

  // Vérifier si l'événement est expiré
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

    try {
      setLoading(true)
      await participationsApi.participate(eventId, notes)
      
      toast.success('Inscription réussie !')
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

  // Détecter si l'utilisateur est inscrit en vérifiant les participations
  const userParticipation = event.participations?.find((p: Participation) => p.user?.id === currentUser?.id)
  const isParticipating = event.is_participating || !!userParticipation
  const participationStatus = event.participation_status || userParticipation?.status

  // Si l'événement est annulé - Priorité absolue
  if (isCancelled) {
    return (
      <div className="flex items-center gap-3">
        {/* Badge d'événement annulé */}
        <div className="px-4 py-2 rounded-lg bg-red-600 text-white flex items-center gap-2 text-sm font-medium shadow-sm">
          <XCircle className="h-5 w-5" />
          Événement annulé
        </div>
        
        {/* Bouton désactivé */}
        <Button disabled variant="outline" className="opacity-60 cursor-not-allowed">
          Inscription fermée
        </Button>
      </div>
    )
  }

  // Si l'événement est expiré - Priorité absolue
  if (isExpired) {
    return (
      <div className="flex items-center gap-3">
        {/* Badge d'événement expiré */}
        <div className="px-4 py-2 rounded-lg bg-red-500 text-white flex items-center gap-2 text-sm font-medium shadow-sm">
          <CalendarX className="h-5 w-5" />
          Événement expiré
        </div>
        
        {/* Bouton désactivé */}
        <Button disabled variant="outline" className="opacity-60 cursor-not-allowed">
          Inscription fermée
        </Button>
      </div>
    )
  }

  // Si l'utilisateur n'est pas connecté - NOUVELLE LOGIQUE
  if (!currentUser) {
    return (
      <div className="flex flex-col gap-3">
        <Button disabled variant="outline" className="opacity-60 cursor-not-allowed w-full">
          S'inscrire
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
          <LogIn className="h-4 w-4" />
          <span>Veuillez vous inscrire ou vous connecter en tant que participant pour pouvoir vous inscrire à l'événement</span>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link to="/auth/login">Se connecter</Link>
          </Button>
          <Button asChild size="sm" className="flex-1">
            <Link to="/auth/register">S'inscrire</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Si rôle non participant: désactiver l'inscription
  if (isNonParticipantRole) {
    return (
      <div className="flex items-center gap-3">
        <Button disabled variant="outline" className="opacity-60 cursor-not-allowed w-full">
          Réservé aux participants
        </Button>
      </div>
    )
  }

  // Si l'utilisateur est déjà inscrit - Design amélioré avec bouton de désinscription
  if (isParticipating) {
    const statusColor = participationStatus === 'inscrit' 
      ? 'bg-green-500 text-white' 
      : participationStatus === 'en_attente'
      ? 'bg-orange-500 text-white'
      : 'bg-gray-500 text-white'
    
    const statusText = participationStatus === 'inscrit' 
      ? 'Inscrit' 
      : participationStatus === 'en_attente'
      ? 'En attente'
      : 'Statut inconnu'

    return (
      <div className="flex items-center gap-3">
        {/* Badge de statut */}
        <div className={`px-4 py-2 rounded-lg ${statusColor} flex items-center gap-2 text-sm font-medium shadow-sm`}>
          <span>{statusText}</span>
        </div>
        
        {/* Bouton de désinscription */}
        <Button 
          variant="outline" 
          onClick={handleUnsubscribe}
          disabled={unsubscribeLoading}
          className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
        >
          {unsubscribeLoading ? 'Désinscription...' : 'Se désinscrire'}
        </Button>
      </div>
    )
  }

  // Si l'événement est complet
  if (event.available_spots === 0) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full" disabled={isNonParticipantRole}>
            Liste d'attente
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
              <Button variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleConfirm} disabled={loading}>
                {loading ? 'Inscription...' : 'Rejoindre la liste d\'attente'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Événement avec places disponibles
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" disabled={isNonParticipantRole}>
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
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleConfirm} disabled={loading}>
              {loading ? 'Inscription...' : 'Confirmer l\'inscription'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
