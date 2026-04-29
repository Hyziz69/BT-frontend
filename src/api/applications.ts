import api from './axios'
import type { ApiResponse, Application } from '../types'

export const applicationsApi = {
  getAll(status?: string): Promise<{ data: Application[] }> {
    return api.get('/program-a/applications', { params: { status } }).then((r) => r.data)
  },

  getOne(id: string): Promise<ApiResponse<Application>> {
    return api.get(`/program-a/applications/${id}`).then((r) => r.data)
  },

  create(payload: {
    call_id: string
    team_id: string
    motivation_letter?: string
    solution_proposal?: string
  }): Promise<ApiResponse<Application>> {
    return api.post('/program-a/applications', payload).then((r) => r.data)
  },

  update(
    id: string,
    payload: {
      motivation_letter?: string
      solution_proposal?: string
    },
  ): Promise<ApiResponse<Application>> {
    return api.put(`/program-a/applications/${id}`, payload).then((r) => r.data)
  },

  transition(
    id: string,
    status: string,
    decision_notes?: string,
  ): Promise<ApiResponse<Application>> {
    return api
      .patch(`/program-a/applications/${id}/transition`, { status, decision_notes })
      .then((r) => r.data)
  },
}
