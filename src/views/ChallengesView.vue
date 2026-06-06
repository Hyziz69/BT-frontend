<template>
  <AppLayout>
    <div class="challenges-page">
      <div class="page-header">
        <div class="header-content">
          <div class="page-icon">◆</div>
          <div>
            <h1 class="page-title">Challenges</h1>
            <p class="page-subtitle">Open company challenges — apply with your team.</p>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading">Loading…</div>

      <template v-else>
        <!-- My applications -->
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
            <button v-else @click="openApply(ch)" class="btn-primary">View &amp; apply</button>
          </div>
        </div>
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

            <template v-if="!applySuccess">
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
            <p v-if="applyError" class="error">{{ applyError }}</p>

            <div class="modal-actions">
              <button @click="closeApply" class="btn-secondary">{{ applySuccess ? 'Close' : 'Cancel' }}</button>
              <button v-if="!applySuccess" @click="handleApply" :disabled="applying" class="btn-primary">
                {{ applying ? 'Submitting…' : 'Submit application' }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { challengesApi, challengeApplicationsApi } from '../api/challenges'
import type { Application, Challenge } from '../types'
import AppLayout from '../components/AppLayout.vue'

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

onMounted(load)

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
  applying.value = true
  applyError.value = null
  try {
    await challengeApplicationsApi.apply({
      call_id: activeChallenge.value.call_id,
      challenge_id: activeChallenge.value.id,
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

.page-header {
  display: flex;
  align-items: flex-start;
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
