import api from './axios'

export const participationsApi = {
  async participate(eventId: number, notes?: string) {
    const { data } = await api.post(`/events/${eventId}/participate`, { notes })
    return data
  },

  async cancel(eventId: number) {
    const { data } = await api.delete(`/events/${eventId}/cancel-participation`)
    return data
  },

  async myParticipations() {
    const { data } = await api.get('/my-participations')
    return data
  },

  async checkInForEvent(eventId: number, qr_code: string) {
    const { data } = await api.post(`/events/${eventId}/checkin`, { qr_code })
    return data
  },

  async checkIn(qr_code: string) {
    // fallback si route globale existe, sinon utiliser checkInForEvent
    const { data } = await api.post('/participations/check-in', { qr_code })
    return data
  },

  async participants(eventId: number) {
    const { data } = await api.get(`/events/${eventId}/participants`)
    return data
  },
} 