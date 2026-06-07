<template>
  <AppLayout>
    <div class="app-detail">
      <button @click="router.back()" class="back-btn">← Back to Applications</button>

      <div v-if="loading">Loading application...</div>

      <div v-else-if="loadError" class="load-error">
        <div class="load-error-icon">⚠</div>
        <h3>Can't open this application</h3>
        <p>{{ loadError }}</p>
        <button @click="router.push('/applications')" class="btn-primary">← Back to Applications</button>
      </div>

      <div v-else-if="application">
        <!-- Header -->
        <div class="page-header">
          <div class="header-content">
            <div class="app-icon">◎</div>
            <div>
              <h1 class="page-title">{{ application.team?.name ?? 'Application' }}</h1>
              <p class="page-subtitle">{{ application.call?.program?.name ?? 'Program A' }}</p>
            </div>
          </div>
          <span class="status-badge" :class="application.status">{{ application.status.replace(/_/g, ' ') }}</span>
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
            <span>{{ application.submitted_at ? new Date(application.submitted_at).toLocaleDateString('sk-SK') : 'Not submitted' }}</span>
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
            <h2>Required Documents</h2>
          </div>

          <!-- Required checklist -->
          <div class="checklist">
            <div v-for="item in documentChecklist" :key="item.type" class="checklist-item" :class="{ uploaded: item.uploaded }">
              <div class="checklist-icon">{{ item.uploaded ? '✓' : '○' }}</div>
              <div class="checklist-info">
                <strong>{{ item.label }}</strong>
                <span v-if="item.uploaded" class="checklist-meta">
                  {{ item.doc?.filename }} · v{{ item.doc?.version }} · {{ ((item.doc?.file_size ?? 0) / 1024).toFixed(1) }} KB
                </span>
                <span v-else class="checklist-missing">Not uploaded</span>
              </div>
              <div v-if="item.uploaded" class="doc-actions">
                <button @click="handleViewDocument(item.doc!)" class="btn-icon" title="View">👁</button>
                <button v-if="canUpload" @click="handleDeleteDocument(item.doc!)" class="btn-icon danger" title="Delete">✕</button>
              </div>
              <div v-else-if="canUpload" class="doc-actions">
                <label class="btn-icon upload-btn" :title="`Upload ${item.label}`">
                  +
                  <input type="file" class="file-input-hidden" @change="(e) => handleInlineUpload(e, item.type)" />
                </label>
              </div>
            </div>
          </div>

          <div class="delimiter">
            <span>Optional Attachments</span>
          </div>

          <div class="checklist">
            <div v-if="otherDocuments.length === 0 && !canUpload" class="empty-section">No optional documents uploaded.</div>
            <div v-for="doc in otherDocuments" :key="doc.id" class="checklist-item uploaded">
              <div class="checklist-icon">📎</div>
              <div class="checklist-info">
                <strong>{{ doc.filename }}</strong>
                <span class="checklist-meta">{{ doc.doc_type }} · v{{ doc.version }} · {{ (doc.file_size / 1024).toFixed(1) }} KB</span>
              </div>
              <div class="doc-actions">
                <button @click="handleViewDocument(doc)" class="btn-icon" title="View">👁</button>
                <button v-if="canUpload" @click="handleDeleteDocument(doc)" class="btn-icon danger" title="Delete">✕</button>
              </div>
            </div>

            <!-- Upload optional -->
            <div v-if="canUpload" class="optional-upload">
              <label class="optional-upload-btn">
                <div class="optional-upload-content">
                  <span class="optional-upload-plus">+</span>
                  <div>
                    <span class="optional-upload-title">Add Attachment</span>
                    <span class="optional-upload-hint">CV, cover letter, portfolio, references, or any supporting document</span>
                  </div>
                </div>
                <input type="file" class="file-input-hidden" @change="(e) => handleInlineUpload(e, 'attachment')" />
              </label>
            </div>
          </div>
        </div>

        <!-- Evaluations -->
        <div class="section" v-if="authStore.isAdmin || authStore.isEvaluator">
          <div class="section-header">
            <h2>Evaluations</h2>
            <button v-if="!myEvaluation" @click="showEvalForm = true" class="btn-primary">
              + Add Evaluation
            </button>
          </div>

          <div v-if="evaluations.length === 0" class="empty-section">No evaluations yet.</div>

          <div class="evaluations-list">
            <div v-for="ev in evaluations" :key="ev.id" class="evaluation-card">
              <div class="eval-header">
                <div class="eval-info">
                  <strong>{{ ev.evaluator?.first_name }} {{ ev.evaluator?.last_name }}</strong>
                  <span class="eval-criterion" v-if="ev.criterion">{{ ev.criterion }}</span>
                </div>
                <div class="eval-right">
                  <span class="eval-score" :class="scoreClass(ev.score)">{{ ev.score }}/100</span>
                  <button
                    v-if="authStore.isAdmin || ev.evaluator?.id === authStore.user?.id"
                    @click="handleDeleteEvaluation(ev)"
                    class="btn-icon danger"
                    title="Delete"
                  >✕</button>
                </div>
              </div>
              <p v-if="ev.comment" class="eval-comment">{{ ev.comment }}</p>
            </div>
          </div>

          <!-- Average score -->
          <div v-if="evaluations.length > 0" class="eval-average">
            Average Score: <strong>{{ averageScore }}</strong>/100
          </div>
        </div>

        <!-- Add Evaluation Modal -->
        <div v-if="showEvalForm" class="modal-overlay" @click.self="showEvalForm = false">
          <div class="modal">
            <h2>Add Evaluation</h2>
            <div class="field">
              <label>Score (0-100)</label>
              <input v-model.number="newEval.score" type="number" min="0" max="100" placeholder="85" />
            </div>
            <div class="field">
              <label>Criterion <span style="color:#9ca3af;font-weight:400">(optional)</span></label>
              <input v-model="newEval.criterion" type="text" placeholder="e.g. Innovation, Feasibility" />
            </div>
            <div class="field">
              <label>Comment <span style="color:#9ca3af;font-weight:400">(optional)</span></label>
              <textarea v-model="newEval.comment" rows="3" placeholder="Your evaluation notes..." />
            </div>
            <p v-if="evalError" class="error">{{ evalError }}</p>
            <div class="modal-actions">
              <button @click="showEvalForm = false" class="btn-secondary">Cancel</button>
              <button @click="handleAddEvaluation" :disabled="addingEval" class="btn-primary">
                {{ addingEval ? 'Submitting...' : 'Submit Evaluation' }}
              </button>
            </div>
          </div>
        </div>
        <!-- Milestones -->
        <div class="section">
          <div class="section-header">
            <h2>Milestones</h2>
            <button v-if="authStore.isAdmin" @click="showMilestoneForm = true" class="btn-primary">
              + Add Milestone
            </button>
          </div>

          <div v-if="milestones.length === 0" class="empty-section">No milestones yet.</div>

          <div class="milestones-list">
            <div v-for="milestone in milestones" :key="milestone.id" class="milestone-card" :class="{ overdue: milestone.is_overdue }">
              <div class="milestone-info">
                <strong>{{ milestone.title }}</strong>
                <span v-if="milestone.due_date" class="due-date">
                  Due: {{ new Date(milestone.due_date).toLocaleDateString('sk-SK') }}
                </span>
                <p v-if="milestone.comment" class="milestone-comment">{{ milestone.comment }}</p>
              </div>
              <div class="milestone-right">
                <span class="status-badge" :class="milestone.status">{{ milestone.status }}</span>
                <select v-if="authStore.isAdmin" v-model="milestone.status" @change="handleMilestoneUpdate(milestone)" class="status-select">
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>
        </div>

      <!-- Add Milestone Modal -->
      <div v-if="showMilestoneForm" class="modal-overlay" @click.self="showMilestoneForm = false">
        <div class="modal">
          <h2>Add Milestone</h2>
          <div class="field">
            <label>Title</label>
            <input v-model="newMilestone.title" type="text" placeholder="e.g. MVP prototype ready" />
          </div>
          <div class="field">
            <label>Due Date</label>
            <input v-model="newMilestone.due_date" type="date" />
          </div>
          <div class="field">
            <label>Comment</label>
            <textarea v-model="newMilestone.comment" rows="3" placeholder="Optional notes..." />
          </div>
          <p v-if="milestoneError" class="error">{{ milestoneError }}</p>
          <div class="modal-actions">
            <button @click="showMilestoneForm = false" class="btn-secondary">Cancel</button>
            <button @click="handleAddMilestone" :disabled="addingMilestone" class="btn-primary">
              {{ addingMilestone ? 'Adding...' : 'Add Milestone' }}
            </button>
          </div>
        </div>
      </div>

        <!-- Transition Status (Admin only) -->
        <div class="section" v-if="authStore.isAdmin">
      <h2>Change Status</h2>
      <div class="field">
        <select v-model="newStatus">
          <option value="">-- Select new status --</option>
          <option v-for="status in allowedTransitions" :key="status" :value="status">
            {{ status.replace(/_/g, ' ') }}
          </option>
        </select>
      </div>
      <div class="field">
        <label>Decision Notes</label>
        <textarea v-model="decisionNotes" rows="3" placeholder="Optional notes..." />
      </div>
      <button @click="handleTransition" :disabled="!newStatus || transitioning" class="btn-primary">
        {{ transitioning ? 'Updating...' : 'Update Status' }}
      </button>
    </div>

      <!-- Submit Application (Student) -->
      <div class="section" v-if="application && (isLeader && application.status === 'draft' || application.status === 'pending_supplement')">
        <div class="section-header">
          <h2>Submit Application</h2>
        </div>
        <p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 1rem;">
          Make sure all 6 required documents are uploaded before submitting.
        </p>

        <div v-if="submitError" class="submit-error">
          <div class="submit-error-icon">⚠</div>
          <div>
            <strong>Cannot submit</strong>
            <p>{{ submitError }}</p>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <button @click="handleSubmit" :disabled="submitting" class="btn-primary">
            {{ submitting ? 'Submitting...' : 'Submit Application' }}
          </button>
          <button v-if="application.status === 'draft'" @click="handleDeleteFromDetail" :disabled="deletingFromDetail" class="btn-danger">
            {{ deletingFromDetail ? 'Deleting...' : 'Delete Draft' }}
          </button>
        </div>
      </div>

      <!-- Company Accept (company_contact only) -->
      <div class="section" v-if="authStore.user?.account_type === 'company_contact' && application.status === 'submitted'">
        <div class="section-header">
          <h2>Review Application</h2>
        </div>
        <p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 1rem;">
          If this project interests your company, you can accept it to start a collaboration.
        </p>
        <button @click="handleCompanyAccept" :disabled="transitioning" class="btn-primary">
          ✓ Accept Application
        </button>
      </div>
      <!-- Delete Confirmation Modal -->
    <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
      <div class="modal modal-sm">
        <div class="delete-icon">🗑</div>
        <h2>Delete Document</h2>
        <p>Are you sure you want to delete <strong>{{ deleteTarget.filename }}</strong>? This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="deleteTarget = null" class="btn-secondary">Cancel</button>
          <button @click="confirmDelete" :disabled="deleting" class="btn-danger">
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
    </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { applicationsApi } from '../api/applications'
