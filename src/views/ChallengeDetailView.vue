<template>
  <AppLayout>
    <div class="challenge-detail">
      <button @click="router.back()" class="back-btn">← Back</button>

      <div v-if="loading" class="state">Loading challenge…</div>
      <div v-else-if="error" class="state error">{{ error }}</div>

      <div v-else-if="challenge">
        <!-- Header -->
        <div class="page-header">
          <div class="header-content">
            <div class="ch-icon">◆</div>
            <div>
              <h1 class="page-title">{{ challenge.title }}</h1>
              <p class="page-subtitle">{{ challenge.company?.name ?? 'Company challenge' }}</p>
            </div>
          </div>
          <span class="status-badge" :class="statusClass(challenge.status)">{{ statusLabel(challenge.status) }}</span>
        </div>

        <!-- Details -->
        <div class="section">
          <div class="section-head">
            <h2>Details</h2>
            <button v-if="canManage && !editing" @click="startEdit" class="btn-light">✎ Edit</button>
          </div>

          <!-- Read mode -->
          <div v-if="!editing" class="detail-grid">
            <div class="detail-row"><span class="label">Budget</span><span>{{ challenge.budget ? formatBudget(challenge.budget) + ' €' : '—' }}</span></div>
            <div class="detail-row"><span class="label">Call</span><span>{{ challenge.call?.title ?? '—' }}</span></div>
            <div class="detail-row"><span class="label">Product owner</span><span>{{ poName }}</span></div>
            <div class="detail-row"><span class="label">Candidates</span><span>{{ challenge.candidates_count ?? 0 }} team(s)</span></div>
            <div class="detail-row" v-if="challenge.selected_team"><span class="label">Selected team</span><span class="strong">{{ challenge.selected_team.name }}</span></div>
            <div class="detail-row"><span class="label">Created</span><span>{{ formatDate(challenge.created_at) }}</span></div>
          </div>

          <!-- Edit mode -->
          <div v-else class="edit-form">
            <label class="field">
              <span>Title</span>
              <input v-model="form.title" type="text" />
            </label>
            <label class="field">
              <span>Budget (€)</span>
              <input v-model="form.budget" type="number" min="0" placeholder="e.g. 8000" />
            </label>
            <label class="field">
              <span>Product owner</span>
              <select v-model="form.product_owner_id">
                <option value="">— none —</option>
                <option v-for="u in poCandidates" :key="u.id" :value="u.id">
                  {{ u.first_name }} {{ u.last_name }}
                </option>
              </select>
            </label>
            <div class="form-actions">
              <button @click="saveEdit" class="btn-primary" :disabled="saving">{{ saving ? 'Saving…' : 'Save' }}</button>
              <button @click="editing = false" class="btn-light" :disabled="saving">Cancel</button>
            </div>
            <p v-if="saveError" class="inline-error">{{ saveError }}</p>
          </div>
        </div>

        <!-- Technical spec (the main writing area) -->
        <div class="section">
          <div class="section-head">
            <h2>Technical specification</h2>
            <button v-if="canManage && !editingSpec" @click="startEditSpec" class="btn-light">✎ Edit</button>
          </div>

          <p v-if="!editingSpec" class="spec-text">{{ challenge.technical_spec || 'No specification yet.' }}</p>

          <div v-else class="edit-form">
            <textarea v-model="form.technical_spec" rows="12" placeholder="Describe the goal, scope, deliverables, tech stack…"></textarea>
            <div class="form-actions">
              <button @click="saveSpec" class="btn-primary" :disabled="saving">{{ saving ? 'Saving…' : 'Save spec' }}</button>
              <button @click="editingSpec = false" class="btn-light" :disabled="saving">Cancel</button>
            </div>
            <p v-if="saveError" class="inline-error">{{ saveError }}</p>
          </div>
        </div>

        <!-- Status management (managers) -->
        <div v-if="canManage" class="section">
          <h2>Status</h2>
          <p class="hint">Current: <strong>{{ statusLabel(challenge.status) }}</strong></p>
          <div class="status-actions">
            <button
              v-if="challenge.status === 'draft'"
              @click="changeStatus('published')"
              class="btn-primary"
              :disabled="saving"
            >
              🚀 Publish challenge
            </button>
            <div class="status-set">
              <select v-model="targetStatus">
                <option v-for="s in STATUSES" :key="s" :value="s">{{ statusLabel(s) }}</option>
              </select>
              <button @click="changeStatus(targetStatus)" class="btn-light" :disabled="saving || targetStatus === challenge.status">
                Set status
              </button>
            </div>
          </div>
        </div>

        <!-- Project progress (once a team is assigned) -->
        <div v-if="canManage && project" class="section">
          <div class="section-head">
            <h2>Project progress</h2>
            <button
              v-if="['assigned', 'in_progress'].includes(challenge.status)"
              @click="approveDelivery"
              class="btn-primary"
              :disabled="saving"
            >
              ✓ Approve delivery
            </button>
          </div>

          <div class="detail-grid">
            <div class="detail-row"><span class="label">Team</span><span class="strong">{{ project.team?.name }}</span></div>
            <div class="detail-row"><span class="label">Mentor</span><span>{{ projectMentorName ?? 'Not assigned yet' }}</span></div>
          </div>

          <h3 class="sub">Milestones</h3>
          <div v-if="(project.milestones ?? []).length === 0" class="hint">No milestones yet.</div>
          <div v-else class="prog-list">
            <div v-for="m in project.milestones" :key="m.id" class="prog-row">
              <span class="pill" :class="msCls(m.status)">{{ m.status.replace('_', ' ') }}</span>
              <span class="prog-title">{{ m.title }}</span>
            </div>
          </div>

          <h3 class="sub">Latest mentor feedback</h3>
          <div v-if="projectConsultations.length === 0" class="hint">No consultations logged yet.</div>
          <div v-else class="prog-list">
            <div v-for="c in projectConsultations.slice(0, 3)" :key="c.id" class="consult-mini">
              <strong>{{ c.scheduled_at ? new Date(c.scheduled_at).toLocaleDateString('sk-SK') : '' }}</strong>
              <span>{{ c.feedback || c.notes || '—' }}</span>
            </div>
          </div>
        </div>

        <!-- Candidate teams (managers) -->
        <div v-if="canManage" class="section">
          <div class="section-head">
            <h2>Candidate teams</h2>
            <span class="count-pill">{{ candidates.length }}</span>
          </div>

          <div v-if="candidates.length === 0" class="empty">No teams have applied yet.</div>

          <div v-else class="cand-list">
            <div v-for="app in candidates" :key="app.id" class="cand-row" :class="{ chosen: app.status === 'approved' }">
              <div class="cand-info">
                <strong>{{ app.team?.name ?? 'Team' }}</strong>
                <span class="muted">{{ app.team?.members?.length ?? 0 }} member(s) · {{ appStatusLabel(app.status) }}</span>
                <p v-if="app.motivation_letter" class="cand-letter">{{ app.motivation_letter }}</p>
              </div>
              <button
                v-if="app.status === 'submitted'"
                @click="selectTeam(app.id)"
                class="btn-primary"
                :disabled="saving"
              >
                Select team
              </button>
              <span v-else-if="app.status === 'approved'" class="pill green">Selected ✓</span>
              <span v-else class="pill grey">{{ appStatusLabel(app.status) }}</span>
            </div>
          </div>
        </div>

        <!-- Mentor assignment (NTI admin, once a team is selected) -->
        <div v-if="isAdmin && assignedApplicationId" class="section">
          <h2>Mentor</h2>
          <p class="hint">Current mentor: <strong>{{ currentMentor?.name ?? 'none assigned' }}</strong></p>
          <div class="status-set">
            <select v-model="targetMentor">
              <option value="">Select mentor…</option>
              <option v-for="m in mentorCandidates" :key="m.id" :value="m.id">
                {{ m.first_name }} {{ m.last_name }}
              </option>
            </select>
            <button @click="assignMentor" class="btn-primary" :disabled="saving || !targetMentor">
              Assign mentor
            </button>
          </div>
        </div>

        <!-- Student apply -->
        <div v-else-if="isStudent && (challenge.status === 'published' || challenge.status === 'matching')" class="section">
          <h2>Interested?</h2>
          <p class="hint">Apply with your team from the Challenges page.</p>
          <RouterLink to="/challenges" class="btn-primary inline">Go to Challenges →</RouterLink>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { challengesApi, challengeApplicationsApi, type PersonOption } from '../api/challenges'
