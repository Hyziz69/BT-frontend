import api from './axios'
import type { Consultation, Mentorship } from '../types'

export interface ConsultationPayload {
  scheduled_at: string
  notes?: string
  feedback?: string
}

export const mentorApi = {
  // The current mentor's mentorships (mentees).
  mentorships(): Promise<{ mentorships: Mentorship[] }> {
    return api.get('/mentor/mentorships').then((r) => r.data)
  },

  // One mentorship in detail (team, project, consultations).
  mentorship(id: string): Promise<{ mentorship: Mentorship }> {
    return api.get(`/mentor/mentorships/${id}`).then((r) => r.data)
  },

  // Log a consultation for a mentorship.
  logConsultation(
    id: string,
    payload: ConsultationPayload,
  ): Promise<{ message: string; consultation: Consultation }> {
    return api.post(`/mentor/mentorships/${id}/consultations`, payload).then((r) => r.data)
  },
}