import { documentsApi } from '../api/documents'
import AppLayout from '../components/AppLayout.vue'
import type { Application, Document, Milestone } from '../types'
import { milestonesApi } from '../api/milestones'
import { useTeamsStore } from '../stores/teams'
import api from '../api/axios'
import { evaluationsApi } from '../api/evaluations'

const evaluations = ref<any[]>([])
const showEvalForm = ref(false)
const addingEval = ref(false)
const evalError = ref<string | null>(null)
const newEval = ref({ score: 0, criterion: '', comment: '' })

const myEvaluation = computed(() =>
  evaluations.value.find(e => e.evaluator?.id === authStore.user?.id)
)

const averageScore = computed(() => {
  if (evaluations.value.length === 0) return 0
  const sum = evaluations.value.reduce((acc, e) => acc + Number(e.score), 0)
  return (sum / evaluations.value.length).toFixed(1)
})

function scoreClass(score: number) {
  if (score >= 75) return 'score-high'
  if (score >= 50) return 'score-mid'
  return 'score-low'
}

async function handleAddEvaluation() {
  if (!application.value) return
  addingEval.value = true
  evalError.value = null
  try {
    const response = await evaluationsApi.create(application.value.id, newEval.value)
    evaluations.value.push(response.data)
    showEvalForm.value = false
    newEval.value = { score: 0, criterion: '', comment: '' }
  } catch (e: any) {
    evalError.value = e.response?.data?.message ?? 'Failed to submit evaluation'
  } finally {
    addingEval.value = false
  }
}

