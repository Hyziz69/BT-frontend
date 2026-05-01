<template>
  <div class="page">
    <nav class="navbar">
      <span class="brand">NTI Portal</span>
      <div class="nav-links">
        <RouterLink to="/dashboard">Dashboard</RouterLink>
        <RouterLink to="/teams">Teams</RouterLink>
        <button @click="handleLogout">Logout</button>
      </div>
    </nav>

    <div class="content">
      <div class="page-header">
        <h1>Applications</h1>
        <button @click="showCreateForm = true" class="btn-primary">+ New Application</button>
      </div>

      <!-- Create Application Modal -->
      <div v-if="showCreateForm" class="modal-overlay" @click.self="showCreateForm = false">
        <div class="modal">
          <h2>New Application</h2>

          <div class="field">
            <label>Select Call</label>
            <select v-model="newApp.call_id">
              <option value="">-- Select a call --</option>
              <option v-for="call in calls" :key="call.id" :value="call.id">
                {{ call.title }} (closes {{ new Date(call.closes_at).toLocaleDateString('sk-SK') }})
              </option>
            </select>
            <p v-if="calls.length === 0" class="hint">No open calls available right now.</p>
          </div>

          <div class="field">
            <label>Select Team</label>
            <select v-model="newApp.team_id">
              <option value="">-- Select a team --</option>
              <option v-for="team in teamsStore.teams" :key="team.id" :value="team.id">
                {{ team.name }}
              </option>
            </select>
          </div>

          <div class="field">
            <label>Motivation Letter</label>
            <textarea v-model="newApp.motivation_letter" rows="4" placeholder="Why do you want to join this program?" />
          </div>

          <div class="field">
            <label>Solution Proposal</label>
            <textarea v-model="newApp.solution_proposal" rows="4" placeholder="Describe your proposed solution..." />
          </div>

          <p v-if="appError" class="error">{{ appError }}</p>

          <div class="modal-actions">
            <button @click="showCreateForm = false" class="btn-secondary">Cancel</button>
            <button @click="handleCreate" :disabled="creating || !newApp.call_id || !newApp.team_id" class="btn-primary">
              {{ creating ? 'Creating...' : 'Create Draft' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <p v-if="loading">Loading applications...</p>

      <!-- Empty -->
      <div v-else-if="applications.length === 0" class="empty">
        <p>No applications yet.</p>
        <button @click="showCreateForm = true" class="btn-primary">Create your first application</button>
      </div>

      <!-- Applications List -->
      <div class="applications-list">
        <div
          v-for="app in applications"
          :key="app.id"
          class="app-card"
          @click="router.push(`/applications/${app.id}`)"
        >
          <div class="app-top">
            <h2>{{ app.team?.name ?? 'Unknown Team' }}</h2>
            <span class="status-badge" :class="app.status">{{ app.status }}</span>
          </div>
          <p class="call-name">{{ app.call?.program?.name ?? 'Program A' }}</p>
          <p class="date">Submitted: {{ app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('sk-SK') : 'Not yet' }}</p>
          <p v-if="app.score !== null" class="score">Score: {{ app.score }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTeamsStore } from '../stores/teams'
import { applicationsApi } from '../api/applications'
import { callsApi } from '../api/calls'
import type { Application } from '../types'

const router = useRouter()
const authStore = useAuthStore()
const teamsStore = useTeamsStore()

const applications = ref<Application[]>([])
const calls = ref<any[]>([])
const loading = ref(false)
const creating = ref(false)
const appError = ref<string | null>(null)
const showCreateForm = ref(false)

const newApp = ref({
  team_id: '',
  call_id: '',
  motivation_letter: '',
  solution_proposal: '',
})

onMounted(async () => {
  loading.value = true
  try {
    const [appsResponse, callsResponse] = await Promise.all([
      applicationsApi.getAll(),
      callsApi.getAll(),
      teamsStore.fetchTeams(),
    ])
    applications.value = appsResponse.data
    calls.value = callsResponse.data
  } finally {
    loading.value = false
  }
})

async function handleCreate() {
  appError.value = null
  creating.value = true
  try {
    const response = await applicationsApi.create(newApp.value)
    applications.value.push(response.data)
    showCreateForm.value = false
    newApp.value = { team_id: '', call_id: '', motivation_letter: '', solution_proposal: '' }
  } catch (e: any) {
    appError.value = e.response?.data?.message ?? 'Failed to create application'
  } finally {
    creating.value = false
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.page { min-height: 100vh; background: #f5f5f5; }
.navbar {
  background: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.brand { font-size: 1.2rem; font-weight: bold; }
.nav-links { display: flex; gap: 1rem; align-items: center; }
.nav-links a { color: white; text-decoration: none; }
.nav-links button {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
}
.content { padding: 2rem; }
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.applications-list { display: flex; flex-direction: column; gap: 1rem; }
.app-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;
}
.app-card:hover { transform: translateY(-2px); }
.app-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.app-top h2 { color: #2c3e50; }
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
}
.status-badge.draft { background: #f0f0f0; color: #666; }
.status-badge.submitted { background: #d1ecf1; color: #0c5460; }
.status-badge.approved { background: #d4edda; color: #155724; }
.status-badge.rejected { background: #f8d7da; color: #721c24; }
.status-badge.in_evaluation { background: #fff3cd; color: #856404; }
.status-badge.active { background: #cce5ff; color: #004085; }
.call-name { color: #666; font-size: 0.9rem; margin-bottom: 0.25rem; }
.date { color: #888; font-size: 0.85rem; }
.score { color: #2c3e50; font-weight: 500; margin-top: 0.5rem; }
.btn-primary {
  background: #2c3e50;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary {
  background: #eee;
  color: #333;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
}
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
  border-radius: 8px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal h2 { margin-bottom: 1.5rem; }
.field { margin-bottom: 1rem; }
label { display: block; margin-bottom: 0.25rem; font-weight: 500; }
input, select, textarea {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  font-family: inherit;
}
.modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem; }
.error { color: #e74c3c; font-size: 0.9rem; }
.hint { color: #888; font-size: 0.85rem; margin-top: 0.25rem; }
.empty { text-align: center; padding: 3rem; color: #666; }
.empty button { margin-top: 1rem; }
</style>