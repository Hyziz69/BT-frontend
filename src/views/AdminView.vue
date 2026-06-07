<template>
  <AppLayout>
    <div class="admin">
      <div class="page-header">
        <div class="header-content">
          <span class="kicker">Administration</span>
          <h1 class="page-title">Admin Panel</h1>
          <p class="page-subtitle">
            Manage users, programs, calls and mentor assignment from one clean workspace.
          </p>
        </div>

        <div class="header-actions">
          <button class="btn-primary" @click="loadAll" :disabled="loading || saving">
            {{ loading ? 'Refreshing...' : 'Refresh' }}
          </button>
        </div>
      </div>

      <div class="admin-switch">
        <RouterLink to="/admin" class="switch-link active-switch">
          <span>★</span>
          Admin Panel
        </RouterLink>

        <RouterLink to="/admin/activity" class="switch-link">
          <span>◷</span>
          Activity Log
        </RouterLink>

        <RouterLink to="/admin/reports" class="switch-link">
          <span>&#9635;</span>
          Reports
        </RouterLink>
      </div>

      <div v-if="accessDenied" class="empty">
        <div class="empty-icon">⛔</div>
        <h2>403 — Access denied</h2>
        <p>You do not have enough permissions to access this page.</p>
      </div>

      <div v-else-if="loading" class="loading">Loading admin data...</div>

      <template v-else>
        <p v-if="error" class="banner error">{{ error }}</p>
        <p v-if="successMessage" class="banner success">{{ successMessage }}</p>

        <section v-if="stats" class="overview-section">
          <div class="section-heading compact">
            <div>
              <h2>Admin overview</h2>
              <p>Navigation cards move you to sections. Info cards show only platform numbers.</p>
            </div>
          </div>

          <h3 class="overview-group-title">Navigation</h3>

          <div class="stats-grid">
            <button
              v-for="card in navigationCards"
              :key="card.key"
              type="button"
              class="stat-card clickable"
              :class="card.tone"
              @click="scrollToSection(card.target)"
            >
              <div class="stat-top">
                <span class="stat-icon">{{ card.icon }}</span>
                <span class="stat-target">{{ card.targetLabel }}</span>
              </div>

              <h3>{{ card.title }}</h3>
              <p>{{ card.value }}</p>
              <small>{{ card.subtitle }}</small>

              <div class="summary-extra">
                {{ card.info }}
              </div>
            </button>
          </div>

          <h3 class="overview-group-title second">Platform numbers</h3>

          <div class="stats-grid info-grid">
            <div
              v-for="card in infoCards"
              :key="card.key"
              class="stat-card info-only"
              :class="card.tone"
            >
              <div class="stat-top">
                <span class="stat-icon">{{ card.icon }}</span>
                <span class="stat-target muted-target">Overview only</span>
              </div>

              <h3>{{ card.title }}</h3>
              <p>{{ card.value }}</p>
              <small>{{ card.subtitle }}</small>

              <div class="summary-extra">
                {{ card.info }}
              </div>
            </div>
          </div>
        </section>

        <section
          ref="usersSection"
          class="card module-card"
          :class="{ 'section-highlight': activeSection === 'users' }"
        >
          <div class="section-heading">
            <div>
              <h2>User approvals</h2>
              <p>Review registered users and manage access.</p>
            </div>

            <div class="module-counter">
              <strong>{{ filteredUsers.length }}</strong>
              <span>shown</span>
            </div>
          </div>

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

          <div v-if="filteredUsers.length" class="table-wrap">
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
                  <td>
                    <span class="status-badge" :class="statusClass(user.status)">
                      {{ user.status }}
                    </span>
                  </td>
                  <td>{{ formatDate(user.created_at) }}</td>
                  <td>
                    <div class="user-actions">
                      <button
                        v-if="user.status !== 'active'"
                        class="action-pill approve"
                        :disabled="saving"
                        @click="approveUser(user.id)"
                      >
                        Approve
                      </button>

                      <button
                        v-if="user.status !== 'suspended'"
                        class="action-pill reject"
                        :disabled="saving"
                        @click="rejectUser(user.id)"
                      >
                        Reject
                      </button>

                      <button
                        class="action-pill delete"
                        :disabled="saving || isCurrentUser(user)"
                        @click="deleteUser(user)"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p v-else class="muted">No users found.</p>
        </section>

        <section
          ref="programsSection"
          class="card module-card"
          :class="{ 'section-highlight': activeSection === 'programs' }"
        >
          <div class="section-heading">
            <div>
              <h2>Programs</h2>
              <p>Simple list of programs. Create or edit only when needed.</p>
            </div>

            <div class="section-actions">
              <div class="module-counter">
                <strong>{{ programs.length }}</strong>
                <span>programs</span>
              </div>

              <button class="btn-primary" type="button" @click="openProgramCreate">
                Create program
              </button>
            </div>
          </div>

          <div v-if="programFormOpen" class="inline-form-panel">
            <div class="inline-form-header">
              <div>
                <h3>{{ editingProgramId ? 'Edit program' : 'Create program' }}</h3>
                <p>Fill only the program data. You can close this form anytime.</p>
              </div>

              <button class="btn-secondary small" type="button" @click="closeProgramForm">
                Close
              </button>
            </div>

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
                Active program
              </label>
            </div>

            <div class="actions">
              <button class="btn-primary" :disabled="saving" @click="submitProgram">
                {{ editingProgramId ? 'Update program' : 'Create program' }}
              </button>

              <button class="btn-secondary" :disabled="saving" @click="resetProgramForm">
                Reset
              </button>
            </div>
          </div>

          <div v-if="programs.length" class="simple-list">
            <article v-for="program in programs" :key="program.id" class="simple-item">
              <div class="item-main">
                <span class="item-icon">◇</span>
                <div>
                  <h3>{{ program.name }}</h3>
                  <p>{{ program.description || 'No description added.' }}</p>

                  <div class="item-meta">
                    <span>{{ program.type }}</span>
                    <span>{{ program.calls_count ?? 0 }} calls</span>
                    <span>{{ program.min_team_size }}–{{ program.max_team_size }} members</span>
                  </div>
                </div>
              </div>

              <div class="item-actions">
                <span class="status-badge" :class="program.is_active ? 'status-active' : 'status-default'">
                  {{ program.is_active ? 'active' : 'inactive' }}
                </span>

                <button class="btn-secondary small" @click="editProgram(program)">
                  Edit
                </button>
              </div>
            </article>
          </div>

          <p v-else class="muted">No programs found.</p>
        </section>

        <section
          ref="callsSection"
          class="card module-card"
          :class="{ 'section-highlight': activeSection === 'calls' }"
        >
          <div class="section-heading">
            <div>
              <h2>Calls</h2>
              <p>Simple list of calls. Create, edit, open or close a call.</p>
            </div>

            <div class="section-actions">
              <div class="module-counter">
                <strong>{{ calls.length }}</strong>
                <span>calls</span>
              </div>

              <button class="btn-primary" type="button" @click="openCallCreate">
                Create call
              </button>
            </div>
          </div>

          <div v-if="callFormOpen" class="inline-form-panel">
            <div class="inline-form-header">
              <div>
                <h3>{{ editingCallId ? 'Edit call' : 'Create call' }}</h3>
                <p>Choose program, title and dates for this call.</p>
              </div>

              <button class="btn-secondary small" type="button" @click="closeCallForm">
                Close
              </button>
            </div>

            <div class="form-grid">
              <div class="field">
                <label>Program</label>
                <select
                  v-model="callForm.program_id"
                  :class="{ 'is-placeholder': !callForm.program_id }"
                >
                  <option value="" disabled>Select program</option>
                  <option v-for="program in programs" :key="program.id" :value="program.id">
                    {{ program.name }}
                  </option>
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
              <button class="btn-primary" :disabled="saving" @click="submitCall">
                {{ editingCallId ? 'Update call' : 'Create call' }}
              </button>

              <button class="btn-secondary" :disabled="saving" @click="resetCallForm">
                Reset
              </button>
            </div>
          </div>

          <div v-if="calls.length" class="simple-list">
            <article v-for="call in calls" :key="call.id" class="simple-item">
              <div class="item-main">
                <span class="item-icon">◉</span>
                <div>
                  <h3>{{ call.title }}</h3>
                  <p>{{ call.description || 'No description added.' }}</p>

                  <div class="item-meta">
                    <span>{{ call.program?.name ?? 'No program' }}</span>
                    <span>{{ call.applications_count ?? 0 }} applications</span>
                    <span>Opens: {{ call.opens_at ? formatDate(call.opens_at) : '—' }}</span>
                  </div>
                </div>
              </div>

              <div class="item-actions call-actions">
                <span class="status-badge" :class="callStatusClass(call.status)">
                  {{ call.status }}
                </span>

                <button class="btn-secondary small" @click="editCall(call)">
                  Edit
                </button>

                <button
                  class="btn-success small"
                  :disabled="call.status === 'open' || saving"
                  @click="openCall(call.id)"
                >
                  Open
                </button>

                <button
                  class="btn-danger small"
                  :disabled="call.status === 'closed' || saving"
                  @click="closeCall(call.id)"
                >
                  Close
                </button>
              </div>
            </article>
          </div>

          <p v-else class="muted">No calls found.</p>
        </section>

        <section
          ref="applicationsSection"
          class="card module-card"
          :class="{ 'section-highlight': activeSection === 'applications' }"
        >
          <div class="section-heading">
            <div>
              <h2>Applications / Assign mentor</h2>
              <p>Attach active mentors to submitted applications.</p>
            </div>

            <div class="module-counter">
              <strong>{{ applications.length }}</strong>
              <span>applications</span>
            </div>
          </div>

          <div v-if="applications.length" class="table-wrap">
            <table>
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

      <div v-if="deleteModalOpen && userToDelete" class="modal-backdrop" @click.self="closeDeleteModal">
        <div class="delete-modal">
          <div class="modal-icon">!</div>

          <h3>Delete user?</h3>

          <p class="modal-text">
            You are going to permanently delete this account. This action cannot be undone.
            Admins will receive an email notification about this deletion.
          </p>

          <div class="delete-user-box">
            <p><strong>Name:</strong> {{ userToDelete.first_name }} {{ userToDelete.last_name }}</p>
            <p><strong>Email:</strong> {{ userToDelete.email }}</p>
            <p><strong>Type:</strong> {{ userToDelete.account_type }}</p>
            <p><strong>Status:</strong> {{ userToDelete.status }}</p>
          </div>

          <label class="delete-confirm-label">
            Type <strong>delete</strong> to confirm
          </label>

          <input
            v-model="deleteConfirmationText"
            class="delete-confirm-input"
            type="text"
            placeholder="delete"
            autocomplete="off"
          />

          <div class="modal-actions">
            <button class="btn-secondary" :disabled="saving" @click="closeDeleteModal">
              Cancel
            </button>

            <button
              class="btn-danger"
              :disabled="saving || deleteConfirmationText.trim().toLowerCase() !== 'delete'"
              @click="confirmDeleteUser"
            >
              Yes, delete
            </button>
          </div>
        </div>
      </div>
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

