<template>
  <AppLayout>
    <div class="dashboard">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Good to see you, {{ authStore.user?.first_name }} 👋</h1>
          <p class="page-subtitle">{{ subtitle }}</p>
        </div>
        <div class="account-badge"><span>{{ roleLabel }}</span></div>
      </div>

      <div v-if="loading" class="loading-block">Loading your dashboard…</div>

      <!-- ============ STUDENT ============ -->
      <template v-else-if="isStudent">
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-icon">◈</span>
            <div class="stat-info">
              <span class="stat-label">My Team</span>
              <span class="stat-value">{{ teamsStore.teams[0]?.name ?? 'No team yet' }}</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">◎</span>
            <div class="stat-info">
              <span class="stat-label">My Applications</span>
              <span class="stat-value">{{ myApps.length }}</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">◆</span>
            <div class="stat-info">
              <span class="stat-label">Open Challenges</span>
              <span class="stat-value">{{ openChallenges.length }}</span>
            </div>
          </div>
        </div>

        <!-- My applications -->
        <div class="section-row">
          <div class="section-title">My applications</div>
          <RouterLink to="/challenges" class="see-all">View all →</RouterLink>
        </div>
        <div v-if="myApps.length" class="card-list">
          <component
            :is="isActiveApp(app.status) ? 'RouterLink' : 'div'"
            v-for="app in myApps.slice(0, 4)"
            :key="app.id"
            :to="isActiveApp(app.status) ? `/projects/${app.id}` : undefined"
            class="row-card"
            :class="{ link: isActiveApp(app.status) }"
          >
            <div class="row-main">
              <strong>{{ app.challenge?.title ?? 'Challenge' }}</strong>
              <span class="muted">{{ app.challenge?.company?.name ?? '' }}</span>
            </div>
            <span class="pill" :class="appStatusClass(app.status)">{{ appStatusLabel(app.status) }}</span>
          </component>
        </div>
        <RouterLink v-else to="/challenges" class="empty-cta">
          You haven't applied yet — browse open challenges →
        </RouterLink>

        <!-- Open challenges -->
        <template v-if="openChallenges.length">
          <div class="section-row">
            <div class="section-title">Open challenges</div>
            <RouterLink to="/challenges" class="see-all">View all →</RouterLink>
          </div>
          <div class="card-list">
            <RouterLink
              v-for="ch in openChallenges.slice(0, 3)"
              :key="ch.id"
              :to="`/challenges/${ch.id}`"
              class="row-card link"
            >
              <div class="row-main">
                <strong>{{ ch.title }}</strong>
                <span class="muted">{{ ch.budget ? formatBudget(ch.budget) + ' €' : 'Budget n/a' }}</span>
              </div>
              <span class="row-arrow">→</span>
            </RouterLink>
          </div>
        </template>
      </template>

      <!-- ============ COMPANY ============ -->
      <template v-else-if="isCompany">
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-icon">◆</span>
            <div class="stat-info">
              <span class="stat-label">Challenges</span>
              <span class="stat-value">{{ myChallenges.length }}</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">◉</span>
            <div class="stat-info">
              <span class="stat-label">Awaiting decision</span>
              <span class="stat-value">{{ needsDecision.length }}</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">◎</span>
            <div class="stat-info">
              <span class="stat-label">Candidates waiting</span>
              <span class="stat-value">{{ candidatesWaiting }}</span>
            </div>
          </div>
        </div>

        <!-- Needs decision -->
        <template v-if="needsDecision.length">
          <div class="section-row">
            <div class="section-title">Needs your decision</div>
            <RouterLink to="/company" class="see-all">Manage →</RouterLink>
          </div>
          <div class="card-list">
            <RouterLink
              v-for="ch in needsDecision"
              :key="ch.id"
              :to="`/challenges/${ch.id}`"
              class="row-card link attention"
            >
              <div class="row-main">
                <strong>{{ ch.title }}</strong>
                <span class="muted">{{ ch.candidates_count }} candidate team(s) waiting</span>
              </div>
              <span class="pill amber">Choose team</span>
            </RouterLink>
          </div>
        </template>

        <!-- All challenges -->
        <div class="section-row">
          <div class="section-title">My challenges</div>
          <RouterLink to="/company" class="see-all">Manage →</RouterLink>
        </div>
        <div v-if="myChallenges.length" class="card-list">
          <RouterLink
            v-for="ch in myChallenges.slice(0, 6)"
            :key="ch.id"
            :to="`/challenges/${ch.id}`"
            class="row-card link"
          >
            <div class="row-main">
              <strong>{{ ch.title }}</strong>
              <span class="muted">{{ ch.candidates_count ?? 0 }} candidates</span>
            </div>
            <span class="pill" :class="chStatusClass(ch.status)">{{ chStatusLabel(ch.status) }}</span>
          </RouterLink>
        </div>
        <RouterLink v-else to="/company" class="empty-cta">
          No challenges yet — create your first →
        </RouterLink>
      </template>

      <!-- ============ MENTOR ============ -->
      <template v-else-if="isMentor">
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-icon">🧑‍🏫</span>
            <div class="stat-info">
              <span class="stat-label">My Mentees</span>
              <span class="stat-value">{{ myMentorships.length }}</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">◉</span>
            <div class="stat-info">
              <span class="stat-label">Active</span>
              <span class="stat-value">{{ activeMentees }}</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">◎</span>
            <div class="stat-info">
              <span class="stat-label">Consultations</span>
              <span class="stat-value">{{ totalConsultations }}</span>
            </div>
          </div>
        </div>

        <div class="section-row">
          <div class="section-title">My mentees</div>
          <RouterLink to="/mentees" class="see-all">View all →</RouterLink>
        </div>
        <div v-if="myMentorships.length" class="card-list">
          <RouterLink
            v-for="m in myMentorships.slice(0, 5)"
            :key="m.id"
            :to="`/mentorships/${m.id}`"
            class="row-card link"
          >
            <div class="row-main">
              <strong>{{ m.application?.team?.name ?? 'Team' }}</strong>
              <span class="muted">{{ menteeProject(m) }}</span>
            </div>
            <span class="pill" :class="m.ended_at ? 'grey' : 'green'">{{ m.ended_at ? 'Ended' : 'Active' }}</span>
          </RouterLink>
        </div>
        <div v-else class="empty-cta static">
          No mentees yet — they'll appear here once an admin assigns you to a project.
        </div>
      </template>

      <!-- ============ ADMIN ============ -->
      <template v-else>
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-icon">◉</span>
            <div class="stat-info">
              <span class="stat-label">Pending Users</span>
              <span class="stat-value">{{ adminStats?.pending_users_count ?? 0 }}</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">◎</span>
            <div class="stat-info">
              <span class="stat-label">Applications</span>
              <span class="stat-value">{{ adminStats?.total_applications ?? 0 }}</span>
            </div>
          </div>
          <div class="stat-card">
            <span class="stat-icon">✦</span>
            <div class="stat-info">
              <span class="stat-label">Open Calls</span>
              <span class="stat-value">{{ adminStats?.open_calls ?? 0 }}</span>
            </div>
          </div>
        </div>

        <div class="section-title">Quick actions</div>
        <div class="quick-links">
          <RouterLink to="/admin" class="quick-card">
            <div class="quick-icon admin">⚙</div>
            <div class="quick-info">
              <h3>Admin Panel</h3>
              <p>Manage users, approvals, calls and programs</p>
            </div>
            <span class="quick-arrow">→</span>
          </RouterLink>

          <RouterLink to="/admin/activity" class="quick-card">
            <div class="quick-icon activity">◷</div>
            <div class="quick-info">
              <h3>Activity Log</h3>
              <p>Check admin action history and audit records</p>
            </div>
            <span class="quick-arrow">→</span>
          </RouterLink>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useTeamsStore } from '../stores/teams'
