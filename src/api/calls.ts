import api from './axios'

export const callsApi = {
    getAll(): Promise<{ data: any[] }> {
        return api.get('/program-b/calls').then(r => r.data)
    },
}
