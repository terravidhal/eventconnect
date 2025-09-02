import { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { participationsApi } from '@/lib/api/participations'
import { toast } from 'sonner'

export default function ParticipationDialog({ eventId }: { eventId: number }) {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    try {
      setLoading(true)
      await participationsApi.participate(eventId, notes || undefined)
      toast.success('Inscription confirmée')
      setOpen(false)
    } catch (e: any) {
      const message = e?.response?.data?.message || "Échec de l'inscription"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>S'inscrire</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer votre inscription</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Notes (optionnel)</label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Allergies, préférences..." />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? 'Validation...' : 'Confirmer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 