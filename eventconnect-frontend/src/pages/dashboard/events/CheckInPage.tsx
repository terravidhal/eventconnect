import { useState } from 'react'
import { participationsApi } from '@/lib/api/participations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function CheckInPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCheck = async () => {
    try {
      setLoading(true)
      await participationsApi.checkIn(code)
      toast.success('Check-in validé')
      setCode('')
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Code invalide'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 max-w-md">
      <h2 className="text-2xl font-semibold">Check-in</h2>
      <p className="text-sm text-muted-foreground">Saisissez un QR/code pour valider une participation.</p>
      <div className="flex gap-2">
        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="QR ou code" />
        <Button onClick={handleCheck} disabled={loading || !code.trim()}>
          {loading ? 'Validation...' : 'Valider'}
        </Button>
      </div>
    </div>
  )
} 