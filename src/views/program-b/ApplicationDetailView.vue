<template>
  <AppLayout>
    <div class="app-detail">
      <button @click="router.back()" class="back-btn">← Back to Applications</button>

      <div v-if="loading">Loading application...</div>

      <div v-else-if="application">
        <div class="page-header">
          <div class="header-content">
            <div class="app-icon">◎</div>
            <div>
              <h1 class="page-title">{{ application.team?.name ?? 'Application' }}</h1>
              <p class="page-subtitle">{{ application.call?.program?.name ?? 'Program B' }}</p>
            </div>
          </div>
          <span class="status-badge" :class="application.status">{{ application.status.replace(/_/g, ' ') }}</span>
        </div>

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

        <div class="section">
          <div class="section-header">
            <h2>Mentorship</h2>
          </div>

          <div v-if="activeMentorships.length > 0" class="mentors-list">
            <div v-for="mentorship in activeMentorships" :key="mentorship.id" class="detail-row mentorship-row">
              <div>
                <p><strong>Name:</strong> {{ mentorship.mentor.first_name }} {{ mentorship.mentor.last_name }}</p>
                <p><strong>Email:</strong> <a :href="`mailto:${mentorship.mentor.email}`">{{ mentorship.mentor.email }}</a></p>
              </div>
              <div v-if="authStore.isAdmin" class="actions">
                <button @click="handleEndMentorship(mentorship.id)" class="btn-secondary small">End Mentorship</button>
              </div>
            </div>
          </div>
          <div v-else class="empty-section">
            No active mentors have been assigned to this application yet.
          </div>

          <div v-if="authStore.isAdmin" class="assign-form" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
            <div class="field">
              <select v-model="selectedMentorId" :disabled="loadingMentors || assigningMentor">
                <option value="">
                  {{ loadingMentors ? 'Loading mentors...' : '-- Add Mentor --' }}
                </option>
                <option v-for="mentor in availableMentors" :key="mentor.id" :value="mentor.id">
                  {{ mentor.first_name }} {{ mentor.last_name }}
                </option>
              </select>
            </div>
            <button
              @click="handleAssignMentor"
              :disabled="!selectedMentorId || assigningMentor || loadingMentors"
              class="btn-primary"
            >
              {{ assigningMentor ? 'Assigning...' : 'Assign Mentor' }}
            </button>
          </div>
        </div>

        <div class="section" v-if="application.motivation_letter">
          <h2>Motivation Letter</h2>
          <p class="text-content">{{ application.motivation_letter }}</p>
        </div>

        <div class="section" v-if="application.solution_proposal">
          <h2>Solution Proposal</h2>
          <p class="text-content">{{ application.solution_proposal }}</p>
        </div>

        <div class="section" v-if="application.team?.members">
          <div class="section-header">
            <h2>Team CVs</h2>
          </div>

          <p class="text-content" style="margin-bottom: 1rem; font-size: 0.875rem;">
            Všetci členovia tímu musia mať vo svojom profile nahraté CV pred podaním prihlášky.
          </p>

          <div class="checklist">
            <div
              v-for="member in application.team.members"
              :key="member.id"
              class="checklist-item"
              :class="{ uploaded: !!member.profile?.cv_path }"
            >
              <div class="checklist-icon">{{ member.profile?.cv_path ? '✓' : '○' }}</div>
              <div class="checklist-info">
                <strong>{{ member.first_name }} {{ member.last_name }}</strong>
                <span v-if="member.profile?.cv_path" class="checklist-meta">CV nahraté</span>
                <span v-else class="checklist-missing">CV chýba v profile</span>
              </div>
            </div>
          </div>
        </div>

        <div class="section" v-if="isLeader && application.status === 'draft'">
          <div class="section-header">
            <h2>Submit Application</h2>
          </div>
          <div v-if="missingCvs.length > 0" class="error" style="margin-bottom: 1rem;">
            Nemôžete podať prihlášku. Nasledujúci členovia si musia aktualizovať profil: {{ missingCvs.join(', ') }}
          </div>
          <button @click="handleSubmit" :disabled="submitting || missingCvs.length > 0" class="btn-primary">
            {{ submitting ? 'Submitting...' : 'Submit Application' }}
          </button>
        </div>

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

        <div class="section" v-if="authStore.isAdmin || authStore.user?.account_type === 'evaluator'">
          <h2>Change Status</h2>
          <div class="field">
            <select v-model="newStatus">
              <option value="">-- Select new status --</option>
              <option v-for="status in allowedTransitions" :key="status" :value="status">
                {{ status.replace(/_/g, ' ') }}
              </option>
            </select>
          </div>
          <div class="field" v-if="['approved', 'rejected'].includes(newStatus)">
            <label>Score</label>
            <input type="number" v-model="score" placeholder="Enter score (0-100)" />
          </div>
          <div class="field">
            <label>Decision Notes</label>
            <textarea v-model="decisionNotes" rows="3" placeholder="Optional notes..." />
          </div>
          <button @click="handleTransition" :disabled="!newStatus || transitioning" class="btn-primary">
            {{ transitioning ? 'Updating...' : 'Update Status' }}
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.ts'
import { applicationsBApi } from '@/api/program-b/applications.ts'
import { milestonesApi } from '@/api/milestones.ts'
import AppLayout from '../../components/AppLayout.vue'
import type { ApiError, Application, Milestone, User } from '@/types'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const application = ref<Application | null>(null)
const milestones = ref<Milestone[]>([])
const loading = ref(false)
const submitting = ref(false)

