<template>
  <AppLayout>
    <div class="admin-page">
      <header class="hero">
        <div>
          <p class="eyebrow">Administration</p>
          <h1>Admin control center</h1>
          <p>Manage platform users, time chapters, programs, applications and mentor work.</p>
        </div>

        <button class="btn dark" type="button" :disabled="loading" @click="loadAll">
          {{ loading ? 'Refreshing...' : 'Refresh' }}
        </button>
      </header>

      <nav class="admin-tabs">
        <RouterLink to="/admin" class="tab active">
          <span class="tab-icon">&#9733;</span>
          Admin Panel
        </RouterLink>

        <RouterLink to="/admin/activity" class="tab">
          <span class="tab-icon">&#8857;</span>
          Activity Log
        </RouterLink>

        <RouterLink to="/admin/reports" class="tab">
          <span class="tab-icon">&#9635;</span>
          Reports
        </RouterLink>
      </nav>

      <div v-if="accessDenied" class="empty">
        <h2>Access denied</h2>
        <p>You do not have admin permissions.</p>
      </div>

      <div v-else-if="loading" class="loading">
        Loading admin data...
      </div>

      <template v-else>
        <p v-if="error" class="message error">{{ error }}</p>
        <p v-if="successMessage" class="message success">{{ successMessage }}</p>

        <section class="overview-panel">
          <div class="overview-main">
            <span class="overview-icon">&#9678;</span>

            <div>
              <h2>Platform status</h2>
              <p>
                {{ stat('users_count') }} users,
                {{ stat('total_applications') }} applications,
                {{ stat('active_projects_count') }} active projects.
              </p>
            </div>
          </div>

          <div class="overview-note">
            <strong>Active project rule</strong>
            <span>
              A team/person can join another call only when the previous active project does not overlap by time.
            </span>
          </div>
        </section>

        <section class="kpi-grid">
          <button class="kpi-card clickable" type="button" @click="scrollTo('users')">
            <span class="kpi-top">
              <span class="kpi-icon green">&#9679;</span>
              <span>Users</span>
            </span>
            <strong>{{ stat('users_count') }}</strong>
            <small>{{ stat('pending_users_count') }} waiting approval</small>
          </button>

          <button class="kpi-card clickable" type="button" @click="scrollTo('applications')">
            <span class="kpi-top">
              <span class="kpi-icon violet">&#10022;</span>
              <span>Applications</span>
            </span>
            <strong>{{ stat('total_applications') }}</strong>
            <small>{{ stat('applications_waiting_count') }} waiting review</small>
          </button>

          <button class="kpi-card clickable" type="button" @click="scrollTo('calls')">
            <span class="kpi-top">
              <span class="kpi-icon amber">&#8857;</span>
              <span>Calls</span>
            </span>
            <strong>{{ stat('total_calls') }}</strong>
            <small>{{ stat('open_calls') }} currently open</small>
          </button>

          <button class="kpi-card clickable" type="button" @click="scrollTo('mentors')">
            <span class="kpi-top">
              <span class="kpi-icon cyan">&#9733;</span>
              <span>Mentors</span>
            </span>
            <strong>{{ mentors.length }}</strong>
            <small>{{ activeMentors.length }} active mentors</small>
          </button>
        </section>

        <section class="work-grid">
          <button class="work-card" type="button" @click="scrollTo('programs')">
            <div>
              <h3>Programs</h3>
              <p>Program A / Program B settings and team size limits.</p>
            </div>
            <strong>{{ stat('active_programs') }}/{{ stat('total_programs') }}</strong>
          </button>

          <button class="work-card warning" type="button" @click="scrollTo('calls')">
            <div>
              <h3>Time chapters</h3>
              <p>Calls control the time window for applications and project overlap.</p>
            </div>
            <strong>{{ stat('open_calls') }}</strong>
          </button>

          <button class="work-card danger" type="button" @click="scrollTo('applications')">
            <div>
              <h3>Busy teams</h3>
              <p>Teams that should not be assigned to another overlapping project.</p>
            </div>
            <strong>{{ stat('teams_with_active_projects_count') }}</strong>
          </button>

          <div class="work-card done">
            <div>
              <h3>Completed</h3>
              <p>Completed or archived applications do not block future calls.</p>
            </div>
            <strong>{{ stat('completed_applications') }}</strong>
          </div>
        </section>

        <section ref="usersSection" class="panel">
          <div class="section-title">
            <div>
              <h2>Users</h2>
              <p>Approve accounts and manage roles.</p>
            </div>
            <span class="counter">{{ filteredUsers.length }} shown</span>
          </div>

          <div class="filters">
            <input v-model="userSearch" type="text" placeholder="Search user..." />

            <select v-model="userStatusFilter">
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Rejected</option>
            </select>

            <select v-model="userTypeFilter">
              <option value="">All roles</option>
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
              <option value="company_contact">Company</option>
              <option value="evaluator">Evaluator</option>
              <option value="nti_admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="user in filteredUsers" :key="user.id">
                  <td>
                    <strong>{{ user.first_name }} {{ user.last_name }}</strong>
                  </td>

                  <td>{{ user.email }}</td>

                  <td>
                    <select
                      class="small-select"
                      :value="user.account_type"
                      :disabled="saving"
                      @change="handleRoleChange(user, $event)"
                    >
                      <option value="student">Student</option>
                      <option value="mentor">Mentor</option>
                      <option value="company_contact">Company</option>
                      <option value="evaluator">Evaluator</option>
                      <option value="nti_admin">NTI Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                  </td>

                  <td>
                    <span class="badge" :class="statusClass(user.status)">
                      {{ cleanStatus(user.status) }}
                    </span>
                  </td>

                  <td>{{ formatDate(user.created_at) }}</td>

                  <td>
                    <div class="actions">
                      <button
                        v-if="user.status !== 'active'"
                        class="mini approve"
                        type="button"
                        :disabled="saving"
                        @click="approveUser(user.id)"
                      >
                        Approve
                      </button>

                      <button
                        v-if="user.status !== 'suspended'"
                        class="mini reject"
                        type="button"
                        :disabled="saving"
                        @click="rejectUser(user.id)"
                      >
                        Reject
                      </button>

                      <button
                        class="mini delete"
                        type="button"
                        :disabled="saving || user.id === authUserId"
                        @click="deleteUser(user)"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="!filteredUsers.length">
                  <td colspan="6" class="muted">No users found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section ref="mentorsSection" class="panel">
          <div class="section-title">
            <div>
              <h2>Mentors</h2>
              <p>People available for application and project support.</p>
            </div>
            <span class="counter">{{ activeMentors.length }} active</span>
          </div>

          <div class="mentor-grid">
            <div v-for="mentor in mentors" :key="mentor.id" class="mentor-card">
              <div class="mentor-avatar">
                {{ initials(mentor) }}
              </div>

              <div>
                <strong>{{ mentor.first_name }} {{ mentor.last_name }}</strong>
                <span>{{ mentor.email }}</span>
                <span class="badge" :class="statusClass(mentor.status)">
                  {{ cleanStatus(mentor.status) }}
                </span>
              </div>
            </div>

            <p v-if="!mentors.length" class="muted">No mentors found.</p>
          </div>
        </section>

        <section ref="programsSection" class="panel">
          <div class="section-title">
            <div>
              <h2>Programs</h2>
              <p>Create and edit Program A / Program B settings.</p>
            </div>

            <button class="btn dark" type="button" @click="openProgramForm()">
              Create program
            </button>
          </div>

          <div v-if="programFormOpen" class="form-box">
            <h3>{{ editingProgramId ? 'Edit program' : 'Create program' }}</h3>

            <div class="form-grid">
              <label>
                Type
                <select v-model="programForm.type">
                  <option value="program_a">Program A</option>
                  <option value="program_b">Program B</option>
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

              <label class="checkbox full">
                <input v-model="programForm.is_active" type="checkbox" />
                Active program
              </label>
            </div>

            <div class="form-actions">
              <button class="btn dark" type="button" :disabled="saving" @click="saveProgram">
                Save program
              </button>
              <button class="btn light" type="button" @click="closeProgramForm">
                Cancel
              </button>
            </div>
          </div>

          <div class="list">
            <div v-for="program in programs" :key="program.id" class="list-item">
              <div>
                <h3>{{ program.name }}</h3>
                <p>{{ program.description || 'No description' }}</p>

                <div class="chips">
                  <span>{{ cleanStatus(program.type) }}</span>
                  <span>{{ program.min_team_size }}-{{ program.max_team_size }} members</span>
                  <span>{{ program.is_active ? 'active' : 'inactive' }}</span>
                </div>
              </div>

              <div class="actions">
                <button class="mini edit" type="button" @click="openProgramForm(program)">
                  Edit
                </button>
              </div>
            </div>

            <p v-if="!programs.length" class="muted">No programs found.</p>
          </div>
        </section>

        <section ref="callsSection" class="panel">
          <div class="section-title">
            <div>
              <h2>Calls / time chapters</h2>
              <p>Calls define project time windows and active-project overlap rules.</p>
            </div>

            <button class="btn dark" type="button" @click="openCallForm()">
              Create call
            </button>
          </div>

          <div v-if="callFormOpen" class="form-box">
            <h3>{{ editingCallId ? 'Edit call' : 'Create call' }}</h3>

            <div class="form-grid">
              <label>
                Program
                <select v-model="callForm.program_id">
                  <option value="">Choose program</option>
                  <option v-for="program in programs" :key="program.id" :value="program.id">
                    {{ program.name }} / {{ cleanStatus(program.type) }}
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

            <div class="form-actions">
              <button class="btn dark" type="button" :disabled="saving" @click="saveCall">
                Save call
              </button>
              <button class="btn light" type="button" @click="closeCallForm">
                Cancel
              </button>
            </div>
          </div>

          <div class="list">
            <div v-for="call in calls" :key="call.id" class="list-item">
              <div>
                <h3>{{ call.title }}</h3>
                <p>{{ call.description || 'No description' }}</p>

                <div class="chips">
                  <span>{{ call.program?.name || 'Program' }}</span>
                  <span>{{ cleanStatus(call.status) }}</span>
                  <span>{{ formatDate(call.opens_at) }} > {{ formatDate(call.closes_at) }}</span>
                </div>
              </div>

              <div class="actions">
                <button class="mini edit" type="button" @click="openCallForm(call)">
                  Edit
                </button>

                <button
                  v-if="call.status !== 'open'"
                  class="mini approve"
                  type="button"
                  @click="openCall(call.id)"
                >
                  Open
                </button>

                <button
                  v-if="call.status === 'open'"
                  class="mini reject"
                  type="button"
                  @click="closeCall(call.id)"
                >
                  Close
                </button>
              </div>
            </div>

            <p v-if="!calls.length" class="muted">No calls found.</p>
          </div>
        </section>

        <section ref="applicationsSection" class="panel">
          <div class="section-title">
            <div>
              <h2>Applications</h2>
              <p>Review teams, budgets, statuses and mentor assignment.</p>
            </div>
            <span class="counter">{{ filteredApplications.length }} shown</span>
          </div>

          <div class="filters">
            <input v-model="applicationSearch" type="text" placeholder="Search application..." />

            <select v-model="applicationStatusFilter">
              <option value="">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="formally_verified">Formally verified</option>
              <option value="in_evaluation">In evaluation</option>
              <option value="approved">Approved</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div class="table-wrap">
            <table class="applications-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Project / challenge</th>
                  <th>Call</th>
                  <th>Status</th>
                  <th>Budget</th>
                  <th>Mentor</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="application in filteredApplications" :key="application.id">
                  <td class="team-cell">
                    <strong>{{ application.team?.name || 'Team' }}</strong>
                  </td>

                  <td class="project-cell">
                    {{ application.challenge?.title || application.summary || 'Application' }}
                  </td>

                  <td class="call-cell">
                    {{ application.call?.title || 'Call' }}
                  </td>

                  <td>
                    <div class="status-editor">
                      <span class="badge" :class="applicationStatusClass(application.status)">
                        {{ cleanStatus(application.status) }}
                      </span>

                      <div class="status-actions">
                        <select v-model="statusSelects[application.id]" class="small-select status-select">
                          <option value="">Change status</option>
                          <option value="submitted">Submitted</option>
                          <option value="formally_verified">Formally verified</option>
                          <option value="in_evaluation">In evaluation</option>
                          <option value="pending_supplement">Pending supplement</option>
                          <option value="approved">Approved</option>
                          <option value="onboarding">Onboarding</option>
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="completed">Completed</option>
                          <option value="rejected">Rejected</option>
                        </select>

                        <button
                          class="mini edit"
                          type="button"
                          :disabled="saving || !statusSelects[application.id]"
                          @click="changeApplicationStatus(application)"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </td>

                  <td class="budget-cell">
                    {{ formatBudget(application.requested_budget) }}
                  </td>

                  <td>
                    <div class="assign">
                      <select v-model="mentorSelects[application.id]" class="small-select mentor-select">
                        <option value="">Choose mentor</option>
                        <option v-for="mentor in activeMentors" :key="mentor.id" :value="mentor.id">
                          {{ mentor.first_name }} {{ mentor.last_name }}
                        </option>
                      </select>

                      <button
                        class="mini approve"
                        type="button"
                        :disabled="saving || !mentorSelects[application.id]"
                        @click="assignMentor(application)"
                      >
                        Assign
                      </button>
                    </div>

                    <small v-if="currentMentorName(application)" class="current-mentor">
                      Current: {{ currentMentorName(application) }}
                    </small>
                  </td>
                </tr>

                <tr v-if="!filteredApplications.length">
                  <td colspan="6" class="muted">No applications found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import { useAuthStore } from '../stores/auth'