type SectionKey = 'users' | 'programs' | 'calls' | 'applications'

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

const usersSection = ref<HTMLElement | null>(null)
const programsSection = ref<HTMLElement | null>(null)
const callsSection = ref<HTMLElement | null>(null)
const applicationsSection = ref<HTMLElement | null>(null)
const activeSection = ref<SectionKey | null>(null)

const editingProgramId = ref<string | null>(null)
const editingCallId = ref<string | null>(null)
const programFormOpen = ref(false)
const callFormOpen = ref(false)

const selectedMentorByApplication = ref<Record<string, string>>({})

const userSearch = ref('')
const userStatusFilter = ref('')
const userTypeFilter = ref('')

const deleteModalOpen = ref(false)
const userToDelete = ref<AdminUser | null>(null)
const deleteConfirmationText = ref('')

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

const navigationCards = computed(() => {
  if (!stats.value) {
    return []
  }

  return [
    {
      key: 'users',
      target: 'users' as SectionKey,
      targetLabel: 'Go to users',
      icon: '◉',
      title: 'Users',
      value: stats.value.pending_users_count,
      subtitle: `${stats.value.users_count} total · pending approvals`,
      info: 'Approve, reject or delete user accounts.',
      tone: 'green',
    },
    {
      key: 'programs',
      target: 'programs' as SectionKey,
      targetLabel: 'Go to programs',
      icon: '◇',
      title: 'Programs',
      value: stats.value.total_programs,
      subtitle: `${stats.value.active_programs} active programs`,
      info: 'Create or edit Program A and Program B settings.',
      tone: 'blue',
    },
    {
      key: 'calls',
      target: 'calls' as SectionKey,
      targetLabel: 'Go to calls',
      icon: '◎',
      title: 'Calls',
      value: stats.value.open_calls,
      subtitle: `${stats.value.total_calls} total calls`,
      info: 'Open, close and schedule calls for programs.',
      tone: 'yellow',
    },
    {
      key: 'applications',
      target: 'applications' as SectionKey,
      targetLabel: 'Go to applications',
      icon: '✦',
      title: 'Applications',
      value: stats.value.total_applications,
      subtitle: `${stats.value.pending_applications} pending`,
      info: 'Check applications and assign mentors.',
      tone: 'purple',
    },
  ]
})

