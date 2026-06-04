import api from './axios'

export interface ProgramOption {
  id: string
  type: 'program_a' | 'program_b'
  name: string
  description?: string | null
}

export interface CallOption {
  id: string
  title: string
  description?: string | null
  opens_at?: string | null
  closes_at?: string | null
}

export const programsApi = {
  // Active Program B programs (id included).
  listProgramB(): Promise<{ programs: ProgramOption[] }> {
    return api.get('/program-b/programs').then((r) => r.data)
  },

  // Open calls for a given program.
  callsFor(programId: string): Promise<{ calls: CallOption[] }> {
    return api.get('/program-b/calls', { params: { program_id: programId } }).then((r) => r.data)
  },
}