import AppLayout from '../components/AppLayout.vue'
import type { Application, Challenge, Consultation, StudentProject } from '../types'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const id = route.params.id as string

const loading = ref(true)
const error = ref('')
const challenge = ref<Challenge | null>(null)
const canManage = ref(false)
const candidates = ref<Application[]>([])
const project = ref<StudentProject | null>(null)

const projectConsultations = computed<Consultation[]>(() =>
  (project.value?.mentorships ?? [])
    .flatMap((m) => m.consultations ?? [])
    .sort((a, b) => (b.scheduled_at ?? '').localeCompare(a.scheduled_at ?? '')),
)
const projectMentorName = computed(() => {
  const mentor = project.value?.mentorships?.find((m) => m.mentor)?.mentor
  return mentor ? `${mentor.first_name} ${mentor.last_name}`.trim() : null
})
function msCls(s: string) {
  return s === 'completed' ? 'green' : s === 'overdue' ? 'red' : s === 'in_progress' ? 'amber' : 'grey'
}

async function approveDelivery() {
  if (!assignedApplicationId.value) return
  if (!confirm('Approve the final delivery and close this project?')) return
  saving.value = true
  try {
    await challengeApplicationsApi.approveDelivery(assignedApplicationId.value)
    await load()
  } finally {
    saving.value = false
  }
}