const infoCards = computed(() => {
  if (!stats.value) {
    return []
  }

  return [
    {
      key: 'approved',
      icon: '✓',
      title: 'Approved',
      value: stats.value.approved_applications,
      subtitle: 'approved applications',
      info: 'Shows how many applications were accepted.',
      tone: 'green',
    },
    {
      key: 'rejected',
      icon: '!',
      title: 'Rejected',
      value: stats.value.rejected_applications,
      subtitle: 'rejected applications',
      info: 'Shows how many applications were rejected.',
      tone: 'red',
    },
    {
      key: 'pending',
      icon: '⌁',
      title: 'Pending',
      value: stats.value.pending_applications,
      subtitle: 'waiting for review',
      info: 'Applications still waiting for admin action.',
      tone: 'yellow',
    },
    {
      key: 'mentors',
      icon: '★',
      title: 'Mentors',
      value: stats.value.mentors_count,
      subtitle: 'active mentors',
      info: 'Mentors available for application assignment.',
      tone: 'blue',
    },
  ]
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

function callStatusClass(status: string) {
  if (status === 'open') return 'status-active'
  if (status === 'draft') return 'status-pending'
  if (status === 'closed') return 'status-rejected'
  return 'status-default'
}

function isCurrentUser(user: AdminUser) {
  return authStore.user?.id === user.id
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

function sectionElement(section: SectionKey) {
  const map: Record<SectionKey, HTMLElement | null> = {
    users: usersSection.value,
    programs: programsSection.value,
    calls: callsSection.value,
    applications: applicationsSection.value,
  }

  return map[section]
}

function scrollToSection(section: SectionKey) {
  const element = sectionElement(section)

  if (!element) {
    return
  }

  activeSection.value = section
  element.scrollIntoView({ behavior: 'smooth', block: 'start' })

  window.setTimeout(() => {
    if (activeSection.value === section) {
      activeSection.value = null
    }
  }, 1400)
}

function openProgramCreate() {
  resetProgramForm()
  programFormOpen.value = true
}

function closeProgramForm() {
  resetProgramForm()
  programFormOpen.value = false
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
  programFormOpen.value = true
  programForm.value = {
    type: program.type,
    name: program.name,
    description: program.description ?? '',
    min_team_size: program.min_team_size,
    max_team_size: program.max_team_size,
    is_active: program.is_active,
  }
  scrollToSection('programs')
}

function openCallCreate() {
  resetCallForm()
  callFormOpen.value = true
}

function closeCallForm() {
  resetCallForm()
  callFormOpen.value = false
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
  callFormOpen.value = true
  callForm.value = {
    program_id: call.program_id,
    title: call.title,
    description: call.description ?? '',
    opens_at: formatDateTimeLocal(call.opens_at),
    closes_at: formatDateTimeLocal(call.closes_at),
  }
  scrollToSection('calls')
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
    console.log('All users:', allUsers)
    console.log('Mentors:', mentors.value)
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
    users.value = users.value.map((u) => (u.id === id ? { ...u, status: 'active' } : u))
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
    users.value = users.value.map((u) => (u.id === id ? { ...u, status: 'suspended' } : u))
    successMessage.value = response.message ?? 'User rejected successfully.'
    await loadAll()
  } catch (e: any) {
    handleApiError(e)
  } finally {
    saving.value = false
  }
}

function deleteUser(user: AdminUser) {
  error.value = null
  successMessage.value = null

  if (isCurrentUser(user)) {
    error.value = 'You cannot delete your own admin account.'
    return
  }

  userToDelete.value = user
  deleteConfirmationText.value = ''
  deleteModalOpen.value = true
}

function closeDeleteModal() {
  if (saving.value) {
    return
  }

  deleteModalOpen.value = false
  userToDelete.value = null
  deleteConfirmationText.value = ''
}

async function confirmDeleteUser() {
  if (!userToDelete.value) {
    return
  }

  if (deleteConfirmationText.value.trim().toLowerCase() !== 'delete') {
    error.value = 'Type "delete" to confirm deletion.'
    return
  }

  const deletingUserId = userToDelete.value.id

  saving.value = true
  error.value = null
  successMessage.value = null

  try {
    const response = await adminApi.deleteUser(deletingUserId)

    users.value = users.value.filter((u) => u.id !== deletingUserId)
    successMessage.value = response.message ?? 'User deleted successfully.'

    deleteModalOpen.value = false
    userToDelete.value = null
    deleteConfirmationText.value = ''

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

    closeProgramForm()
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

    closeCallForm()
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
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.admin {
  max-width: 1280px;
  font-family: 'DM Sans', sans-serif;
  color: #0f172a;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 2rem 0 1.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.kicker {
  display: inline-flex;
  background: #ecfdf5;
  color: #047857;
  border-radius: 999px;
  padding: 0.25rem 0.7rem;
  font-size: 0.78rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
}

.page-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
  letter-spacing: -0.04em;
  color: #0f172a;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.95rem;
}

.header-actions,
.section-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.admin-switch {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-bottom: 1.25rem;
}

.switch-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.9rem;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #334155;
  text-decoration: none;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: 0.86rem;
  transition: all 0.15s ease;
}

.switch-link:hover,
.active-switch {
  background: #0f172a;
  border-color: #0f172a;
  color: #6ee7b7;
}

.banner {
  padding: 0.85rem 1rem;
  border-radius: 14px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  border: 1px solid transparent;
}

.banner.error {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}

.banner.success {
  background: #ecfdf5;
  color: #047857;
  border-color: #a7f3d0;
}

.overview-section {
  margin-bottom: 1.5rem;
}

.overview-group-title {
  margin: 0 0 0.7rem;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 800;
  color: #334155;
}

.overview-group-title.second {
  margin-top: 1.25rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.stat-card {
  position: relative;
  overflow: hidden;
  text-align: left;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 1.2rem;
  min-height: 185px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.04);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease,
    background 0.22s ease;
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-card.info-only {
  cursor: default;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: #a7f3d0;
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.1);
  background: #ffffff;
}

.stat-card.info-only:hover {
  transform: translateY(-1px);
}

.stat-card::after {
  content: '';
  position: absolute;
  right: -30px;
  top: -30px;
  width: 95px;
  height: 95px;
  border-radius: 999px;
  background: #ecfdf5;
  opacity: 0.75;
  transition: transform 0.22s ease, opacity 0.22s ease;
}

.stat-card:hover::after {
  transform: scale(1.08);
  opacity: 0.95;
}

.stat-card.blue::after {
  background: #eff6ff;
}

.stat-card.yellow::after {
  background: #fef3c7;
}

.stat-card.purple::after {
  background: #f5f3ff;
}

.stat-card.red::after {
  background: #fee2e2;
}

.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.9rem;
  position: relative;
  z-index: 1;
}

.stat-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #0f172a;
  color: #6ee7b7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
}

