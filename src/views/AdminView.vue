<template>
  <AppLayout>
    <div class="admin">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Admin Panel</h1>
          <p class="page-subtitle">User approvals, calls, programs, mentor assignment and reporting.</p>
        </div>
        <button class="btn-secondary" @click="loadAll" :disabled="loading || saving">Refresh</button>
      </div>

      <!-- Access denied -->
      <div v-if="accessDenied" class="empty">
        <div class="empty-icon">⛔</div>
        <h2>403 — Access denied</h2>
        <p>You do not have enough permissions to access this page.</p>
      </div>

      <div v-else-if="loading" class="loading">Loading admin data...</div>

      <template v-else>
        <p v-if="error" class="banner error">{{ error }}</p>
        <p v-if="successMessage" class="banner success">{{ successMessage }}</p>

        <!-- Stats -->
        <section v-if="stats" class="stats-grid">
          <div class="stat-card"><h3>Total applications</h3><p>{{ stats.total_applications }}</p></div>
          <div class="stat-card"><h3>Approved</h3><p>{{ stats.approved_applications }}</p></div>
          <div class="stat-card"><h3>Rejected</h3><p>{{ stats.rejected_applications }}</p></div>
          <div class="stat-card"><h3>Pending applications</h3><p>{{ stats.pending_applications }}</p></div>
          <div class="stat-card"><h3>Open calls</h3><p>{{ stats.open_calls }}</p></div>
          <div class="stat-card"><h3>Programs</h3><p>{{ stats.total_programs }}</p></div>
          <div class="stat-card"><h3>Mentors</h3><p>{{ stats.mentors_count }}</p></div>
          <div class="stat-card"><h3>Pending users</h3><p>{{ stats.pending_users_count }}</p></div>
        </section>

        <!-- User approvals -->
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
          </div>

          <div class="table-wrap" v-if="filteredUsers.length">
            <table>
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
                  <td><span class="tag">{{ user.account_type }}</span></td>
                  <td><span class="status-badge" :class="statusClass(user.status)">{{ user.status }}</span></td>
                  <td>{{ formatDate(user.created_at) }}</td>
                  <td class="action-row">
                    <button class="btn-success small" @click="approveUser(user.id)" :disabled="saving || user.status === 'active'">Approve</button>
                    <button class="btn-danger small" @click="rejectUser(user.id)" :disabled="saving || user.status === 'suspended'">Reject</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="muted">No users found.</p>
        </section>

        <!-- Programs -->
        <section class="grid-two">
          <div class="card">
            <h2>{{ editingProgramId ? 'Edit program' : 'Create program' }}</h2>

            <div class="form-grid">
              <div class="field">
                <label>Type</label>
                <select v-model="programForm.type">
                  <option value="program_a">program_a</option>
                  <option value="program_b">program_b</option>
                </select>
              </div>
              <div class="field">
                <label>Name</label>
                <input v-model="programForm.name" type="text" placeholder="Program name" />
              </div>
              <div class="field">
                <label>Min team size</label>
                <input v-model.number="programForm.min_team_size" type="number" min="1" />
              </div>
              <div class="field">
                <label>Max team size</label>
                <input v-model.number="programForm.max_team_size" type="number" min="1" />
              </div>
              <div class="field full">
                <label>Description</label>
                <textarea v-model="programForm.description" rows="3" />
              </div>
              <label class="checkbox full">
                <input v-model="programForm.is_active" type="checkbox" />
                Active
              </label>
            </div>

            <div class="actions">
              <button class="btn-primary" @click="submitProgram" :disabled="saving">
                {{ editingProgramId ? 'Update program' : 'Create program' }}
              </button>
              <button class="btn-secondary" @click="resetProgramForm" :disabled="saving">Reset</button>
            </div>
          </div>

          <div class="card">
            <h2>Programs</h2>
            <div class="table-wrap" v-if="programs.length">
              <table>
                <thead>
                  <tr><th>Name</th><th>Type</th><th>Active</th><th>Calls</th><th></th></tr>
                </thead>
                <tbody>
                  <tr v-for="program in programs" :key="program.id">
                    <td>{{ program.name }}</td>
                    <td><span class="tag">{{ program.type }}</span></td>
                    <td>{{ program.is_active ? 'yes' : 'no' }}</td>
                    <td>{{ program.calls_count ?? 0 }}</td>
                    <td><button class="btn-secondary small" @click="editProgram(program)">Edit</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="muted">No programs found.</p>
          </div>
        </section>

        <!-- Calls -->
        <section class="grid-two">
          <div class="card">
            <h2>{{ editingCallId ? 'Edit call' : 'Create call' }}</h2>

            <div class="form-grid">
              <div class="field">
                <label>Program</label>
                <select
                  v-model="callForm.program_id"
                  :class="{ 'is-placeholder': !callForm.program_id }"
                >
                  <option value="" disabled>Select program</option>
                  <option v-for="program in programs" :key="program.id" :value="program.id">{{ program.name }}</option>
                </select>
              </div>
              <div class="field">
                <label>Title</label>
                <input v-model="callForm.title" type="text" placeholder="Call title" />
              </div>
              <div class="field">
                <label>Opens at</label>
                <input v-model="callForm.opens_at" type="datetime-local" />
              </div>
              <div class="field">
                <label>Closes at</label>
                <input v-model="callForm.closes_at" type="datetime-local" />
              </div>
              <div class="field full">
                <label>Description</label>
                <textarea v-model="callForm.description" rows="3" />
              </div>
            </div>

            <div class="actions">
              <button class="btn-primary" @click="submitCall" :disabled="saving">
                {{ editingCallId ? 'Update call' : 'Create call' }}
              </button>
              <button class="btn-secondary" @click="resetCallForm" :disabled="saving">Reset</button>
            </div>
          </div>

          <div class="card">
            <h2>Calls</h2>
            <div class="table-wrap" v-if="calls.length">
              <table>
                <thead>
                  <tr><th>Title</th><th>Program</th><th>Status</th><th>Apps</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  <tr v-for="call in calls" :key="call.id">
                    <td>{{ call.title }}</td>
                    <td>{{ call.program?.name }}</td>
                    <td><span class="tag">{{ call.status }}</span></td>
                    <td>{{ call.applications_count ?? 0 }}</td>
                    <td class="action-row">
                      <button class="btn-secondary small" @click="editCall(call)">Edit</button>
                      <button class="btn-success small" @click="openCall(call.id)" :disabled="call.status === 'open'">Open</button>
                      <button class="btn-danger small" @click="closeCall(call.id)" :disabled="call.status === 'closed'">Close</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="muted">No calls found.</p>
          </div>
        </section>

        <!-- Applications -->
        <section class="card">
          <h2>Applications / Assign mentor</h2>
          <div class="table-wrap" v-if="applications.length">
            <table>
              <thead>
                <tr><th>Application</th><th>Team</th><th>Call</th><th>Status</th><th>Current mentors</th><th>Assign mentor</th></tr>
              </thead>
              <tbody>
                <tr v-for="application in applications" :key="application.id">
                  <td><span class="mono">{{ application.id }}</span></td>
                  <td>{{ application.team?.name ?? '-' }}</td>
                  <td>{{ application.call?.title ?? '-' }}</td>
                  <td><span class="tag">{{ application.status }}</span></td>
                  <td>
                    <span v-if="application.mentorships?.length">
                      {{ application.mentorships.map((m) => mentorName(m.mentor)).join(', ') }}
                    </span>
                    <span v-else class="muted">-</span>
                  </td>
                  <td class="assign-cell">
                    <select
                      v-model="selectedMentorByApplication[application.id]"
                      :class="{ 'is-placeholder': !selectedMentorByApplication[application.id] }"
                    >
                      <option value="" disabled>Select mentor</option>
                      <option v-for="mentor in mentors" :key="mentor.id" :value="mentor.id">
                        {{ mentor.first_name }} {{ mentor.last_name }}
                      </option>
                    </select>
                    <button
                      class="btn-primary small"
                      :disabled="!selectedMentorByApplication[application.id] || saving"
                      @click="assignMentor(application.id)"
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="muted">No applications found.</p>
        </section>
      </template>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  adminApi,
  type AdminApplication,
  type AdminCall,
  type AdminDashboardStats,
  type AdminProgram,
  type AdminUser,
} from '../api/admin'
import { useAuthStore } from '../stores/auth'
import AppLayout from '../components/AppLayout.vue'

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
  error.value = null; successMessage.value = null; saving.value = true
  try {
    const response = await adminApi.approveUser(id)
    users.value = users.value.map((u) => (u.id === id ? { ...u, status: 'active' } : u))
    successMessage.value = response.message ?? 'User approved successfully.'
    await loadAll()
  } catch (e: any) { handleApiError(e) } finally { saving.value = false }
}

