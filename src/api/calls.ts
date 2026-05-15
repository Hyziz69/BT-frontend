import api from './axios'

export const callsApi = {
    getAll(): Promise<{ data: any[] }> {
        return api.get('/program-a/calls').then(r => r.data)
    },
}