.stat-target {
  color: #047857;
  background: #ecfdf5;
  border: 1px solid #bbf7d0;
  border-radius: 999px;
  padding: 0.22rem 0.55rem;
  font-size: 0.7rem;
  font-weight: 900;
  opacity: 0.8;
  transition: opacity 0.18s ease, background 0.18s ease;
}

.stat-card:hover .stat-target {
  opacity: 1;
  background: #d1fae5;
}

.muted-target {
  color: #64748b;
  background: #f8fafc;
  border-color: #e2e8f0;
}

.stat-card:hover .muted-target {
  background: #f8fafc;
}

.stat-card h3 {
  position: relative;
  z-index: 1;
  font-size: 0.74rem;
  font-weight: 800;
  color: #64748b;
  margin: 0 0 0.55rem 0;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.stat-card p {
  position: relative;
  z-index: 1;
  font-family: 'Plus Jakarta Sans', sans-serif;
  margin: 0;
  font-size: 1.85rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.04em;
}

.stat-card small {
  position: relative;
  z-index: 1;
  display: block;
  color: #64748b;
  margin-top: 0.2rem;
  font-size: 0.82rem;
}

.summary-extra {
  position: relative;
  z-index: 1;
  margin-top: 0.75rem;
  color: #334155;
  font-size: 0.82rem;
  line-height: 1.35;
  height: 42px;
  opacity: 0.62;
  transition: opacity 0.18s ease, color 0.18s ease;
}

.stat-card:hover .summary-extra {
  opacity: 1;
  color: #0f172a;
}

.info-grid .stat-card {
  min-height: 165px;
}

.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 1.5rem;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.04);
  margin-bottom: 1.25rem;
  scroll-margin-top: 1.5rem;
}

