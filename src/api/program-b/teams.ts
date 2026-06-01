import api from '../axios.ts'
import type { ApiResponse, PaginatedResponse, Team } from '@/types'

export const teamsApi = {
  getAll(): Promise<{ data: Team[] }> {
    return api.get('/program-b/teams').then((r) => r.data)
  },

  getOne(id: string): Promise<ApiResponse<Team>> {
    return api.get(`/program-b/teams/${id}`).then((r) => r.data)
  },

  create(payload: { name: string; competencies: string[] }): Promise<ApiResponse<Team>> {
    return api.post('/program-b/teams', payload).then((r) => r.data)
  },

  update(
    id: string,
    payload: { name: string; competencies: string[] },
  ): Promise<ApiResponse<Team>> {
    return api.put(`/program-b/teams/${id}`, payload).then((r) => r.data)
  },

  // НОВЫЙ МЕТОД: Вступление по инвайт-коду
  join(inviteCode: string): Promise<ApiResponse<Team>> {
    return api.post('/program-b/teams/join', { invite_code: inviteCode }).then((r) => r.data)
  },

  // Удаление участника (kick)
  removeMember(teamId: string, userId: string): Promise<void> {
    return api.delete(`/program-b/teams/${teamId}/members/${userId}`).then((r) => r.data)
  },

  leave(teamId: string): Promise<void> {
    return api.post(`/program-b/teams/${teamId}/leave`).then((r) => r.data)
  }
}
