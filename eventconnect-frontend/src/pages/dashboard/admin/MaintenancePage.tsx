import { Button } from '@/components/ui/button'

export default function MaintenancePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Maintenance</h2>
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">Vider le cache</Button>
          <span className="text-muted-foreground">Purge du cache client/serveur</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">Recalculer les stats</Button>
          <span className="text-muted-foreground">Reconstruire les agrégations</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="destructive">Mode maintenance</Button>
          <span className="text-muted-foreground">Activer/Désactiver</span>
        </div>
      </div>
    </div>
  )
} 