<template>
  <div class="auth-container">
    <div class="auth-box">
      <div class="brand">
        <div class="brand-icon">◈</div>
        <h1>NTI Portal</h1>
      </div>
      <h2>Forgot Password</h2>

      <div v-if="sent" class="success-banner">
        <span>✓</span>
        <div>
          <strong>Check your email</strong>
          <p>If this email is registered, you'll receive a reset link shortly.</p>
        </div>
      </div>

      <form v-else @submit.prevent="handleSubmit">
        <p class="subtitle">Enter your email and we'll send you a reset link.</p>
        <div class="field">
          <label>Email</label>
          <input v-model="email" type="email" placeholder="your@email.com" required />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Sending...' : 'Send Reset Link' }}
        </button>
        <p class="auth-link"><RouterLink to="/login">← Back to Login</RouterLink></p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { authApi } from '../api/auth'

const email = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const sent = ref(false)

async function handleSubmit() {
  loading.value = true
  error.value = null
  try {
    await authApi.forgotPassword(email.value)
    sent.value = true
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Something went wrong. Try again.'
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
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0 0 1.25rem 0;
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

button:disabled { opacity: 0.6; cursor: not-allowed; }
button:hover:not(:disabled) { opacity: 0.9; }

.error {
  color: #ef4444;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.success-banner {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: #f0fdf4;
  border: 1px solid #6ee7b7;
  border-radius: 10px;
}

.success-banner span {
  font-size: 1.25rem;
  color: #16a34a;
}

.success-banner strong {
  display: block;
  color: #065f46;
  margin-bottom: 0.25rem;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.success-banner p {
  color: #047857;
  font-size: 0.875rem;
  margin: 0;
}

.auth-link {
  text-align: center;
  margin-top: 1.25rem;
  font-size: 0.875rem;
}

.auth-link a {
  color: #0f1117;
  font-weight: 600;
  text-decoration: none;
}

.auth-link a:hover { color: #6ee7b7; }
</style>