const poCandidates = ref<PersonOption[]>([])
const mentorCandidates = ref<PersonOption[]>([])
const assignedApplicationId = ref<string | null>(null)
const currentMentor = ref<{ id: string; name: string } | null>(null)
const targetMentor = ref('')

const editing = ref(false)
const editingSpec = ref(false)
const saving = ref(false)
const saveError = ref('')
const targetStatus = ref('')

const form = reactive({ title: '', budget: '' as string | number, technical_spec: '', product_owner_id: '' })

const STATUSES = ['draft', 'published', 'matching', 'assigned', 'in_progress', 'closed']

const isStudent = computed(() => authStore.user?.account_type === 'student')
const isAdmin = computed(() => ['nti_admin', 'superadmin'].includes(authStore.user?.account_type ?? ''))
const poName = computed(() => {
  const po = challenge.value?.product_owner
  return po ? `${po.first_name} ${po.last_name}`.trim() : '—'
})

const CH_STATUS: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'grey' },
  published: { label: 'Published', cls: 'blue' },
  matching: { label: 'Matching', cls: 'amber' },
  assigned: { label: 'Assigned', cls: 'violet' },
  in_progress: { label: 'In progress', cls: 'green' },
  closed: { label: 'Closed', cls: 'grey' },
}
const statusLabel = (s: string) => CH_STATUS[s]?.label ?? s
const statusClass = (s: string) => CH_STATUS[s]?.cls ?? 'grey'

const APP_STATUS: Record<string, string> = {
  submitted: 'Pending review',
  approved: 'Selected',
  rejected: 'Not selected',
  active: 'In progress',
}
const appStatusLabel = (s: string) => APP_STATUS[s] ?? s

