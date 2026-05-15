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
      </div>

      <div v-else-if="loading" class="access-card">
        <h2>Loading admin data...</h2>
      </div>

      <template v-else>
        <h1>Admin Panel</h1>
        <p class="subtitle">User approvals, calls, programs, mentor assignment and reporting</p>

        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="successMessage" class="success">{{ successMessage }}</p>

        <section class="stats-grid" v-if="stats">
          <div class="stat-card"><h3>Total applications</h3><p>{{ stats.total_applications }}</p></div>
          <div class="stat-card"><h3>Approved</h3><p>{{ stats.approved_applications }}</p></div>
          <div class="stat-card"><h3>Rejected</h3><p>{{ stats.rejected_applications }}</p></div>
          <div class="stat-card"><h3>Pending applications</h3><p>{{ stats.pending_applications }}</p></div>
          <div class="stat-card"><h3>Open calls</h3><p>{{ stats.open_calls }}</p></div>
          <div class="stat-card"><h3>Programs</h3><p>{{ stats.total_programs }}</p></div>
          <div class="stat-card"><h3>Mentors</h3><p>{{ stats.mentors_count }}</p></div>
          <div class="stat-card"><h3>Pending users</h3><p>{{ stats.pending_users_count }}</p></div>
        </section>

        <section class="card">
          <h2>User approvals</h2>

          <div class="filters">
            <input v-model="userSearch" type="text" placeholder="Search by name or email" />
            <select v-model="userStatusFilter">
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Approved</option>
              <option value="suspended">Rejected</option>
            </select>
            <select v-model="userTypeFilter">
              <option value="">All types</option>
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
              <option value="company_contact">Company contact</option>
              <option value="nti_admin">Admin</option>
            </select>
            <button class="btn-secondary small" @click="loadAll">Refresh</button>
          </div>

          <table v-if="filteredUsers.length">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Account type</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>{{ user.first_name }} {{ user.last_name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.account_type }}</td>
                <td>
                  <span class="status-badge" :class="statusClass(user.status)">
                    {{ user.status }}
                  </span>
                </td>
                <td>{{ formatDate(user.created_at) }}</td>
                <td class="action-row">
                  <button
                    class="btn-success small"
                    @click="approveUser(user.id)"
                    :disabled="saving || user.status === 'active'"
                  >
                    Approve
                  </button>
                  <button
                    class="btn-danger small"
                    @click="rejectUser(user.id)"
                    :disabled="saving || user.status === 'suspended'"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <p v-else>No users found.</p>
        </section>

        <section class="grid-two">
          <div class="card">
            <h2>{{ editingProgramId ? 'Edit program' : 'Create program' }}</h2>

            <div class="form-grid">
              <label>
                Type
                <select v-model="programForm.type">
                  <option value="program_a">program_a</option>
                  <option value="program_b">program_b</option>
                </select>
              </label>

              <label>
                Name
                <input v-model="programForm.name" type="text" />
              </label>

              <label>
                Min team size
                <input v-model.number="programForm.min_team_size" type="number" min="1" />
              </label>

              <label>
                Max team size
                <input v-model.number="programForm.max_team_size" type="number" min="1" />
              </label>

              <label class="full">
                Description
                <textarea v-model="programForm.description" rows="3" />
              </label>

              <label class="checkbox">
                <input v-model="programForm.is_active" type="checkbox" />
                Active
              </label>
            </div>

            <div class="actions">
              <button class="btn-save" @click="submitProgram" :disabled="saving">
                {{ editingProgramId ? 'Update program' : 'Create program' }}
              </button>
              <button class="btn-secondary" @click="resetProgramForm" :disabled="saving">
                Reset
              </button>
            </div>
          </div>

          <div class="card">
            <h2>Programs</h2>

            <table v-if="programs.length">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Active</th>
                  <th>Calls</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="program in programs" :key="program.id">
                  <td>{{ program.name }}</td>
                  <td>{{ program.type }}</td>
                  <td>{{ program.is_active ? 'yes' : 'no' }}</td>
                  <td>{{ program.calls_count ?? 0 }}</td>
                  <td>
                    <button class="btn-secondary small" @click="editProgram(program)">Edit</button>
                  </td>
                </tr>
              </tbody>
            </table>

            <p v-else>No programs found.</p>
          </div>
        </section>

        <section class="grid-two">
          <div class="card">
            <h2>{{ editingCallId ? 'Edit call' : 'Create call' }}</h2>

            <div class="form-grid">
              <label>
                Program
                <select v-model="callForm.program_id">
                  <option value="" disabled>Select program</option>
                  <option v-for="program in programs" :key="program.id" :value="program.id">
                    {{ program.name }}
                  </option>
                </select>
              </label>

              <label>
                Title
                <input v-model="callForm.title" type="text" />
              </label>

              <label>
                Opens at
                <input v-model="callForm.opens_at" type="datetime-local" />
              </label>

              <label>
                Closes at
                <input v-model="callForm.closes_at" type="datetime-local" />
              </label>

              <label class="full">
                Description
                <textarea v-model="callForm.description" rows="3" />
              </label>
            </div>

            <div class="actions">
              <button class="btn-save" @click="submitCall" :disabled="saving">
                {{ editingCallId ? 'Update call' : 'Create call' }}
              </button>
              <button class="btn-secondary" @click="resetCallForm" :disabled="saving">
                Reset
              </button>
            </div>
          </div>

          <div class="card">
            <h2>Calls</h2>

            <table v-if="calls.length">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Program</th>
                  <th>Status</th>
                  <th>Applications</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="call in calls" :key="call.id">
                  <td>{{ call.title }}</td>
                  <td>{{ call.program?.name }}</td>
                  <td>{{ call.status }}</td>
                  <td>{{ call.applications_count ?? 0 }}</td>
                  <td class="action-row">
                    <button class="btn-secondary small" @click="editCall(call)">Edit</button>
                    <button class="btn-success small" @click="openCall(call.id)" :disabled="call.status === 'open'">
                      Open
                    </button>
                    <button class="btn-danger small" @click="closeCall(call.id)" :disabled="call.status === 'closed'">
                      Close
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <p v-else>No calls found.</p>
          </div>
        </section>

        <section class="card">
          <h2>Applications / Assign mentor</h2>

          <table v-if="applications.length">
            <thead>
              <tr>
                <th>Application</th>
                <th>Team</th>
                <th>Call</th>
                <th>Status</th>
                <th>Current mentors</th>
                <th>Assign mentor</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="application in applications" :key="application.id">
                <td>{{ application.id }}</td>
                <td>{{ application.team?.name ?? '-' }}</td>
                <td>{{ application.call?.title ?? '-' }}</td>
                <td>{{ application.status }}</td>
                <td>
                  <span v-if="application.mentorships?.length">
                    {{ application.mentorships.map((m) => mentorName(m.mentor)).join(', ') }}
                  </span>
                  <span v-else>-</span>
                </td>
                <td class="assign-cell">
                  <select v-model="selectedMentorByApplication[application.id]">
                    <option value="">Select mentor</option>
                    <option v-for="mentor in mentors" :key="mentor.id" :value="mentor.id">
                      {{ mentor.first_name }} {{ mentor.last_name }}
                    </option>
                  </select>

                  <button
                    class="btn-save small"
                    :disabled="!selectedMentorByApplication[application.id] || saving"
                    @click="assignMentor(application.id)"
                  >
                    Assign
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <p v-else>No applications found.</p>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import {
  adminApi,
  type AdminApplication,
  type AdminCall,
  type AdminDashboardStats,
  type AdminProgram,
  type AdminUser,
} from '../api/admin'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const accessDenied = ref(false)

