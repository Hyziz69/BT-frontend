import api from './axios'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api'

export const contentApi = {
  getPublic(): Promise<Record<string, string>> {
    return axios.get(`${BASE_URL}/content`).then(r => r.data)
  },

  getAll(): Promise<Array<{ id: string; key: string; label: string; type: string; value: string }>> {
    return api.get('/admin/content').then(r => r.data)
  },

  update(key: string, value: string): Promise<any> {
    return api.patch(`/admin/content/${key}`, { value }).then(r => r.data)
  },
}