const formatBudget = (b: number | string) => Number(b).toLocaleString('sk-SK')
const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString('sk-SK') : '—')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await challengesApi.get(id)
    challenge.value = res.challenge
    canManage.value = res.can_manage
    targetStatus.value = res.challenge.status
    poCandidates.value = res.po_candidates ?? []
    mentorCandidates.value = res.mentor_candidates ?? []
    assignedApplicationId.value = res.assigned_application_id ?? null
    currentMentor.value = res.current_mentor ?? null
    if (canManage.value) {
      const c = await challengesApi.candidates(id).catch(() => ({ applications: [] }))
      candidates.value = c.applications
    }
    // Load progress (mentor, milestones, consultations) once a team is assigned.
    project.value = null
    if (canManage.value && assignedApplicationId.value) {
      const p = await challengeApplicationsApi.project(assignedApplicationId.value).catch(() => null)
      project.value = p?.application ?? null
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Could not load this challenge.'
  } finally {
    loading.value = false
  }
}

function startEdit() {
  if (!challenge.value) return
  form.title = challenge.value.title
  form.budget = challenge.value.budget ?? ''
  form.product_owner_id = challenge.value.product_owner_id ?? ''
  saveError.value = ''
  editing.value = true
}

function startEditSpec() {
  if (!challenge.value) return
  form.technical_spec = challenge.value.technical_spec ?? ''
  saveError.value = ''
  editingSpec.value = true
}

async function saveEdit() {
  saving.value = true
  saveError.value = ''
  try {
    const payload: { title: string; budget: number | null; product_owner_id?: string } = {
      title: form.title,
      budget: form.budget === '' ? null : Number(form.budget),
    }
    if (form.product_owner_id) payload.product_owner_id = form.product_owner_id
    await challengesApi.update(id, payload)
    editing.value = false
    await load()
  } catch (e: any) {
    saveError.value = e?.response?.data?.message ?? 'Failed to save.'
  } finally {
    saving.value = false
  }
}

async function saveSpec() {
  saving.value = true
  saveError.value = ''
  try {
    await challengesApi.update(id, { technical_spec: form.technical_spec })
    editingSpec.value = false
    await load()
  } catch (e: any) {
    saveError.value = e?.response?.data?.message ?? 'Failed to save.'
  } finally {
    saving.value = false
  }
}

async function changeStatus(status: string) {
  saving.value = true
  try {
    await challengesApi.updateStatus(id, status)
    await load()
  } finally {
    saving.value = false
  }
}

async function selectTeam(applicationId: string) {
  saving.value = true
  try {
    await challengeApplicationsApi.select(applicationId)
    await load()
  } finally {
    saving.value = false
  }
}

