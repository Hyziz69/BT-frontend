<template>
  <AppLayout>
    <div class="challenges-page">
      <div class="page-header">
        <div class="header-content">
          <div class="page-icon">◆</div>
          <div>
            <h1 class="page-title">{{ isCompany ? 'Program B' : 'Program B' }}</h1>
            <p class="page-subtitle">{{ isCompany ? 'Manage your challenges and review applicants.' : 'Open company challenges — apply with your team.' }}</p>
          </div>
        </div>
        <button v-if="isCompany" @click="openCreateChallenge" class="btn-primary">+ New Challenge</button>
      </div>

      <div v-if="loading" class="loading">Loading…</div>

      <template v-else>
        <!-- Company view -->
        <template v-if="isCompany">
          <div v-if="challenges.length === 0" class="section empty">No challenges yet. Create your first one.</div>
          <div v-else class="challenge-list">
            <div v-for="ch in challenges" :key="ch.id" class="challenge-row" @click="router.push(`/challenges/${ch.id}`)">
              <div class="challenge-row-main">
                <strong>{{ ch.title }}</strong>
                <span class="muted">{{ ch.budget ? formatBudget(ch.budget) + ' €' : 'No budget' }}</span>
              </div>
              <div class="challenge-row-right">
                <span class="status-badge" :class="ch.status">{{ ch.status }}</span>
                <span class="candidates-count">{{ ch.candidates_count ?? 0 }} candidates</span>
                <span class="arrow">→</span>
              </div>
            </div>
          </div>
        </template>

        <!-- Student view -->
        <template v-else>
          <div v-if="myApps.length" class="section my-apps">
            <h2>My applications</h2>
            <div class="app-list">
              <div v-for="app in myApps" :key="app.id" class="app-row">
                <div class="app-info">
                  <RouterLink v-if="app.challenge?.id" :to="`/challenges/${app.challenge.id}`" class="app-title-link">
                    {{ app.challenge?.title ?? 'Challenge' }}
                  </RouterLink>
                  <strong v-else>{{ app.challenge?.title ?? 'Challenge' }}</strong>
                  <span class="muted">
                    {{ app.challenge?.company?.name ?? '' }}
                    · applied {{ app.submitted_at ? formatDate(app.submitted_at) : '' }}
                  </span>
                </div>
                <div class="app-right">
                  <span class="app-status" :class="statusClass(app.status)">{{ statusLabel(app.status) }}</span>
                  <RouterLink
                    v-if="['approved', 'active', 'completed'].includes(app.status)"
                    :to="`/projects/${app.id}`"
                    class="project-link"
                  >
                    Open project →
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>

          <h2 class="grid-heading">Open challenges</h2>
          <div v-if="challenges.length === 0" class="section empty">
            No open challenges right now. Check back later.
          </div>
          <div v-else class="challenge-grid">
            <div v-for="ch in challenges" :key="ch.id" class="challenge-card">
              <div class="card-top">
                <RouterLink :to="`/challenges/${ch.id}`" class="card-title link">{{ ch.title }}</RouterLink>
                <span class="status-badge" :class="ch.status">{{ ch.status }}</span>
              </div>
              <div class="card-meta">
                <span v-if="ch.budget">💶 {{ formatBudget(ch.budget) }} €</span>
                <span v-else>Budget not specified</span>
              </div>
              <span v-if="appliedStatus(ch.id)" class="app-status" :class="statusClass(appliedStatus(ch.id)!)">
                {{ statusLabel(appliedStatus(ch.id)!) }}
              </span>
              <template v-else>
                <button v-if="isStudent" @click="openApply(ch)" class="btn-primary">View &amp; apply</button>
                <button v-else @click="openApply(ch)" class="btn-primary">View details</button>
              </template>
            </div>
          </div>
        </template>
      </template>

      <!-- Apply modal -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeApply">
        <div class="modal">
          <div v-if="detailLoading" class="loading">Loading…</div>
          <template v-else-if="activeChallenge">
            <h2>{{ activeChallenge.title }}</h2>
            <p class="spec-label">Technical specification</p>
            <p class="spec-text">{{ activeChallenge.technical_spec || 'No specification provided.' }}</p>
            <p v-if="activeChallenge.budget" class="budget-line">
              Budget: <strong>{{ formatBudget(activeChallenge.budget) }} €</strong>
            </p>

            <template v-if="!applySuccess && isStudent">
              <div class="field">
                <label>Motivation letter</label>
                <textarea v-model="applyForm.motivation_letter" rows="3" placeholder="Why is your team a great fit?"></textarea>
              </div>
              <div class="field">
                <label>Solution proposal</label>
                <textarea v-model="applyForm.solution_proposal" rows="3" placeholder="Outline your proposed approach…"></textarea>
              </div>
            </template>

            <p v-if="applySuccess" class="success">{{ applySuccess }}</p>
            <div v-if="applyError" class="apply-warning">
              <span class="warning-icon">⚠</span>
              <p>{{ applyError }}</p>
            </div>

            <div class="modal-actions">
              <button @click="closeApply" class="btn-secondary">{{ applySuccess ? 'Close' : 'Cancel' }}</button>
              <button v-if="!applySuccess && isStudent" @click="handleApply" :disabled="applying" class="btn-primary">
                {{ applying ? 'Submitting…' : 'Submit application' }}
              </button>
            </div>
          </template>
        </div>
      </div>
      <!-- Create challenge modal -->
