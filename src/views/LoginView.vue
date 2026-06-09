<template>
  <div class="auth-container">
    <div class="auth-box">
      <div class="brand">
        <div class="brand-icon">◈</div>
        <h1>NTI Portal</h1>
      </div>
      <h2>Sign In</h2>
      <form @submit.prevent="handleLogin">
        <div class="field">
          <label>Email</label>
          <input v-model="form.email" type="email" placeholder="your@email.com" required />
        </div>
        <div class="field">
          <div class="label-row">
            <label>Password</label>
            <RouterLink to="/forgot-password" class="forgot-link">Forgot password?</RouterLink>
          </div>
          <input v-model="form.password" type="password" placeholder="••••••••" required />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
        <p class="auth-link">Don't have an account? <RouterLink to="/register">Sign up</RouterLink></p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { authApi } from '../api/auth'

const router = useRouter()
const authStore = useAuthStore()
const form = ref({ email: '', password: '' })
const loading = ref(false)
const error = ref<string | null>(null)

async function handleLogin() {
  loading.value = true
  error.value = null

  try {
    const response = await authApi.login(form.value.email, form.value.password)
    authStore.setToken(response.access_token)
    authStore.setUser(response.user)
    router.push('/dashboard')
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Login failed.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.auth-box {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 420px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
}

.forgot-link {
  font-size: 0.8rem;
  color: #8892a4;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s;
}

.forgot-link:hover { color: #0f1117; }

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: #0f1117;
  color: #6ee7b7;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

h1 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.3rem;
  font-weight: 800;
  color: #0f1117;
  margin: 0;
}

h2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f1117;
  margin: 0 0 1.5rem 0;
}

.field {
  margin-bottom: 1rem;
}

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
  transition: border-color 0.15s;
  font-family: 'DM Sans', sans-serif;
}

input:focus {
  outline: none;
  border-color: #6ee7b7;
}

button {
  width: 100%;
  padding: 0.75rem;
  background: #0f1117;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: opacity 0.15s;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
button:hover:not(:disabled) {
  opacity: 0.9;
}

.error {
  color: #ef4444;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.auth-link {
  text-align: center;
  margin-top: 1.25rem;
  font-size: 0.875rem;
  color: #8892a4;
}

.auth-link a {
  color: #0f1117;
  font-weight: 600;
  text-decoration: none;
}

.auth-link a:hover {
  color: #6ee7b7;
}

.auth-link.forgot {
  text-align: right;
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}

.auth-link.forgot a {
  font-size: 0.825rem;
  color: #6b7280;
  font-weight: 500;
}
</style>
