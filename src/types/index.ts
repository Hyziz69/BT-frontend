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
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'leader' | 'member'
  joined_at: string
}

export interface Team {
  id: string
  name: string
  competencies: string[]
  leader: {
    id: string
    name: string
    email: string
  }
  members: TeamMember[]
  member_count: number
  created_at: string
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
  title: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  due_date: string | null
  comment: string | null
  is_overdue: boolean
  created_at: string
  updated_at: string
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