<div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
  <div class="modal">
    <h2>New Challenge</h2>
    <div class="field">
      <label>Title *</label>
      <input v-model="createForm.title" type="text" placeholder="e.g. Mobile onboarding app" />
    </div>
    <div class="field">
      <label>Technical specification *</label>
      <textarea v-model="createForm.technical_spec" rows="4" placeholder="Describe the problem and expected solution…"></textarea>
    </div>
    <div class="field">
      <label>Budget (EUR)</label>
      <input v-model.number="createForm.budget" type="number" min="0" placeholder="5000" />
    </div>
    <div class="field">
      <label>Call *</label>
      <select v-model="createForm.call_id" class="select-field">
        <option value="" disabled>-- Select call --</option>
        <option v-for="c in availableCalls" :key="c.id" :value="c.id">{{ c.title }}</option>
      </select>
    </div>
    <p v-if="createError" class="error">{{ createError }}</p>
    <div class="modal-actions">
      <button @click="showCreateModal = false" class="btn-secondary">Cancel</button>
      <button @click="handleCreateChallenge" :disabled="creating" class="btn-primary">
        {{ creating ? 'Creating…' : 'Create Challenge' }}
      </button>
    </div>
  </div>
</div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { challengesApi, challengeApplicationsApi } from '../api/challenges'
import type { Application, Challenge } from '../types'
import AppLayout from '../components/AppLayout.vue'
import { useRouter } from 'vue-router'
import { programsApi } from '../api/programs'
import { useAuthStore } from '../stores/auth'
import { useTeamsStore } from '../stores/teams'
const teamsStore = useTeamsStore()
const authStore = useAuthStore()
const isStudent = computed(() => authStore.user?.account_type === 'student')

const showCreateModal = ref(false)
const creating = ref(false)
const createError = ref<string | null>(null)
const availableCalls = ref<any[]>([])
const createForm = ref({ title: '', technical_spec: '', budget: null as number | null, call_id: '' })

async function openCreateChallenge() {
  createForm.value = { title: '', technical_spec: '', budget: null, call_id: '' }
  createError.value = null
  showCreateModal.value = true
  try {
    const res = await programsApi.listProgramB()
    if (res.programs.length > 0) {
      const callsRes = await programsApi.callsFor(res.programs[0]!.id)
      availableCalls.value = callsRes.calls ?? []
    }
  } catch {
    availableCalls.value = []
  }
}

async function handleCreateChallenge() {
  if (!createForm.value.title || !createForm.value.technical_spec) {
    createError.value = 'Title and specification are required.'
    return
  }
  creating.value = true
  createError.value = null
  try {
    await challengesApi.create({
      title: createForm.value.title,
      technical_spec: createForm.value.technical_spec,
      call_id: createForm.value.call_id || undefined,
      budget: createForm.value.budget,
    })
    showCreateModal.value = false
    await load()
  } catch (e: any) {
    createError.value = e.response?.data?.message ?? 'Failed to create challenge.'
  } finally {
    creating.value = false
  }
}

const router = useRouter()
const isCompany = computed(() => authStore.user?.account_type === 'company_contact')

const loading = ref(true)
const challenges = ref<Challenge[]>([])
const myApps = ref<Application[]>([])

