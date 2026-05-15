import api from './axios'
import type { ApiResponse, Document } from '../types'

export const documentsApi = {
  getAll(applicationId: string): Promise<{ data: Document[] }> {
    return api.get(`/program-a/applications/${applicationId}/documents`).then((r) => r.data)
  },

  upload(
    applicationId: string,
    file: File,
    docType: string,
    classification = 'internal',
  ): Promise<ApiResponse<Document>> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('doc_type', docType)
    formData.append('classification', classification)

    return api
      .post(`/program-a/applications/${applicationId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  delete(applicationId: string, documentId: string): Promise<void> {
    return api
      .delete(`/program-a/applications/${applicationId}/documents/${documentId}`)
      .then((r) => r.data)
  },
}
