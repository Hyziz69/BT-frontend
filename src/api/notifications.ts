import api from './axios'

export interface AppNotification {
  id: string
  type: string
  subject: string
  body: string
  is_read: boolean
  sent_at: string | null
  created_at: string
}

export const notificationsApi = {
  list(): Promise<{ notifications: AppNotification[]; unread_count: number }> {
    return api.get('/notifications').then((r) => r.data)
  },

  markRead(id: string): Promise<{ message: string }> {
    return api.patch(`/notifications/${id}/read`).then((r) => r.data)
  },

  markAllRead(): Promise<{ message: string }> {
    return api.patch('/notifications/read-all').then((r) => r.data)
  },

  remove(id: string): Promise<{ message: string }> {
    return api.delete(`/notifications/${id}`).then((r) => r.data)
  },
}
