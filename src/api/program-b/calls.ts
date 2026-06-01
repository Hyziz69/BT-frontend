import api from '../axios.ts'

export const callsApi = {
    getAll(): Promise<{ data: any[] }> {
        return api.get('/program-b/calls').then(r => r.data)
    },
}
