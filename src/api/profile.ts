import api from './axios'
import type { User } from '../types'

export interface ProfileCompany {
  id: string
  name: string
  sector: string | null
  status: string | null
}

export interface ProfileUser extends User {
  full_name?: string
  avatar_path?: string | null
  avatar_url?: string | null
  bio?: string | null
  phone?: string | null
  linkedin_url?: string | null
  github_url?: string | null
  portfolio_url?: string | null
  gdpr_consent?: boolean | null
  gdpr_consented_at?: string | null
  email_verified_at?: string | null
  created_at?: string | null
  company?: ProfileCompany | null
}

export interface StudentProfileData {
  study_program: string | null
  study_year: number | null
  skills: string[]
  cv_path?: string | null
  cv_url: string | null
  academic_declaration: boolean | null
  academic_notes: string | null
}

export interface ProfileStats {
  teams_count: number
  led_teams_count: number
  applications_count: number
  submitted_applications_count: number
  approved_applications_count: number
  rejected_applications_count: number
  active_applications_count: number
  mentor_assignments_count: number
}

export interface ProfileTeam {
  id: string
  name: string
  role: string | null
  joined_at: string | null
}

export interface ProfileRecentApplication {
  id: string
  status: string
  submitted_at: string | null
  created_at: string | null
  team: {
    id: string
    name: string
  } | null
  call: {
    id: string
    title: string
    status: string
    program: {
      id: string
      name: string
      type: string
    } | null
  } | null
}

export interface ProfileOverview {
  user: ProfileUser
  student_profile: StudentProfileData | null
  stats: ProfileStats
  teams: ProfileTeam[]
  recent_applications: ProfileRecentApplication[]
}

export interface ProfileCard {
  user: ProfileUser
  teams: Array<{
    id: string
    name: string
  }>
}

export interface UpdateProfileDetailsPayload {
  first_name: string
  last_name: string
  bio?: string | null
  phone?: string | null
  linkedin_url?: string | null
  github_url?: string | null
  portfolio_url?: string | null
}

export interface UpdateStudentProfilePayload {
  study_program: string | null
  study_year: number | null
  skills: string[]
  academic_declaration: boolean
}

export interface ChangePasswordPayload {
  current_password: string
  password: string
  password_confirmation: string
}

export const profileApi = {
  getOverview(): Promise<ProfileOverview> {
    return api.get('/profile/overview').then((r) => r.data)
  },

  getPublicProfile(userId: string): Promise<ProfileOverview> {
    return api.get(`/users/${userId}/profile`).then((r) => r.data)
  },

  getProfileCard(userId: string): Promise<ProfileCard> {
    return api.get(`/users/${userId}/profile-card`).then((r) => r.data)
  },

  updateDetails(payload: UpdateProfileDetailsPayload): Promise<{ message: string; user: ProfileUser }> {
    return api.patch('/profile/details', payload).then((r) => r.data)
  },

  updateAvatar(file: File): Promise<{ message: string; user: ProfileUser }> {
    const formData = new FormData()
    formData.append('avatar', file, file.name)

    return api.post('/profile/avatar', formData).then((r) => r.data)
  },

  deleteAvatar(): Promise<{ message: string; user: ProfileUser }> {
    return api.delete('/profile/avatar').then((r) => r.data)
  },

  uploadCv(file: File): Promise<{ message: string; student_profile: StudentProfileData }> {
    const formData = new FormData()
    formData.append('cv', file, file.name)

    return api.post('/profile/cv', formData).then((r) => r.data)
  },

  deleteCv(): Promise<{ message: string; student_profile: StudentProfileData }> {
    return api.delete('/profile/cv').then((r) => r.data)
  },

  updateStudentProfile(
    payload: UpdateStudentProfilePayload,
  ): Promise<{ message: string; student_profile: StudentProfileData }> {
    return api.patch('/profile/student-profile', payload).then((r) => r.data)
  },

  changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
    return api.patch('/profile/password', payload).then((r) => r.data)
  },
}