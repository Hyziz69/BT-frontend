<template>
  <div class="app-layout">
    <aside class="sidebar">
      <RouterLink to="/" class="sidebar-brand">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M12 3L21 12L12 21L3 12L12 3Z" />
          </svg>
        </span>
        <span class="brand-text">NTI Portal</span>
      </RouterLink>

      <nav class="sidebar-nav">
        <RouterLink to="/dashboard" class="nav-item">
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <rect x="4" y="4" width="6" height="6" rx="1" />
              <rect x="14" y="4" width="6" height="6" rx="1" />
              <rect x="4" y="14" width="6" height="6" rx="1" />
              <rect x="14" y="14" width="6" height="6" rx="1" />
            </svg>
          </span>
          <span>Dashboard</span>
        </RouterLink>

        <RouterLink v-if="!isMentor" to="/applications" class="nav-item">
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="7" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
          </span>
          <span>{{ isEvaluator ? 'Applications' : 'Program A' }}</span>
        </RouterLink>

        <RouterLink v-if="!isMentor && !isEvaluator" to="/challenges" class="nav-item">
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 3.5L14.7 9L20.8 9.9L16.4 14.2L17.4 20.2L12 17.4L6.6 20.2L7.6 14.2L3.2 9.9L9.3 9L12 3.5Z" />
            </svg>
          </span>
          <span>Program B</span>
        </RouterLink>

        <RouterLink v-if="isStudent" :to="teamLink" class="nav-item">
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 3L21 12L12 21L3 12L12 3Z" />
              <path d="M12 8L16 12L12 16L8 12L12 8Z" />
            </svg>
          </span>
          <span>My Team</span>
        </RouterLink>

        <RouterLink v-if="isCompany" to="/company" class="nav-item">
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M4 20V9L12 4L20 9V20" />
              <path d="M9 20V13H15V20" />
            </svg>
          </span>
          <span>Company</span>
        </RouterLink>

        <RouterLink v-if="isMentor" to="/mentees" class="nav-item">
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="8" cy="9" r="3" />
              <circle cx="16" cy="9" r="3" />
              <path d="M4 20C4.6 16.8 6.1 15 8 15" />
              <path d="M20 20C19.4 16.8 17.9 15 16 15" />
            </svg>
          </span>
          <span>Mentees</span>
        </RouterLink>

        <RouterLink v-if="isAdmin" to="/teams" class="nav-item">
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 3L21 12L12 21L3 12L12 3Z" />
              <path d="M12 8L16 12L12 16L8 12L12 8Z" />
            </svg>
          </span>
          <span>Teams</span>
        </RouterLink>

        <RouterLink
          v-if="isAdmin"
          to="/admin"
          class="nav-item"
          :class="{ 'router-link-active': route.path.startsWith('/admin') }"
        >
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 3.5L14.7 9L20.8 9.9L16.4 14.2L17.4 20.2L12 17.4L6.6 20.2L7.6 14.2L3.2 9.9L9.3 9L12 3.5Z" />
            </svg>
          </span>
          <span>Admin</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <button
          type="button"
          class="user-info"
          :class="{ active: route.path === '/profile' }"
          title="Open profile"
          @click="goToProfile"
        >
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            alt="Profile avatar"
            class="user-avatar-img"
          />

          <div v-else class="user-avatar">
            {{ initials }}
          </div>

          <div class="user-details">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role">{{ roleLabel }}</span>
          </div>
        </button>

        <button @click="handleLogout" class="logout-btn" title="Logout" aria-label="Logout">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>

    <main class="main-content">
      <slot />
    </main>

    <NotificationBell />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTeamsStore } from '../stores/teams'
import NotificationBell from './NotificationBell.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const teamsStore = useTeamsStore()

const user = computed(() => authStore.user as any)

const isStudent = computed(() => user.value?.account_type === 'student')
const isCompany = computed(() => user.value?.account_type === 'company_contact')
const isMentor = computed(() => user.value?.account_type === 'mentor')
const isEvaluator = computed(() => user.value?.account_type === 'evaluator')

const isAdmin = computed(() =>
  ['nti_admin', 'superadmin'].includes(user.value?.account_type ?? ''),
)

const teamLink = computed(() => {
  if (teamsStore.teams.length > 0 && teamsStore.teams[0]) {
    return `/teams/${teamsStore.teams[0].id}`
  }

  return '/teams'
})

const avatarUrl = computed(() => user.value?.avatar_url ?? null)

