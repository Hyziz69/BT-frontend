<template>
  <div class="page">
    <nav class="navbar">
      <span class="brand">NTI Portal</span>
      <div class="nav-links">
        <RouterLink to="/dashboard">Dashboard</RouterLink>
        <RouterLink to="/teams">Teams</RouterLink>
        <RouterLink to="/applications">Applications</RouterLink>
        <button @click="handleLogout">Logout</button>
      </div>
    </nav>

    <div class="content">
      <button @click="router.back()" class="back-btn">← Back</button>

      <div v-if="loading">Loading application...</div>

      <div v-else-if="application">
        <!-- Header -->
        <div class="app-header">
          <div>
            <h1>{{ application.team?.name ?? 'Application' }}</h1>
            <p class="program-name">{{ application.call?.program?.name ?? 'Program A' }}</p>
          </div>
          <span class="status-badge" :class="application.status">{{ application.status }}</span>
        </div>

        <!-- Details -->
        <div class="section">
          <h2>Details</h2>
          <div class="detail-row">
            <span class="label">Score</span>
            <span>{{ application.score ?? 'Not evaluated yet' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Submitted</span>
            <span>{{
              application.submitted_at
                ? new Date(application.submitted_at).toLocaleDateString('sk-SK')
                : 'Not submitted'
            }}</span>
          </div>
          <div class="detail-row" v-if="application.decided_at">
            <span class="label">Decided</span>
            <span>{{ new Date(application.decided_at).toLocaleDateString('sk-SK') }}</span>
          </div>
        </div>

        <!-- Motivation Letter -->
        <div class="section" v-if="application.motivation_letter">
          <h2>Motivation Letter</h2>
          <p class="text-content">{{ application.motivation_letter }}</p>
        </div>

        <!-- Solution Proposal -->
        <div class="section" v-if="application.solution_proposal">
          <h2>Solution Proposal</h2>
          <p class="text-content">{{ application.solution_proposal }}</p>
        </div>

        <!-- Documents -->
        <div class="section">
          <div class="section-header">
            <h2>Documents</h2>
            <button v-if="canUpload" @click="showUploadForm = true" class="btn-primary">
              + Upload Document
            </button>
          </div>

          <div v-if="documents.length === 0" class="empty-section">No documents uploaded yet.</div>

          <div class="documents-list">
            <div v-for="doc in documents" :key="doc.id" class="doc-card">
              <div class="doc-info">
                <strong>{{ doc.filename }}</strong>
                <span class="doc-type">{{ doc.doc_type }}</span>
                <span class="doc-meta"
                  >v{{ doc.version }} · {{ (doc.file_size / 1024).toFixed(1) }} KB</span
                >
              </div>
              <a :href="doc.download_url" target="_blank" class="btn-secondary">Download</a>
            </div>
          </div>
        </div>

        <!-- Upload Document Modal -->
        <div v-if="showUploadForm" class="modal-overlay" @click.self="showUploadForm = false">
          <div class="modal">
            <h2>Upload Document</h2>
            <div class="field">
              <label>Document Type</label>
              <select v-model="uploadDocType">
                <option value="executive_summary">Executive Summary</option>
                <option value="tech_architecture">Technical Architecture</option>
                <option value="roadmap">Roadmap</option>
                <option value="budget">Budget</option>
                <option value="risk_analysis">Risk Analysis</option>
                <option value="monetization">Monetization Model</option>
                <option value="cv">CV</option>
                <option value="attachment">Attachment</option>
              </select>
            </div>
            <div class="field">
              <label>File</label>
              <input type="file" @change="handleFileChange" />
            </div>
            <p v-if="uploadError" class="error">{{ uploadError }}</p>
            <div class="modal-actions">
              <button @click="showUploadForm = false" class="btn-secondary">Cancel</button>
              <button @click="handleUpload" :disabled="uploading" class="btn-primary">
                {{ uploading ? 'Uploading...' : 'Upload' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Milestones -->
        <div class="section">
          <h2>Milestones</h2>
          <div v-if="milestones.length === 0" class="empty-section">No milestones yet.</div>
          <div class="milestones-list">
            <div
              v-for="milestone in milestones"
              :key="milestone.id"
              class="milestone-card"
              :class="{ overdue: milestone.is_overdue }"
            >
              <div class="milestone-info">
                <strong>{{ milestone.title }}</strong>
                <span v-if="milestone.due_date" class="due-date">
                  Due: {{ new Date(milestone.due_date).toLocaleDateString() }}
                </span>
                <p v-if="milestone.comment" class="milestone-comment">{{ milestone.comment }}</p>
              </div>
              <span class="status-badge" :class="milestone.status">{{ milestone.status }}</span>
            </div>
          </div>
        </div>

        <!-- Transition Status (Admin only) -->
        <div class="section" v-if="authStore.isAdmin">
          <h2>Change Status</h2>
          <div class="field">
            <select v-model="newStatus">
              <option value="">-- Select new status --</option>
              <option value="formally_verified">Formally Verified</option>
              <option value="in_evaluation">In Evaluation</option>
              <option value="pending_supplement">Pending Supplement</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="onboarding">Onboarding</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div class="field">
            <label>Decision Notes</label>
            <textarea v-model="decisionNotes" rows="3" placeholder="Optional notes..." />
          </div>
          <button
            @click="handleTransition"
            :disabled="!newStatus || transitioning"
            class="btn-primary"
          >
            {{ transitioning ? 'Updating...' : 'Update Status' }}
          </button>
        </div>
      </div>

      <div v-else class="error">Application not found.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { applicationsApi } from '../api/applications'
import { documentsApi } from '../api/documents'
import type { Application, Document, Milestone } from '../types'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const application = ref<Application | null>(null)
const documents = ref<Document[]>([])
const milestones = ref<Milestone[]>([])
const loading = ref(false)

const showUploadForm = ref(false)
const uploadDocType = ref('executive_summary')
const uploadFile = ref<File | null>(null)
const uploading = ref(false)
const uploadError = ref<string | null>(null)

const newStatus = ref('')
const decisionNotes = ref('')
const transitioning = ref(false)

const canUpload = computed(
  () => application.value && ['draft', 'pending_supplement'].includes(application.value.status),
)

onMounted(async () => {
  loading.value = true
  try {
    const id = route.params.id as string
    const [appResponse, docsResponse] = await Promise.all([
      applicationsApi.getOne(id),
      documentsApi.getAll(id),
    ])
    application.value = appResponse.data
    documents.value = docsResponse.data
    milestones.value = application.value.milestones ?? []
  } finally {
    loading.value = false
  }
})

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  uploadFile.value = target.files?.[0] ?? null
}

async function handleUpload() {
  if (!uploadFile.value || !application.value) return
  uploading.value = true
  uploadError.value = null
  try {
    const response = await documentsApi.upload(
      application.value.id,
      uploadFile.value,
      uploadDocType.value,
    )
    documents.value.push(response.data)
    showUploadForm.value = false
    uploadFile.value = null
  } catch (e: any) {
    uploadError.value = e.response?.data?.message ?? 'Upload failed'
  } finally {
    uploading.value = false
  }
}

async function handleTransition() {
  if (!application.value || !newStatus.value) return
  transitioning.value = true
  try {
    const response = await applicationsApi.transition(
      application.value.id,
      newStatus.value,
      decisionNotes.value,
    )
    application.value = response.data
    newStatus.value = ''
    decisionNotes.value = ''
  } finally {
    transitioning.value = false
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}
.navbar {
  background: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.brand {
  font-size: 1.2rem;
  font-weight: bold;
}
.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.nav-links a {
  color: white;
  text-decoration: none;
}
.nav-links button {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
}
.content {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}
.back-btn {
  background: none;
  border: none;
  color: #2c3e50;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1rem;
  padding: 0;
}
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}
.app-header h1 {
  margin-bottom: 0.25rem;
}
.program-name {
  color: #666;
}
.section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}
.section h2 {
  margin-bottom: 1rem;
  color: #2c3e50;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.section-header h2 {
  margin-bottom: 0;
}
.detail-row {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}
.label {
  color: #666;
  width: 120px;
  flex-shrink: 0;
}
.text-content {
  color: #444;
  line-height: 1.6;
  white-space: pre-wrap;
}
.documents-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.doc-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border: 1px solid #eee;
  border-radius: 6px;
}
.doc-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.doc-type {
  font-size: 0.8rem;
  color: #666;
  text-transform: capitalize;
  background: #f0f0f0;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
}
.doc-meta {
  font-size: 0.8rem;
  color: #888;
}
.milestones-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.milestone-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border: 1px solid #eee;
  border-radius: 6px;
}
.milestone-card.overdue {
  border-color: #f8d7da;
  background: #fff5f5;
}
.milestone-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.due-date {
  font-size: 0.85rem;
  color: #666;
}
.milestone-comment {
  font-size: 0.85rem;
  color: #888;
  margin: 0;
}
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
  white-space: nowrap;
}
.status-badge.draft {
  background: #f0f0f0;
  color: #666;
}
.status-badge.submitted {
  background: #d1ecf1;
  color: #0c5460;
}
.status-badge.approved {
  background: #d4edda;
  color: #155724;
}
.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}
.status-badge.in_evaluation {
  background: #fff3cd;
  color: #856404;
}
.status-badge.active {
  background: #cce5ff;
  color: #004085;
}
.status-badge.pending {
  background: #f0f0f0;
  color: #666;
}
.status-badge.in_progress {
  background: #fff3cd;
  color: #856404;
}
.status-badge.completed {
  background: #d4edda;
  color: #155724;
}
.status-badge.overdue {
  background: #f8d7da;
  color: #721c24;
}
.btn-primary {
  background: #2c3e50;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-secondary {
  background: #eee;
  color: #333;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  font-size: 0.9rem;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 480px;
}
.modal h2 {
  margin-bottom: 1.5rem;
}
.field {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
}
input,
select,
textarea {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  font-family: inherit;
}
.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}
.error {
  color: #e74c3c;
  font-size: 0.9rem;
}
.empty-section {
  color: #888;
  font-style: italic;
  padding: 0.5rem 0;
}
</style>
