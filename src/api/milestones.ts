import api from './axios'

export const milestonesApi = {
  getAll(applicationId: string): Promise<{ data: any[] }> {
    return api.get(`/program-a/applications/${applicationId}/milestones`).then(r => r.data)
  },

  create(applicationId: string, payload: { title: string; due_date?: string; comment?: string }): Promise<{ data: any }> {
    return api.post(`/program-a/applications/${applicationId}/milestones`, payload).then(r => r.data)
  },

  update(applicationId: string, milestoneId: string, payload: { status: string; comment?: string }): Promise<{ data: any }> {
    return api.patch(`/program-a/applications/${applicationId}/milestones/${milestoneId}`, payload).then(r => r.data)
  },

  delete(applicationId: string, milestoneId: string): Promise<void> {
    return api.delete(`/program-a/applications/${applicationId}/milestones/${milestoneId}`)
  },
}