async function rejectUser(id: string) {
  error.value = null; successMessage.value = null; saving.value = true
  try {
    const response = await adminApi.rejectUser(id)
    users.value = users.value.map((u) => (u.id === id ? { ...u, status: 'suspended' } : u))
    successMessage.value = response.message ?? 'User rejected successfully.'
    await loadAll()
  } catch (e: any) { handleApiError(e) } finally { saving.value = false }
}

async function submitProgram() {
  error.value = null; successMessage.value = null; saving.value = true
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
  } catch (e: any) { handleApiError(e) } finally { saving.value = false }
}

async function submitCall() {
  error.value = null; successMessage.value = null; saving.value = true
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
  } catch (e: any) { handleApiError(e) } finally { saving.value = false }
}

async function openCall(id: string) {
  error.value = null; successMessage.value = null; saving.value = true
  try { await adminApi.openCall(id); successMessage.value = 'Call opened successfully.'; await loadAll() }
  catch (e: any) { handleApiError(e) } finally { saving.value = false }
}

async function closeCall(id: string) {
  error.value = null; successMessage.value = null; saving.value = true
  try { await adminApi.closeCall(id); successMessage.value = 'Call closed successfully.'; await loadAll() }
  catch (e: any) { handleApiError(e) } finally { saving.value = false }
}

