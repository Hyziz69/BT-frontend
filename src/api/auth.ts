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

  forgotPassword(email: string): Promise<{ message: string }> {
    return api.post('/password/reset', { email }).then((r) => r.data)
  },

  resetPassword(payload: {
    token: string
    email: string
    password: string
    password_confirmation: string
  }): Promise<{ message: string }> {
    return api.post('/password/reset/confirm', payload).then((r) => r.data)
  },

  verifyEmail(id: string, hash: string, expires: string, signature: string): Promise<{ message: string }> {
    return api.get(`/email/verify/${id}/${hash}`, { params: { expires, signature } }).then((r) => r.data)
  },

  resendVerification(email: string): Promise<{ message: string }> {
    return api.post('/email/verify/resend', { email }).then((r) => r.data)
  },

  changePassword(payload: {
    current_password: string
    password: string
    password_confirmation: string
  }): Promise<{ message: string }> {
    return api.patch('/user/password', payload).then((r) => r.data)
  },
}
