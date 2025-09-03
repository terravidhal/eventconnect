import api from './axios'
import type { Event } from '@/types'

export interface EventsFilters {
  category_id?: number
  min_price?: number
  max_price?: number
  date_from?: string
  date_to?: string
  q?: string
  page?: number
  per_page?: number
}

export const eventsApi = {
  async list(filters: EventsFilters = {}) {
    const { data } = await api.get('/events', { params: filters })
    return data as { data: Event[]; current_page?: number; last_page?: number; total?: number }
  },

  async get(id: number) {
    const { data } = await api.get(`/events/${id}`)
    return data as Event
  },

  async create(payload: Partial<Event>) {
    const { data } = await api.post('/events', payload)
    return data as Event
  },

  async update(id: number, payload: Partial<Event>) {
    const { data } = await api.put(`/events/${id}`, payload)
    return data as Event
  },

  async remove(id: number) {
    const { data } = await api.delete(`/events/${id}`)
    return data as { message: string }
  },

  async search(query: string, filters: EventsFilters = {}) {
    const { data } = await api.get('/events/search', { params: { q: query, ...filters } })
    return data as { data?: Event[] } | Event[]
  },

  async availableFilters() {
    const { data } = await api.get('/events/available-filters')
    return data as any
  },

  async popular() {
    const { data } = await api.get('/events/popular')
    return data as Event[]
  },

  async myEvents() {
    const { data } = await api.get('/my-events')
    return data as Event[]
  },
} 