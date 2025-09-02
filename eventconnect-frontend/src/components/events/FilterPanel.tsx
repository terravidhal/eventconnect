import { useEffect, useState } from 'react'
import { eventsApi } from '@/lib/api/events'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function FilterPanel() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([])

  const [category_id, setCategoryId] = useState<string>(params.get('category_id') || '')
  const [min_price, setMinPrice] = useState<string>(params.get('min_price') || '')
  const [max_price, setMaxPrice] = useState<string>(params.get('max_price') || '')
  const [date_from, setDateFrom] = useState<string>(params.get('date_from') || '')
  const [date_to, setDateTo] = useState<string>(params.get('date_to') || '')

  useEffect(() => {
    eventsApi.availableFilters().then((f) => {
      if (Array.isArray(f?.categories)) setCategories(f.categories)
    }).catch(() => {})
  }, [])

  const apply = () => {
    const s = new URLSearchParams()
    if (category_id) s.set('category_id', category_id)
    if (min_price) s.set('min_price', min_price)
    if (max_price) s.set('max_price', max_price)
    if (date_from) s.set('date_from', date_from)
    if (date_to) s.set('date_to', date_to)
    navigate(`/events/search?${s.toString()}`)
  }

  const reset = () => {
    setCategoryId(''); setMinPrice(''); setMaxPrice(''); setDateFrom(''); setDateTo('')
    navigate('/events/search')
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Select value={category_id} onValueChange={setCategoryId}>
        <SelectTrigger><SelectValue placeholder="Catégorie" /></SelectTrigger>
        <SelectContent>
          {categories.map((c) => (
            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input placeholder="Prix min" value={min_price} onChange={(e) => setMinPrice(e.target.value)} />
      <Input placeholder="Prix max" value={max_price} onChange={(e) => setMaxPrice(e.target.value)} />
      <Input type="date" placeholder="Du" value={date_from} onChange={(e) => setDateFrom(e.target.value)} />
      <Input type="date" placeholder="Au" value={date_to} onChange={(e) => setDateTo(e.target.value)} />

      <div className="sm:col-span-2 lg:col-span-5 flex gap-2">
        <Button onClick={apply}>Appliquer</Button>
        <Button variant="outline" onClick={reset}>Réinitialiser</Button>
      </div>
    </div>
  )
} 