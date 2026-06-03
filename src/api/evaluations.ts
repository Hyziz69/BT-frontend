import api from './axios'

export const evaluationsApi = {
  getAll(applicationId: string): Promise<{ data: any[] }> {
    return api.get(`/program-a/applications/${applicationId}/evaluations`).then(r => r.data)
  },

  create(applicationId: string, payload: {
    score: number
    comment?: string
    criterion?: string
  }): Promise<{ data: any }> {
    return api.post(`/program-a/applications/${applicationId}/evaluations`, payload).then(r => r.data)
  },

  delete(applicationId: string, evaluationId: string): Promise<void> {
    return api.delete(`/program-a/applications/${applicationId}/evaluations/${evaluationId}`)
  },
}