const STATUS_META: Record<string, { label: string; cls: string }> = {
  submitted: { label: 'Pending review', cls: 'pending' },
  approved: { label: 'Selected ✓', cls: 'ok' },
  active: { label: 'In progress', cls: 'ok' },
  completed: { label: 'Completed', cls: 'done' },
  archived: { label: 'Completed', cls: 'done' },
  rejected: { label: 'Not selected', cls: 'rejected' },
}
function statusLabel(s: string): string {
  return STATUS_META[s]?.label ?? s
}
function statusClass(s: string): string {
  return STATUS_META[s]?.cls ?? 'pending'
}
function appliedStatus(challengeId: string): string | null {
  return myApps.value.find((a) => a.challenge?.id === challengeId)?.status ?? null
}
function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('sk-SK')
}

const showModal = ref(false)
const detailLoading = ref(false)
const activeChallenge = ref<Challenge | null>(null)
const applyForm = ref<{ motivation_letter: string; solution_proposal: string }>({
  motivation_letter: '',
  solution_proposal: '',
})
const applying = ref(false)
const applyError = ref<string | null>(null)
const applySuccess = ref<string | null>(null)

onMounted(async () => {
  await teamsStore.fetchTeams()
  load()
})

function formatBudget(b: number | string): string {
  const n = typeof b === 'string' ? parseFloat(b) : b
  return Number.isFinite(n) ? n.toLocaleString('sk-SK') : String(b)
}

async function load() {
  loading.value = true
  try {
    const [list] = await Promise.all([challengesApi.list(), loadMine()])
    challenges.value = list.challenges
  } catch {
    challenges.value = []
  } finally {
    loading.value = false
  }
}

async function loadMine() {
  try {
    const res = await challengeApplicationsApi.mine()
    myApps.value = res.applications
  } catch {
    myApps.value = []
  }
}

async function openApply(ch: Challenge) {
  applyForm.value = { motivation_letter: '', solution_proposal: '' }
  applyError.value = null
  applySuccess.value = null
  activeChallenge.value = ch
  showModal.value = true
  detailLoading.value = true
  try {
    // Fetch full detail (technical_spec + call_id needed to apply).
    const res = await challengesApi.get(ch.id)
    activeChallenge.value = res.challenge
  } catch {
    /* keep the list-level data */
  } finally {
    detailLoading.value = false
  }
}

function closeApply() {
  showModal.value = false
  activeChallenge.value = null
}

