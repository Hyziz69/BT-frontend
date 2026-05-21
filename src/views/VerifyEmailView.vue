<template>
  <div class="auth-container">
    <div class="auth-box">
      <div class="brand">
        <div class="brand-icon">◈</div>
        <h1>NTI Portal</h1>
      </div>

      <div v-if="loading" class="state">
        <div class="spinner">⟳</div>
        <p>Verifying your email...</p>
      </div>

      <div v-else-if="success" class="state success">
        <div class="icon">✓</div>
        <h2>Email Verified!</h2>
        <p>Your email has been confirmed. An admin will review and approve your account shortly.</p>
        <RouterLink to="/login" class="btn-primary">Go to Login</RouterLink>
      </div>

      <div v-else class="state error">
        <div class="icon">✕</div>
        <h2>Verification Failed</h2>
        <p>{{ error }}</p>
        <form v-if="showResend" @submit.prevent="handleResend" class="resend-form">
          <input v-model="resendEmail" type="email" placeholder="your@email.com" required />
          <button type="submit" :disabled="resending">
            {{ resending ? 'Sending...' : 'Resend Verification Email' }}
          </button>
          <p v-if="resendSuccess" class="resend-success">New verification email sent!</p>
        </form>
        <button v-else @click="showResend = true" class="btn-secondary">Resend Verification Email</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { authApi } from '../api/auth'

const route = useRoute()

const loading = ref(true)
const success = ref(false)
const error = ref('')
const showResend = ref(false)
const resendEmail = ref('')
const resending = ref(false)
const resendSuccess = ref(false)

onMounted(async () => {
  const id        = route.query.id as string
  const hash      = route.query.hash as string
  const expires   = route.query.expires as string
  const signature = route.query.signature as string

  if (!id || !hash || !expires || !signature) {
    error.value = 'Invalid verification link. Please check your email or request a new link.'
    loading.value = false
    return
  }

  try {
    await authApi.verifyEmail(id, hash, expires, signature)
    success.value = true
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Verification failed. The link may have expired.'
  } finally {
    loading.value = false
  }
})

async function handleResend() {
  resending.value = true
  try {
    await authApi.resendVerification(resendEmail.value)
    resendSuccess.value = true
  } catch {
    // silent
  } finally {
    resending.value = false
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
  max-width: 440px;
  text-align: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  justify-content: center;
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

.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.icon {
  width: 56px; height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.success .icon { background: #d1fae5; color: #065f46; }
.error .icon   { background: #fee2e2; color: #991b1b; }

.spinner {
  font-size: 2.5rem;
  color: #8892a4;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}

@keyframes spin { to { transform: rotate(360deg); } }

h2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f1117;
  margin: 0;
}

p { color: #6b7280; margin: 0; font-size: 0.9rem; line-height: 1.5; }

.btn-primary {
  background: #0f1117;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  font-family: 'Plus Jakarta Sans', sans-serif;
  display: inline-block;
  margin-top: 0.5rem;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

.resend-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  margin-top: 0.5rem;
}

.resend-form input {
  padding: 0.65rem 0.9rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: 'DM Sans', sans-serif;
}

.resend-form input:focus { outline: none; border-color: #6ee7b7; }

.resend-form button {
  background: #0f1117;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.resend-form button:disabled { opacity: 0.6; cursor: not-allowed; }

.resend-success { color: #16a34a; font-size: 0.875rem; }
</style>