import {
  adminApi,
  type AdminApplication,
  type AdminDashboardStats,
  type AdminUser,
} from '../api/admin'

type ProgramItem = any
type CallItem = any

const authStore = useAuthStore()

const loading = ref(true)
const saving = ref(false)
const accessDenied = ref(false)
const error = ref('')
const successMessage = ref('')

const stats = ref<AdminDashboardStats | null>(null)
const users = ref<AdminUser[]>([])
const programs = ref<ProgramItem[]>([])
const calls = ref<CallItem[]>([])
const applications = ref<AdminApplication[]>([])

const usersSection = ref<HTMLElement | null>(null)
const mentorsSection = ref<HTMLElement | null>(null)
const programsSection = ref<HTMLElement | null>(null)
const callsSection = ref<HTMLElement | null>(null)
const applicationsSection = ref<HTMLElement | null>(null)

const userSearch = ref('')
const userStatusFilter = ref('')
const userTypeFilter = ref('')
const applicationSearch = ref('')
const applicationStatusFilter = ref('')

const programFormOpen = ref(false)
const editingProgramId = ref<string | null>(null)

const callFormOpen = ref(false)
const editingCallId = ref<string | null>(null)

const mentorSelects = reactive<Record<string, string>>({})
const statusSelects = reactive<Record<string, string>>({})

