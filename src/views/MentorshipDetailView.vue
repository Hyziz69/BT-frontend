<template>
  <AppLayout>
    <div class="mentorship-detail">
      <button @click="router.push('/mentees')" class="back-btn">← Back to Mentees</button>

      <div v-if="loading" class="state">Loading…</div>
      <div v-else-if="error" class="state error">{{ error }}</div>

      <div v-else-if="mentorship">
        <!-- Header -->
        <div class="page-header">
          <div class="header-content">
            <div class="m-icon">🧑‍🏫</div>
            <div>
              <h1 class="page-title">{{ teamName }}</h1>
              <p class="page-subtitle">{{ projectLabel }}</p>
            </div>
          </div>
          <span class="status-badge" :class="ended ? 'grey' : 'green'">{{ ended ? 'Ended' : 'Active' }}</span>
        </div>

        <!-- Project / details -->
        <div class="section">
          <h2>Project</h2>
          <div class="detail-grid">
            <div class="detail-row"><span class="label">Project</span><span class="strong">{{ projectLabel }}</span></div>
            <div class="detail-row" v-if="challenge?.company"><span class="label">Company</span><span>{{ challenge?.company?.name }}</span></div>
            <div class="detail-row"><span class="label">Started</span><span>{{ fmt(mentorship.started_at) }}</span></div>
            <div class="detail-row" v-if="mentorship.ended_at"><span class="label">Ended</span><span>{{ fmt(mentorship.ended_at) }}</span></div>
            <div class="detail-row"><span class="label">Consultations</span><span>{{ consultations.length }}</span></div>
          </div>
        </div>

        <!-- Team members -->
        <div class="section">
          <h2>Team members</h2>
          <div v-if="members.length === 0" class="empty">No members listed.</div>
          <div v-else class="member-list">
            <div v-for="m in members" :key="m.id" class="member-row" style="cursor:pointer" @click="router.push(`/users/${m.id}/profile`)">
              <div class="avatar">{{ initials(m) }}</div>
              <div class="member-info">
                <strong>{{ m.first_name }} {{ m.last_name }}</strong>
                <span class="muted">{{ m.email }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Project spec -->
        <div class="section" v-if="challenge?.technical_spec">
          <h2>Specification</h2>
          <p class="spec-text">{{ challenge?.technical_spec }}</p>
        </div>

        <!-- Milestones -->
        <div class="section">
          <div class="section-head">
            <h2>Milestones</h2>
            <button v-if="!showMsForm && !ended" @click="openMsForm" class="btn-primary">+ Add</button>
          </div>

          <div v-if="showMsForm" class="log-form">
            <label class="field"><span>Title</span><input v-model="msForm.title" type="text" placeholder="e.g. MVP prototype ready" /></label>
            <label class="field"><span>Due date</span><input v-model="msForm.due_date" type="date" /></label>
            <label class="field"><span>Comment</span><textarea v-model="msForm.comment" rows="2" placeholder="Optional details…"></textarea></label>
            <div class="form-actions">
              <button @click="addMilestone" class="btn-primary" :disabled="savingMs || !msForm.title">{{ savingMs ? 'Saving…' : 'Add milestone' }}</button>
              <button @click="showMsForm = false" class="btn-light" :disabled="savingMs">Cancel</button>
            </div>
          </div>

          <div v-if="milestones.length === 0 && !showMsForm" class="empty">No milestones yet.</div>
          <div v-else class="ms-list">
            <div v-for="m in milestones" :key="m.id" class="ms-row">
              <div class="ms-info">
                <strong>{{ m.title }}</strong>
                <span v-if="m.due_date" class="muted">Due {{ fmt(m.due_date) }}</span>
                <p v-if="m.comment" class="muted m-comment">{{ m.comment }}</p>
              </div>
              <select
                :value="m.status"
                @change="updateMsStatus(m, ($event.target as HTMLSelectElement).value)"
                class="ms-select"
                :disabled="ended"
              >
                <option v-for="s in MS_STATUSES" :key="s" :value="s">{{ s.replace('_', ' ') }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Consultations -->
        <div class="section">
          <div class="section-head">
            <h2>Consultations</h2>
            <button v-if="!showForm && !ended" @click="openForm" class="btn-primary">+ Log consultation</button>
          </div>

          <!-- Log form -->
          <div v-if="showForm" class="log-form">
            <label class="field">
              <span>Date</span>
              <input v-model="form.scheduled_at" type="date" />
            </label>
            <label class="field">
              <span>Notes (what was discussed)</span>
              <textarea v-model="form.notes" rows="3" placeholder="Agenda, progress, blockers…"></textarea>
            </label>
            <label class="field">
              <span>Feedback for the team</span>
              <textarea v-model="form.feedback" rows="3" placeholder="Recommendations, next steps…"></textarea>
            </label>
            <p v-if="formError" class="inline-error">{{ formError }}</p>
            <div class="form-actions">
              <button @click="submit" class="btn-primary" :disabled="saving || !form.scheduled_at">
                {{ saving ? 'Saving…' : 'Save consultation' }}
              </button>
              <button @click="showForm = false" class="btn-light" :disabled="saving">Cancel</button>
            </div>
          </div>

          <div v-if="consultations.length === 0 && !showForm" class="empty">No consultations logged yet.</div>

          <div class="timeline">
            <div v-for="c in consultations" :key="c.id" class="consult-card">
              <div class="consult-date">{{ fmt(c.scheduled_at) }}</div>
              <div class="consult-body">
                <p v-if="c.notes" class="consult-notes">{{ c.notes }}</p>
                <p v-if="c.feedback" class="consult-feedback"><strong>Feedback:</strong> {{ c.feedback }}</p>
                <p v-if="!c.notes && !c.feedback" class="muted">No details.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mentorApi } from '../api/mentor'
import { challengeApplicationsApi } from '../api/challenges'
import { milestonesApi } from '../api/milestones'
import AppLayout from '../components/AppLayout.vue'
import type { Consultation, Mentorship, MentorshipPerson, Milestone } from '../types'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const loading = ref(true)
const error = ref('')
const mentorship = ref<Mentorship | null>(null)
const consultations = ref<Consultation[]>([])

const showForm = ref(false)
const saving = ref(false)
const formError = ref('')
const form = reactive({ scheduled_at: '', notes: '', feedback: '' })

const ended = computed(() => !!mentorship.value?.ended_at)
const challenge = computed(() => mentorship.value?.application?.challenge ?? null)
const appId = computed(() => mentorship.value?.application?.id ?? '')
const milestones = ref<Milestone[]>([])

const showMsForm = ref(false)
const savingMs = ref(false)
const msForm = reactive({ title: '', due_date: '', comment: '' })
const MS_STATUSES = ['pending', 'in_progress', 'completed', 'overdue']

function openMsForm() {
  msForm.title = ''
  msForm.due_date = ''
  msForm.comment = ''
  showMsForm.value = true
}
async function addMilestone() {
  if (!msForm.title || !appId.value) return
  savingMs.value = true
  try {
    await milestonesApi.create(appId.value, {
      title: msForm.title,
      due_date: msForm.due_date || null,
      comment: msForm.comment || null,
    })
    showMsForm.value = false
    await load()
  } finally {
    savingMs.value = false
  }
}
async function updateMsStatus(m: Milestone, status: string) {
  m.status = status as Milestone['status']
  try {
    await milestonesApi.update(appId.value, m.id, { status })
  } catch {
    /* optimistic */
  }
}
const teamName = computed(() => mentorship.value?.application?.team?.name ?? 'Mentorship')
const members = computed<MentorshipPerson[]>(() => mentorship.value?.application?.team?.members ?? [])
const projectLabel = computed(
  () =>
    challenge.value?.title ??
    mentorship.value?.application?.call?.program?.name ??
    'Program A application',
)

function fmt(d?: string | null) {
  return d ? new Date(d).toLocaleDateString('sk-SK') : '—'
}
function initials(m: MentorshipPerson) {
  return ((m.first_name?.[0] ?? '') + (m.last_name?.[0] ?? '')).toUpperCase()
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await mentorApi.mentorship(id)
    mentorship.value = res.mentorship
    consultations.value = res.mentorship.consultations ?? []
    milestones.value = res.mentorship.application?.milestones ?? []
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Could not load this mentorship.'
  } finally {
    loading.value = false
  }
}

