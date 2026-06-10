import api from './axios'
import type { Application, Challenge, StudentProject } from '../types'

export interface PersonOption {
  id: string
  first_name: string
  last_name: string
}

export interface ChallengePayload {
  title: string
  technical_spec: string
  call_id?: string | null
  budget?: number | null
  product_owner_id?: string | null
}

export const challengesApi = {
  // Role-aware: company managers receive their own challenges (drafts included).
  list(): Promise<{ challenges: Challenge[] }> {
    return api.get('/program-b/challenges').then((r) => r.data)
  },

  get(id: string): Promise<{
    challenge: Challenge
    can_manage: boolean
    po_candidates?: PersonOption[]
    mentor_candidates?: PersonOption[]
    assigned_application_id?: string
    current_mentor?: { id: string; name: string } | null
  }> {
    return api.get(`/program-b/challenges/${id}`).then((r) => r.data)
  },

  create(payload: ChallengePayload): Promise<{ message: string; challenge: Challenge }> {
    return api.post('/program-b/challenges', payload).then((r) => r.data)
  },

  update(
    id: string,
    payload: Partial<ChallengePayload>,
  ): Promise<{ message: string; challenge: Challenge }> {
    return api.put(`/program-b/challenges/${id}`, payload).then((r) => r.data)
  },

  updateStatus(id: string, status: string): Promise<{ message: string; challenge: Challenge }> {
    return api.patch(`/program-b/challenges/${id}/status`, { status }).then((r) => r.data)
  },

  // Candidate teams (applications) that applied to this challenge.
  candidates(id: string): Promise<{ applications: Application[] }> {
    return api.get(`/program-b/challenges/${id}/applications`).then((r) => r.data)
  },
}

export interface ApplyPayload {
  call_id: string
  challenge_id: string
  team_id?: string
  motivation_letter?: string
  solution_proposal?: string
}

// Program B application actions.
export const challengeApplicationsApi = {
  // The current student's own Program B applications (with challenge + status).
  mine(): Promise<{ applications: Application[] }> {
    return api.get('/program-b/applications').then((r) => r.data)
  },

  // One application as a "project": challenge, team, milestones, mentor & feedback.
  project(applicationId: string): Promise<{ application: StudentProject }> {
    return api.get(`/program-b/applications/${applicationId}`).then((r) => r.data)
  },

  // Student (team leader) applies their team to a challenge.
  apply(payload: ApplyPayload): Promise<{ message: string; application: Application }> {
    return api.post('/program-b/applications', payload).then((r) => r.data)
  },

  // Select the winning team; backend auto-rejects the others for this challenge.
  select(applicationId: string): Promise<{ message: string }> {
    return api.post(`/program-b/applications/${applicationId}/select`).then((r) => r.data)
  },

  // Admin assigns a university mentor to the selected team's project.
  assignMentor(applicationId: string, mentorId: string): Promise<{ message: string }> {
    return api
      .post(`/program-b/applications/${applicationId}/assign-mentor`, { mentor_id: mentorId })
      .then((r) => r.data)
  },

  // Project milestones (mentor / company / admin).
  addMilestone(applicationId: string, payload: MilestonePayload): Promise<{ message: string }> {
    return api.post(`/program-b/applications/${applicationId}/milestones`, payload).then((r) => r.data)
  },

  updateMilestone(
    applicationId: string,
    milestoneId: string,
    payload: MilestonePayload,
  ): Promise<{ message: string }> {
    return api
      .patch(`/program-b/applications/${applicationId}/milestones/${milestoneId}`, payload)
      .then((r) => r.data)
  },

  // Company approves the final delivery → project closed.
  approveDelivery(applicationId: string): Promise<{ message: string }> {
    return api.post(`/program-b/applications/${applicationId}/approve-delivery`).then((r) => r.data)
  },
}

export interface MilestonePayload {
  title?: string
  status?: string
  due_date?: string | null
  comment?: string | null
}
