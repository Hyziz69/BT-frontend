import api from './axios'
import type { ApiResponse, Application } from '@/types'

const BASE_URL = '/program-b/applications'

export const applicationsBApi = {
  // Получить все заявки (Примечание: GET маршрут отсутствует в предоставленном api-program-b.php)
  getAll() {
    return api.get<Application[]>(BASE_URL)
  },

  // Получить одну заявку (Примечание: GET маршрут отсутствует в предоставленном api-program-b.php)
  getOne(id: string | number) {
    return api.get<Application>(`${BASE_URL}/${id}`)
  },

  // Создать заявку
  create(payload: any) {
    return api.post<Application>(BASE_URL, payload)
  },

  // Специфичные методы
  select(id: string | number) {
    return api.post<Application>(`${BASE_URL}/${id}/select`)
  },

  assignMentor(id: string | number, mentorId: string | number) {
    return api.post<Application>(`${BASE_URL}/${id}/assign-mentor`, { mentor_id: mentorId })
  },

  assignPo(id: string | number, poId: string | number) {
    return api.post<Application>(`${BASE_URL}/${id}/assign-po`, { po_id: poId })
  },

  approveDelivery(id: string | number) {
    return api.post<Application>(`${BASE_URL}/${id}/approve-delivery`)
  },
}
