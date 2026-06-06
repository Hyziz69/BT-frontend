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
  company_id?: string | null
  company_role?: CompanyRole | null
}

export type CompanyRole = 'owner' | 'manager' | 'member'

export interface Company {
  id: string
  name: string
  ico: string | null
  sector: string | null
  description: string | null
  website: string | null
  status: 'active' | 'pending' | 'inactive'
}

export interface CompanyMember {
  id: string
  name: string
  email: string
  role: CompanyRole
  role_label: string
  status: string
}

export interface CompanyInvitation {
  id: string
  email: string
  role: CompanyRole
  status: string
  expires_at: string
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
  challenge?: Challenge & { company?: { id: string; name: string } }
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

export interface Challenge {
  id: string
  title: string
  technical_spec?: string | null
  status: 'draft' | 'published' | 'matching' | 'assigned' | 'in_progress' | 'closed'
  budget?: number | string | null
  company_id: string
  call_id?: string | null
  product_owner_id?: string | null
  team_id?: string | null
  candidates_count?: number
  created_at?: string
  updated_at?: string
  company?: { id: string; name: string } | null
  product_owner?: { id: string; first_name: string; last_name: string } | null
  call?: { id: string; title: string } | null
  selected_team?: { id: string; name: string } | null
}

export interface Consultation {
  id: string
  scheduled_at: string | null
  notes: string | null
  feedback: string | null
  created_at?: string
}

export interface MentorshipPerson {
  id: string
  first_name: string
  last_name: string
  email: string
}

export interface StudentProject {
  id: string
  status: string
  submitted_at: string | null
  decided_at: string | null
  challenge?: {
    id: string
    title: string
    status: string
    technical_spec?: string | null
    budget?: number | string | null
    company?: { id: string; name: string } | null
  } | null
  team?: { id: string; name: string; members?: MentorshipPerson[] }
  milestones?: Milestone[]
  mentorships?: {
    id: string
    mentor?: { id: string; first_name: string; last_name: string } | null
    consultations?: Consultation[]
  }[]
}

export interface Mentorship {
  id: string
  mentor_id: string
  notes: string | null
  started_at: string | null
  ended_at: string | null
  consultations_count?: number
  consultations?: Consultation[]
  application?: {
    id: string
    status: string
    team?: { id: string; name: string; members?: MentorshipPerson[] }
    challenge?: {
      id: string
      title: string
      status: string
      technical_spec?: string | null
      company?: { id: string; name: string } | null
    } | null
    call?: { id: string; program?: { id: string; name: string } } | null
    milestones?: Milestone[]
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
