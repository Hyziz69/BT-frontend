<template>
  <div class="auth-container">
    <div class="auth-box">
      <div class="brand">
        <div class="brand-icon">◈</div>
        <h1>NTI Portal</h1>
      </div>
      <h2>Create Account</h2>

      <div v-if="success" class="success-banner">
        <span>✓</span>
        <div>
          <strong>Account created!</strong>
          <p>Check your email to verify your address. An admin will then approve your account.</p>
        </div>
      </div>

      <form v-else @submit.prevent="handleRegister">
        <div class="field-row">
          <div class="field">
            <label>First Name</label>
            <input v-model="form.first_name" type="text" placeholder="John" required />
          </div>
          <div class="field">
            <label>Last Name</label>
            <input v-model="form.last_name" type="text" placeholder="Doe" required />
          </div>
        </div>
        <div class="field">
          <label>Email</label>
          <input v-model="form.email" type="email" placeholder="your@email.com" required />
        </div>
        <div class="field">
          <label>Password</label>
          <input v-model="form.password" type="password" placeholder="••••••••" required />
        </div>
        <div class="field">
          <label>Confirm Password</label>
          <input v-model="form.password_confirmation" type="password" placeholder="••••••••" required />
        </div>
       <div class="field">
        <label>Account Type</label>
        <select v-model="form.account_type">
          <option value="student">Student</option>
          <option value="mentor">Mentor</option>
          <option value="company_contact">Company Representative</option>
        </select>
      </div>
        <div class="field checkbox">
          <input type="checkbox" v-model="form.gdpr_consent" id="gdpr" required />
          <label for="gdpr">I agree to the processing of my personal data (GDPR)</label>
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Create Account' }}
        </button>
        <p class="auth-link">Already have an account? <RouterLink to="/login">Sign in</RouterLink></p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authApi } from '../api/auth'

const router = useRouter()
const route = useRoute()

const form = ref<{
  first_name: string
  last_name: string
  email: string
  password: string
  password_confirmation: string
  account_type: 'student' | 'mentor' | 'company_contact'
  gdpr_consent: boolean
}>({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirmation: '',
  account_type: 'student',
  gdpr_consent: false,
})

const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

async function handleRegister() {
  loading.value = true
  error.value = null
  try {
    await authApi.register(form.value)
    success.value = true
    const redirect = route.query.redirect as string | undefined
    setTimeout(() => router.push(redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'), 4000)
  } catch (e: any) {
    const errors = e.response?.data?.errors
    if (errors) {
      error.value = Object.values(errors).flat().join(' ')
    } else {
      error.value = e.response?.data?.message ?? 'Registration failed'
    }
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
  padding: 2rem 1rem;
}

.auth-box {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 480px;
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
  margin: 0 0 1.5rem 0;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
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

input, select {
  width: 100%;
  padding: 0.65rem 0.9rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  box-sizing: border-box;
  transition: border-color 0.15s;
  font-family: 'DM Sans', sans-serif;
}

input:focus, select:focus {
  outline: none;
  border-color: #6ee7b7;
}

.checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.checkbox input {
  width: auto;
  margin-top: 0.15rem;
  flex-shrink: 0;
}

.checkbox label {
  margin: 0;
  font-weight: 400;
  font-size: 0.825rem;
  color: #6b7280;
  line-height: 1.4;
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
  margin-top: 0.25rem;
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
  margin-top: 0.1rem;
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
</style>