async function handleDeleteEvaluation(ev: any) {
  if (!application.value) return
  try {
    await evaluationsApi.delete(application.value.id, ev.id)
    evaluations.value = evaluations.value.filter(e => e.id !== ev.id)
  } catch {
    alert('Failed to delete evaluation')
  }
}

const teamsStore = useTeamsStore()
const submitting = ref(false)
const deleteTarget = ref<Document | null>(null)
const deleting = ref(false)
const submitError = ref<string | null>(null)
  const deletingFromDetail = ref(false)

async function handleDeleteFromDetail() {
  if (!application.value) return
  if (!confirm('Delete this draft application?')) return
  deletingFromDetail.value = true
  try {
    await applicationsApi.delete(application.value.id)
    router.push('/applications')
  } catch (e: any) {
    alert(e.response?.data?.message ?? 'Failed to delete application')
  } finally {
    deletingFromDetail.value = false
  }
}

  async function handleCompanyAccept() {
  if (!application.value) return
  transitioning.value = true
  try {
    const response = await applicationsApi.transition(application.value.id, 'approved', 'Accepted by company representative.')
    application.value = response.data
  } catch (e: any) {
    alert(e.response?.data?.message ?? 'Failed to accept application')
  } finally {
    transitioning.value = false
  }
}

async function handleViewDocument(doc: Document) {
  if (!application.value) return
  try {
    const response = await api.get(
      `/program-a/applications/${application.value.id}/documents/${doc.id}/download`,
      { responseType: 'blob' }
    )
    const url = window.URL.createObjectURL(new Blob([response.data]))
    window.open(url, '_blank')
  } catch {
    alert('Failed to open document')
  }
}

