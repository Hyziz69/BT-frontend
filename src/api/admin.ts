import api from './axios'

export interface AdminUser {
  id: string
  first_name: string
  last_name: string
  email: string
  account_type: string
  status: string
  gdpr_consent: boolean
  created_at: string
}

export interface AdminDashboardStats {
  users_count: number
  active_users_count: number
  pending_users_count: number
  rejected_users_count: number
  students_count: number
  admins_count: number
  mentors_count: number
  total_programs: number
  active_programs: number
  total_calls: number
  open_calls: number
  closed_calls: number
  draft_calls: number
  total_applications: number
  approved_applications: number
  rejected_applications: number
  pending_applications: number
}

export interface AdminProgram {
  id: string
  type: 'program_a' | 'program_b'
  name: string
  description: string | null
  min_team_size: number
  max_team_size: number
  is_active: boolean
  calls_count?: number
}

export interface AdminCall {
  id: string
  program_id: string
  title: string
  description: string | null
  status: 'draft' | 'open' | 'evaluating' | 'closed'
  opens_at: string | null
  closes_at: string | null
  applications_count?: number
  program?: {
    id: string
    type: string
    name: string
  }
}

export interface AdminApplication {
  id: string
  status: string
  submitted_at: string | null
  team?: {
    id: string
    name: string
  }
  call?: {
    id: string
    title: string
    program?: {
      id: string
      name: string
      type: string
    }
  }
  mentorships?: Array<{
    id: string
    mentor?: {
      id: string
      first_name: string
      last_name: string
      email: string
    }
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
  entity_type: string
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
  entity_types: Array<{
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

  getUsers(params?: Record<string, string>) {
    return api.get('/admin/users', { params }).then((r) => r.data as AdminUser[])
  },

  approveUser(id: string) {
    return api.patch(`/admin/users/${id}/approve`).then((r) => r.data)
  },

  updateUser(id: string, payload: { account_type?: string; status?: string }) {
    return api.patch(`/admin/users/${id}`, payload).then((r) => r.data)
  },

  rejectUser(id: string) {
    return api.patch(`/admin/users/${id}/reject`).then((r) => r.data)
  },

  transitionApplication(id: string, status: string) {
    return api.patch(`/program-a/applications/${id}/transition`, { status }).then(r => r.data)
  },

  deleteUser(id: string) {
    return api.delete(`/admin/users/${id}`).then((r) => r.data)
  },

  getPrograms(): Promise<AdminProgram[]> {
    return api.get('/admin/programs').then((r) => r.data)
  },

  createProgram(payload: Partial<AdminProgram>) {
    return api.post('/admin/programs', payload).then((r) => r.data)
  },

  updateProgram(id: string, payload: Partial<AdminProgram>) {
    return api.patch(`/admin/programs/${id}`, payload).then((r) => r.data)
  },

  getCalls(): Promise<AdminCall[]> {
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

  assignMentor(applicationId: string, mentorId: string, notes?: string) {
    return api
      .post(`/program-b/applications/${applicationId}/mentorships`, {
        mentor_id: mentorId,
        notes,
      })
      .then((r) => r.data)
  },
  endMentorship(applicationId: string, mentorshipId: string, notes?: string) {
    return api
      .patch(`/program-b/applications/${applicationId}/mentorships/${mentorshipId}/end`, {
        notes
      })
      .then((r) => r.data)
  },
}
