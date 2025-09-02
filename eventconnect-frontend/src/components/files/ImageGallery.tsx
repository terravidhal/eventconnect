import { useEffect, useState } from 'react'
import { filesApi } from '@/lib/api/files'
import { Button } from '@/components/ui/button'

export default function ImageGallery({ eventId }: { eventId: number }) {
  const [items, setItems] = useState<Array<{ filename: string; url: string; thumb?: string }>>([])
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    try {
      const data = await filesApi.listEventFiles(eventId)
      setItems(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [eventId])

  const remove = async (filename: string) => {
    await filesApi.deleteFile(filename)
    await refresh()
  }

  if (loading) return <p className="text-muted-foreground">Chargement...</p>

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((f) => (
        <div key={f.filename} className="border rounded p-2">
          <img src={f.thumb || f.url} alt={f.filename} className="w-full h-40 object-cover rounded" />
          <div className="flex justify-between items-center mt-2 text-xs">
            <span className="truncate" title={f.filename}>{f.filename}</span>
            <Button size="sm" variant="destructive" onClick={() => remove(f.filename)}>Supprimer</Button>
          </div>
        </div>
      ))}
    </div>
  )
} 