import api from './axios'

export const invitationsApi = {
    send(teamId: string, emails: string[]): Promise<{ message: string, results: any }> {
        return api.post(`/program-a/teams/${teamId}/invitations`, { emails }).then(r => r.data)
    },

    getAll(teamId: string): Promise<{ data: any[] }> {
        return api.get(`/program-a/teams/${teamId}/invitations`).then(r => r.data)
    },

    accept(token: string): Promise<{ message: string }> {
        return api.post('/program-a/invitations/accept', { token }).then(r => r.data)
    },

    preview(token: string): Promise<any> {
        return api.get(`/program-a/invitations/${token}`).then(r => r.data)
    },
}