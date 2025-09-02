import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function SearchBar() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/events/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Input placeholder="Rechercher un événement..." value={q} onChange={(e) => setQ(e.target.value)} />
      <Button type="submit">Rechercher</Button>
    </form>
  )
} 