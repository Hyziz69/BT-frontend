<template>
  <div class="page">
    <nav class="navbar">
      <span class="brand">NTI Portal</span>
      <div class="nav-links">
        <RouterLink to="/dashboard">Dashboard</RouterLink>
        <RouterLink to="/teams">Teams</RouterLink>
        <RouterLink v-if="isAdmin" to="/admin">Admin</RouterLink>
        <button @click="handleLogout">Logout</button>
      </div>
    </nav>

    <div class="content">
      <div class="page-header">
        <h1>Applications</h1>
        <button @click="showCreateForm = true" class="btn-primary">+ New Application</button>
      </div>

      <p v-if="pageError" class="error">{{ pageError }}</p>

      <div v-if="showCreateForm" class="modal-overlay" @click.self="showCreateForm = false">
        <div class="modal">
          <h2>New Application</h2>

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
            <label>Call ID</label>
            <input v-model="newApp.call_id" type="text" placeholder="Paste the call UUID" />
          </div>

          <div class="field">
            <label>Motivation Letter</label>
            <textarea
              v-model="newApp.motivation_letter"
              rows="4"
              placeholder="Why do you want to join this program?"
            />
          </div>

          <div class="field">
            <label>Solution Proposal</label>
            <textarea
              v-model="newApp.solution_proposal"
              rows="4"
              placeholder="Describe your proposed solution..."
            />
          </div>

          <p v-if="appError" class="error">{{ appError }}</p>

          <div class="modal-actions">
            <button @click="showCreateForm = false" class="btn-secondary">Cancel</button>
            <button @click="handleCreate" :disabled="creating" class="btn-primary">
              {{ creating ? 'Creating...' : 'Create Draft' }}
            </button>
          </div>
        </div>
      </div>

      <p v-if="loading">Loading applications...</p>

      <div v-else-if="applications.length === 0" class="empty">
        <p>No applications yet.</p>
        <button @click="showCreateForm = true" class="btn-primary">
          Create your first application
        </button>
      </div>

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

          <p class="date">
            Submitted:
            {{ app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : 'Not yet' }}
          </p>

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
import api from '../api/axios'
import type { Application } from '../types'

const router = useRouter()
const authStore = useAuthStore()
const teamsStore = useTeamsStore()

const applications = ref<Application[]>([])
const loading = ref(false)
const creating = ref(false)
const appError = ref<string | null>(null)
const pageError = ref<string | null>(null)
const showCreateForm = ref(false)
const isAdmin = ref(false)

const newApp = ref({
  team_id: '',
  call_id: '',
  motivation_letter: '',
  solution_proposal: '',
})

onMounted(async () => {
  await checkAdmin()

  loading.value = true
  pageError.value = null

  try {
    const response = await applicationsApi.getAll()
    applications.value = response.data
  } catch (e: any) {
    pageError.value = e.response?.data?.message ?? 'Failed to load applications'
  } finally {
    loading.value = false
  }

  teamsStore.fetchTeams()
})

async function checkAdmin() {
  const token = localStorage.getItem('token')

  if (!token) {
    isAdmin.value = false
    return
  }

  try {
    const response = await api.get('/user')
    isAdmin.value = response.data.account_type === 'nti_admin'
  } catch {
    isAdmin.value = false
  }
}

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
  localStorage.removeItem('token')
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
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.app-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.app-card:hover {
  transform: translateY(-2px);
}

.app-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.app-top h2 {
  color: #2c3e50;
}

.call-name {
  color: #666;
  margin-bottom: 0.5rem;
}

.date {
  color: #888;
  font-size: 0.9rem;
}

.score {
  margin-top: 0.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.draft {
  background: #f0f0f0;
  color: #666;
}

.status-badge.submitted {
  background: #d1ecf1;
  color: #0c5460;
}

.status-badge.under_review {
  background: #fff3cd;
  color: #856404;
}

.status-badge.accepted {
  background: #d4edda;
  color: #155724;
}

.status-badge.rejected {
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
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.field {
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
}

.field label {
  margin-bottom: 0.4rem;
  color: #2c3e50;
  font-weight: 600;
}

.field input,
.field select,
.field textarea {
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
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

.empty {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty button {
  margin-top: 1rem;
}
</style>