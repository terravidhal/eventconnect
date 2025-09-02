import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { filesApi } from '@/lib/api/files'
import { toast } from 'sonner'

export default function ImageUpload({ eventId, onUploaded }: { eventId?: number; onUploaded?: (file: { filename: string; url: string; thumb?: string }) => void }) {
  const [uploading, setUploading] = useState(false)

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      const res = await filesApi.uploadImage(file, eventId)
      toast.success('Image uploadée')
      onUploaded?.(res)
    } catch (err: any) {
      const message = err?.response?.data?.message || `Échec de l'upload`
      toast.error(message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Input type="file" accept="image/*" onChange={onFileChange} disabled={uploading} />
      <Button type="button" variant="outline" disabled>{uploading ? 'Upload...' : 'Choisir'}</Button>
    </div>
  )
} 