type NotificationItem = {
  id: string | number
  title: string
  message?: string
  date?: string
  read?: boolean
}

export default function NotificationCenter({ items = [], onMarkRead }: { items: NotificationItem[]; onMarkRead?: (id: string | number) => void }) {
  if (!items.length) return <p className="text-muted-foreground text-sm">Aucune notification</p>
  return (
    <div className="space-y-2">
      {items.map((n) => (
        <div key={n.id} className="border rounded p-3 flex items-start justify-between gap-3">
          <div>
            <div className="font-medium">{n.title}</div>
            {n.message && <div className="text-sm text-muted-foreground">{n.message}</div>}
            {n.date && <div className="text-xs text-muted-foreground mt-1">{new Date(n.date).toLocaleString()}</div>}
          </div>
          {!n.read && (
            <button className="text-xs underline" onClick={() => onMarkRead?.(n.id)}>Marquer comme lu</button>
          )}
        </div>
      ))}
    </div>
  )
} 