const userName = computed(() => {
  const first = user.value?.first_name ?? ''
  const last = user.value?.last_name ?? ''

  return `${first} ${last}`.trim() || 'NTI User'
})

const roleLabel = computed(() => {
  const role = user.value?.account_type ?? ''

  const labels: Record<string, string> = {
    student: 'Student',
    mentor: 'Mentor',
    company_contact: 'Company',
    evaluator: 'Evaluator',
    nti_admin: 'NTI Administrator',
    superadmin: 'Super Admin',
  }

  return labels[role] ?? role
})

const initials = computed(() => {
  const f = user.value?.first_name?.[0] ?? ''
  const l = user.value?.last_name?.[0] ?? ''

  return (f + l).toUpperCase() || 'NT'
})

onMounted(() => {
  if (isStudent.value) {
    teamsStore.fetchTeams()
  }
})

function goToProfile() {
  if (route.path !== '/profile') {
    router.push('/profile')
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style>
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  background: #f0f2f5;
  min-height: 100vh;
}
</style>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.app-layout {
  display: flex;
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
  background: #f0f2f5;
}

.sidebar {
  width: 240px;
  min-height: 100vh;
  background: #0f1117;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 10;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.75rem 1.5rem;
  border-bottom: 1px solid #1e2130;
  text-decoration: none;
  transition: all 0.15s ease;
}

.sidebar-brand:hover {
  background: #151924;
}

.brand-mark {
  width: 22px;
  min-width: 22px;
  height: 22px;
  color: #6ee7b7;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.brand-mark svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.brand-text {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: 1.1rem;
  color: #ffffff;
  letter-spacing: 0.02em;
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.78rem 0.85rem;
  border-radius: 9px;
  color: #98a2b3;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.15s ease;
}

.nav-item:hover {
  background: #1a1f2e;
  color: #ffffff;
}

.nav-item.router-link-active {
  background: #163622;
  color: #6ee7b7;
  font-weight: 700;
}

.nav-icon {
  width: 20px;
  min-width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  opacity: 0.95;
}

.nav-icon svg {
  width: 15px;
  height: 15px;
  display: block;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.nav-item.router-link-active .nav-icon {
  opacity: 1;
}

.sidebar-footer {
  padding: 1rem 0.75rem;
  border-top: 1px solid #1e2130;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  padding: 0.35rem;
  margin: -0.35rem;
  border-radius: 10px;
  transition: all 0.15s ease;
}

.user-info:hover,
.user-info.active {
  background: #1a1f2e;
}

.user-avatar,
.user-avatar-img {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  flex-shrink: 0;
}

.user-avatar {
  background: #1a2e22;
  color: #6ee7b7;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar-img {
  object-fit: cover;
  display: block;
  border: 1px solid rgba(110, 231, 183, 0.25);
}

.user-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  color: #8892a4;
  font-size: 0.75rem;
  text-transform: capitalize;
}

.logout-btn {
  background: none;
  border: none;
  color: #8892a4;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 6px;
  transition: all 0.15s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn:hover {
  background: #1e2130;
  color: #f87171;
}

.main-content {
  margin-left: 240px;
  flex: 1;
  min-height: 100vh;
  padding: 2rem;
}

/* FINAL SIDEBAR ICON FIX - icons are generated by CSS, not template */
.sidebar-nav .nav-item {
  display: flex !important;
  align-items: center !important;
  gap: 0.85rem !important;
  padding: 0.78rem 0.85rem !important;
  border-radius: 9px !important;
  color: #98a2b3 !important;
  text-decoration: none !important;
  font-size: 0.95rem !important;
  font-weight: 500 !important;
}

.sidebar-nav .nav-item:hover {
  background: #1a1f2e !important;
  color: #ffffff !important;
}

.sidebar-nav .nav-item.router-link-active {
  background: #163622 !important;
  color: #6ee7b7 !important;
  font-weight: 700 !important;
}

.sidebar-nav .nav-item .nav-icon {
  display: none !important;
}

.sidebar-nav .nav-item::before {
  width: 20px;
  min-width: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  font-size: 0.9rem;
  line-height: 1;
}

.sidebar-nav .nav-item:nth-child(1)::before {
  content: "\25A6";
}

.sidebar-nav .nav-item:nth-child(2)::before {
  content: "\25CE";
}

.sidebar-nav .nav-item:nth-child(3)::before {
  content: "\2605";
}

.sidebar-nav .nav-item:nth-child(4)::before {
  content: "\25C8";
}

.sidebar-nav .nav-item:nth-child(5)::before {
  content: "\2605";
}
</style>