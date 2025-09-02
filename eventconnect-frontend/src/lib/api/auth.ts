import api from './axios'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
  phone?: string
  role: 'participant' | 'organisateur' | 'admin'
}

export interface UpdateProfilePayload {
  name?: string
  phone?: string
  avatar?: string
}

export const authApi = {
  async login(payload: LoginPayload) {
    const { data } = await api.post('/login', payload)
    return data as { token: string; user: any }
  },

  async register(payload: RegisterPayload) {
    const { data } = await api.post('/register', payload)
    return data as { token: string; user: any }
  },

  async logout() {
    const { data } = await api.post('/logout')
    return data
  },

  async getUser() {
    const { data } = await api.get('/user')
    return data as any
  },

  async updateProfile(payload: UpdateProfilePayload) {
    const { data } = await api.put('/user', payload)
    return data as any
  },
} 