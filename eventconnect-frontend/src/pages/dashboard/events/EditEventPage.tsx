import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { eventsApi } from '@/lib/api/events'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import ImageUpload from '@/components/files/ImageUpload'
import ImageGallery from '@/components/files/ImageGallery'

const schema = z.object({
  title: z.string().min(3, 'Au moins 3 caractères'),
  description: z.string().min(10, 'Au moins 10 caractères'),
  date: z.string().min(1, 'Date requise'),
  location: z.string().min(2, 'Lieu requis'),
  capacity: z.coerce.number().int().positive('Capacité > 0'),
  price: z.coerce.number().min(0, 'Prix >= 0').optional(),
  category_id: z.coerce.number().int().positive('Catégorie requise'),
  tags: z.string().optional(),
  status: z.enum(['brouillon', 'publié', 'annulé']).default('brouillon'),
})

export default function EditEventPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const eventId = Number(id)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['event', eventId],
    enabled: Number.isFinite(eventId) && eventId > 0,
    queryFn: () => eventsApi.get(eventId),
  })

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '', description: '', date: '', location: '', capacity: 10,
      price: 0, category_id: 1, tags: '', status: 'brouillon',
    }
  })

  React.useEffect(() => {
    if (data) {
      form.reset({
        title: data.title,
        description: data.description,
        date: data.date?.slice(0, 16),
        location: data.location,
        capacity: data.capacity,
        price: data.price ?? 0,
        category_id: (data as any).category?.id ?? 1,
        tags: Array.isArray((data as any).tags) ? (data as any).tags.join(', ') : '',
        status: data.status as any,
      })
    }
  }, [data])

  if (!Number.isFinite(eventId)) return <p className="text-destructive">ID invalide</p>
  if (isLoading) return <p className="text-muted-foreground">Chargement...</p>
  if (isError || !data) return <p className="text-destructive">Événement introuvable.</p>

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const payload = {
        ...values,
        tags: values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }
      await eventsApi.update(eventId, payload as any)
      toast.success('Événement mis à jour')
      navigate('/dashboard/events', { replace: true })
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Mise à jour échouée'
      toast.error(message)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Modifier l'événement</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 max-w-2xl">
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl><Textarea rows={4} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem>
              <FormLabel>Date et heure</FormLabel>
              <FormControl><Input type="datetime-local" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="location" render={({ field }) => (
            <FormItem>
              <FormLabel>Lieu</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField control={form.control} name="capacity" render={({ field }) => (
              <FormItem>
                <FormLabel>Capacité</FormLabel>
                <FormControl><Input type="number" min={1} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="price" render={({ field }) => (
              <FormItem>
                <FormLabel>Prix (€)</FormLabel>
                <FormControl><Input type="number" step="0.01" min={0} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="category_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie (ID)</FormLabel>
                <FormControl><Input type="number" min={1} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="tags" render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel>Statut</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="publié">Publié</SelectItem>
                  <SelectItem value="annulé">Annulé</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <div className="flex gap-2">
            <Button type="submit">Enregistrer</Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Annuler</Button>
          </div>
        </form>
      </Form>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Images de l'événement</h3>
        <ImageUpload eventId={eventId} onUploaded={() => { /* Optionally trigger gallery refresh via state */ }} />
        <ImageGallery eventId={eventId} />
      </div>
    </div>
  )
} 