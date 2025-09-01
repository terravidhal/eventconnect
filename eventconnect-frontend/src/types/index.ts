export interface User {
  id: number
  name: string
  email: string
  phone?: string
  role: 'participant' | 'organisateur' | 'admin'
  avatar?: string
  created_at: string
  updated_at: string
}

export interface Event {
  id: number
  title: string
  description: string
  date: string
  location: string
  latitude?: number
  longitude?: number
  capacity: number
  price?: number
  image?: string
  tags: string[]
  status: 'brouillon' | 'publié' | 'annulé'
  created_at: string
  updated_at: string
  category: Category
  organizer: User
  can_edit?: boolean
  can_delete?: boolean
  can_participate?: boolean
}

export interface Category {
  id: number
  name: string
  icon: string
}

export interface Participation {
  id: number
  event_id: number
  user_id: number
  status: 'inscrit' | 'en_attente' | 'checked_in' | 'annulé'
  notes?: string
  qr_code?: string
  created_at: string
  updated_at: string
  event?: Event
  user?: User
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
