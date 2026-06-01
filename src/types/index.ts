export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  account_type:
    | 'student'
    | 'mentor'
    | 'company_contact'
    | 'editor'
    | 'nti_admin'
    | 'superadmin'
    | 'evaluator'
  status: 'active' | 'pending' | 'suspended'
  profile?: StudentProfile
}

export interface StudentProfile {
  id: string
  user_id: string
  study_program: string | null
  study_year: number | null
  skills: string[] | null
  cv_path: string | null
  academic_declaration: boolean
}

export interface TeamMember extends User {
  pivot?: {
    team_id: string
    user_id: string
    role: string
    joined_at: string
  }
}

export interface Team {
  id: string
  leader_id: string
  name: string
  invite_code: string
  competencies: string[] | null
  member_count?: number
  created_at: string
  updated_at: string | null
  leader?: User
  members?: TeamMember[]
}

export interface Application {
  id: string
  status: string
  score: number | null
  motivation_letter: string | null
  solution_proposal: string | null
  submitted_at: string | null
  decided_at: string | null
  created_at: string
  updated_at: string
  team?: Team
  call?: Call
  documents?: Document[]
  milestones?: Milestone[]
  mentorship?: Mentorship[];
  available_transitions?: string[];
}

export interface Mentorship {
  id: string
  application_id: string
  mentor_id: string
  notes: string | null
  started_at: string | null
  ended_at: string | null
  created_at: string | null
  updated_at: string | null
  mentor: User
}

export interface Call {
  id: string
  title: string
  status: 'draft' | 'open' | 'evaluating' | 'closed'
  closes_at: string | null
  program: {
    id: string
    type: 'program_a' | 'program_b'
    name: string
  }
}

export interface Document {
  id: string
  doc_type: string
  classification: string
  filename: string
  mime_type: string
  file_size: number
  version: number
  uploaded_by: {
    id: string
    name: string
  }
  created_at: string
  download_url: string
}

export interface Milestone {
  id: string
  application_id: string
  title: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  due_date: string | null
  comment: string | null
  is_overdue: boolean
  created_at: string | null
  updated_at: string | null
}

export interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
}

export interface ApiResponse<T> {
  data: T
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    current_page: number
    last_page: number
  }
}
