import api from './axios'
import type { Application, Call, Program } from '../types'

export type AdminUser = {
  id: string
  first_name: string
  last_name: string
  email: string
  account_type: string
  status: string
  gdpr_consent?: boolean
  created_at: string
  approved_at?: string | null
}

export type AdminDashboardStats = {
  users_count: number
  active_users_count: number
  pending_users_count: number
  rejected_users_count: number
  students_count: number
  admins_count: number

  mentors_count: number
  active_mentors_count: number
  available_mentors_count: number

  teams_count: number
  teams_with_active_projects_count: number

  total_programs: number
  active_programs: number

  total_calls: number
  open_calls: number
  evaluating_calls: number
  closed_calls: number
  draft_calls: number

  total_applications: number
  applications_waiting_count: number
  approved_applications: number
  active_projects_count: number
  completed_applications: number
  rejected_applications: number
  pending_applications: number

  total_users?: number
  pending_users?: number
  active_users?: number
  rejected_users?: number
  total_mentors?: number
}

export type AdminApplication = Application & {
  latest_mentorship?: {
    id: string
    mentor_id: string
    mentor?: AdminUser
    started_at: string
    ended_at?: string | null
    notes?: string | null
  } | null
  mentorships?: Array<{
    id: string
    mentor_id: string
    mentor?: AdminUser
    started_at: string
    ended_at?: string | null
    notes?: string | null
  }>
}

export interface AdminAuditActor {
  id: string
  first_name: string
  last_name: string
  email: string
  account_type: string
}

export interface AdminAuditEvent {
  id: string
  actor_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  payload: {
    label?: string | null
    method?: string
    path?: string
    status_code?: number
    request?: Record<string, unknown>
    route_parameters?: Record<string, unknown>
    [key: string]: unknown
  } | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  actor?: AdminAuditActor | null
}

export interface AdminAuditEventsResponse {
  data: AdminAuditEvent[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export interface AdminAuditEventFilters {
  actions: string[]
  entity_types: Array<string | {
    value: string
    label: string
  }>
}

export interface AdminAuditEventQuery {
  search?: string
  action?: string
  entity_type?: string
  actor_id?: string
  date_from?: string
  date_to?: string
  per_page?: number
  page?: number
  sort?: 'newest' | 'oldest'
}

export const adminApi = {
  getDashboard(): Promise<AdminDashboardStats> {
    return api.get('/admin/dashboard').then((r) => r.data)
  },

  getAuditEvents(params?: AdminAuditEventQuery): Promise<AdminAuditEventsResponse> {
    return api.get('/admin/audit-events', { params }).then((r) => r.data)
  },

  getAuditEventFilters(): Promise<AdminAuditEventFilters> {
    return api.get('/admin/audit-events/filters').then((r) => r.data)
  },

  getUsers(params?: Record<string, string>): Promise<AdminUser[]> {
    return api.get('/admin/users', { params }).then((r) => r.data)
  },

  approveUser(id: string) {
    return api.patch(`/admin/users/${id}/approve`).then((r) => r.data)
  },

  rejectUser(id: string) {
    return api.patch(`/admin/users/${id}/reject`).then((r) => r.data)
  },

  deleteUser(id: string) {
    return api.delete(`/admin/users/${id}`).then((r) => r.data)
  },

  updateUserRole(id: string, accountType: string) {
    return api.patch(`/admin/users/${id}`, {
      account_type: accountType,
    }).then((r) => r.data)
  },

  updateUser(id: string, payload: { account_type?: string; status?: string }) {
    return api.patch(`/admin/users/${id}`, payload).then((r) => r.data)
  },

  getPrograms(): Promise<Program[]> {
    return api.get('/admin/programs').then((r) => r.data)
  },

  createProgram(payload: Partial<Program>) {
    return api.post('/admin/programs', payload).then((r) => r.data)
  },

  updateProgram(id: string, payload: Partial<Program>) {
    return api.patch(`/admin/programs/${id}`, payload).then((r) => r.data)
  },

  getCalls(): Promise<Call[]> {
    return api.get('/admin/calls').then((r) => r.data)
  },

  createCall(payload: any) {
    return api.post('/admin/calls', payload).then((r) => r.data)
  },

  updateCall(id: string, payload: any) {
    return api.patch(`/admin/calls/${id}`, payload).then((r) => r.data)
  },

  openCall(id: string) {
    return api.patch(`/admin/calls/${id}/open`).then((r) => r.data)
  },

  closeCall(id: string) {
    return api.patch(`/admin/calls/${id}/close`).then((r) => r.data)
  },

  getApplications(): Promise<AdminApplication[]> {
    return api.get('/admin/applications').then((r) => r.data)
  },

  transitionApplication(id: string, status: string) {
    return api.patch(`/program-a/applications/${id}/transition`, { status }).then((r) => r.data)
  },

  assignMentor(applicationId: string, mentorId: string, notes?: string) {
    return api
      .patch(`/admin/applications/${applicationId}/assign-mentor`, {
        mentor_id: mentorId,
        notes,
      })
      .then((r) => r.data)
  },
    updateApplicationStatus(applicationId: string, status: string) {
    return api
      .patch(`/admin/applications/${applicationId}/status`, {
        status,
      })
      .then((r) => r.data)
  },
}