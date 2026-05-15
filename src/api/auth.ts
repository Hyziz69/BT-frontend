import api from './axios'

export interface RegisterPayload {
  first_name: string
  last_name: string
  email: string
  password: string
  password_confirmation: string
  account_type: 'student' | 'mentor' | 'company_contact'
  gdpr_consent: boolean
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: any
}

export const authApi = {
  login(email: string, password: string): Promise<LoginResponse> {
    return api.post('/login', { email, password }).then((r) => r.data)
  },

  register(payload: RegisterPayload): Promise<{ message: string; status: string }> {
    return api.post('/register', payload).then((r) => r.data)
  },

  me() {
    return api.get('/me').then((r) => r.data)
  },

  logout(): Promise<void> {
    return api.post('/logout').then((r) => r.data)
  },
}
