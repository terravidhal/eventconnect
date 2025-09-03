import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/store/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, User } from 'lucide-react'
import { Link } from 'react-router-dom'

const schema = z.object({
  name: z.string().min(2, 'Au moins 2 caractères'),
  phone: z.string().optional(),
  avatar: z.string().url('URL invalide').optional().or(z.literal('')),
})

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      avatar: user?.avatar || '',
    },
  })

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const payload = { ...values }
      if (!payload.avatar) delete (payload as any).avatar
      
      // Le backend retourne { message: '...', user: {...} }
      const response = await authApi.updateProfile(payload)
      
      // Extraire l'utilisateur de la réponse
      const updatedUser = response.user || response
      
      // Mettre à jour le store
      updateUser(updatedUser)
      
      // Invalider les queries pour forcer le rafraîchissement
      queryClient.invalidateQueries({ queryKey: ['user'] })
      
      toast.success('Profil mis à jour avec succès')
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Échec de la mise à jour'
      toast.error(message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Bouton retour */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link to="/events" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour aux événements
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Mon profil</h1>
      </div>

      <div className="max-w-2xl">
        {/* Affichage de l'avatar actuel */}
        <div className="mb-6 p-4 border rounded-lg bg-muted/30">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Avatar actuel</h3>
          <div className="flex items-center gap-4">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name || 'Avatar'} 
                className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                }}
              />
            ) : null}
            <div className={`w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-semibold ${user?.avatar ? 'hidden' : ''}`}>
              {user?.name?.slice(0,1)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {user?.avatar ? 'Image personnalisée' : 'Initiales par défaut'}
              </p>
              {user?.avatar && (
                <p className="text-xs text-muted-foreground mt-1 break-all">
                  {user.avatar}
                </p>
              )}
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="avatar" render={({ field }) => (
              <FormItem>
                <FormLabel>Avatar (URL)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://example.com/avatar.jpg" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground">
                  Entrez l'URL d'une image pour personnaliser votre avatar
                </p>
              </FormItem>
            )} />

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
