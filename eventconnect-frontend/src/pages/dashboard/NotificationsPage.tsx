import NotificationCenter from '@/components/notifications/NotificationCenter'
import { useState } from 'react'

export default function NotificationsPage() {
  const [items, setItems] = useState([
    { id: 1, title: 'Participation confirmée', message: 'Votre inscription à "Tech Meetup" est validée.', date: new Date().toISOString(), read: false },
    { id: 2, title: 'Rappel d\'événement', message: '"Tech Meetup" commence demain à 10:00.', date: new Date().toISOString(), read: false },
  ])

  const markRead = (id: number | string) => {
    setItems((prev) => prev.map(i => i.id === id ? { ...i, read: true } : i))
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Notifications</h2>
      <NotificationCenter items={items} onMarkRead={markRead} />
    </div>
  )
} 