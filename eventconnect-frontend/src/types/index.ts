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

export interface Participation {
  id: number
  event_id: number
  user_id: number
  status: 'inscrit' | 'en_attente' | 'annulé' | 'checked_in'
  notes?: string
  qr_code?: string
  created_at: string
  updated_at: string
  event?: Event
  user?: User
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
  // Nouvelles propriétés pour la gestion des places
  participants_count?: number
  available_spots?: number
  is_full?: boolean
  participation_rate?: number
  is_participating?: boolean
  participation_status?: 'inscrit' | 'en_attente' | 'annulé' | null
  // Participations pour la liste des événements
  participations?: Participation[]
}

export interface Category {
  id: number
  name: string
  icon: string
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