const stats = ref<AdminDashboardStats | null>(null)
const users = ref<AdminUser[]>([])
const programs = ref<AdminProgram[]>([])
const calls = ref<AdminCall[]>([])
const applications = ref<AdminApplication[]>([])

const editingProgramId = ref<string | null>(null)
const editingCallId = ref<string | null>(null)

const selectedMentorByApplication = ref<Record<string, string>>({})

const userSearch = ref('')
const userStatusFilter = ref('')
const userTypeFilter = ref('')

const mentors = computed(() =>
  users.value.filter((user) => user.account_type === 'mentor' && user.status === 'active'),
)

const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const search = userSearch.value.trim().toLowerCase()
    const matchesSearch =
      !search ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)

    const matchesStatus = !userStatusFilter.value || user.status === userStatusFilter.value
    const matchesType = !userTypeFilter.value || user.account_type === userTypeFilter.value

    return matchesSearch && matchesStatus && matchesType
  })
})

const programForm = ref({
  type: 'program_a' as 'program_a' | 'program_b',
  name: '',
  description: '',
  min_team_size: 3,
  max_team_size: 10,
  is_active: true,
})

const callForm = ref({
  program_id: '',
  title: '',
  description: '',
  opens_at: '',
  closes_at: '',
})

function handleLogout() {
  authStore.logout()
  localStorage.removeItem('token')
  router.push('/login')
}

