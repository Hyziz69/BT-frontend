<template>
  <div class="app-layout">
    <!-- Sidebar -->
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
          <span>Teams</span>
        </RouterLink>
        <RouterLink to="/applications" class="nav-item">
          <span class="nav-icon">◎</span>
          <span>Applications</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">{{ initials }}</div>
          <div class="user-details">
            <span class="user-name">{{ authStore.user?.first_name }} {{ authStore.user?.last_name }}</span>
            <span class="user-role">{{ authStore.user?.account_type }}</span>
          </div>
        </div>
        <button @click="handleLogout" class="logout-btn" title="Logout">⏻</button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const initials = computed(() => {
  const f = authStore.user?.first_name?.[0] ?? ''
  const l = authStore.user?.last_name?.[0] ?? ''
  return (f + l).toUpperCase()
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style>
/* Global reset — not scoped so it applies to html/body */
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
  color: #ffffff;
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
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #1a2e22;
  color: #6ee7b7;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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