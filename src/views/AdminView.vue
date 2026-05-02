<template>
  <div class="admin-page">
    <nav class="navbar">
      <span class="brand">NTI Portal</span>

      <div class="nav-links">
        <RouterLink to="/dashboard">Dashboard</RouterLink>
        <RouterLink to="/teams">Teams</RouterLink>
        <RouterLink to="/applications">Applications</RouterLink>
        <button @click="handleLogout">Logout</button>
      </div>
    </nav>

    <main class="content">
      <div v-if="accessDenied" class="access-card">
        <h1>403</h1>
        <h2>Access denied</h2>
        <p>You do not have enough permissions to access this page.</p>

        <RouterLink to="/dashboard" class="back-link">
          Back to dashboard
        </RouterLink>
      </div>

      <div v-else-if="unauthenticated" class="access-card">
        <h1>401</h1>
        <h2>Unauthenticated</h2>
        <p>You need a valid token to access this page.</p>

        <RouterLink to="/login" class="back-link">
          Go to login
        </RouterLink>
      </div>

      <template v-else>
        <h1>Admin Panel</h1>
        <p class="subtitle">Admin users management</p>

        <section class="table-card">
          <div class="table-header">
            <h2>Users</h2>

            <div class="actions">
              <button
                v-if="hasUnsavedChanges"
                class="btn-secondary"
                :disabled="saving"
                @click="resetChanges"
              >
                Reset changes
              </button>

              <button
                v-if="hasUnsavedChanges"
                class="btn-save"
                :disabled="saving"
                @click="confirmSaveChanges"
              >
                {{ saving ? 'Saving...' : 'Save changes' }}
              </button>
            </div>
          </div>

          <p v-if="hasUnsavedChanges" class="warning">
            You have unsaved changes.
          </p>

          <p v-if="loading">Loading...</p>
          <p v-if="error" class="error">{{ error }}</p>
          <p v-if="successMessage" class="success">{{ successMessage }}</p>

          <table v-if="!loading && users.length">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Account type</th>
                <th>Status</th>
                <th>Created at</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="user in users"
                :key="user.id"
                :class="{ changed: isUserChanged(user) }"
              >
                <td>{{ user.first_name }} {{ user.last_name }}</td>
                <td>{{ user.email }}</td>

                <td>
                  <select v-model="user.account_type" :disabled="saving">
                    <option value="student">student</option>
                    <option value="firm">firm</option>
                    <option value="mentor">mentor</option>
                    <option value="committee">committee</option>
                    <option value="editor">editor</option>
                    <option value="firm_admin">firm_admin</option>
                    <option value="nti_admin">nti_admin</option>
                    <option value="super_admin">super_admin</option>
                  </select>
                </td>

                <td>
                  <select v-model="user.status" :disabled="saving">
                    <option value="active">active</option>
                    <option value="pending">pending</option>
                    <option value="suspended">suspended</option>
                    <option value="blocked">blocked</option>
                  </select>
                </td>

                <td>{{ formatDate(user.created_at) }}</td>
              </tr>
            </tbody>
          </table>

          <p v-if="!loading && !error && !users.length">No users found.</p>
        </section>
      </template>
    </main>

    <div v-if="showLeaveModal" class="modal-overlay">
      <div class="modal">
        <h2>Unsaved changes</h2>
        <p>You have unsaved changes. What do you want to do?</p>

        <div class="modal-actions">
          <button class="btn-save" :disabled="saving" @click="saveAndLeave">
            {{ saving ? 'Saving...' : 'Save and leave' }}
          </button>

          <button class="btn-danger" :disabled="saving" @click="discardAndLeave">
            Discard changes
          </button>

          <button class="btn-secondary" :disabled="saving" @click="cancelLeave">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import api from '../api/axios'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const users = ref<any[]>([])
const originalUsers = ref<any[]>([])

const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const accessDenied = ref(false)
const unauthenticated = ref(false)

const showLeaveModal = ref(false)
const pendingRoute = ref<string | null>(null)
const pendingLogout = ref(false)
const allowNavigation = ref(false)

const hasUnsavedChanges = computed(() => {
  return users.value.some((user) => isUserChanged(user))
})

function formatDate(date: string | null) {
  if (!date) return '-'

  return new Date(date).toLocaleDateString()
}

function getOriginalUser(userId: string) {
  return originalUsers.value.find((user) => user.id === userId)
}

function isUserChanged(user: any) {
  const originalUser = getOriginalUser(user.id)

  if (!originalUser) return false

  return (
    user.account_type !== originalUser.account_type ||
    user.status !== originalUser.status
  )
}

function getChangedUsers() {
  return users.value.filter((user) => isUserChanged(user))
}

