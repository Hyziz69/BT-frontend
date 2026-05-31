<template>
  <AppLayout>
    <div class="dashboard">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Good to see you, {{ authStore.user?.first_name }} 👋</h1>
          <p class="page-subtitle">Here's what's happening with your projects.</p>
        </div>
        <div class="account-badge">
          <span>{{ roleLabel }}</span>
        </div>
      </div>

      <!-- Quick stats -->
      <div class="stats-grid">
        <div class="stat-card" v-if="!isAdmin">
          <span class="stat-icon">◈</span>
          <div class="stat-info">
            <span class="stat-label">My Team</span>
            <span class="stat-value" v-if="teamsStore.teams.length > 0">{{ teamsStore.teams[0]?.name }}</span>
            <span class="stat-value loading-shimmer" v-else>—</span>
          </div>
        </div>

        <div class="stat-card" v-if="isAdmin">
          <span class="stat-icon">◉</span>
          <div class="stat-info">
            <span class="stat-label">Pending Users</span>
            <span class="stat-value">{{ adminStats?.pending_users_count ?? 0 }}</span>
          </div>
        </div>

        <div class="stat-card">
          <span class="stat-icon">◎</span>
          <div class="stat-info">
            <span class="stat-label">Applications</span>
            <span class="stat-value">
              {{ isAdmin ? adminStats?.total_applications ?? 0 : applicationCount }}
            </span>
          </div>
        </div>

        <div class="stat-card">
          <span class="stat-icon">✦</span>
          <div class="stat-info">
            <span class="stat-label">{{ isAdmin ? 'Open Calls' : 'Program' }}</span>
            <span class="stat-value">{{ isAdmin ? adminStats?.open_calls ?? 0 : 'A' }}</span>
          </div>
        </div>
      </div>

      <!-- Quick links -->
      <div class="section-title">Quick actions</div>
      <div class="quick-links">
        <RouterLink
          v-if="!isAdmin"
          :to="teamsStore.teams.length > 0 && teamsStore.teams[0] ? `/teams/${teamsStore.teams[0].id}` : '/teams'"
          class="quick-card"
        >
          <div class="quick-icon teams">◈</div>
          <div class="quick-info">
            <h3>My Team</h3>
            <p>{{ teamsStore.teams[0]?.name ?? 'View and manage your team' }}</p>
          </div>
          <span class="quick-arrow">→</span>
        </RouterLink>

        <RouterLink v-if="!isAdmin" to="/applications" class="quick-card">
          <div class="quick-icon applications">◎</div>
          <div class="quick-info">
            <h3>Applications</h3>
            <p>Track your Program A applications</p>
          </div>
          <span class="quick-arrow">→</span>
        </RouterLink>

        <RouterLink v-if="isAdmin" to="/admin" class="quick-card">
          <div class="quick-icon admin">⚙</div>
          <div class="quick-info">
            <h3>Admin Panel</h3>
            <p>Manage users, approvals, calls and programs</p>
          </div>
          <span class="quick-arrow">→</span>
        </RouterLink>

        <RouterLink v-if="isAdmin" to="/admin/activity" class="quick-card">
          <div class="quick-icon activity">◷</div>
          <div class="quick-info">
            <h3>Activity Log</h3>
            <p>Check admin action history and audit records</p>
          </div>
          <span class="quick-arrow">→</span>
        </RouterLink>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useTeamsStore } from '../stores/teams'
import { applicationsApi } from '../api/applications'
import { adminApi, type AdminDashboardStats } from '../api/admin'
import AppLayout from '../components/AppLayout.vue'

const authStore = useAuthStore()
const teamsStore = useTeamsStore()

const applicationCount = ref(0)
const adminStats = ref<AdminDashboardStats | null>(null)

const isAdmin = computed(() =>
  authStore.user?.account_type === 'nti_admin' || authStore.user?.account_type === 'superadmin',
)

const roleLabel = computed(() => {
  const role = authStore.user?.account_type ?? ''

  const labels: Record<string, string> = {
    student: 'Student',
    mentor: 'Mentor',
    company_contact: 'Company',
    nti_admin: 'NTI Administrator',
    superadmin: 'Super Admin',
  }

  return labels[role] ?? role
})

onMounted(async () => {
  if (isAdmin.value) {
    try {
      adminStats.value = await adminApi.getDashboard()
    } catch {
      adminStats.value = null
    }

    return
  }

  await teamsStore.fetchTeams()

  try {
    const res = await applicationsApi.getAll()
    applicationCount.value = res.data.length
  } catch {
    applicationCount.value = 0
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.dashboard {
  max-width: 900px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 2.5rem 0 2rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.page-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: #0f1117;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: #8892a4;
  font-size: 0.95rem;
}

.account-badge {
  background: #0f1117;
  color: #6ee7b7;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
  margin-top: 1.25rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  font-size: 1.5rem;
  color: #6ee7b7;
  width: 40px;
  height: 40px;
  background: #f0fdf4;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.8rem;
  color: #8892a4;
  font-weight: 500;
}

.stat-value {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f1117;
  line-height: 1.2;
}

.loading-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
  border-radius: 4px;
  color: transparent;
  min-width: 60px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.section-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #8892a4;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}

.quick-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quick-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.quick-card:hover {
  border-color: #6ee7b7;
  transform: translateX(4px);
}

.quick-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.quick-icon.teams {
  background: #eff6ff;
  color: #3b82f6;
}

.quick-icon.applications {
  background: #f0fdf4;
  color: #22c55e;
}

.quick-icon.admin {
  background: #fef3c7;
  color: #d97706;
}

.quick-icon.activity {
  background: #f5f3ff;
  color: #7c3aed;
}

.quick-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.quick-info h3 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f1117;
  margin: 0 0 0.2rem 0;
}

.quick-info p {
  font-size: 0.85rem;
  color: #8892a4;
  margin: 0;
}

.quick-arrow {
  color: #8892a4;
  font-size: 1.1rem;
  transition: color 0.15s ease;
}

.quick-card:hover .quick-arrow {
  color: #6ee7b7;
}
</style>