async function assignMentor() {
  if (!assignedApplicationId.value || !targetMentor.value) return
  saving.value = true
  try {
    await challengeApplicationsApi.assignMentor(assignedApplicationId.value, targetMentor.value)
    targetMentor.value = ''
    await load()
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.challenge-detail {
  max-width: 820px;
  font-family: 'DM Sans', sans-serif;
}

.back-btn {
  background: none;
  border: none;
  color: #8892a4;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.5rem 0;
  margin-bottom: 0.5rem;
}
.back-btn:hover { color: #0f1117; }

.state { padding: 2rem 0; color: #8892a4; }
.state.error { color: #ef4444; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem 0 2rem 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
}
.header-content { display: flex; gap: 1rem; align-items: center; }
.ch-icon {
  width: 48px; height: 48px; border-radius: 12px;
  background: #f0fdf4; color: #16a34a;
  display: flex; align-items: center; justify-content: center; font-size: 1.4rem;
}
.page-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.7rem; font-weight: 700; color: #0f1117; margin: 0;
}
.page-subtitle { color: #8892a4; font-size: 0.9rem; margin: 0.2rem 0 0 0; }

.section {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.section h2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1rem; font-weight: 700; color: #0f1117; margin: 0 0 1rem 0;
}
.section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.section-head h2 { margin: 0; }

.detail-grid { display: flex; flex-direction: column; gap: 0.1rem; }
.detail-row {
  display: flex; justify-content: space-between;
  padding: 0.6rem 0; border-bottom: 1px solid #f3f4f6; font-size: 0.9rem;
}
.detail-row:last-child { border-bottom: none; }
.label { color: #8892a4; }
.strong, .detail-row .strong { font-weight: 700; color: #0f1117; }

.spec-text {
  white-space: pre-wrap;
  line-height: 1.6;
  color: #374151;
  font-size: 0.92rem;
  margin: 0;
}

.edit-form { display: flex; flex-direction: column; gap: 0.9rem; }
.field { display: flex; flex-direction: column; gap: 0.35rem; }
.field span { font-size: 0.8rem; color: #8892a4; font-weight: 600; }
.edit-form input, .edit-form textarea, .status-set select {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  font-size: 0.9rem;
  font-family: inherit;
  color: #0f1117;
}
.edit-form textarea { resize: vertical; line-height: 1.5; }
.edit-form input:focus, .edit-form textarea:focus { outline: none; border-color: #6ee7b7; }

.form-actions { display: flex; gap: 0.6rem; }

.btn-primary {
  background: #0f1117; color: #fff; border: none;
  padding: 0.55rem 1.1rem; border-radius: 8px;
  font-size: 0.85rem; font-weight: 600; cursor: pointer;
}
.btn-primary:hover { background: #1f2430; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary.inline { display: inline-block; text-decoration: none; }

.btn-light {
  background: #f3f4f6; color: #374151; border: none;
  padding: 0.5rem 0.9rem; border-radius: 8px;
  font-size: 0.82rem; font-weight: 600; cursor: pointer;
}
.btn-light:hover { background: #e5e7eb; }
.btn-light:disabled { opacity: 0.5; cursor: not-allowed; }

.hint { color: #8892a4; font-size: 0.88rem; margin: 0 0 1rem 0; }
.inline-error { color: #ef4444; font-size: 0.85rem; margin: 0; }

.status-actions { display: flex; flex-direction: column; gap: 0.9rem; }
.status-set { display: flex; gap: 0.6rem; align-items: center; }

.count-pill {
  background: #f0fdf4; color: #16a34a;
  border-radius: 999px; padding: 0.15rem 0.6rem;
  font-size: 0.8rem; font-weight: 700;
}

.empty { color: #8892a4; font-size: 0.9rem; }

.cand-list { display: flex; flex-direction: column; gap: 0.7rem; }
.cand-row {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  padding: 0.9rem 1.1rem; border: 1px solid #f3f4f6; border-radius: 10px;
}
.cand-row.chosen { border-color: #6ee7b7; background: #f0fdf4; }
.cand-info { display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }
.cand-info strong { font-size: 0.92rem; color: #0f1117; }
.muted { color: #8892a4; font-size: 0.8rem; }
.cand-letter { margin: 0.35rem 0 0 0; font-size: 0.85rem; color: #4b5563; line-height: 1.4; }

.status-badge, .pill {
  padding: 0.3rem 0.8rem; border-radius: 999px;
  font-size: 0.78rem; font-weight: 600; white-space: nowrap;
}
.status-badge.grey, .pill.grey { background: #f3f4f6; color: #4b5563; }
.status-badge.blue { background: #dbeafe; color: #1e40af; }
.status-badge.amber { background: #fef3c7; color: #92400e; }
.status-badge.violet { background: #ede9fe; color: #6d28d9; }
.status-badge.green, .pill.green { background: #dcfce7; color: #166534; }
.pill.amber { background: #fef3c7; color: #92400e; }
.pill.red { background: #fee2e2; color: #991b1b; }

.sub { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.82rem; font-weight: 700; color: #6b7280; margin: 1.25rem 0 0.6rem 0; text-transform: uppercase; letter-spacing: 0.04em; }
.prog-list { display: flex; flex-direction: column; gap: 0.5rem; }
.prog-row { display: flex; align-items: center; gap: 0.7rem; font-size: 0.88rem; color: #374151; }
.prog-title { color: #0f1117; }
.consult-mini { display: flex; gap: 0.7rem; font-size: 0.85rem; color: #4b5563; }
.consult-mini strong { color: #16a34a; white-space: nowrap; min-width: 84px; }
</style>
