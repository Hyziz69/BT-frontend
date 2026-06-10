<template>
  <AppLayout>
    <div class="applications">
      <div class="page-header">
        <div class="header-content">
          <div class="page-icon">🚀</div>
          <div>
            <h1 class="page-title">Program B Applications</h1>
            <p class="page-subtitle">Track your startup applications and pitch decks</p>
          </div>
        </div>
        <button v-if="isCompany" @click="showCreateForm = true" class="btn-primary">+ New Program B App</button>
      </div>

      <p v-if="pageError" class="error">{{ pageError }}</p>

      <div v-if="!loading && applications.length === 0" class="empty-state">
        <div class="empty-icon">🚀</div>
        <h3>No Program B applications yet</h3>
        <p>Select an open call and create your first application.</p>
        <button @click="showCreateForm = true" class="btn-primary">Create Application</button>
      </div>

      <div v-if="loading" class="loading">Loading Program B applications...</div>

      <div v-else class="applications-list">
        <div
          v-for="app in applications"
          :key="app.id"
          class="app-card"
          @click="router.push(`/applications-b/${app.id}`)"
        >
          <div class="app-left">
            <div class="app-icon-sm">🚀</div>
            <div class="app-info">
              <h3>{{ app.team?.name ?? 'Unknown Team' }}</h3>
              <p>{{ app.call?.title ?? 'Unknown Call' }}</p>
            </div>
          </div>
          <div class="app-right">
            <span class="status-badge" :class="app.status ?? ''">{{ (app.status ?? 'unknown').replace(/_/g, ' ') }}</span>
            <span class="app-date">
              {{ app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('sk-SK') : 'Not submitted' }}
            </span>
            <span v-if="app.score !== null" class="app-score">Score: {{ app.score }}</span>
            <span class="app-arrow">→</span>
          </div>
        </div>
      </div>

      <div v-if="showCreateForm" class="modal-overlay" @click.self="showCreateForm = false">
        <div class="modal">
          <h2>Apply for Program B</h2>

          <div class="field">
            <label>Select Call</label>
            <select v-model="newApp.call_id">
              <option value="">-- Select a call --</option>
              <option v-for="call in programBCalls" :key="call.id" :value="call.id">
                {{ call.title }} (closes: {{ new Date(call.closes_at).toLocaleDateString('sk-SK') }})
              </option>
            </select>
          </div>

          <div class="field">
            <label>Select Company Challenge</label>
            <select v-model="newApp.challenge_id">
              <option value="">-- Select a challenge --</option>
              <option v-for="challenge in programBChallenges" :key="challenge.id" :value="challenge.id">
                {{ challenge.title }}
              </option>
            </select>
          </div>

          <div class="field">
            <label>Elevator Pitch (Motivation Letter)</label>
            <textarea v-model="newApp.motivation_letter" rows="3" placeholder="Briefly describe your startup idea..." />
          </div>

          <p v-if="appError" class="error">{{ appError }}</p>

          <div class="modal-actions">
            <button @click="showCreateForm = false" class="btn-secondary">Cancel</button>
            <button @click="handleCreate" :disabled="creating || !newApp.call_id || !newApp.challenge_id" class="btn-primary">
              {{ creating ? 'Creating...' : 'Create Application' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.ts'
import { applicationsBApi } from '@/api/program-b/applications.ts'
import { callsApi } from '@/api/program-b/calls.ts'
import api from '../../api/axios.ts'
import AppLayout from '../../components/AppLayout.vue'
import type { Application } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

const applications = ref<Application[]>([])
const programBCalls = ref<any[]>([])
const programBChallenges = ref<any[]>([])
const loading = ref(false)
const creating = ref(false)
const appError = ref<string | null>(null)
const pageError = ref<string | null>(null)
const showCreateForm = ref(false)
const isCompany = computed(() => authStore.user?.account_type === 'company_contact')

const newApp = ref({
  call_id: '',
  challenge_id: '', 
  motivation_letter: '',
  solution_proposal: '',
})

onMounted(async () => {
  loading.value = true
  pageError.value = null
  try {
    const appResponse = await applicationsBApi.getAll()
    applications.value = (appResponse.data as any).applications ?? appResponse.data ?? []

    const callsResponse = await callsApi.getAll()
    programBCalls.value = callsResponse.data

    const challengesResponse = await api.get('/program-b/challenges')
    programBChallenges.value = challengesResponse.data.challenges

  } catch (e: any) {
    pageError.value = e.response?.data?.message ?? 'Failed to load data'
  } finally {
    loading.value = false
  }
})

async function handleCreate() {
  appError.value = null
  creating.value = true
  try {
    const response = await applicationsBApi.create(newApp.value)
    router.push(`/applications/${response.data.application.id}`)
  } catch (e: any) {
    appError.value = e.response?.data?.message ?? 'Failed to create application'
  } finally {
    creating.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.applications { max-width: 900px; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 0 0 2rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-icon {
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

.loading { color: #8892a4; padding: 2rem 0; }

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.empty-icon {
  font-size: 2.5rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f1117;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #8892a4;
  margin: 0 0 1.5rem 0;
}

.applications-list { display: flex; flex-direction: column; gap: 0.75rem; }

.app-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s ease;
}

.app-card:hover {
  border-color: #6ee7b7;
  transform: translateX(4px);
}

.app-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.app-icon-sm {
  width: 40px;
  height: 40px;
  background: #f0fdf4;
  color: #22c55e;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.app-info h3 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f1117;
  margin: 0 0 0.2rem 0;
}

.app-info p {
  font-size: 0.825rem;
  color: #8892a4;
  margin: 0;
}

.app-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.app-date { font-size: 0.8rem; color: #9ca3af; }
.app-score { font-size: 0.8rem; font-weight: 600; color: #0f1117; }

.app-arrow {
  color: #8892a4;
  font-size: 1rem;
  transition: color 0.15s;
}

.app-card:hover .app-arrow { color: #6ee7b7; }

/* Status badges */
.status-badge {
  padding: 0.2rem 0.7rem;
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

/* Buttons */
.btn-primary {
  background: #0f1117;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
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
  font-size: 0.875rem;
}

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
  max-width: 520px;
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
</style>
