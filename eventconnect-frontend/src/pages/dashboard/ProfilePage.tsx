import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/store/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'

const schema = z.object({
  name: z.string().min(2, 'Au moins 2 caractères'),
  phone: z.string().optional(),
  avatar: z.string().url('URL invalide').optional().or(z.literal('')),
})

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)

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
      const updated = await authApi.updateProfile(payload)
      updateUser(updated)
      toast.success('Profil mis à jour')
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Échec de la mise à jour'
      toast.error(message)
    }
  }

  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-semibold mb-4">Mon profil</h2>
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
              <FormControl><Input placeholder="https://..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </form>
      </Form>
    </div>
  )
} 