import { adminApi, type AdminDashboardStats } from '../api/admin'
import { challengeApplicationsApi, challengesApi } from '../api/challenges'
import { mentorApi } from '../api/mentor'
import AppLayout from '../components/AppLayout.vue'
import type { Application, Challenge, Mentorship } from '../types'

const authStore = useAuthStore()
const teamsStore = useTeamsStore()

const loading = ref(true)
const adminStats = ref<AdminDashboardStats | null>(null)
const myApps = ref<Application[]>([])
const openChallenges = ref<Challenge[]>([])
const myChallenges = ref<Challenge[]>([])
const myMentorships = ref<Mentorship[]>([])

const activeMentees = computed(() => myMentorships.value.filter((m) => !m.ended_at).length)
const totalConsultations = computed(() =>
  myMentorships.value.reduce((s, m) => s + (m.consultations_count ?? 0), 0),
)
function menteeProject(m: Mentorship): string {
  return (
    m.application?.challenge?.title ??
    m.application?.call?.program?.name ??
    'Program A application'
  )
}

const role = computed(() => authStore.user?.account_type ?? '')
const isStudent = computed(() => role.value === 'student')
const isCompany = computed(() => role.value === 'company_contact')
const isMentor = computed(() => role.value === 'mentor')
const isAdmin = computed(() => ['nti_admin', 'superadmin'].includes(role.value))

const candidatesWaiting = computed(() =>
  myChallenges.value.reduce((sum, c) => sum + (c.candidates_count ?? 0), 0),
)
const needsDecision = computed(() =>
  myChallenges.value.filter((c) => (c.candidates_count ?? 0) > 0),
)

const subtitle = computed(() => {
  if (isCompany.value) return "Here's what's happening with your challenges."
  if (isStudent.value) return "Here's what's happening with your team."
  if (isAdmin.value) return 'Platform overview and admin tools.'
  return 'Welcome to the NTI Portal.'
})

const roleLabel = computed(() => {
  const labels: Record<string, string> = {
    student: 'Student',
    mentor: 'Mentor',
    company_contact: 'Company',
    nti_admin: 'NTI Administrator',
    superadmin: 'Super Admin',
  }
  return labels[role.value] ?? role.value
})

