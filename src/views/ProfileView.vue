<template>
  <div class="page">
    <div class="container">
      <h1>My Profile</h1>

      <!-- User info -->
      <div class="card">
        <h2>Account Info</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Name</span>
            <span class="value">{{ user?.first_name }} {{ user?.last_name }}</span>
          </div>
          <div class="info-item">
            <span class="label">Email</span>
            <span class="value">{{ user?.email }}</span>
          </div>
          <div class="info-item">
            <span class="label">Account type</span>
            <span class="value capitalize">{{ user?.account_type }}</span>
          </div>
          <div class="info-item">
            <span class="label">Status</span>
            <span class="badge" :class="user?.status">{{ user?.status }}</span>
          </div>
        </div>
      </div>

      <!-- Change password -->
      <div class="card">
        <h2>Change Password</h2>

        <div v-if="success" class="success-banner">
          <span>✓</span>
          <div>
            <strong>Password updated!</strong>
            <p>Your new password is active.</p>
          </div>
        </div>

        <form v-else @submit.prevent="handleChangePassword">
          <div class="field">
            <label>Current Password</label>
            <input v-model="form.current_password" type="password" placeholder="••••••••" required />
          </div>
          <div class="field">
            <label>New Password</label>
            <input v-model="form.password" type="password" placeholder="••••••••" required minlength="8" />
          </div>
          <div class="field">
            <label>Confirm New Password</label>
            <input v-model="form.password_confirmation" type="password" placeholder="••••••••" required />
          </div>
          <p v-if="error" class="error">{{ error }}</p>
          <button type="submit" :disabled="loading">
            {{ loading ? 'Saving...' : 'Change Password' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { authApi } from '../api/auth'

const authStore = useAuthStore()
const user = authStore.user

const form = ref({ current_password: '', password: '', password_confirmation: '' })
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

async function handleChangePassword() {
  loading.value = true
  error.value = null
  try {
    await authApi.changePassword(form.value)
    success.value = true
    form.value = { current_password: '', password: '', password_confirmation: '' }
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Failed to change password.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 2rem 1rem;
  font-family: 'DM Sans', sans-serif;
}

.container {
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

h1 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f1117;
  margin: 0;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

h2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f1117;
  margin: 0 0 1.25rem 0;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid #f3f4f6;
}

.info-item:last-child { border-bottom: none; padding-bottom: 0; }

.label {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 500;
}

.value {
  font-size: 0.95rem;
  color: #0f1117;
  font-weight: 600;
}

.capitalize { text-transform: capitalize; }

.badge {
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.badge.active   { background: #d1fae5; color: #065f46; }
.badge.pending  { background: #fef3c7; color: #92400e; }
.badge.suspended { background: #fee2e2; color: #991b1b; }

.field { margin-bottom: 1rem; }

label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
}

input {
  width: 100%;
  padding: 0.65rem 0.9rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  box-sizing: border-box;
  font-family: 'DM Sans', sans-serif;
  transition: border-color 0.15s;
}

input:focus { outline: none; border-color: #6ee7b7; }

button {
  padding: 0.75rem 1.75rem;
  background: #0f1117;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: opacity 0.15s;
  margin-top: 0.25rem;
}

button:disabled { opacity: 0.6; cursor: not-allowed; }
button:hover:not(:disabled) { opacity: 0.9; }

.error { color: #ef4444; font-size: 0.875rem; margin-bottom: 0.5rem; }

.success-banner {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: #f0fdf4;
  border: 1px solid #6ee7b7;
  border-radius: 10px;
}

.success-banner span { font-size: 1.25rem; color: #16a34a; }
.success-banner strong { display: block; color: #065f46; margin-bottom: 0.25rem; font-family: 'Plus Jakarta Sans', sans-serif; }
.success-banner p { color: #047857; font-size: 0.875rem; margin: 0; }
</style>