function handleDeleteDocument(doc: Document) {
  deleteTarget.value = doc
}

async function confirmDelete() {
  if (!application.value || !deleteTarget.value) return
  deleting.value = true
  try {
    await documentsApi.delete(application.value.id, deleteTarget.value.id)
    documents.value = documents.value.filter(d => d.id !== deleteTarget.value!.id)
    deleteTarget.value = null
  } catch (e: any) {
    alert(e.response?.data?.message ?? 'Failed to delete document')
  } finally {
    deleting.value = false
  }
}

const isLeader = computed(() => {
  if (!application.value || !authStore.user) return false
  return application.value.team?.leader?.id === authStore.user.id
})

const allowedTransitions = computed(() => {
  const transitions: Record<string, string[]> = {
    submitted: ['formally_verified', 'rejected'],
    formally_verified: ['in_evaluation', 'pending_supplement'],
    in_evaluation: ['approved', 'rejected', 'pending_supplement'],
    approved: ['onboarding'],
    onboarding: ['active'],
    active: ['paused', 'completed'],
    paused: ['active', 'completed'],
    completed: ['archived'],
  }
  return transitions[application.value?.status ?? ''] ?? []
})

async function handleSubmit() {
  if (!application.value) return
  submitting.value = true
  submitError.value = null
  try {
    const response = await applicationsApi.transition(application.value.id, 'submitted', '')
    application.value = response.data
  } catch (e: any) {
    submitError.value = e.response?.data?.message ?? 'Failed to submit application'
  } finally {
    submitting.value = false
  }
}

