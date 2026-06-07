import api from '../axios.ts'
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

  assignMentor(applicationId: string | number, mentorId: string | number) {
    return api.post<Application>(`${BASE_URL}/${applicationId}/mentorships`, { mentor_id: mentorId })
  },

  endMentorship(applicationId: string, mentorshipId: string) {
    return api.patch(`${BASE_URL}/${applicationId}/mentorships/${mentorshipId}/end`);
  },

  assignPo(id: string | number, poId: string | number) {
    return api.post<Application>(`${BASE_URL}/${id}/assign-po`, { po_id: poId })
  },

  approveDelivery(id: string | number) {
    return api.post<Application>(`${BASE_URL}/${id}/approve-delivery`)
  },

  transition(id: string | number, status: string, decision_notes: string | null, score: number | null) {
    return api.patch<Application>(`${BASE_URL}/${id}/transition`, { status, decision_notes, score })
  },

  getMentors() {
    return api.get('/admin/users', {
      params: {
        account_type: 'mentor',
        status: 'active'
      }
    }).then(response => response.data);
  }
}