.module-card {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.module-card:hover {
  border-color: #d1fae5;
  box-shadow: 0 16px 35px rgba(15, 23, 42, 0.06);
}

.module-card.section-highlight {
  border-color: #6ee7b7;
  box-shadow:
    0 0 0 4px rgba(110, 231, 183, 0.18),
    0 16px 35px rgba(15, 23, 42, 0.08);
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-heading.compact {
  margin-bottom: 0.9rem;
}

.section-heading h2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.12rem;
  font-weight: 800;
  margin: 0 0 0.25rem;
  color: #0f172a;
  letter-spacing: -0.03em;
}

.section-heading p {
  margin: 0;
  color: #64748b;
  font-size: 0.88rem;
}

.module-counter {
  min-width: 82px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 0.55rem 0.75rem;
  text-align: center;
}

.module-counter strong {
  display: block;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #0f172a;
  font-size: 1.05rem;
  line-height: 1;
}

.module-counter span {
  display: block;
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 800;
  margin-top: 0.2rem;
}

.inline-form-panel {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.inline-form-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.inline-form-header h3 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
  margin-bottom: 0.2rem;
}

.inline-form-header p {
  margin: 0;
  color: #64748b;
  font-size: 0.84rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.9rem;
}

.field {
  display: flex;
  flex-direction: column;
}

.field.full,
.checkbox.full {
  grid-column: 1 / -1;
}

.field label {
  margin-bottom: 0.4rem;
  font-weight: 700;
  font-size: 0.82rem;
  color: #334155;
}

input,
textarea,
select {
  width: 100%;
  padding: 0.66rem 0.85rem;
  border: 1px solid #dbe3eb;
  border-radius: 12px;
  font-size: 0.92rem;
  font-family: 'DM Sans', sans-serif;
  background: #ffffff;
  color: #0f172a;
  box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
}

select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.25rem;
  cursor: pointer;
}

