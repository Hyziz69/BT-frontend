<template>
  <div class="dashboard">
    <nav class="navbar">
      <span class="brand">NTI Portal</span>
      <div class="nav-links">
        <RouterLink to="/teams">Teams</RouterLink>
        <RouterLink to="/applications">Applications</RouterLink>
        <button @click="handleLogout">Logout</button>
      </div>
    </nav>

    <div class="content">
      <h1>Welcome, {{ authStore.user?.first_name ?? 'User' }}</h1>
      <p>
        Account type: <strong>{{ authStore.user?.account_type }}</strong>
      </p>

      <div class="cards">
        <RouterLink to="/teams" class="card">
          <h2>My Teams</h2>
          <p>View and manage your teams</p>
        </RouterLink>

        <RouterLink to="/applications" class="card">
          <h2>Applications</h2>
          <p>Track your Program A applications</p>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.dashboard {
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
.nav-links a:hover {
  text-decoration: underline;
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
.cards {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}
.card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  flex: 1;
  transition: transform 0.2s;
}
.card:hover {
  transform: translateY(-2px);
}
.card h2 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}
.card p {
  color: #666;
}
</style>