const programForm = reactive({
  type: 'program_a',
  name: '',
  description: '',
  min_team_size: 1,
  max_team_size: 5,
  is_active: true,
})

const callForm = reactive({
  program_id: '',
  title: '',
  description: '',
  opens_at: '',
  closes_at: '',
})

const authUserId = computed(() => authStore.user?.id ?? '')

const mentors = computed(() =>
  users.value.filter((user) => user.account_type === 'mentor'),
)

const activeMentors = computed(() =>
  mentors.value.filter((mentor) => mentor.status === 'active'),
)

const filteredUsers = computed(() => {
  const search = userSearch.value.trim().toLowerCase()

  return users.value.filter((user) => {
    const name = `${user.first_name} ${user.last_name}`.toLowerCase()

    const matchesSearch =
      !search ||
      name.includes(search) ||
      user.email.toLowerCase().includes(search)

    const matchesStatus =
      !userStatusFilter.value || user.status === userStatusFilter.value

    const matchesType =
      !userTypeFilter.value || user.account_type === userTypeFilter.value

    return matchesSearch && matchesStatus && matchesType
  })
})

const filteredApplications = computed(() => {
  const search = applicationSearch.value.trim().toLowerCase()

  return applications.value.filter((application) => {
    const text = [
      application.team?.name,
      application.challenge?.title,
      application.call?.title,
      application.summary,
      application.status,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const matchesSearch = !search || text.includes(search)
    const matchesStatus =
      !applicationStatusFilter.value ||
      application.status === applicationStatusFilter.value

    return matchesSearch && matchesStatus
  })
})

onMounted(() => {
  loadAll()
})

function stat(key: keyof AdminDashboardStats): number {
  return Number(stats.value?.[key] ?? 0)
}

async function loadAll() {
  loading.value = true
  accessDenied.value = false
  error.value = ''
  successMessage.value = ''

  try {
    const [statsResponse, usersResponse, programsResponse, callsResponse, applicationsResponse] =
      await Promise.all([
        adminApi.getDashboard(),
        adminApi.getUsers(),
        adminApi.getPrograms(),
        adminApi.getCalls(),
        adminApi.getApplications(),
      ])

    stats.value = statsResponse
    users.value = usersResponse
    programs.value = programsResponse
    calls.value = callsResponse
    applications.value = applicationsResponse

    for (const application of applications.value) {
      const mentorId =
        application.latest_mentorship?.mentor_id ??
        application.mentorships?.find((mentorship) => !mentorship.ended_at)?.mentor_id ??
        ''

      mentorSelects[application.id] = mentorId
      statusSelects[application.id] = ''
    }
  } catch (e: any) {
    if (e?.response?.status === 403) {
      accessDenied.value = true
    } else {
      error.value = e?.response?.data?.message ?? 'Failed to load admin data.'
    }
  } finally {
    loading.value = false
  }
}

function scrollTo(section: 'users' | 'mentors' | 'programs' | 'calls' | 'applications') {
  const map = {
    users: usersSection,
    mentors: mentorsSection,
    programs: programsSection,
    calls: callsSection,
    applications: applicationsSection,
  }

  map[section].value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

async function approveUser(id: string) {
  await runAction(async () => {
    await adminApi.approveUser(id)
    successMessage.value = 'User approved.'
    await loadAll()
  })
}

async function rejectUser(id: string) {
  await runAction(async () => {
    await adminApi.rejectUser(id)
    successMessage.value = 'User rejected.'
    await loadAll()
  })
}

async function deleteUser(user: AdminUser) {
  const ok = window.confirm(
    `Delete ${user.first_name} ${user.last_name}? This action cannot be undone.`,
  )

  if (!ok) return

  await runAction(async () => {
    await adminApi.deleteUser(user.id)
    successMessage.value = 'User deleted.'
    await loadAll()
  })
}

function handleRoleChange(user: AdminUser, event: Event) {
  const target = event.target as HTMLSelectElement | null

  if (!target) {
    return
  }

  changeRole(user, target.value)
}

async function changeRole(user: AdminUser, accountType: string) {
  if (user.account_type === accountType) return

  const ok = window.confirm(
    `Change role for ${user.first_name} ${user.last_name} to ${accountType}?`,
  )

  if (!ok) {
    await loadAll()
    return
  }

  await runAction(async () => {
    await adminApi.updateUserRole(user.id, accountType)
    successMessage.value = 'User role updated.'
    await loadAll()
  })
}

function openProgramForm(program?: ProgramItem) {
  if (program) {
    editingProgramId.value = program.id
    programForm.type = program.type ?? 'program_a'
    programForm.name = program.name ?? ''
    programForm.description = program.description ?? ''
    programForm.min_team_size = Number(program.min_team_size ?? 1)
    programForm.max_team_size = Number(program.max_team_size ?? 5)
    programForm.is_active = Boolean(program.is_active)
  } else {
    editingProgramId.value = null
    programForm.type = 'program_a'
    programForm.name = ''
    programForm.description = ''
    programForm.min_team_size = 1
    programForm.max_team_size = 5
    programForm.is_active = true
  }

  programFormOpen.value = true
}

function closeProgramForm() {
  programFormOpen.value = false
  editingProgramId.value = null
}

async function saveProgram() {
  await runAction(async () => {
    const payload = {
      type: programForm.type,
      name: programForm.name,
      description: programForm.description,
      min_team_size: programForm.min_team_size,
      max_team_size: programForm.max_team_size,
      is_active: programForm.is_active,
    }

    if (editingProgramId.value) {
      await adminApi.updateProgram(editingProgramId.value, payload)
      successMessage.value = 'Program updated.'
    } else {
      await adminApi.createProgram(payload)
      successMessage.value = 'Program created.'
    }

    closeProgramForm()
    await loadAll()
  })
}

function openCallForm(call?: CallItem) {
  if (call) {
    editingCallId.value = call.id
    callForm.program_id = call.program_id ?? call.program?.id ?? ''
    callForm.title = call.title ?? ''
    callForm.description = call.description ?? ''
    callForm.opens_at = toLocalInput(call.opens_at)
    callForm.closes_at = toLocalInput(call.closes_at)
  } else {
    editingCallId.value = null
    callForm.program_id = ''
    callForm.title = ''
    callForm.description = ''
    callForm.opens_at = ''
    callForm.closes_at = ''
  }

  callFormOpen.value = true
}

function closeCallForm() {
  callFormOpen.value = false
  editingCallId.value = null
}

async function saveCall() {
  await runAction(async () => {
    const payload = {
      program_id: callForm.program_id,
      title: callForm.title,
      description: callForm.description,
      opens_at: callForm.opens_at || null,
      closes_at: callForm.closes_at || null,
    }

    if (editingCallId.value) {
      await adminApi.updateCall(editingCallId.value, payload)
      successMessage.value = 'Call updated.'
    } else {
      await adminApi.createCall(payload)
      successMessage.value = 'Call created.'
    }

    closeCallForm()
    await loadAll()
  })
}

async function openCall(id: string) {
  await runAction(async () => {
    await adminApi.openCall(id)
    successMessage.value = 'Call opened.'
    await loadAll()
  })
}

async function closeCall(id: string) {
  await runAction(async () => {
    await adminApi.closeCall(id)
    successMessage.value = 'Call closed.'
    await loadAll()
  })
}

async function changeApplicationStatus(application: AdminApplication) {
  const status = statusSelects[application.id]

  if (!status || status === application.status) {
    statusSelects[application.id] = ''
    return
  }

  await runAction(async () => {
    await adminApi.updateApplicationStatus(application.id, status)

    successMessage.value = 'Application status updated.'
    await loadAll()
  })
}

async function assignMentor(application: AdminApplication) {
  const mentorId = mentorSelects[application.id]

  if (!mentorId) return

  await runAction(async () => {
    await adminApi.assignMentor(application.id, mentorId)
    successMessage.value = 'Mentor assigned.'
    await loadAll()
  })
}

async function runAction(callback: () => Promise<void>) {
  saving.value = true
  error.value = ''
  successMessage.value = ''

  try {
    await callback()
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Action failed.'
  } finally {
    saving.value = false
  }
}

function currentMentorName(application: AdminApplication): string {
  const active =
    application.latest_mentorship ??
    application.mentorships?.find((mentorship) => !mentorship.ended_at)

  if (!active?.mentor) return ''

  return `${active.mentor.first_name} ${active.mentor.last_name}`.trim()
}

function initials(user: AdminUser): string {
  return `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || 'M'
}

function statusClass(status: string): string {
  if (status === 'active') return 'green'
  if (status === 'pending') return 'amber'
  if (status === 'suspended' || status === 'rejected') return 'red'

  return 'grey'
}

function applicationStatusClass(status: string): string {
  if (['approved', 'active', 'completed'].includes(status)) return 'green'
  if (['submitted', 'formally_verified', 'in_evaluation', 'pending_supplement', 'onboarding', 'paused'].includes(status)) {
    return 'amber'
  }
  if (status === 'rejected') return 'red'

  return 'grey'
}

function cleanStatus(status?: string | null): string {
  if (!status) return '-'

  return status.replace(/_/g, ' ')
}

function formatBudget(value?: string | number | null): string {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  const numberValue = Number(value)

  if (Number.isNaN(numberValue)) {
    return '-'
  }

  return `${numberValue.toLocaleString('sk-SK')} EUR`
}

function formatDate(value?: string | null): string {
  if (!value) return '-'

  return new Date(value).toLocaleDateString('sk-SK')
}

function toLocalInput(value?: string | null): string {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)

  return localDate.toISOString().slice(0, 16)
}
</script>

<style scoped>
.admin-page {
  max-width: 1180px;
}

.hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem 0 1.2rem;
  border-bottom: 1px solid #dbe3eb;
  margin-bottom: 1rem;
}

.hero > .btn {
  flex-shrink: 0;
  align-self: flex-start;
}

.eyebrow {
  display: inline-flex;
  background: #ecfdf5;
  color: #047857;
  border-radius: 999px;
  padding: 0.22rem 0.65rem;
  font-size: 0.74rem;
  font-weight: 800;
  margin-bottom: 0.65rem;
}

.hero h1 {
  margin: 0 0 0.25rem;
  color: #0f1117;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 2rem;
  font-weight: 900;
}

.hero p {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
}

.admin-tabs {
  display: flex;
  gap: 0.65rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  gap: 0.45rem;
  padding: 0.58rem 1rem;
  border-radius: 13px;
  background: #ffffff;
  color: #1f2a44;
  border: 1px solid #dbe3eb;
  font-size: 0.9rem;
  line-height: 1;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
  transition: all 0.15s ease;
}

.tab:hover,
.tab.active {
  background: #0f172a;
  color: #6ee7b7;
  border-color: #0f172a;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.1);
}

.tab-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  min-width: 16px;
  font-size: 0.82rem;
  line-height: 1;
}

.overview-panel,
.panel {
  background: #ffffff;
  border: 1px solid #dbe3eb;
  border-radius: 22px;
  padding: 1.25rem;
  margin-bottom: 1.3rem;
  box-shadow: 0 14px 35px rgba(15, 23, 42, 0.05);
}

.overview-panel {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  background:
    radial-gradient(circle at top right, rgba(110, 231, 183, 0.18), transparent 32%),
    #ffffff;
}

.overview-main {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.overview-icon {
  width: 54px;
  height: 54px;
  border-radius: 17px;
  background: #0f172a;
  color: #6ee7b7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
}

.overview-main h2 {
  margin: 0 0 0.25rem;
  font-size: 1.25rem;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.overview-main p,
.overview-note span {
  margin: 0;
  color: #64748b;
}

.overview-note {
  max-width: 380px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 0.9rem 1rem;
}

.overview-note strong {
  display: block;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.kpi-grid,
.work-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.3rem;
}

.kpi-grid {
  grid-template-columns: repeat(4, 1fr);
}

.work-grid {
  grid-template-columns: repeat(4, 1fr);
}

.kpi-card,
.work-card {
  background: #ffffff;
  border: 1px solid #dbe3eb;
  border-radius: 20px;
  padding: 1rem;
  text-align: left;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

.kpi-card {
  position: relative;
  overflow: hidden;
  min-height: 155px;
}

.kpi-card::after {
  content: "";
  position: absolute;
  top: -34px;
  right: -34px;
  width: 105px;
  height: 105px;
  border-radius: 999px;
  opacity: 0.18;
  pointer-events: none;
}

.kpi-card:nth-child(1)::after {
  background: #10b981;
}

.kpi-card:nth-child(2)::after {
  background: #8b5cf6;
}

.kpi-card:nth-child(3)::after {
  background: #f59e0b;
}

.kpi-card:nth-child(4)::after {
  background: #06b6d4;
}

.kpi-card.clickable,
.work-card {
  cursor: pointer;
  transition: all 0.15s ease;
}

.kpi-card.clickable:hover,
.work-card:hover {
  transform: translateY(-2px);
  border-color: #6ee7b7;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
}

.kpi-card:focus,
.kpi-card:focus-visible,
.work-card:focus,
.work-card:focus-visible {
  outline: none;
  border-color: #6ee7b7;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.kpi-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.kpi-icon {
  width: 34px;
  height: 34px;
  border-radius: 11px;
  background: #0f172a;
  color: #6ee7b7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-icon,
.kpi-top,
.kpi-card strong,
.kpi-card small {
  position: relative;
  z-index: 1;
}

.kpi-card strong,
.work-card strong {
  display: block;
  margin-top: 1rem;
  color: #0f172a;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 2rem;
  font-weight: 900;
}

.kpi-card small {
  display: block;
  margin-top: 0.2rem;
  color: #3b5d88;
}

.work-card {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  min-height: 130px;
}

.work-card h3 {
  margin: 0 0 0.35rem;
  color: #0f172a;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.work-card p {
  margin: 0;
  color: #64748b;
  line-height: 1.45;
  font-size: 0.9rem;
}

.work-card.warning {
  background: #fffbeb;
}

.work-card.danger {
  background: #fef2f2;
}

.work-card.done {
  background: #ecfdf5;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-title h2 {
  margin: 0 0 0.25rem;
  color: #0f172a;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.15rem;
  font-weight: 900;
}

.section-title p {
  margin: 0;
  color: #64748b;
}

.counter {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 800;
}

.filters {
  display: flex;
  gap: 0.7rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.filters input {
  flex: 1;
  min-width: 230px;
}

input,
textarea,
select {
  width: 100%;
  padding: 0.68rem 0.85rem;
  border: 1px solid #dbe3eb;
  border-radius: 12px;
  background: #ffffff;
  color: #0f172a;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.92rem;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
}

.small-select {
  min-width: 150px;
  padding: 0.45rem 0.65rem;
  font-size: 0.82rem;
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
  padding: 0.85rem 0.9rem;
  border-bottom: 1px solid #eef2f7;
  text-align: left;
  vertical-align: middle;
}

th {
  background: #f8fafc;
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.applications-table {
  min-width: 1100px;
}

.team-cell {
  min-width: 130px;
}

.project-cell {
  min-width: 160px;
}

.call-cell {
  min-width: 150px;
}

.budget-cell {
  min-width: 120px;
  white-space: nowrap;
  color: #0f172a;
  font-weight: 800;
}

.badge {
  display: inline-flex;
  border-radius: 999px;
  padding: 0.24rem 0.68rem;
  border: 1px solid transparent;
  font-size: 0.76rem;
  font-weight: 900;
  text-transform: capitalize;
}

.badge.green {
  background: #ecfdf5;
  color: #047857;
  border-color: #a7f3d0;
}

.badge.amber {
  background: #fffbeb;
  color: #b45309;
  border-color: #fde68a;
}

.badge.red {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}

.badge.grey {
  background: #f8fafc;
  color: #475569;
  border-color: #e2e8f0;
}

.actions,
.assign {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
  align-items: center;
}

.status-editor {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  min-width: 190px;
}

.status-actions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: nowrap;
}

.status-select {
  min-width: 155px;
}

.mentor-select {
  min-width: 170px;
}

.current-mentor {
  display: block;
  margin-top: 0.35rem;
  color: #64748b;
  font-size: 0.78rem;
}

.btn,
.mini {
  border: 1px solid transparent;
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  transition: all 0.15s ease;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  width: auto;
  border-radius: 13px;
  padding: 0.58rem 1rem;
  font-size: 0.9rem;
  line-height: 1;
  white-space: nowrap;
}

.btn.dark {
  background: #0f172a;
  color: #ffffff;
}

.btn.light {
  background: #f8fafc;
  color: #334155;
  border-color: #e2e8f0;
}

.mini {
  border-radius: 999px;
  padding: 0.38rem 0.75rem;
  font-size: 0.75rem;
}

.mini.approve {
  background: #ecfdf5;
  color: #047857;
  border-color: #a7f3d0;
}

.mini.reject {
  background: #fffbeb;
  color: #b45309;
  border-color: #fde68a;
}

.mini.delete {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}

.mini.edit {
  background: #f8fafc;
  color: #334155;
  border-color: #e2e8f0;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mentor-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: 0.8rem;
}

.mentor-card {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1rem;
}

.mentor-avatar {
  width: 42px;
  height: 42px;
  border-radius: 13px;
  background: #0f172a;
  color: #6ee7b7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
}

.mentor-card strong,
.mentor-card span {
  display: block;
}

.mentor-card strong {
  color: #0f172a;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.mentor-card span {
  color: #64748b;
  font-size: 0.86rem;
  margin-top: 0.15rem;
}

.form-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.form-box h3 {
  margin: 0 0 0.85rem;
  color: #0f172a;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}

.form-grid label {
  color: #334155;
  font-size: 0.82rem;
  font-weight: 800;
}

.form-grid input,
.form-grid textarea,
.form-grid select {
  margin-top: 0.35rem;
}

.full {
  grid-column: 1 / -1;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox input {
  width: auto;
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 0.6rem;
  margin-top: 1rem;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.list-item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 1rem;
}

.list-item h3 {
  margin: 0 0 0.25rem;
  color: #0f172a;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.list-item p {
  margin: 0 0 0.55rem;
  color: #64748b;
}

.chips {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.chips span {
  background: #ffffff;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 0.22rem 0.58rem;
  font-size: 0.74rem;
  font-weight: 800;
}

.message {
  border-radius: 14px;
  padding: 0.85rem 1rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.message.error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.message.success {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.loading,
.empty,
.muted {
  color: #64748b;
}

.loading,
.empty {
  padding: 2rem;
}

@media (max-width: 1100px) {
  .kpi-grid,
  .work-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .mentor-grid {
    grid-template-columns: 1fr 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .overview-panel,
  .section-title,
  .list-item {
    flex-direction: column;
    align-items: stretch;
  }

  .hero {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 700px) {
  .kpi-grid,
  .work-grid,
  .mentor-grid {
    grid-template-columns: 1fr;
  }
}
</style>