async function assignMentor(applicationId: string) {
  const mentorId = selectedMentorByApplication.value[applicationId]
  if (!mentorId) return
  error.value = null; successMessage.value = null; saving.value = true
  try {
    await adminApi.assignMentor(applicationId, mentorId)
    successMessage.value = 'Mentor assigned successfully.'
    selectedMentorByApplication.value[applicationId] = ''
    await loadAll()
  } catch (e: any) { handleApiError(e) } finally { saving.value = false }
}

onMounted(async () => { await loadAll() })
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.admin { max-width: 1280px; font-family: 'DM Sans', sans-serif; color: #0f1117; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding: 2rem 0 1.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}
.page-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}
.page-subtitle { color: #8892a4; font-size: 0.95rem; }

.banner {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}
.banner.error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
.banner.success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.stat-card h3 {
  font-size: 0.8rem;
  font-weight: 500;
  color: #8892a4;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.stat-card p {
  font-family: 'Plus Jakarta Sans', sans-serif;
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f1117;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  margin-bottom: 1.25rem;
}
.card h2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.grid-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.9rem;
}
.field { display: flex; flex-direction: column; }
.field.full, .checkbox.full { grid-column: 1 / -1; }
.field label {
  margin-bottom: 0.4rem;
  font-weight: 600;
  font-size: 0.85rem;
  color: #374151;
}

input, textarea, select {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.92rem;
  font-family: 'DM Sans', sans-serif;
  background: #fff;
  color: #0f1117;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: #6ee7b7;
}

/* Custom dropdown */
select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238892a4' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.25rem;
  cursor: pointer;
}

/* Greys placeholder text in selects when nothing is chosen */
select.is-placeholder { color: #8892a4; }
select option { color: #0f1117; }
select option[disabled] { color: #8892a4; }

.checkbox {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #374151;
  font-weight: 500;
}
.checkbox input { width: auto; }

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1rem;
}
.filters input { flex: 1; min-width: 220px; }
.filters select { width: auto; min-width: 160px; }

.actions {
  display: flex;
  gap: 0.6rem;
  margin-top: 1.25rem;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary, .btn-success, .btn-danger {
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.1rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: opacity 0.15s, background 0.15s;
}
.btn-primary { background: #0f1117; color: white; }
.btn-secondary { background: #f3f4f6; color: #374151; }
.btn-success { background: #16a34a; color: white; }
.btn-danger { background: #dc2626; color: white; }
.btn-primary:hover:not(:disabled),
.btn-success:hover:not(:disabled),
.btn-danger:hover:not(:disabled) { opacity: 0.88; }
.btn-secondary:hover:not(:disabled) { background: #e5e7eb; }
.btn-primary:disabled, .btn-secondary:disabled,
.btn-success:disabled, .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
.small { padding: 0.4rem 0.75rem; font-size: 0.82rem; }

.table-wrap { overflow-x: auto; }
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
th, td {
  text-align: left;
  padding: 0.75rem 0.85rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}
th {
  background: #fafafa;
  color: #8892a4;
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid #e5e7eb;
}
tbody tr:hover { background: #fafbfc; }

.action-row, .assign-cell {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  flex-wrap: wrap;
}
.assign-cell select { min-width: 160px; }

.tag {
  background: #eff6ff;
  color: #2563eb;
  padding: 0.18rem 0.55rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge {
  display: inline-block;
  border-radius: 999px;
  padding: 0.2rem 0.7rem;
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: capitalize;
}
.status-active { background: #f0fdf4; color: #16a34a; }
.status-pending { background: #fef3c7; color: #b45309; }
.status-rejected { background: #fef2f2; color: #dc2626; }
.status-default { background: #f3f4f6; color: #6b7280; }

.muted { color: #8892a4; font-size: 0.9rem; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.78rem; color: #6b7280; }
.loading { color: #8892a4; padding: 2rem 0; }

.empty { text-align: center; padding: 4rem 2rem; color: #8892a4; }
.empty-icon { font-size: 2.5rem; margin-bottom: 1rem; }
.empty h2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #0f1117;
  margin-bottom: 0.5rem;
}

@media (max-width: 1100px) {
  .grid-two, .form-grid { grid-template-columns: 1fr; }
}
</style>