function mentorName(mentor: any) {
  if (!mentor) return '-'
  return `${mentor.first_name} ${mentor.last_name}`
}

function formatDate(value: string) {
  return new Date(value).toLocaleString()
}

function statusClass(status: string) {
  if (status === 'active') return 'status-active'
  if (status === 'pending') return 'status-pending'
  if (status === 'suspended') return 'status-rejected'
  return 'status-default'
}

function formatDateTimeLocal(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

function toApiDate(value: string) {
  return value ? new Date(value).toISOString() : null
}

function resetProgramForm() {
  editingProgramId.value = null
  programForm.value = {
    type: 'program_a',
    name: '',
    description: '',
    min_team_size: 3,
    max_team_size: 10,
    is_active: true,
  }
}

function editProgram(program: AdminProgram) {
  editingProgramId.value = program.id
  programForm.value = {
    type: program.type,
    name: program.name,
    description: program.description ?? '',
    min_team_size: program.min_team_size,
    max_team_size: program.max_team_size,
    is_active: program.is_active,
  }
}

function resetCallForm() {
  editingCallId.value = null
  callForm.value = {
    program_id: '',
    title: '',
    description: '',
    opens_at: '',
    closes_at: '',
  }
}

function editCall(call: AdminCall) {
  editingCallId.value = call.id
  callForm.value = {
    program_id: call.program_id,
    title: call.title,
    description: call.description ?? '',
    opens_at: formatDateTimeLocal(call.opens_at),
    closes_at: formatDateTimeLocal(call.closes_at),
  }
}

function handleApiError(e: any) {
  if (e.response?.status === 403) {
    accessDenied.value = true
    error.value = e.response?.data?.message ?? 'Access denied.'
    return
  }

  if (e.response?.status === 401) {
    authStore.logout()
    localStorage.removeItem('token')
    router.replace('/login')
    return
  }

  error.value = e.response?.data?.message ?? 'Request failed.'
}

async function loadAll() {
  loading.value = true
  error.value = null
  successMessage.value = null
  accessDenied.value = false

  try {
    const [dashboard, allUsers, allPrograms, allCalls, allApplications] = await Promise.all([
      adminApi.getDashboard(),
      adminApi.getUsers(),
      adminApi.getPrograms(),
      adminApi.getCalls(),
      adminApi.getApplications(),
    ])

    stats.value = dashboard
    users.value = allUsers
    programs.value = allPrograms
    calls.value = allCalls
    applications.value = allApplications
  } catch (e: any) {
    handleApiError(e)
  } finally {
    loading.value = false
  }
}

async function approveUser(id: string) {
  error.value = null
  successMessage.value = null
  saving.value = true

  try {
    const response = await adminApi.approveUser(id)

    users.value = users.value.map((user) =>
      user.id === id ? { ...user, status: 'active' } : user,
    )

    successMessage.value = response.message ?? 'User approved successfully.'
    await loadAll()
  } catch (e: any) {
    handleApiError(e)
  } finally {
    saving.value = false
  }
}

async function rejectUser(id: string) {
  error.value = null
  successMessage.value = null
  saving.value = true

  try {
    const response = await adminApi.rejectUser(id)

    users.value = users.value.map((user) =>
      user.id === id ? { ...user, status: 'suspended' } : user,
    )

    successMessage.value = response.message ?? 'User rejected successfully.'
    await loadAll()
  } catch (e: any) {
    handleApiError(e)
  } finally {
    saving.value = false
  }
}

async function submitProgram() {
  error.value = null
  successMessage.value = null
  saving.value = true

  try {
    if (editingProgramId.value) {
      await adminApi.updateProgram(editingProgramId.value, programForm.value)
      successMessage.value = 'Program updated successfully.'
    } else {
      await adminApi.createProgram(programForm.value)
      successMessage.value = 'Program created successfully.'
    }

    resetProgramForm()
    await loadAll()
  } catch (e: any) {
    handleApiError(e)
  } finally {
    saving.value = false
  }
}

async function submitCall() {
  error.value = null
  successMessage.value = null
  saving.value = true

  const payload = {
    program_id: callForm.value.program_id,
    title: callForm.value.title,
    description: callForm.value.description || null,
    opens_at: toApiDate(callForm.value.opens_at),
    closes_at: toApiDate(callForm.value.closes_at),
  }

  try {
    if (editingCallId.value) {
      await adminApi.updateCall(editingCallId.value, payload)
      successMessage.value = 'Call updated successfully.'
    } else {
      await adminApi.createCall(payload)
      successMessage.value = 'Call created successfully.'
    }

    resetCallForm()
    await loadAll()
  } catch (e: any) {
    handleApiError(e)
  } finally {
    saving.value = false
  }
}

async function openCall(id: string) {
  error.value = null
  successMessage.value = null
  saving.value = true

  try {
    await adminApi.openCall(id)
    successMessage.value = 'Call opened successfully.'
    await loadAll()
  } catch (e: any) {
    handleApiError(e)
  } finally {
    saving.value = false
  }
}

async function closeCall(id: string) {
  error.value = null
  successMessage.value = null
  saving.value = true

  try {
    await adminApi.closeCall(id)
    successMessage.value = 'Call closed successfully.'
    await loadAll()
  } catch (e: any) {
    handleApiError(e)
  } finally {
    saving.value = false
  }
}

async function assignMentor(applicationId: string) {
  const mentorId = selectedMentorByApplication.value[applicationId]
  if (!mentorId) return

  error.value = null
  successMessage.value = null
  saving.value = true

  try {
    await adminApi.assignMentor(applicationId, mentorId)
    successMessage.value = 'Mentor assigned successfully.'
    selectedMentorByApplication.value[applicationId] = ''
    await loadAll()
  } catch (e: any) {
    handleApiError(e)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadAll()
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
  margin-bottom: 1.5rem;
}

.card,
.access-card {
  background: white;
  padding: 1.25rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  margin-bottom: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 1rem 1.2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.stat-card h3 {
  margin: 0 0 0.5rem;
  color: #2c3e50;
  font-size: 0.95rem;
}

.stat-card p {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.grid-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.9rem;
}

.form-grid .full {
  grid-column: 1 / -1;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-weight: 600;
  color: #2c3e50;
}

input,
select,
textarea {
  padding: 0.65rem 0.75rem;
  border: 1px solid #d5dbe3;
  border-radius: 8px;
  font: inherit;
}

.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.actions,
.filters {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.filters {
  margin-bottom: 1rem;
}

.btn-save,
.btn-secondary,
.btn-success,
.btn-danger {
  border: none;
  border-radius: 8px;
  padding: 0.65rem 0.95rem;
  cursor: pointer;
  color: white;
}

.btn-save {
  background: #2c3e50;
}

.btn-secondary {
  background: #7f8c8d;
}

.btn-success {
  background: #27ae60;
}

.btn-danger {
  background: #c0392b;
}

.small {
  padding: 0.45rem 0.7rem;
  font-size: 0.9rem;
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
  border-bottom: 1px solid #e6e6e6;
  vertical-align: top;
}

th {
  background: #2c3e50;
  color: white;
}

.action-row,
.assign-cell {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.status-badge {
  display: inline-block;
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-active {
  background: #d4edda;
  color: #1e8449;
}

.status-pending {
  background: #e5e7eb;
  color: #4b5563;
}

.status-rejected {
  background: #fde2e2;
  color: #c0392b;
}

.status-default {
  background: #f3f4f6;
  color: #374151;
}

.error {
  color: #c0392b;
  margin-bottom: 1rem;
}

.success {
  color: #1e8449;
  margin-bottom: 1rem;
}

@media (max-width: 1100px) {
  .stats-grid,
  .grid-two {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>