function openForm() {
  form.scheduled_at = new Date().toISOString().slice(0, 10)
  form.notes = ''
  form.feedback = ''
  formError.value = ''
  showForm.value = true
}

async function submit() {
  saving.value = true
  formError.value = ''
  try {
    await mentorApi.logConsultation(id, {
      scheduled_at: form.scheduled_at,
      notes: form.notes || undefined,
      feedback: form.feedback || undefined,
    })
    showForm.value = false
    await load()
  } catch (e: any) {
    formError.value = e?.response?.data?.message ?? 'Failed to save consultation.'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.mentorship-detail { max-width: 820px; font-family: 'DM Sans', sans-serif; }

.back-btn { background: none; border: none; color: #8892a4; font-size: 0.9rem; cursor: pointer; padding: 0.5rem 0; margin-bottom: 0.5rem; }
.back-btn:hover { color: #0f1117; }

.state { padding: 2rem 0; color: #8892a4; }
.state.error { color: #ef4444; }

.page-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 1rem 0 2rem 0; border-bottom: 1px solid #e5e7eb; margin-bottom: 1.5rem;
}
.header-content { display: flex; gap: 1rem; align-items: center; }
.m-icon {
  width: 48px; height: 48px; border-radius: 12px; background: #f0fdf4;
  display: flex; align-items: center; justify-content: center; font-size: 1.4rem;
}
.page-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.7rem; font-weight: 700; color: #0f1117; margin: 0; }
.page-subtitle { color: #8892a4; font-size: 0.9rem; margin: 0.2rem 0 0 0; }

.section { background: #fff; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.section h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1rem; font-weight: 700; color: #0f1117; margin: 0 0 1rem 0; }
.section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.section-head h2 { margin: 0; }

.detail-grid { display: flex; flex-direction: column; }
.detail-row { display: flex; justify-content: space-between; padding: 0.6rem 0; border-bottom: 1px solid #f3f4f6; font-size: 0.9rem; }
.detail-row:last-child { border-bottom: none; }
.label { color: #8892a4; }
.strong { font-weight: 700; color: #0f1117; }
.muted { color: #8892a4; font-size: 0.8rem; }
.empty { color: #8892a4; font-size: 0.9rem; }

.member-row:hover .member-info strong { color: #16a34a; }
.member-list { display: flex; flex-direction: column; gap: 0.6rem; }
.member-row { display: flex; align-items: center; gap: 0.8rem; }
.avatar {
  width: 38px; height: 38px; border-radius: 50%; background: #0f1117; color: #6ee7b7;
  display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem;
}
.member-info { display: flex; flex-direction: column; }
.member-info strong { font-size: 0.9rem; color: #0f1117; }

.spec-text { white-space: pre-wrap; line-height: 1.6; color: #374151; font-size: 0.92rem; margin: 0; }

.btn-primary { background: #0f1117; color: #fff; border: none; padding: 0.55rem 1.1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
.btn-primary:hover { background: #1f2430; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-light { background: #f3f4f6; color: #374151; border: none; padding: 0.5rem 0.9rem; border-radius: 8px; font-size: 0.82rem; font-weight: 600; cursor: pointer; }
.btn-light:hover { background: #e5e7eb; }

.log-form { display: flex; flex-direction: column; gap: 0.9rem; margin-bottom: 1.25rem; padding-bottom: 1.25rem; border-bottom: 1px solid #f3f4f6; }
.field { display: flex; flex-direction: column; gap: 0.35rem; }
.field span { font-size: 0.8rem; color: #8892a4; font-weight: 600; }
.log-form input, .log-form textarea {
  border: 1px solid #d1d5db; border-radius: 8px; padding: 0.6rem 0.8rem;
  font-size: 0.9rem; font-family: inherit; color: #0f1117;
}
.log-form textarea { resize: vertical; line-height: 1.5; }
.log-form input:focus, .log-form textarea:focus { outline: none; border-color: #6ee7b7; }
.form-actions { display: flex; gap: 0.6rem; }
.inline-error { color: #ef4444; font-size: 0.85rem; margin: 0; }

.timeline { display: flex; flex-direction: column; gap: 0.75rem; }
.consult-card { display: flex; gap: 1rem; padding: 0.9rem 1rem; border: 1px solid #f3f4f6; border-radius: 10px; }
.consult-date { font-size: 0.8rem; font-weight: 700; color: #16a34a; white-space: nowrap; min-width: 90px; }
.consult-body { display: flex; flex-direction: column; gap: 0.35rem; }
.consult-notes { margin: 0; font-size: 0.88rem; color: #374151; line-height: 1.45; }
.consult-feedback { margin: 0; font-size: 0.85rem; color: #4b5563; line-height: 1.45; }

.status-badge { padding: 0.3rem 0.8rem; border-radius: 999px; font-size: 0.78rem; font-weight: 600; }
.status-badge.green { background: #dcfce7; color: #166534; }
.status-badge.grey { background: #f3f4f6; color: #4b5563; }

.ms-list { display: flex; flex-direction: column; gap: 0.6rem; }
.ms-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding: 0.7rem 0; border-bottom: 1px solid #f7f7f8; }
.ms-row:last-child { border-bottom: none; }
.ms-info { display: flex; flex-direction: column; gap: 0.15rem; }
.ms-info strong { font-size: 0.9rem; color: #0f1117; }
.m-comment { margin: 0.2rem 0 0 0; }
.ms-select { border: 1px solid #d1d5db; border-radius: 8px; padding: 0.35rem 0.6rem; font-size: 0.8rem; font-family: inherit; text-transform: capitalize; cursor: pointer; }
.ms-select:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
