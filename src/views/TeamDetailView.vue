<template>
  <AppLayout>
    <div class="team-detail">
      <button @click="router.back()" class="back-btn">← Back to Teams</button>

      <div v-if="teamsStore.loading">Loading team...</div>

      <div v-else-if="teamsStore.currentTeam">
        <!-- Header -->
        <div class="page-header">
          <div class="header-content">
            <div class="team-icon">◈</div>
            <div>
              <h1 class="page-title">{{ teamsStore.currentTeam.name }}</h1>
              <p class="page-subtitle">{{ teamsStore.currentTeam.members.length }} member{{ teamsStore.currentTeam.members.length !== 1 ? 's' : '' }}</p>
            </div>
          </div>
          <div class="competencies">
            <span v-for="c in teamsStore.currentTeam.competencies" :key="c" class="tag">{{ c }}</span>
            <span v-if="teamsStore.currentTeam.competencies.length === 0" class="tag-empty">No competencies</span>
          </div>
        </div>

        <!-- Members Section -->
        <div class="section">
          <div class="section-header">
            <h2>Members</h2>
            <button v-if="isLeader" @click="showAddMember = true" class="btn-primary">
              + Invite Member
            </button>
          </div>

          <div class="members-list">
            <div
              v-for="member in teamsStore.currentTeam.members"
              :key="member.id"
              class="member-card"
            >
              <div class="member-avatar">
                {{ member.name.charAt(0).toUpperCase() }}
              </div>
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

        <!-- Pending Invitations -->
        <div class="section" v-if="isLeader && invitations.length > 0">
          <h2>Pending Invitations</h2>
          <div class="members-list">
            <div v-for="inv in invitations" :key="inv.id" class="member-card">
              <div class="member-avatar invite">✉</div>
              <div class="member-info">
                <strong>{{ inv.email }}</strong>
                <span class="email">Expires: {{ new Date(inv.expires_at).toLocaleDateString('sk-SK') }}</span>
              </div>
              <span class="role-badge" :class="inv.status">{{ inv.status }}</span>
            </div>
          </div>
        </div>

        <!-- Invite Member Modal -->
        <div v-if="showAddMember" class="modal-overlay" @click.self="showAddMember = false; inviteSuccess = null">
          <div class="modal">
            <h2>Invite Member</h2>
            <div class="field" v-if="!inviteSuccess">
              <label>Student Email</label>
              <input v-model="memberEmail" type="email" placeholder="student@example.com" />
            </div>
            <p v-if="inviteSuccess" class="success">{{ inviteSuccess }}</p>
            <p v-if="inviteError" class="error">{{ inviteError }}</p>
            <div class="modal-actions">
              <button @click="showAddMember = false; inviteSuccess = null" class="btn-secondary">
                {{ inviteSuccess ? 'Close' : 'Cancel' }}
              </button>
              <button v-if="!inviteSuccess" @click="handleInvite" :disabled="inviting" class="btn-primary">
                {{ inviting ? 'Sending...' : 'Send Invitation' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="error">Team not found.</div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTeamsStore } from '../stores/teams'
import { useAuthStore } from '../stores/auth'
import { invitationsApi } from '../api/invitations'
import AppLayout from '../components/AppLayout.vue'

const router = useRouter()
const route = useRoute()
const teamsStore = useTeamsStore()
const authStore = useAuthStore()

const showAddMember = ref(false)
const memberEmail = ref('')
const inviteError = ref<string | null>(null)
const inviteSuccess = ref<string | null>(null)
const inviting = ref(false)
const invitations = ref<any[]>([])

const isLeader = computed(() => teamsStore.currentTeam?.leader.id === authStore.user?.id)

onMounted(async () => {
  await teamsStore.fetchTeam(route.params.id as string)
  if (teamsStore.currentTeam?.leader.id === authStore.user?.id && teamsStore.currentTeam) {
    try {
      const res = await invitationsApi.getAll(teamsStore.currentTeam.id)
      invitations.value = res.data ?? []
    } catch {
      invitations.value = []
    }
  }
})

async function handleInvite() {
  if (!teamsStore.currentTeam) return
  inviting.value = true
  inviteError.value = null
  inviteSuccess.value = null
  try {
    const response = await invitationsApi.send(teamsStore.currentTeam.id, [memberEmail.value])
    const result = response.results[memberEmail.value]
    if (result === 'invited') {
      inviteSuccess.value = `Invitation sent to ${memberEmail.value}`
      memberEmail.value = ''
      const res = await invitationsApi.getAll(teamsStore.currentTeam.id)
      invitations.value = res.data ?? []
    } else if (result === 'already_member') {
      inviteError.value = 'This person is already a team member.'
    } else if (result === 'already_invited') {
      inviteError.value = 'This person has already been invited.'
    }
  } catch (e: any) {
    inviteError.value = e.response?.data?.message ?? 'Failed to send invitation.'
  } finally {
    inviting.value = false
  }
}

async function handleRemoveMember(userId: string) {
  if (confirm('Are you sure you want to remove this member?')) {
    await teamsStore.removeMember(teamsStore.currentTeam!.id, userId)
    await teamsStore.fetchTeam(route.params.id as string)
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.team-detail { max-width: 900px; }

.back-btn {
  background: none;
  border: none;
  color: #8892a4;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;
  margin-bottom: 1.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: color 0.15s;
}

.back-btn:hover { color: #0f1117; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 0 0 2rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.team-icon {
  width: 52px;
  height: 52px;
  background: #eff6ff;
  color: #3b82f6;
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

.competencies {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
  justify-content: flex-end;
  max-width: 300px;
}

.tag {
  background: #f0fdf4;
  color: #16a34a;
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
}

.tag-empty { color: #d1d5db; font-size: 0.8rem; font-style: italic; }

.section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.section-header h2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #0f1117;
  margin: 0;
}

.section h2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #0f1117;
  margin: 0 0 1.25rem 0;
}

.members-list { display: flex; flex-direction: column; gap: 0.75rem; }

.member-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid #f3f4f6;
  border-radius: 10px;
  transition: border-color 0.15s;
}

.member-card:hover { border-color: #e5e7eb; }

.member-avatar {
  width: 38px;
  height: 38px;
  background: #0f1117;
  color: #6ee7b7;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.member-avatar.invite {
  background: #f0fdf4;
  color: #16a34a;
}

.member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.member-info strong { font-size: 0.9rem; color: #0f1117; }
.email { color: #8892a4; font-size: 0.8rem; }

.member-right { display: flex; align-items: center; gap: 0.75rem; }

.role-badge {
  padding: 0.2rem 0.7rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

.role-badge.leader { background: #fef3c7; color: #92400e; }
.role-badge.member { background: #eff6ff; color: #1d4ed8; }
.role-badge.pending { background: #fef3c7; color: #92400e; }
.role-badge.accepted { background: #d1fae5; color: #065f46; }
.role-badge.expired { background: #f3f4f6; color: #6b7280; }

.btn-primary {
  background: #0f1117;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
}

.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-danger {
  background: #fee2e2;
  color: #991b1b;
  border: none;
  padding: 0.3rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
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
.success { color: #16a34a; font-size: 0.9rem; }
</style>