const availableMentors = ref<User[]>([])
const loadingMentors = ref(false)
const selectedMentorId = ref<string>('')
const assigningMentor = ref(false)

const newStatus = ref('')
const decisionNotes = ref('')
const transitioning = ref(false)

const showMilestoneForm = ref(false)
const addingMilestone = ref(false)
const milestoneError = ref<string | null>(null)
const newMilestone = ref({ title: '', due_date: '', comment: '' })

const score = ref<number | null>(null)

const isLeader = computed(() => {
  if (!application.value || !authStore.user) return false
  return application.value.team?.leader_id === authStore.user.id
})

const missingCvs = computed(() => {
  if (!application.value?.team?.members) return []
  return application.value.team.members
    .filter((m) => !m.profile || !m.profile.cv_path)
    .map((m) => `${m.first_name} ${m.last_name}`)
})

const allowedTransitions = computed(() => {
  const role = authStore.user?.account_type
  const transitions: Record<string, Record<string, string[]>> = {
    nti_admin: {
      submitted: ['formally_verified', 'rejected'],
      formally_verified: ['in_evaluation', 'pending_supplement'],
      in_evaluation: ['approved', 'rejected', 'pending_supplement'],
      approved: ['onboarding'],
      onboarding: ['active'],
      active: ['paused', 'completed'],
      paused: ['active', 'completed'],
      completed: ['archived'],
    },
    evaluator: {
      formally_verified: ['in_evaluation', 'pending_supplement'],
      in_evaluation: ['pending_supplement'],
    },
  }
  const roleKey = role === 'evaluator' ? 'evaluator' : 'nti_admin'
  return transitions[roleKey]?.[application.value?.status ?? ''] ?? []
})

const activeMentorships = computed(() => {
  if (!application.value?.mentorships) return []
  return application.value.mentorships.filter(m => !m.ended_at)
})

onMounted(async () => {
  loading.value = true
  try {
    const id = route.params.id as string
    const appResponse = await applicationsBApi.getOne(id)
    application.value = appResponse.data
    milestones.value = application.value.milestones ?? []
  } finally {
    loading.value = false
  }

  // Загрузка менторов строго локализована и изолирована от глобального стора
  if (authStore.isAdmin) {
    loadingMentors.value = true
    try {
      availableMentors.value = await applicationsBApi.getMentors()
    } catch (error) {
      console.error('Failed to load mentors:', error)
    } finally {
      loadingMentors.value = false
    }
  }
})

async function handleAssignMentor() {
  if (!application.value || !selectedMentorId.value) return

  assigningMentor.value = true
  try {
    await applicationsBApi.assignMentor(application.value.id, selectedMentorId.value)

    const response = await applicationsBApi.getOne(application.value.id)
    application.value = response.data
    selectedMentorId.value = ''
  } catch (error: unknown) {
    console.error('Failed to assign mentor:', error)
  } finally {
    assigningMentor.value = false
  }
}

async function handleEndMentorship(mentorshipId: string) {
  if (!application.value) return

  if (!confirm('Are you sure you want to end this mentorship?')) return

  try {
    await applicationsBApi.endMentorship(application.value.id, mentorshipId)
    const response = await applicationsBApi.getOne(application.value.id)
    application.value = response.data
  } catch (error: unknown) {
    console.error('Failed to end mentorship:', error)
  }
}

async function handleSubmit() {
  if (!application.value || missingCvs.value.length > 0) return
  submitting.value = true
  try {
    const response = await applicationsBApi.transition(application.value.id, 'submitted', '')
    application.value = response.data
  } catch (e: unknown) {
    const apiError = e as ApiError
    alert(apiError.response?.data?.message ?? 'Failed to submit application')
  } finally {
    submitting.value = false
  }
}

async function handleTransition() {
  if (!application.value || !newStatus.value) return
  transitioning.value = true
  try {
    const response = await applicationsBApi.transition(application.value.id, newStatus.value, decisionNotes.value, score.value)
    application.value = response.data
    newStatus.value = ''
    decisionNotes.value = ''
  } catch (e: unknown) {
    const apiError = e as ApiError
    alert(apiError.response?.data?.message ?? 'Transition failed')
  } finally {
    transitioning.value = false
  }
}

async function handleAddMilestone() {
  if (!application.value || !newMilestone.value.title) return
  addingMilestone.value = true
  milestoneError.value = null
  try {
    const response = await milestonesApi.create(application.value.id, newMilestone.value)
    milestones.value.push(response.data)
    showMilestoneForm.value = false
    newMilestone.value = { title: '', due_date: '', comment: '' }
  } catch (e: unknown) {
    const apiError = e as ApiError
    milestoneError.value = apiError.response?.data?.message ?? 'Failed to add milestone'
  } finally {
    addingMilestone.value = false
  }
}

async function handleMilestoneUpdate(milestone: Milestone) {
  if (!application.value) return
  try {
    await milestonesApi.update(application.value.id, milestone.id, {
      status: milestone.status,
      comment: milestone.comment ?? undefined,
    })
  } catch (e: unknown) {
    console.error('Failed to update milestone:', e)
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.app-detail { max-width: 900px; }

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

.mentorship-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

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

.error { color: #ef4444; font-size: 0.875rem; }
.empty-section { color: #9ca3af; font-style: italic; padding: 0.5rem 0; }
</style>
