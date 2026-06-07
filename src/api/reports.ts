import api from './axios'

export interface AdminReportInfo {
  type: 'summary' | 'users' | 'companies' | 'teams' | 'applications' | 'mentors'
  name: string
  description: string
}

export interface AdminReportFilters {
  status?: string
  account_type?: string
  program_type?: 'program_a' | 'program_b' | ''
  date_from?: string
  date_to?: string
}

export interface AdminReportsResponse {
  reports: AdminReportInfo[]
  summary: Record<string, any>
}

function cleanFilters(filters: AdminReportFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
}

function filenameFromHeaders(headers: any, fallback: string) {
  const disposition = headers?.['content-disposition'] ?? headers?.['Content-Disposition']
  if (!disposition) return fallback

  const match = String(disposition).match(/filename="?([^"]+)"?/)
  return match?.[1] ?? fallback
}

export const reportsApi = {
  getReports(filters: AdminReportFilters = {}): Promise<AdminReportsResponse> {
    return api.get('/admin/reports', { params: cleanFilters(filters) }).then((r) => r.data)
  },

  async downloadCsv(type: AdminReportInfo['type'], filters: AdminReportFilters = {}) {
    const response = await api.get(`/admin/reports/${type}/csv`, {
      params: cleanFilters(filters),
      responseType: 'blob',
    })

    const filename = filenameFromHeaders(response.headers, `nti-${type}-report.csv`)
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    window.URL.revokeObjectURL(url)
  },
}
