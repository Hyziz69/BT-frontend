import api from './axios'
import type { User } from '../types'

export const authApi = {
    login(email: string, password: string): Promise<{ access_token: string, user: User }> {
        return api.post('/login', { email, password }).then(r => r.data)
    },

    me(): Promise<User> {
        return api.get('/me').then(r => r.data)
    },

    logout(): Promise<void> {
        return api.post('/logout').then(r => r.data)
    },
}