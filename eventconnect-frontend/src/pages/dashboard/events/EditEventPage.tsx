import React from 'react'
import { useForm, type Resolver, type SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { eventsApi } from '@/lib/api/events'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import type { Category } from '@/types'

const schema = z.object({
  title: z.string().min(3, 'Au moins 3 caractères'),
  description: z.string().min(10, 'Au moins 10 caractères'),
  date: z.string().min(1, 'Date requise'),
  location: z.string().min(2, 'Lieu requis'),
  capacity: z.coerce.number().int().positive('Capacité > 0'),
  price: z.coerce.number().min(0, 'Prix >= 0').optional(),
  category_id: z.coerce.number().int().positive('Catégorie requise'),
  tags: z.string().optional(),
  status: z.enum(['brouillon', 'publié', 'annulé']).optional(),
  image: z.string().url('URL invalide').optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

export default function EditEventPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const eventId = Number(id)
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['event', eventId],
    enabled: Number.isFinite(eventId) && eventId > 0,
    queryFn: () => eventsApi.get(eventId),
  })

  // Récupérer les catégories
  const { data: filtersData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['available-filters'],
    queryFn: () => eventsApi.availableFilters(),
  })
  
  const categories = (filtersData?.categories || []) as Category[]

  // Préparer les valeurs par défaut basées sur les données
  const getDefaultValues = (): FormValues => {
    if (data) {
      return {
        title: data.title || '',
        description: data.description || '',
        date: data.date?.slice(0, 16) || '',
        location: data.location || '',
        capacity: Number(data.capacity ?? 10),
        price: data.price !== undefined && data.price !== null ? Number(data.price) : 0,
        category_id: Number((data as any).category?.id ?? 1),
        tags: Array.isArray((data as any).tags) ? (data as any).tags.join(', ') : '',
        status: (data.status as FormValues['status']) || 'brouillon',
        image: data.image || '',
      }
    }
    return {
      title: '', description: '', date: '', location: '', capacity: 10,
      price: 0, category_id: 1, tags: '', status: 'brouillon', image: '',
    }
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: getDefaultValues()
  })

  // Réinitialiser le formulaire quand les données changent
  React.useEffect(() => {
    if (data) {
      const formData = getDefaultValues()
      form.reset(formData)
    }
  }, [data, form])

  if (!Number.isFinite(eventId)) return <p className="text-destructive">ID invalide</p>
  if (isLoading) return <p className="text-muted-foreground">Chargement...</p>
  if (isError || !data) return <p className="text-destructive">Événement introuvable.</p>

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    try {
      const payload = {
        ...values,
        tags: values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }
      
      // Supprimer le champ image s'il est vide
      if (!payload.image) {
        delete (payload as any).image
      }
      
      await eventsApi.update(eventId, payload as any)
      
      // Invalider les queries pour rafraîchir les données
      await queryClient.invalidateQueries({ queryKey: ['event', eventId] })
      await queryClient.invalidateQueries({ queryKey: ['events'] })
      await queryClient.invalidateQueries({ queryKey: ['my-events'] })
      
      toast.success('Événement mis à jour')
      navigate('/dashboard/events', { replace: true })
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Mise à jour échouée'
      toast.error(message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Bouton retour */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/events')} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <h2 className="text-2xl font-semibold">Modifier l'événement</h2>
      </div>
      
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

          <FormField control={form.control} name="image" render={({ field }) => (
            <FormItem>
              <FormLabel>Image de l'événement (URL)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/event-image.jpg" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                Entrez l'URL d'une image pour illustrer votre événement (optionnel)
              </p>
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
                <FormLabel>Catégorie</FormLabel>
                <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value ? String(field.value) : undefined} disabled={categoriesLoading || categories.length === 0}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={categoriesLoading ? "Chargement..." : "Choisir une catégorie"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="tags" render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (séparés par des virgules)</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel>Statut</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
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
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard/events')}>Annuler</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
