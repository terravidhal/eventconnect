import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (token: string, user: User) => {
        localStorage.setItem('token', token)
        set({ 
          token, 
          user, 
          isAuthenticated: true 
        })
      },
      
      logout: () => {
        localStorage.removeItem('token')
        set({ 
          token: null, 
          user: null, 
          isAuthenticated: false 
        })
      },
      
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData }
          set({ 
            user: updatedUser
          })
          // Forcer la mise à jour du localStorage
          localStorage.setItem('auth-storage', JSON.stringify({
            state: {
              user: updatedUser,
              token: get().token,
              isAuthenticated: get().isAuthenticated
            },
            version: 0
          }))
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)