const showMilestoneForm = ref(false)
const addingMilestone = ref(false)
const milestoneError = ref<string | null>(null)
const newMilestone = ref({ title: '', due_date: '', comment: '' })

async function handleAddMilestone() {
  if (!application.value || !newMilestone.value.title) return
  addingMilestone.value = true
  milestoneError.value = null
  try {
    const response = await milestonesApi.create(application.value.id, newMilestone.value)
    milestones.value.push(response.data)
    showMilestoneForm.value = false
    newMilestone.value = { title: '', due_date: '', comment: '' }
  } catch (e: any) {
    milestoneError.value = e.response?.data?.message ?? 'Failed to add milestone'
  } finally {
    addingMilestone.value = false
  }
}

async function handleMilestoneUpdate(milestone: any) {
  if (!application.value) return
  try {
    await milestonesApi.update(application.value.id, milestone.id, {
      status: milestone.status,
      comment: milestone.comment,
    })
  } catch {
  }
}

async function handleInlineUpload(e: Event, docType: string) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !application.value) return
  uploading.value = true
  uploadError.value = null
  try {
    const response = await documentsApi.upload(application.value.id, file, docType)
    documents.value.push(response.data)
  } catch (e: any) {
    uploadError.value = e.response?.data?.message ?? 'Upload failed'
    alert(uploadError.value)
  } finally {
    uploading.value = false
    target.value = ''
  }
}

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const application = ref<Application | null>(null)
const documents = ref<Document[]>([])
const milestones = ref<Milestone[]>([])
const loading = ref(false)
const loadError = ref<string | null>(null)

const uploading = ref(false)
const uploadError = ref<string | null>(null)

const newStatus = ref('')
const decisionNotes = ref('')
const transitioning = ref(false)

const REQUIRED_DOCS = [
  { type: 'executive_summary', label: 'Executive Summary' },
  { type: 'tech_architecture', label: 'Technical Architecture' },
  { type: 'roadmap', label: 'Roadmap' },
  { type: 'budget', label: 'Budget' },
  { type: 'risk_analysis', label: 'Risk Analysis' },
  { type: 'monetization', label: 'Monetization Model' },
]

const documentChecklist = computed(() =>
  REQUIRED_DOCS.map(item => {
    const doc = documents.value.find(d => d.doc_type === item.type)
    return { ...item, uploaded: !!doc, doc }
  })
)

const otherDocuments = computed(() =>
  documents.value.filter(d => !REQUIRED_DOCS.find(r => r.type === d.doc_type))
)

const canUpload = computed(() =>
  application.value && ['draft', 'pending_supplement'].includes(application.value.status)
)

onMounted(async () => {
  loading.value = true
  loadError.value = null
  try {
    const id = route.params.id as string
    const [appResponse, docsResponse, evalsResponse] = await Promise.all([
      applicationsApi.getOne(id),
      documentsApi.getAll(id),
      evaluationsApi.getAll(id),
    ])
    application.value = appResponse.data
    documents.value = docsResponse.data
    evaluations.value = evalsResponse.data
    milestones.value = application.value.milestones ?? []
  } catch (e: any) {
    loadError.value =
      e?.response?.status === 403
        ? "You don't have access to this application."
        : e?.response?.status === 404
          ? 'This application no longer exists.'
          : (e?.response?.data?.message ?? 'Failed to load this application.')
  } finally {
    loading.value = false
  }
})

