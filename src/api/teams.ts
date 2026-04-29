import api from './axios'
import type { ApiResponse, PaginatedResponse, Team } from '../types'

export const teamsApi = {
  getAll(): Promise<{ data: Team[] }> {
    return api.get('/program-a/teams').then((r) => r.data)
  },

  getOne(id: string): Promise<ApiResponse<Team>> {
    return api.get(`/program-a/teams/${id}`).then((r) => r.data)
  },

  create(payload: { name: string; competencies: string[] }): Promise<ApiResponse<Team>> {
    return api.post('/program-a/teams', payload).then((r) => r.data)
  },

  update(
    id: string,
    payload: { name: string; competencies: string[] },
  ): Promise<ApiResponse<Team>> {
    return api.put(`/program-a/teams/${id}`, payload).then((r) => r.data)
  },

  addMember(teamId: string, email: string): Promise<ApiResponse<Team>> {
    return api.post(`/program-a/teams/${teamId}/members`, { email }).then((r) => r.data)
  },

  removeMember(teamId: string, userId: string): Promise<void> {
    return api.delete(`/program-a/teams/${teamId}/members/${userId}`).then((r) => r.data)
  },
}