// --- status badges ---
const APP_STATUS: Record<string, { label: string; cls: string }> = {
  submitted: { label: 'Pending review', cls: 'amber' },
  approved: { label: 'Selected ✓', cls: 'green' },
  active: { label: 'In progress', cls: 'green' },
  completed: { label: 'Completed', cls: 'violet' },
  archived: { label: 'Completed', cls: 'violet' },
  rejected: { label: 'Not selected', cls: 'red' },
}
const appStatusLabel = (s: string) => APP_STATUS[s]?.label ?? s
const appStatusClass = (s: string) => APP_STATUS[s]?.cls ?? 'grey'
const isActiveApp = (s: string) => ['approved', 'active', 'completed'].includes(s)

const CH_STATUS: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'grey' },
  published: { label: 'Published', cls: 'blue' },
  matching: { label: 'Matching', cls: 'amber' },
  assigned: { label: 'Assigned', cls: 'violet' },
  in_progress: { label: 'In progress', cls: 'green' },
  closed: { label: 'Closed', cls: 'grey' },
}
const chStatusLabel = (s: string) => CH_STATUS[s]?.label ?? s
const chStatusClass = (s: string) => CH_STATUS[s]?.cls ?? 'grey'

const formatBudget = (b: number | string) => Number(b).toLocaleString('sk-SK')

onMounted(async () => {
  try {
    if (isAdmin.value) {
      adminStats.value = await adminApi.getDashboard().catch(() => null)
    } else if (isStudent.value) {
      await teamsStore.fetchTeams().catch(() => {})
      const [apps, chs] = await Promise.all([
        challengeApplicationsApi.mine().catch(() => ({ applications: [] })),
        challengesApi.list().catch(() => ({ challenges: [] })),
      ])
      myApps.value = apps.applications
      openChallenges.value = chs.challenges
    } else if (isCompany.value) {
      const chs = await challengesApi.list().catch(() => ({ challenges: [] }))
      myChallenges.value = chs.challenges
    } else if (isMentor.value) {
      const res = await mentorApi.mentorships().catch(() => ({ mentorships: [] }))
      myMentorships.value = res.mentorships
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.dashboard {
  max-width: 900px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 2.5rem 0 2rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.page-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: #0f1117;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: #8892a4;
  font-size: 0.95rem;
}

.account-badge {
  background: #0f1117;
  color: #6ee7b7;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
  margin-top: 1.25rem;
}

.loading-block {
  color: #8892a4;
  font-size: 0.95rem;
  padding: 2rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  font-size: 1.5rem;
  color: #6ee7b7;
  width: 40px;
  height: 40px;
  background: #f0fdf4;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.8rem;
  color: #8892a4;
  font-weight: 500;
}

.stat-value {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f1117;
  line-height: 1.2;
}

.section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1.75rem 0 0.75rem 0;
}

.section-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #8892a4;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}

.section-row .section-title {
  margin-bottom: 0;
}

.see-all {
  font-size: 0.8rem;
  font-weight: 600;
  color: #16a34a;
  text-decoration: none;
}
.see-all:hover {
  text-decoration: underline;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.row-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 0.85rem 1.2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid transparent;
  text-decoration: none;
  transition: all 0.15s ease;
}

.row-card.link:hover {
  border-color: #6ee7b7;
  transform: translateX(3px);
}

.row-card.attention {
  border-color: #fcd34d;
  background: #fffbeb;
}

.row-main {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.row-main strong {
  font-size: 0.9rem;
  color: #0f1117;
}

.muted {
  color: #8892a4;
  font-size: 0.8rem;
}

.row-arrow {
  color: #8892a4;
  font-size: 1.05rem;
}

.pill {
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}
.pill.amber { background: #fef3c7; color: #92400e; }
.pill.green { background: #dcfce7; color: #166534; }
.pill.violet { background: #ede9fe; color: #6d28d9; }
.pill.red { background: #fee2e2; color: #991b1b; }
.pill.blue { background: #dbeafe; color: #1e40af; }
.pill.grey { background: #f3f4f6; color: #4b5563; }

.empty-cta {
  display: block;
  padding: 1.1rem 1.3rem;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 10px;
  color: #16a34a;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
}
.empty-cta:hover {
  background: #f3f4f6;
}
.empty-cta.static {
  color: #8892a4;
  font-weight: 500;
}

.quick-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quick-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.quick-card:hover {
  border-color: #6ee7b7;
  transform: translateX(4px);
}

.quick-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.quick-icon.admin {
  background: #fef3c7;
  color: #d97706;
}

.quick-icon.activity {
  background: #f5f3ff;
  color: #7c3aed;
}

.quick-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.quick-info h3 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f1117;
  margin: 0 0 0.2rem 0;
}

.quick-info p {
  font-size: 0.85rem;
  color: #8892a4;
  margin: 0;
}

.quick-arrow {
  color: #8892a4;
  font-size: 1.1rem;
  transition: color 0.15s ease;
}

.quick-card:hover .quick-arrow {
  color: #6ee7b7;
}
</style>