select.is-placeholder {
  color: #94a3b8;
}

select option {
  color: #0f172a;
}

select option[disabled] {
  color: #94a3b8;
}

.checkbox {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #334155;
  font-weight: 600;
}

.checkbox input {
  width: auto;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-bottom: 1rem;
}

.filters input {
  flex: 1;
  min-width: 220px;
}

.filters select {
  width: auto;
  min-width: 160px;
}

.actions {
  display: flex;
  gap: 0.6rem;
  margin-top: 1.25rem;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary,
.btn-success,
.btn-danger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 0.62rem 1.05rem;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 800;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: opacity 0.15s, background 0.15s, border-color 0.15s, transform 0.15s;
}

.btn-primary {
  background: #0f172a;
  color: white;
}

.btn-secondary {
  background: #f8fafc;
  color: #334155;
  border-color: #e2e8f0;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-danger {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}

.btn-primary:hover:not(:disabled),
.btn-success:hover:not(:disabled),
.btn-danger:hover:not(:disabled),
.btn-secondary:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn-secondary:hover:not(:disabled) {
  background: #f1f5f9;
}

.btn-danger:hover:not(:disabled) {
  background: #fee2e2;
}

.btn-primary:disabled,
.btn-secondary:disabled,
.btn-success:disabled,
.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.small {
  padding: 0.42rem 0.75rem;
  font-size: 0.8rem;
}

.simple-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.simple-item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #edf2f7;
  border-radius: 16px;
  transition: all 0.15s ease;
}

