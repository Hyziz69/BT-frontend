<template>
  <div class="page">
    <nav class="navbar">
      <span class="brand">NTI Portal</span>
      <div class="nav-links">
        <RouterLink to="/dashboard">Dashboard</RouterLink>
        <RouterLink to="/applications">Applications</RouterLink>
        <button @click="handleLogout">Logout</button>
      </div>
    </nav>

    <div class="content">
      <div class="page-header">
        <h1>My Teams</h1>
        <button @click="showCreateForm = true" class="btn-primary">+ Create Team</button>
      </div>

      <!-- Create Team Form -->
      <div v-if="showCreateForm" class="modal-overlay" @click.self="showCreateForm = false">
        <div class="modal">
          <h2>Create New Team</h2>
          <div class="field">
            <label>Team Name</label>
            <input v-model="newTeam.name" type="text" placeholder="Enter team name" />
          </div>
          <div class="field">
            <label>Competencies (comma separated)</label>
            <input v-model="competenciesInput" type="text" placeholder="PHP, Vue.js, MySQL" />
          </div>
          <p v-if="teamsStore.error" class="error">{{ teamsStore.error }}</p>
          <div class="modal-actions">
            <button @click="showCreateForm = false" class="btn-secondary">Cancel</button>
            <button @click="handleCreate" :disabled="teamsStore.loading" class="btn-primary">
              {{ teamsStore.loading ? 'Creating...' : 'Create' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <p v-if="teamsStore.loading && !showCreateForm">Loading teams...</p>

      <!-- Error -->
      <p v-if="teamsStore.error && !showCreateForm" class="error">{{ teamsStore.error }}</p>

      <!-- Empty -->
      <div v-if="!teamsStore.loading && teamsStore.teams.length === 0" class="empty">
        <p>You don't have any teams yet.</p>
        <button @click="showCreateForm = true" class="btn-primary">Create your first team</button>
      </div>

      <!-- Teams List -->
      <div class="teams-grid">
        <div
          v-for="team in teamsStore.teams"
          :key="team.id"
          class="team-card"
          @click="router.push(`/teams/${team.id}`)"
        >
          <h2>{{ team.name }}</h2>
          <p class="members">
            {{ team.member_count }} member{{ team.member_count !== 1 ? 's' : '' }}
          </p>
          <div class="competencies">
            <span v-for="c in team.competencies" :key="c" class="tag">{{ c }}</span>
          </div>
          <p class="leader">Leader: {{ team.leader.name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTeamsStore } from '../stores/teams'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const teamsStore = useTeamsStore()
const authStore = useAuthStore()

const showCreateForm = ref(false)
const competenciesInput = ref('')
const newTeam = ref({ name: '' })

onMounted(() => {
  teamsStore.fetchTeams()
})

async function handleCreate() {
  const competencies = competenciesInput.value
    .split(',')
    .map((c) => c.trim())
    .filter((c) => c.length > 0)

  await teamsStore.createTeam(newTeam.value.name, competencies)

  if (!teamsStore.error) {
    showCreateForm.value = false
    newTeam.value.name = ''
    competenciesInput.value = ''
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
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}
.team-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}
.team-card:hover {
  transform: translateY(-2px);
}
.team-card h2 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}
.members {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}
.competencies {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}
.tag {
  background: #eaf0fb;
  color: #2c3e50;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
}
.leader {
  color: #888;
  font-size: 0.85rem;
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
input {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
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
