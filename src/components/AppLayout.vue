<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <span class="brand-icon">⬡</span>
        <span class="brand-text">NTI Portal</span>
      </div>

      <nav class="sidebar-nav">
        <RouterLink to="/dashboard" class="nav-item">
          <span class="nav-icon">⊞</span>
          <span>Dashboard</span>
        </RouterLink>

        <RouterLink to="/teams" class="nav-item">
          <span class="nav-icon">◈</span>
          <span>{{ isStudent ? 'My Team' : 'Teams' }}</span>
        </RouterLink>

        <RouterLink to="/applications" class="nav-item">
          <span class="nav-icon">◎</span>
          <span>Applications</span>
        </RouterLink>

        <RouterLink to="/applications-b" class="nav-item">
          <span class="nav-icon">★</span>
          <span>Program B Applications</span>
        </RouterLink>

        <RouterLink v-if="isAdmin" to="/admin" class="nav-item">
          <span class="nav-icon">★</span>
          <span>Admin</span>
        </RouterLink>

        <RouterLink v-if="isAdmin" to="/admin/activity" class="nav-item">
          <span class="nav-icon">◷</span>
          <span>Activity Log</span>
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

        <button @click="handleLogout" class="logout-btn" title="Logout">⏻</button>
      </div>
    </aside>

    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const user = computed(() => authStore.user as any)

const isStudent = computed(() => user.value?.account_type === 'student')

const isAdmin = computed(() =>
  ['nti_admin', 'superadmin'].includes(user.value?.account_type ?? ''),
)

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
}

.brand-icon {
  font-size: 1.5rem;
  color: #6ee7b7;
}

.brand-text {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: 1.1rem;
  color: #fff;
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
  gap: 0.75rem;
  padding: 0.7rem 0.75rem;
  border-radius: 8px;
  color: #8892a4;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.15s ease;
}

.nav-item:hover {
  background: #1a1f2e;
  color: #fff;
}

.nav-item.router-link-active {
  background: #1a2e22;
  color: #6ee7b7;
}

.nav-icon {
  font-size: 1rem;
  width: 20px;
  text-align: center;
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
  color: #fff;
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
  font-size: 1.1rem;
  padding: 0.4rem;
  border-radius: 6px;
  transition: all 0.15s ease;
  flex-shrink: 0;
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
</style>
