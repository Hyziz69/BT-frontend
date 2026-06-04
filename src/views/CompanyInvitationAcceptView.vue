<template>
  <div class="accept-container">
    <div class="accept-box">
      <div v-if="loading" class="state">
        <div class="spinner">⟳</div>
        <p>Loading invitation…</p>
      </div>

      <div v-else-if="error" class="state error">
        <div class="icon">{{ expired ? '⏱' : '✕' }}</div>
        <h2>{{ expired ? 'Invitation Expired' : 'Invalid Invitation' }}</h2>
        <p>{{ error }}</p>
        <template v-if="expired">
          <p class="note">Ask the company owner to send you a new invitation.</p>
          <RouterLink to="/register" class="btn-primary">Register</RouterLink>
        </template>
        <RouterLink v-else to="/login" class="btn-primary">Go to Login</RouterLink>
      </div>

      <div v-else-if="accepted" class="state success">
        <div class="icon">✓</div>
        <h2>You joined the company!</h2>
        <p>You have successfully joined <strong>{{ companyName }}</strong>.</p>
        <RouterLink to="/company" class="btn-primary">Open Company</RouterLink>
      </div>

      <div v-else-if="invitation" class="state">
        <div class="icon invite">✉</div>
        <h2>Company Invitation</h2>
        <p>You've been invited to join <strong>{{ invitation.company_name }}</strong>
          as <strong>{{ invitation.role_label }}</strong>.</p>
        <p class="expires">Expires: {{ new Date(invitation.expires_at).toLocaleDateString('sk-SK') }}</p>

        <div v-if="!authStore.isAuthenticated" class="auth-required">
          <p>You need to be logged in to accept this invitation.</p>
          <RouterLink :to="`/login?redirect=/company-invitation/accept?token=${token}`" class="btn-primary">
            Login to Accept
          </RouterLink>
          <RouterLink :to="`/register?redirect=/company-invitation/accept?token=${token}`" class="btn-secondary">
            Register & Accept
          </RouterLink>
        </div>

        <div v-else class="actions">
          <button @click="handleAccept" :disabled="accepting" class="btn-primary">
            {{ accepting ? 'Accepting…' : 'Accept Invitation' }}
          </button>
          <RouterLink to="/dashboard" class="btn-secondary">Decline</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { authApi } from '../api/auth'
import { companyApi } from '../api/company'

const route = useRoute()
const authStore = useAuthStore()

const token = ref<string>('')
const invitation = ref<any>(null)
const loading = ref(false)
const accepting = ref(false)
const accepted = ref(false)
const companyName = ref('')
const error = ref<string | null>(null)
const expired = ref(false)

onMounted(async () => {
  token.value = route.query.token as string

  if (!token.value) {
    error.value = 'No invitation token provided.'
    return
  }

  loading.value = true
  try {
    invitation.value = await companyApi.previewInvitation(token.value)
  } catch (e: any) {
    const reason = e.response?.data?.reason
    expired.value = reason === 'expired'
    error.value = e.response?.data?.message ?? 'This invitation is invalid or has expired.'
  } finally {
    loading.value = false
  }
})

async function handleAccept() {
  accepting.value = true
  error.value = null
  try {
    await companyApi.acceptInvitation(token.value)
    companyName.value = invitation.value.company_name
    accepted.value = true
    // Refresh local user so company_id/company_role are up to date.
    try {
      const fresh = await authApi.me()
      authStore.setUser(fresh)
    } catch {
      /* non-fatal */
    }
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Failed to accept invitation.'
  } finally {
    accepting.value = false
  }
}
</script>

<style scoped>
.accept-container {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.accept-box {
  background: white;
  border-radius: 16px;
  padding: 3rem 2.5rem;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  text-align: center;
}

.state { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }

.icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.icon.invite { background: #eff6ff; color: #3b82f6; }
.state.success .icon { background: #d1fae5; color: #065f46; }
.state.error .icon { background: #fee2e2; color: #991b1b; }

.spinner { font-size: 2rem; color: #8892a4; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

h2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f1117;
  margin: 0;
}

p { color: #6b7280; margin: 0; }
.expires { font-size: 0.85rem; color: #9ca3af; }
.note { font-size: 0.82rem; color: #9ca3af; margin-top: -0.25rem; }

.auth-required, .actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  margin-top: 0.5rem;
}

.btn-primary {
  background: #0f1117;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  display: block;
  text-align: center;
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.95rem;
  text-decoration: none;
  display: block;
  text-align: center;
}
</style>