async function fetchUsers() {
  loading.value = true
  error.value = null
  successMessage.value = null
  accessDenied.value = false
  unauthenticated.value = false

  const token = localStorage.getItem('token')

  try {
    const response = await api.get('/admin/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    users.value = JSON.parse(JSON.stringify(response.data))
    originalUsers.value = JSON.parse(JSON.stringify(response.data))
  } catch (e: any) {
    if (e.response?.status === 403) {
      accessDenied.value = true
      return
    }

    if (e.response?.status === 401) {
      unauthenticated.value = true
      authStore.logout()
      localStorage.removeItem('token')
      return
    }

    error.value = e.response?.data?.message ?? 'Failed to load users'
  } finally {
    loading.value = false
  }
}

async function saveChanges() {
  const changedUsers = getChangedUsers()

  if (!changedUsers.length) {
    successMessage.value = 'No changes to save.'
    return true
  }

  saving.value = true
  error.value = null
  successMessage.value = null

  const token = localStorage.getItem('token')

  try {
    for (const user of changedUsers) {
      await api.patch(
        `/admin/users/${user.id}`,
        {
          account_type: user.account_type,
          status: user.status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
    }

    originalUsers.value = JSON.parse(JSON.stringify(users.value))
    successMessage.value = 'Changes saved successfully.'
    return true
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Failed to save changes.'
    await fetchUsers()
    return false
  } finally {
    saving.value = false
  }
}

async function confirmSaveChanges() {
  const confirmed = window.confirm('Do you want to save these changes?')

  if (!confirmed) return

  await saveChanges()
}

function resetChanges() {
  const confirmed = window.confirm('Discard all unsaved changes?')

  if (!confirmed) return

  users.value = JSON.parse(JSON.stringify(originalUsers.value))
  error.value = null
  successMessage.value = null
}

function clearAuthAndGoLogin() {
  authStore.logout()
  localStorage.removeItem('token')
  router.replace('/login')
}

function handleLogout() {
  if (hasUnsavedChanges.value) {
    pendingLogout.value = true
    pendingRoute.value = '/login'
    showLeaveModal.value = true
    return
  }

  clearAuthAndGoLogin()
}

async function saveAndLeave() {
  const saved = await saveChanges()

  if (!saved) return

  showLeaveModal.value = false
  allowNavigation.value = true

  if (pendingLogout.value) {
    authStore.logout()
    localStorage.removeItem('token')
  }

  if (pendingRoute.value) {
    router.replace(pendingRoute.value)
  }
}

function discardAndLeave() {
  showLeaveModal.value = false
  allowNavigation.value = true

  users.value = JSON.parse(JSON.stringify(originalUsers.value))

  if (pendingLogout.value) {
    authStore.logout()
    localStorage.removeItem('token')
  }

  if (pendingRoute.value) {
    router.replace(pendingRoute.value)
  }
}

function cancelLeave() {
  showLeaveModal.value = false
  pendingRoute.value = null
  pendingLogout.value = false
}

function handleBeforeUnload(event: BeforeUnloadEvent) {
  if (!hasUnsavedChanges.value) return

  event.preventDefault()
  event.returnValue = ''
}

onMounted(async () => {
  await fetchUsers()
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

onBeforeRouteLeave((to) => {
  if (allowNavigation.value) {
    allowNavigation.value = false
    return true
  }

  if (!hasUnsavedChanges.value) {
    return true
  }

  pendingRoute.value = to.fullPath
  pendingLogout.value = false
  showLeaveModal.value = true

  return false
})
</script>

<style scoped>
.admin-page {
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

.subtitle {
  color: #666;
  margin-bottom: 2rem;
}

.table-card,
.access-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.access-card {
  max-width: 500px;
}

.access-card h1 {
  color: #e74c3c;
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.access-card h2 {
  color: #2c3e50;
  margin-bottom: 0.75rem;
}

.access-card p {
  color: #666;
  margin-bottom: 1.5rem;
}

.back-link {
  display: inline-block;
  background: #2c3e50;
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 4px;
  text-decoration: none;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.table-card h2 {
  color: #2c3e50;
  margin: 0;
}

.actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th,
td {
  text-align: left;
  padding: 0.75rem;
  border-bottom: 1px solid #ddd;
}

th {
  background: #2c3e50;
  color: white;
}

tr.changed {
  background: #fff8e1;
}

select {
  padding: 0.4rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
}

select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary,
.btn-secondary,
.btn-danger,
.btn-save {
  border: none;
  padding: 0.55rem 0.9rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-save {
  background: #27ae60;
  color: white;
}

.btn-primary {
  background: #2c3e50;
  color: white;
}

.btn-secondary {
  background: #eeeeee;
  color: #333333;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-primary:disabled,
.btn-secondary:disabled,
.btn-danger:disabled,
.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #e74c3c;
}

.success {
  color: #155724;
}

.warning {
  color: #856404;
  background: #fff3cd;
  padding: 0.6rem 0.8rem;
  border-radius: 4px;
  margin-top: 0.75rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal {
  background: white;
  width: 100%;
  max-width: 460px;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.25);
}

.modal h2 {
  color: #2c3e50;
  margin-bottom: 0.75rem;
}

.modal p {
  color: #666;
  margin-bottom: 1.25rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}
</style>