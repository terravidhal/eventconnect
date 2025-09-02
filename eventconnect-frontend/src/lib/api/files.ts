import api from './axios'

export const filesApi = {
  async uploadImage(file: File, eventId?: number) {
    const form = new FormData()
    form.append('file', file)
    if (eventId) form.append('event_id', String(eventId))

    const { data } = await api.post('/upload/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data as { filename: string; url: string; thumb?: string }
  },

  async listEventFiles(eventId: number) {
    const { data } = await api.get(`/events/${eventId}/files`)
    return data as Array<{ filename: string; url: string; thumb?: string }>
  },

  async deleteFile(filename: string) {
    const { data } = await api.delete(`/files/${encodeURIComponent(filename)}`)
    return data as { message: string }
  },
} 