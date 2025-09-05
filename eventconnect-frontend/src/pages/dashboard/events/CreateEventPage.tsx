import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { eventsApi } from '@/lib/api/events'
import { useQuery } from '@tanstack/react-query'
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
  capacity: z.number().int().positive('Capacité > 0'),
  price: z.number().min(0, 'Prix >= 0').optional(),
  category_id: z.number().int().positive('Catégorie requise'),
  tags: z.string().optional(),
  status: z.enum(['brouillon', 'publié', 'annulé']),
  image: z.string().url('URL invalide').optional().or(z.literal('')),
})

export default function CreateEventPage() {
  const navigate = useNavigate()
  
  // Récupérer les catégories
  const { data: filtersData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['available-filters'],
    queryFn: () => eventsApi.availableFilters(),
  })
  
  const categories = (filtersData?.categories || []) as Category[]
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      date: '',
      location: '',
      capacity: 10 as number,
      price: 0 as number,
      category_id: 1 as number,
      tags: '',
      status: 'brouillon',
      image: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const payload = {
        ...values,
        tags: values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }
      
      // Supprimer le champ image s'il est vide
      if (!payload.image) {
        delete (payload as any).image
      }
      
      await eventsApi.create(payload as any)
      toast.success('Événement créé')
      navigate('/dashboard/events', { replace: true })
    } catch (err: any) {
      const message = err?.response?.data?.message || "Échec de la création"
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
        <h2 className="text-2xl font-semibold">Créer un événement</h2>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 max-w-2xl">
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl><Input placeholder="Nom de l'événement" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl><Textarea rows={4} placeholder="Décrivez l'événement" {...field} /></FormControl>
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
              <FormControl><Input placeholder="Ville, adresse..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField control={form.control} name="capacity" render={({ field }) => (
              <FormItem>
                <FormLabel>Capacité</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                  </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="price" render={({ field }) => (
              <FormItem>
                <FormLabel>Prix (€)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min={0} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                  </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="category_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
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
              <FormControl><Input placeholder="musique, plein air" {...field} /></FormControl>
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
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Création...' : 'Créer'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard/events')}>Annuler</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
