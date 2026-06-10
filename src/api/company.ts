import api from './axios'
import type {
  Company,
  CompanyInvitation,
  CompanyMember,
  CompanyRole,
} from '../types'

export interface CompanyRegisterPayload {
  name: string
  ico: string
  sector: string
  description?: string
  website?: string
}

export const companyApi = {
  register(payload: CompanyRegisterPayload): Promise<{ message: string; company: Company }> {
    return api.post('/program-b/companies/register', payload).then((r) => r.data)
  },

  get(id: string): Promise<{ company: Company }> {
    return api.get(`/program-b/companies/${id}`).then((r) => r.data)
  },

  update(id: string, payload: Partial<CompanyRegisterPayload>): Promise<{ message: string; company: Company }> {
    return api.put(`/program-b/companies/${id}`, payload).then((r) => r.data)
  },

  members(companyId: string): Promise<{ members: CompanyMember[]; invitations: CompanyInvitation[] }> {
    return api.get(`/program-b/companies/${companyId}/members`).then((r) => r.data)
  },

  invite(
    companyId: string,
    email: string,
    role: CompanyRole = 'member',
  ): Promise<{ message: string; invitation: CompanyInvitation }> {
    return api.post(`/program-b/companies/${companyId}/members/invite`, { email, role }).then((r) => r.data)
  },

  cancelInvitation(companyId: string, invitationId: string): Promise<{ message: string }> {
    return api
      .delete(`/program-b/companies/${companyId}/members/invitations/${invitationId}`)
      .then((r) => r.data)
  },

  updateRole(companyId: string, userId: string, role: CompanyRole): Promise<{ message: string }> {
    return api.patch(`/program-b/companies/${companyId}/members/${userId}`, { role }).then((r) => r.data)
  },

  kick(companyId: string, userId: string): Promise<{ message: string }> {
    return api.delete(`/program-b/companies/${companyId}/members/${userId}`).then((r) => r.data)
  },

  leave(companyId: string): Promise<{ message: string }> {
    return api.post(`/program-b/companies/${companyId}/members/leave`).then((r) => r.data)
  },

  previewInvitation(token: string): Promise<{
    email: string
    company_name: string
    role: CompanyRole
    role_label: string
    expires_at: string
  }> {
    return api.get(`/program-b/companies/invitations/${token}`).then((r) => r.data)
  },

  acceptInvitation(token: string): Promise<{ message: string; company_id: string }> {
    return api.post('/program-b/companies/invitations/accept', { token }).then((r) => r.data)
  },

  rejectInvitation(token: string): Promise<{ message: string }> {
    return api.post('/program-b/companies/invitations/reject', { token }).then((r) => r.data)
  },
}