.simple-item:hover {
  background: #ffffff;
  border-color: #bbf7d0;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.item-main {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  min-width: 0;
}

.item-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #0f172a;
  color: #6ee7b7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: 900;
}

.item-main h3 {
  margin: 0 0 0.25rem;
  color: #0f172a;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1rem;
  font-weight: 800;
}

.item-main p {
  color: #64748b;
  margin: 0 0 0.55rem;
  font-size: 0.86rem;
  line-height: 1.4;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.item-meta span {
  background: #ffffff;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 0.22rem 0.55rem;
  font-size: 0.74rem;
  font-weight: 800;
}

.item-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.45rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.call-actions {
  max-width: 280px;
}

.user-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.action-pill {
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0.36rem 0.75rem;
  cursor: pointer;
  font-size: 0.76rem;
  font-weight: 800;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: background 0.15s, border-color 0.15s, color 0.15s, opacity 0.15s, transform 0.15s;
}

.action-pill:hover:not(:disabled) {
  transform: translateY(-1px);
}

.action-pill.approve {
  background: #ecfdf5;
  color: #047857;
  border-color: #a7f3d0;
}

.action-pill.approve:hover:not(:disabled) {
  background: #10b981;
  color: #ffffff;
  border-color: #10b981;
}

.action-pill.reject {
  background: #ffffff;
  color: #475569;
  border-color: #cbd5e1;
}

.action-pill.reject:hover:not(:disabled) {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #94a3b8;
}

.action-pill.delete {
  background: #fffafa;
  color: #b91c1c;
  border-color: #fecaca;
}

.action-pill.delete:hover:not(:disabled) {
  background: #dc2626;
  color: #ffffff;
  border-color: #dc2626;
}

.action-pill:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th,
td {
  text-align: left;
  padding: 0.82rem 1rem;
  border-bottom: 1px solid #eef2f7;
  vertical-align: middle;
}

th {
  background: #f8fafc;
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  border-bottom: 1px solid #e2e8f0;
}

tbody tr {
  transition: background 0.15s;
}

tbody tr:hover {
  background: #fbfdfc;
}

.assign-cell {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  flex-wrap: wrap;
}

.assign-cell select {
  min-width: 160px;
}

.tag {
  display: inline-flex;
  align-items: center;
  background: #f8fafc;
  color: #334155;
  border: 1px solid #e2e8f0;
  padding: 0.2rem 0.58rem;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: capitalize;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.22rem 0.72rem;
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: capitalize;
  border: 1px solid transparent;
}

.status-active {
  background: #ecfdf5;
  color: #047857;
  border-color: #a7f3d0;
}

.status-pending {
  background: #fffbeb;
  color: #b45309;
  border-color: #fde68a;
}

.status-rejected {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}

.status-default {
  background: #f8fafc;
  color: #475569;
  border-color: #e2e8f0;
}

.muted {
  color: #64748b;
  font-size: 0.9rem;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.78rem;
  color: #64748b;
}

.loading {
  color: #64748b;
  padding: 2rem 0;
}

.empty {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.empty h2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.58);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
}

.delete-modal {
  width: 100%;
  max-width: 460px;
  background: #ffffff;
  border-radius: 22px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 25px 70px rgba(15, 23, 42, 0.28);
}

.modal-icon {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 900;
  margin-bottom: 1rem;
}

.delete-modal h3 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.45rem;
}

.modal-text {
  color: #64748b;
  font-size: 0.92rem;
  line-height: 1.55;
  margin: 0 0 1rem;
}

.delete-user-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.delete-user-box p {
  margin: 0 0 0.45rem;
  color: #334155;
  font-size: 0.9rem;
}

.delete-user-box p:last-child {
  margin-bottom: 0;
}

.delete-confirm-label {
  display: block;
  color: #334155;
  font-size: 0.86rem;
  font-weight: 700;
  margin-bottom: 0.45rem;
}

.delete-confirm-input {
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
}

@media (max-width: 1100px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .page-header,
  .section-heading,
  .inline-form-header,
  .simple-item {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions,
  .section-actions,
  .item-actions {
    justify-content: flex-start;
  }

  .user-actions {
    flex-wrap: wrap;
  }
}
</style>