import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/lib/api/axios'
import { ChartAreaInteractive } from '@/components/chart-area-interactive'

export default function GlobalStatsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-global-stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats')
      return data
    },
  })

  const { data: tsData } = useQuery({
    queryKey: ['admin-global-stats-timeseries'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats/timeseries')
      return data
    },
  })

  if (isLoading) return <p className="text-muted-foreground">Chargement...</p>
  if (isError || !data) return <p className="text-destructive">Erreur de chargement.</p>

  const { users = 0, events = 0, participations = 0, fill_rate = 0 } = data || {}
  const series = Array.isArray(tsData?.series) ? tsData.series : []

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Utilisateurs</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{users}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Événements</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{events}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Participations</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{participations}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Taux de remplissage</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{fill_rate}%</div></CardContent>
        </Card>
      </div>

      <ChartAreaInteractive
        data={series}
        title="Inscriptions & Événements"
        description="Évolution des 12 derniers mois"
      />
    </div>
  )
} 