async function handleTransition() {
  if (!application.value || !newStatus.value) return
  console.log('Transitioning to:', newStatus.value)
  transitioning.value = true
  try {
    const response = await applicationsApi.transition(application.value.id, newStatus.value, decisionNotes.value)
    console.log('Response:', response)
    application.value = response.data
    newStatus.value = ''
    decisionNotes.value = ''
  } catch (e: any) {
    console.log('Error:', e.response?.data)
  } finally {
    transitioning.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.evaluations-list { display: flex; flex-direction: column; gap: 0.6rem; }

.evaluation-card {
  padding: 1rem;
  border: 1px solid #f3f4f6;
  border-radius: 10px;
}

.eval-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.eval-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.eval-info strong { font-size: 0.875rem; color: #0f1117; }

.eval-criterion {
  font-size: 0.775rem;
  color: #6b7280;
  font-style: italic;
}

.eval-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.eval-score {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: 0.875rem;
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
}

.score-high { background: #d1fae5; color: #065f46; }
.score-mid { background: #fef3c7; color: #92400e; }
.score-low { background: #fee2e2; color: #991b1b; }

.eval-comment {
  font-size: 0.825rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.eval-average {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
  font-size: 0.875rem;
  color: #6b7280;
  text-align: right;
}

.eval-average strong {
  color: #0f1117;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.app-detail { max-width: 900px; }

.load-error {
  text-align: center;
  padding: 4rem 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  margin-top: 1rem;
}
.load-error-icon { font-size: 2.5rem; color: #f59e0b; margin-bottom: 0.75rem; }
.load-error h3 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.1rem; font-weight: 700; color: #0f1117; margin: 0 0 0.4rem 0;
}
.load-error p { color: #8892a4; margin: 0 0 1.5rem 0; }

.back-btn {
  background: none;
  border: none;
  color: #8892a4;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;
  margin-bottom: 1.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: color 0.15s;
}
.back-btn:hover { color: #0f1117; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 0 0 2rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.app-icon {
  width: 52px;
  height: 52px;
  background: #f0fdf4;
  color: #22c55e;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.page-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f1117;
  margin: 0 0 0.25rem 0;
}

.page-subtitle { color: #8892a4; font-size: 0.9rem; margin: 0; }

.section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  margin-bottom: 1.5rem;
}

.section h2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #0f1117;
  margin: 0 0 1.25rem 0;
}

.section h3 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  color: #8892a4;
  margin: 1.25rem 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.section-header h2 { margin: 0; }

.detail-row {
  display: flex;
  gap: 1rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-row:last-child { border-bottom: none; }

.label { color: #8892a4; width: 120px; flex-shrink: 0; font-size: 0.875rem; }

.text-content { color: #374151; line-height: 1.6; white-space: pre-wrap; margin: 0; }

/* Checklist */
.checklist { display: flex; flex-direction: column; gap: 0.6rem; }

.checklist-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid #f3f4f6;
  border-radius: 10px;
  transition: border-color 0.15s;
}

.checklist-item.uploaded {
  border-color: #6ee7b7;
  background: #f0fdf4;
}

.checklist-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  flex-shrink: 0;
  background: #f3f4f6;
  color: #9ca3af;
}

.checklist-item.uploaded .checklist-icon {
  background: #6ee7b7;
  color: #065f46;
}

.checklist-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.checklist-info strong { font-size: 0.875rem; color: #0f1117; }

.checklist-meta { font-size: 0.775rem; color: #6b7280; }

.checklist-missing { font-size: 0.775rem; color: #9ca3af; font-style: italic; }

/* Documents list */
.documents-list { display: flex; flex-direction: column; gap: 0.6rem; }

.doc-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  background: #f3f4f6;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  text-decoration: none;
  transition: background 0.15s;
}

.btn-icon:hover { background: #e5e7eb; }
.btn-icon.danger { background: #fee2e2; color: #991b1b; }
.btn-icon.danger:hover { background: #fecaca; }

.checklist-missing-badge {
  font-size: 0.75rem;
  color: #9ca3af;
  font-style: italic;
}

.delimiter {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.25rem 0 1rem 0;
  color: #9ca3af;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.delimiter::before,
.delimiter::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.doc-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border: 1px solid #f3f4f6;
  border-radius: 10px;
}

.doc-info { display: flex; flex-direction: column; gap: 0.15rem; }
.doc-info strong { font-size: 0.875rem; color: #0f1117; }

.doc-type {
  font-size: 0.75rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.1rem 0.5rem;
  border-radius: 6px;
  display: inline-block;
  width: fit-content;
}

.optional-upload-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.optional-upload-plus {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f3f4f6;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
  flex-shrink: 0;
  transition: all 0.15s;
}

.optional-upload-btn:hover .optional-upload-plus {
  background: #6ee7b7;
  color: #065f46;
}

.optional-upload-title {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.optional-upload-hint {
  display: block;
  font-size: 0.775rem;
  color: #9ca3af;
  margin-top: 0.1rem;
}

.doc-meta { font-size: 0.775rem; color: #9ca3af; }

/* Milestones */
.milestones-list { display: flex; flex-direction: column; gap: 0.6rem; }

.milestone-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border: 1px solid #f3f4f6;
  border-radius: 10px;
}

.milestone-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
}

.milestone-card.overdue { border-color: #fca5a5; background: #fff5f5; }

.milestone-info { display: flex; flex-direction: column; gap: 0.15rem; }
.milestone-info strong { font-size: 0.875rem; color: #0f1117; }
.due-date { font-size: 0.8rem; color: #6b7280; }
.milestone-comment { font-size: 0.8rem; color: #9ca3af; margin: 0; }

/* Status badges */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;
}
.status-badge.draft { background: #f3f4f6; color: #6b7280; }
.status-badge.submitted { background: #dbeafe; color: #1e40af; }
.status-badge.formally_verified { background: #e0e7ff; color: #3730a3; }
.status-badge.in_evaluation { background: #fef3c7; color: #92400e; }
.status-badge.pending_supplement { background: #fee2e2; color: #991b1b; }
.status-badge.approved { background: #d1fae5; color: #065f46; }
.status-badge.rejected { background: #fee2e2; color: #991b1b; }
.status-badge.onboarding { background: #ede9fe; color: #5b21b6; }
.status-badge.active { background: #d1fae5; color: #065f46; }
.status-badge.paused { background: #fef3c7; color: #92400e; }
.status-badge.completed { background: #d1fae5; color: #065f46; }
.status-badge.archived { background: #f3f4f6; color: #6b7280; }
.status-badge.pending { background: #fef3c7; color: #92400e; }
.status-badge.in_progress { background: #dbeafe; color: #1e40af; }
.status-badge.overdue { background: #fee2e2; color: #991b1b; }

/* Buttons */
.btn-primary {
  background: #0f1117;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  text-decoration: none;
  font-size: 0.85rem;
  display: inline-block;
}

.btn-secondary.small { padding: 0.3rem 0.75rem; font-size: 0.8rem; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}

.modal h2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f1117;
  margin-bottom: 1.5rem;
}

.field { margin-bottom: 1rem; }

.file-input-hidden {
  display: none;
}

.upload-btn {
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 700;
  background: #f0fdf4;
  color: #16a34a;
  border: 1px dashed #6ee7b7;
}

.upload-btn:hover {
  background: #dcfce7;
}

.optional-upload {
  margin-top: 0.5rem;
}

.optional-upload-btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0.75rem 1rem;
  border: 1px dashed #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
}

.optional-upload-btn:hover {
  border-color: #6ee7b7;
  color: #16a34a;
  background: #f0fdf4;
}

.optional-upload-btn input {
  display: none;
}

.submit-error {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: #fff5f5;
  border: 1px solid #fca5a5;
  border-radius: 10px;
  margin-bottom: 1rem;
}

.submit-error-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.submit-error strong {
  display: block;
  color: #991b1b;
  font-size: 0.875rem;
  margin-bottom: 0.2rem;
}

.submit-error p {
  color: #b91c1c;
  font-size: 0.825rem;
  margin: 0;
}

label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
}

input, select, textarea {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  box-sizing: border-box;
  font-family: inherit;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #6ee7b7;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.modal-sm {
  max-width: 380px;
  text-align: center;
}

.modal-sm h2 {
  margin-bottom: 0.75rem;
}

.modal-sm p {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0;
}

.delete-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error { color: #ef4444; font-size: 0.875rem; }
.empty-section { color: #9ca3af; font-style: italic; padding: 0.5rem 0; }
</style>
