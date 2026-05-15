<template>
  <div class="page">
    <nav class="navbar">
      <span class="brand">NTI Portal</span>
      <div class="nav-links">
        <RouterLink to="/dashboard">Dashboard</RouterLink>
        <RouterLink to="/teams">Teams</RouterLink>
        <RouterLink to="/applications">Applications</RouterLink>
        <button @click="handleLogout">Logout</button>
      </div>
    </nav>

    <div class="content">
      <button @click="router.back()" class="back-btn">← Back</button>

      <div v-if="teamsStore.loading">Loading team...</div>

      <div v-else-if="teamsStore.currentTeam">
        <div class="team-header">
          <h1>{{ teamsStore.currentTeam.name }}</h1>
          <div class="competencies">
            <span v-for="c in teamsStore.currentTeam.competencies" :key="c" class="tag">{{
              c
            }}</span>
          </div>
        </div>

        <!-- Members -->
        <div class="section">
          <div class="section-header">
            <h2>Members</h2>
            <button v-if="isLeader" @click="showAddMember = true" class="btn-primary">
              + Add Member
            </button>
          </div>

          <div class="members-list">
            <div
              v-for="member in teamsStore.currentTeam.members"
              :key="member.id"
              class="member-card"
            >
              <div class="member-info">
                <strong>{{ member.name }}</strong>
                <span class="email">{{ member.email }}</span>
              </div>
              <div class="member-right">
                <span class="role-badge" :class="member.role">{{ member.role }}</span>
                <button
                  v-if="isLeader && member.role !== 'leader'"
                  @click="handleRemoveMember(member.id)"
                  class="btn-danger"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Add Member Modal -->
        <div v-if="showAddMember" class="modal-overlay" @click.self="showAddMember = false">
          <div class="modal">
            <h2>Add Member</h2>
            <div class="field">
              <label>Student Email</label>
              <input v-model="memberEmail" type="email" placeholder="student@example.com" />
            </div>
            <p v-if="teamsStore.error" class="error">{{ teamsStore.error }}</p>
            <div class="modal-actions">
              <button @click="showAddMember = false" class="btn-secondary">Cancel</button>
              <button @click="handleAddMember" :disabled="teamsStore.loading" class="btn-primary">
                {{ teamsStore.loading ? 'Adding...' : 'Add' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="error">Team not found.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTeamsStore } from '../stores/teams'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const teamsStore = useTeamsStore()
const authStore = useAuthStore()

const showAddMember = ref(false)
const memberEmail = ref('')

const isLeader = computed(() => teamsStore.currentTeam?.leader.id === authStore.user?.id)

onMounted(() => {
  teamsStore.fetchTeam(route.params.id as string)
})

async function handleAddMember() {
  await teamsStore.addMember(teamsStore.currentTeam!.id, memberEmail.value)
  if (!teamsStore.error) {
    showAddMember.value = false
    memberEmail.value = ''
  }
}

async function handleRemoveMember(userId: string) {
  if (confirm('Are you sure you want to remove this member?')) {
    await teamsStore.removeMember(teamsStore.currentTeam!.id, userId)
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
.back-btn {
  background: none;
  border: none;
  color: #2c3e50;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1rem;
  padding: 0;
}
.team-header {
  margin-bottom: 2rem;
}
.team-header h1 {
  margin-bottom: 0.5rem;
}
.competencies {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.tag {
  background: #eaf0fb;
  color: #2c3e50;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.85rem;
}
.section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.members-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.member-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border: 1px solid #eee;
  border-radius: 6px;
}
.member-info {
  display: flex;
  flex-direction: column;
}
.email {
  color: #888;
  font-size: 0.85rem;
}
.member-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.role-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}
.role-badge.leader {
  background: #fef3cd;
  color: #856404;
}
.role-badge.member {
  background: #d1ecf1;
  color: #0c5460;
}
.btn-primary {
  background: #2c3e50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-secondary {
  background: #eee;
  color: #333;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
.btn-danger {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.3rem 0.7rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
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
</style>
