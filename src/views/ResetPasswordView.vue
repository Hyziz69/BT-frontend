<template>
  <div class="auth-container">
    <div class="auth-box">
      <div class="brand">
        <div class="brand-icon">◈</div>
        <h1>NTI Portal</h1>
      </div>
      <h2>Set New Password</h2>

      <div v-if="success" class="success-banner">
        <span>✓</span>
        <div>
          <strong>Password updated!</strong>
          <p>Your password has been reset. <RouterLink to="/login">Sign in</RouterLink></p>
        </div>
      </div>

      <div v-else-if="!token || !email" class="error-banner">
        <p>Invalid or missing reset link. Please request a new one.</p>
        <RouterLink to="/forgot-password" class="btn-link">Request new link</RouterLink>
      </div>

      <form v-else @submit.prevent="handleSubmit">
        <div class="field">
          <label>New Password</label>
          <input v-model="form.password" type="password" placeholder="••••••••" required minlength="8" />
        </div>
        <div class="field">
          <label>Confirm Password</label>
          <input v-model="form.password_confirmation" type="password" placeholder="••••••••" required />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Saving...' : 'Reset Password' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { authApi } from '../api/auth'

const route = useRoute()

const token = ref('')
const email = ref('')
const form = ref({ password: '', password_confirmation: '' })
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

onMounted(() => {
  token.value = route.query.token as string ?? ''
  email.value = route.query.email as string ?? ''
})

async function handleSubmit() {
  loading.value = true
  error.value = null
  try {
    await authApi.resetPassword({
      token: token.value,
      email: email.value,
      password: form.value.password,
      password_confirmation: form.value.password_confirmation,
    })
    success.value = true
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Failed to reset password. The link may have expired.'
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
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 420px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
}

.brand-icon {
  width: 40px; height: 40px;
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
.success-banner a { color: #065f46; font-weight: 600; }

.error-banner {
  padding: 1.25rem;
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 10px;
  text-align: center;
}

.error-banner p { color: #991b1b; margin: 0 0 0.75rem; font-size: 0.9rem; }
.btn-link { color: #0f1117; font-weight: 600; font-size: 0.9rem; }
</style>
