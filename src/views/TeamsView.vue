<template>
  <AppLayout>
    <div class="teams">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">My Teams</h1>
          <p class="page-subtitle">Manage your teams and collaborate with others.</p>
        </div>
<!--        <button @click="showCreateForm = true" class="btn-primary">+ Create Team</button>-->
      </div>

      <!-- Create Team Modal -->
      <div v-if="showCreateForm" class="modal-overlay" @click.self="showCreateForm = false">
        <div class="modal">
          <h2>Create New Team</h2>
          <div class="field">
            <label>Team Name</label>
            <input v-model="newTeam.name" type="text" placeholder="Enter team name" />
          </div>
          <div class="field">
            <label>Competencies <span class="hint-text">(comma separated)</span></label>
            <input v-model="competenciesInput" type="text" placeholder="PHP, Vue.js, MySQL" />
          </div>
          <p v-if="teamsStore.error" class="error">{{ teamsStore.error }}</p>
          <div class="modal-actions">
            <button @click="showCreateForm = false" class="btn-secondary">Cancel</button>
            <button @click="handleCreate" :disabled="teamsStore.loading" class="btn-primary">
              {{ teamsStore.loading ? 'Creating...' : 'Create Team' }}
            </button>
          </div>
        </div>
      </div>
      <!-- Join Team Modal -->
      <div v-if="showJoinForm" class="modal-overlay" @click.self="showJoinForm = false">
        <div class="modal">
          <h2>Join The Team</h2>
          <div class="field">
            <label>Invite Code</label>
            <input v-model="inviteCodeInput" type="text" placeholder="Enter the invite code" />
          </div>
          <p v-if="teamsStore.error" class="error">{{ teamsStore.error }}</p>
          <div class="modal-actions">
            <button @click="showJoinForm = false" class="btn-secondary">Cancel</button>
            <button @click="handleJoin" :disabled="teamsStore.loading" class="btn-primary">
              {{ teamsStore.loading ? 'Joining...' : 'Join a Team' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="teamsStore.loading && !showCreateForm" class="loading">Loading teams...</div>

      <!-- Empty -->
      <div v-else-if="!teamsStore.loading && teamsStore.teams.length === 0" class="empty">
        <div class="empty-icon">◈</div>
        <p>You don't have any teams yet.</p>
        <button @click="showJoinForm = true" class="btn-secondary">Pripojiť sa</button>
        <button @click="showCreateForm = true" class="btn-primary">Create your first team</button>
      </div>

      <!-- Teams Grid -->
      <div class="teams-grid">
        <div
          v-for="team in teamsStore.teams"
          :key="team.id"
          class="team-card"
          @click="router.push(`/teams/${team.id}`)"
        >
          <div class="team-card-header">
            <div class="team-icon">◈</div>
            <span class="member-count">{{ team.member_count }} member{{ team.member_count !== 1 ? 's' : '' }}</span>
          </div>
          <h2>{{ team.name }}</h2>
          <p class="leader">{{ team.leader.name }}</p>
          <div class="competencies">
            <span v-for="c in team.competencies" :key="c" class="tag">{{ c }}</span>
            <span v-if="team.competencies.length === 0" class="tag-empty">No competencies</span>
          </div>
          <div class="card-footer">
            <span class="view-link">View team →</span>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTeamsStore } from '../stores/teams'
import { useAuthStore } from '../stores/auth'
import AppLayout from '../components/AppLayout.vue'

const router = useRouter()
const teamsStore = useTeamsStore()
const authStore = useAuthStore()

const showCreateForm = ref(false)
const showJoinForm = ref(false)
const competenciesInput = ref('')
const inviteCodeInput = ref('')
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
async function handleJoin() {
  await teamsStore.joinTeam(inviteCodeInput.value.toUpperCase())
  if (!teamsStore.error) {
    showJoinForm.value = false
    inviteCodeInput.value = ''
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.teams { max-width: 900px; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 2.5rem 0 2rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.header-content { display: flex; flex-direction: column; }

.page-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: #0f1117;
  margin-bottom: 0.25rem;
}

.page-subtitle { color: #8892a4; font-size: 0.95rem; }

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.team-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.team-card:hover {
  border-color: #6ee7b7;
  transform: translateY(-2px);
}

.team-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.team-icon {
  width: 36px;
  height: 36px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.member-count {
  font-size: 0.8rem;
  color: #8892a4;
}

.team-card h2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f1117;
  margin: 0;
}

.leader {
  font-size: 0.85rem;
  color: #8892a4;
  margin: 0;
}

.competencies {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.25rem;
}

.tag {
  background: #f0fdf4;
  color: #16a34a;
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
}

.tag-empty {
  color: #d1d5db;
  font-size: 0.8rem;
  font-style: italic;
}

.card-footer {
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
}

.view-link {
  font-size: 0.85rem;
  color: #6ee7b7;
  font-weight: 600;
}

.btn-primary {
  background: #0f1117;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
}

.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
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
  font-size: 0.9rem;
  color: #374151;
}

.hint-text { font-weight: 400; color: #9ca3af; }

input {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  box-sizing: border-box;
}

input:focus { outline: none; border-color: #6ee7b7; }

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.error { color: #ef4444; font-size: 0.9rem; }

.loading { color: #8892a4; padding: 2rem 0; }

.empty {
  text-align: center;
  padding: 4rem 2rem;
  color: #8892a4;
}

.empty-icon {
  font-size: 2.5rem;
  color: #e5e7eb;
  margin-bottom: 1rem;
}

.empty p { margin-bottom: 1rem; }
</style>