async function handleApply() {
  if (!activeChallenge.value) return
  if (!activeChallenge.value.call_id) {
    applyError.value = 'This challenge is not linked to a call and cannot accept applications.'
    return
  }

  const team = teamsStore.teams[0]
  if (!team) {
    applyError.value = 'You need to be in a team to apply.'
    return
  }

  applying.value = true
  applyError.value = null
  try {
    await challengeApplicationsApi.apply({
      call_id: activeChallenge.value.call_id,
      challenge_id: activeChallenge.value.id,
      team_id: team.id,
      motivation_letter: applyForm.value.motivation_letter || undefined,
      solution_proposal: applyForm.value.solution_proposal || undefined,
    })
    applySuccess.value = 'Application submitted! The company will review your team.'
    await loadMine()
  } catch (e: any) {
    applyError.value = e.response?.data?.message ?? 'Failed to submit application.'
  } finally {
    applying.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.challenges-page { max-width: 900px; }
.loading { color: #8892a4; }
.challenge-list { display: flex; flex-direction: column; gap: 0.75rem; }
.challenge-row {
  background: white; border-radius: 12px; padding: 1rem 1.25rem;
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06); cursor: pointer;
  border: 1px solid transparent; transition: all 0.15s ease;
}
.challenge-row:hover { border-color: #6ee7b7; transform: translateX(3px); }
.challenge-row-main { display: flex; flex-direction: column; gap: 0.2rem; }
.challenge-row-main strong { font-size: 0.95rem; color: #0f1117; }
.challenge-row-right { display: flex; align-items: center; gap: 1rem; }
.candidates-count { font-size: 0.8rem; color: #8892a4; }
.arrow { color: #8892a4; }
.select-field {
  width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #e5e7eb;
  border-radius: 8px; font-size: 0.95rem; box-sizing: border-box;
}
input, textarea {
  width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #e5e7eb;
  border-radius: 8px; font-size: 0.95rem; box-sizing: border-box; font-family: inherit;
}
input:focus, textarea:focus { outline: none; border-color: #6ee7b7; }
select {
  width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #e5e7eb;
  border-radius: 8px; font-size: 0.95rem; box-sizing: border-box;
  background: white; cursor: pointer;
}
.apply-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 10px;
  margin-bottom: 0.75rem;
}
.warning-icon {
  color: #d97706;
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}
.apply-warning p {
  color: #92400e;
  font-size: 0.88rem;
  line-height: 1.5;
  margin: 0;
}
select:focus { outline: none; border-color: #6ee7b7; }
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 0 0 2rem 0;
  border-bottom: 1px solid #e5e7eb;
}
.header-content { display: flex; align-items: center; gap: 1rem; }
.page-icon {
  width: 52px; height: 52px;
  background: #eff6ff; color: #3b82f6;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; flex-shrink: 0;
}
.page-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.75rem; font-weight: 700; color: #0f1117;
  margin: 0 0 0.25rem 0;
}
.page-subtitle { color: #8892a4; font-size: 0.9rem; margin: 0; }

.section {
  background: white; border-radius: 12px; padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.empty { color: #8892a4; font-size: 0.9rem; }

.challenge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}
.challenge-card {
  background: white; border-radius: 12px; padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  display: flex; flex-direction: column; gap: 0.75rem;
}
.card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; }
.card-title { font-size: 1rem; color: #0f1117; }
.card-meta { color: #8892a4; font-size: 0.85rem; flex: 1; }

.status-badge {
  padding: 0.2rem 0.65rem; border-radius: 8px;
  font-size: 0.72rem; font-weight: 600; text-transform: capitalize;
  flex-shrink: 0;
}
.status-badge.published { background: #dbeafe; color: #1d4ed8; }
.status-badge.matching { background: #fef3c7; color: #92400e; }

.btn-primary {
  background: #0f1117; color: white; border: none;
  padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer;
  font-size: 0.85rem; font-weight: 600;
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary {
  background: #f3f4f6; color: #374151; border: none;
  padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.85rem;
}

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal {
  background: white; padding: 2rem; border-radius: 16px;
  width: 100%; max-width: 520px; box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  max-height: 85vh; overflow-y: auto;
}
.modal h2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.25rem; font-weight: 700; color: #0f1117; margin: 0 0 1rem 0;
}
.spec-label { font-weight: 600; font-size: 0.8rem; color: #6b7280; margin: 0 0 0.25rem 0; }
.spec-text { color: #374151; font-size: 0.9rem; white-space: pre-wrap; margin: 0 0 1rem 0; }
.budget-line { font-size: 0.9rem; color: #374151; margin: 0 0 1.25rem 0; }

.field { margin-bottom: 1rem; }
label { display: block; margin-bottom: 0.4rem; font-weight: 600; font-size: 0.9rem; color: #374151; }
textarea {
  width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #e5e7eb;
  border-radius: 8px; font-size: 0.95rem; box-sizing: border-box; font-family: inherit;
}
textarea:focus { outline: none; border-color: #6ee7b7; }

.modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem; }
.error { color: #ef4444; font-size: 0.9rem; }
.success { color: #16a34a; font-size: 0.9rem; }

/* My applications */
.my-apps { margin-bottom: 1.5rem; }
.my-apps h2, .grid-heading {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1rem; font-weight: 700; color: #0f1117; margin: 0 0 1rem 0;
}
.grid-heading { margin: 0.5rem 0 1rem 0; }
.app-list { display: flex; flex-direction: column; gap: 0.6rem; }
.app-row {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  padding: 0.75rem 1rem; border: 1px solid #f3f4f6; border-radius: 10px;
}
.app-info { display: flex; flex-direction: column; gap: 0.15rem; }
.app-info strong { font-size: 0.9rem; color: #0f1117; }
.muted { color: #8892a4; font-size: 0.8rem; }

.app-status {
  padding: 0.25rem 0.7rem; border-radius: 999px;
  font-size: 0.75rem; font-weight: 600; white-space: nowrap;
}
.app-status.pending { background: #fef3c7; color: #92400e; }
.app-status.ok { background: #dcfce7; color: #166534; }
.app-status.done { background: #ede9fe; color: #6d28d9; }
.app-status.rejected { background: #fee2e2; color: #991b1b; }

.card-title.link { text-decoration: none; cursor: pointer; }
.card-title.link:hover { color: #16a34a; text-decoration: underline; }
.app-title-link { font-size: 0.9rem; font-weight: 700; color: #0f1117; text-decoration: none; }
.app-title-link:hover { color: #16a34a; text-decoration: underline; }
.app-right { display: flex; align-items: center; gap: 0.85rem; }
.project-link { font-size: 0.8rem; font-weight: 600; color: #16a34a; text-decoration: none; white-space: nowrap; }
.project-link:hover { text-decoration: underline; }
</style>
