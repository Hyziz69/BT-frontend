<template>
  <AppLayout>
    <div class="company-page">
      <div v-if="loading" class="loading">Loading…</div>

      <!-- No company yet → registration form -->
      <div v-else-if="!company" class="register-wrap">
        <div class="page-header">
          <div class="header-content">
            <div class="company-icon">⌂</div>
            <div>
              <h1 class="page-title">Register your company</h1>
              <p class="page-subtitle">Create a company profile to post challenges and invite colleagues.</p>
            </div>
          </div>
        </div>

        <div class="section form-section">
          <div class="field">
            <label>Company name *</label>
            <input v-model="form.name" type="text" placeholder="Acme s.r.o." />
          </div>
          <div class="field">
            <label>IČO *</label>
            <input v-model="form.ico" type="text" placeholder="12345678" />
          </div>
          <div class="field">
            <label>Sector *</label>
            <input v-model="form.sector" type="text" placeholder="IT / Manufacturing / …" />
          </div>
          <div class="field">
            <label>Website</label>
            <input v-model="form.website" type="url" placeholder="https://acme.sk" />
          </div>
          <div class="field">
            <label>Description</label>
            <textarea v-model="form.description" rows="3" placeholder="What does your company do?"></textarea>
          </div>

          <p v-if="formError" class="error">{{ formError }}</p>

          <div class="form-actions">
            <button @click="handleRegister" :disabled="registering" class="btn-primary">
              {{ registering ? 'Registering…' : 'Register company' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Has company → profile + members -->
      <div v-else>
        <div class="page-header">
          <div class="header-content">
            <div class="company-icon">⌂</div>
            <div>
              <h1 class="page-title">{{ company.name }}</h1>
              <p class="page-subtitle">
                {{ company.sector }} · IČO {{ company.ico }}
                <span class="role-pill" :class="myRole ?? ''">{{ myRoleLabel }}</span>
              </p>
            </div>
          </div>
          <button v-if="!isOwner && myRole" @click="handleLeave" class="btn-danger-outline">Leave company</button>
        </div>

        <!-- Members -->
        <div class="section">
          <div class="section-header">
            <h2>Members</h2>
            <button v-if="isOwner" @click="openInvite" class="btn-primary">+ Invite colleague</button>
          </div>

          <div class="members-list">
            <div v-for="m in members" :key="m.id" class="member-card">
              <div class="member-avatar">{{ m.name.charAt(0).toUpperCase() }}</div>
              <div class="member-info">
                <strong>{{ m.name }}</strong>
                <span class="email">{{ m.email }}</span>
              </div>
              <div class="member-right">
                <!-- Owner can change roles of non-owners -->
                <select
                  v-if="isOwner && m.role !== 'owner'"
                  :value="m.role"
                  @change="handleRoleChange(m, ($event.target as HTMLSelectElement).value)"
                  class="role-select"
                >
                  <option value="manager">Manager</option>
                  <option value="member">Member</option>
                </select>
                <span v-else class="role-badge" :class="m.role">{{ m.role_label }}</span>

                <button
                  v-if="isOwner && m.role !== 'owner'"
                  @click="handleKick(m)"
                  class="btn-danger"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pending invitations (owner only) -->
        <div class="section" v-if="isOwner && invitations.length > 0">
          <h2>Pending invitations</h2>
          <div class="members-list">
            <div v-for="inv in invitations" :key="inv.id" class="member-card">
              <div class="member-avatar invite">✉</div>
              <div class="member-info">
                <strong>{{ inv.email }}</strong>
                <span class="email">Role: {{ inv.role }} · Expires {{ formatDate(inv.expires_at) }}</span>
              </div>
              <span class="role-badge pending">{{ inv.status }}</span>
            </div>
          </div>
        </div>

        <!-- Challenges (managers & owners) -->
        <div class="section" v-if="isManager">
          <div class="section-header">
            <h2>Challenges</h2>
            <button @click="openCreate" class="btn-primary">+ New challenge</button>
          </div>

          <div v-if="challengesLoading" class="loading">Loading challenges…</div>
          <div v-else-if="challenges.length === 0" class="empty">No challenges yet.</div>

          <div v-else class="challenge-list">
            <div v-for="ch in challenges" :key="ch.id" class="challenge-card">
              <div class="challenge-row">
                <div class="challenge-main">
                  <RouterLink :to="`/challenges/${ch.id}`" class="challenge-link">{{ ch.title }}</RouterLink>
                  <span class="status-badge" :class="ch.status">{{ ch.status }}</span>
                </div>
                <div class="challenge-actions">
                  <RouterLink :to="`/challenges/${ch.id}`" class="btn-secondary">Open →</RouterLink>
                  <button v-if="ch.status === 'draft'" @click="handlePublish(ch)" class="btn-secondary">
                    Publish
                  </button>
                  <button @click="toggleCandidates(ch)" class="btn-primary">
                    Candidates ({{ ch.candidates_count ?? 0 }})
                  </button>
                </div>
              </div>

              <!-- Expanded candidate teams -->
              <div v-if="expandedId === ch.id" class="candidates">
                <div v-if="candidatesLoading" class="loading">Loading candidates…</div>
                <div v-else-if="(candidates[ch.id] ?? []).length === 0" class="empty">
                  No teams have applied yet.
                </div>
                <div v-else class="candidate-list">
                  <div v-for="app in candidates[ch.id]" :key="app.id" class="candidate-card">
                    <div class="member-info">
                      <strong>{{ app.team?.name ?? 'Unnamed team' }}</strong>
                      <span class="email">
                        {{ app.team?.member_count ?? app.team?.members?.length ?? 0 }} members · {{ app.status }}
                      </span>
                    </div>
                    <button
                      v-if="app.status === 'submitted' && !['assigned', 'closed'].includes(ch.status)"
                      @click="handleSelect(ch, app)"
                      :disabled="selectingId === app.id"
                      class="btn-primary"
                    >
                      {{ selectingId === app.id ? 'Selecting…' : 'Select team' }}
                    </button>
                    <span v-else-if="app.status === 'approved'" class="role-badge manager">Selected</span>
                    <span v-else-if="app.status === 'rejected'" class="role-badge pending">Rejected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Accepted Program A Projects -->
        <div class="section" v-if="isManager">
          <div class="section-header">
            <h2>Accepted Program A Projects</h2>
          </div>
          <div v-if="acceptedApps.length === 0" class="empty">No accepted projects yet.</div>
          <div v-else class="challenge-list">
            <div v-for="app in acceptedApps" :key="app.id" class="challenge-card" @click="router.push(`/applications/${app.id}`)">
              <div class="challenge-row">
                <div class="challenge-main">
                  <strong>{{ app.team?.name ?? 'Unknown team' }}</strong>
                  <span class="status-badge" :class="app.status">{{ app.status }}</span>
                </div>
                <span class="view-link">View →</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create challenge modal -->
      <div v-if="showCreate" class="modal-overlay" @click.self="closeCreate">
        <div class="modal">
          <h2>New challenge</h2>
          <div class="field">
            <label>Title *</label>
            <input v-model="createForm.title" type="text" placeholder="e.g. Mobile onboarding app" />
          </div>
          <div class="field">
            <label>Technical specification *</label>
            <textarea v-model="createForm.technical_spec" rows="4" placeholder="Describe the problem and expected solution…"></textarea>
          </div>
          <div class="field">
            <label>Budget (EUR)</label>
            <input v-model.number="createForm.budget" type="number" min="0" placeholder="5000" />
          </div>
          <div class="field">
            <label>Program *</label>
            <select v-model="selectedProgramId" @change="onProgramChange" class="role-select full">
              <option value="" disabled>-- Select program --</option>
              <option v-for="p in programs" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>
          <div class="field">
            <label>Call *</label>
            <select v-model="createForm.call_id" class="role-select full" :disabled="!selectedProgramId || callsLoading">
              <option value="" disabled>
                {{ callsLoading ? 'Loading calls…' : (availableCalls.length ? '-- Select call --' : 'No open calls') }}
              </option>
              <option v-for="c in availableCalls" :key="c.id" :value="c.id">{{ c.title }}</option>
            </select>
          </div>

          <p v-if="createError" class="error">{{ createError }}</p>
          <div class="modal-actions">
            <button @click="closeCreate" class="btn-secondary">Cancel</button>
            <button @click="handleCreate" :disabled="creating" class="btn-primary">
              {{ creating ? 'Creating…' : 'Create challenge' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Invite modal -->
      <div v-if="showInvite" class="modal-overlay" @click.self="closeInvite">
        <div class="modal">
          <h2>Invite colleague</h2>
          <template v-if="!inviteSuccess">
            <div class="field">
              <label>Email</label>
              <input v-model="inviteEmail" type="email" placeholder="colleague@company.sk" />
            </div>
            <div class="field">
              <label>Role</label>
              <select v-model="inviteRole" class="role-select full">
                <option value="member">Member</option>
                <option value="manager">Manager</option>
              </select>
            </div>
          </template>
          <p v-if="inviteSuccess" class="success">{{ inviteSuccess }}</p>
          <p v-if="inviteError" class="error">{{ inviteError }}</p>
          <div class="modal-actions">
            <button @click="closeInvite" class="btn-secondary">{{ inviteSuccess ? 'Close' : 'Cancel' }}</button>
            <button v-if="!inviteSuccess" @click="handleInvite" :disabled="inviting" class="btn-primary">
              {{ inviting ? 'Sending…' : 'Send invitation' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { authApi } from '../api/auth'
import { companyApi, type CompanyRegisterPayload } from '../api/company'
import { challengesApi, challengeApplicationsApi } from '../api/challenges'
import { programsApi, type ProgramOption, type CallOption } from '../api/programs'
import type { Application, Challenge, Company, CompanyInvitation, CompanyMember, CompanyRole } from '../types'
import AppLayout from '../components/AppLayout.vue'
import { applicationsApi } from '../api/applications'
import { useRouter } from 'vue-router'

const router = useRouter()
const acceptedApps = ref<any[]>([])

async function loadAcceptedApps() {
  try {
    const res = await applicationsApi.getAll('approved')
    acceptedApps.value = res.data
  } catch {
    acceptedApps.value = []
  }
}

const authStore = useAuthStore()

const loading = ref(true)
const company = ref<Company | null>(null)
const members = ref<CompanyMember[]>([])
const invitations = ref<CompanyInvitation[]>([])

const form = ref<CompanyRegisterPayload>({ name: '', ico: '', sector: '', website: '', description: '' })
const registering = ref(false)
const formError = ref<string | null>(null)

const showInvite = ref(false)
const inviteEmail = ref('')
const inviteRole = ref<CompanyRole>('member')
const inviting = ref(false)
const inviteError = ref<string | null>(null)
const inviteSuccess = ref<string | null>(null)

const myRole = computed<CompanyRole | null>(() => (authStore.user as any)?.company_role ?? null)
const isOwner = computed(() => myRole.value === 'owner')
const isManager = computed(() => myRole.value === 'owner' || myRole.value === 'manager')

// --- Challenges ---
const challenges = ref<Challenge[]>([])
const challengesLoading = ref(false)
const expandedId = ref<string | null>(null)
const candidates = ref<Record<string, Application[]>>({})
const candidatesLoading = ref(false)
const selectingId = ref<string | null>(null)

// --- Create challenge ---
const showCreate = ref(false)
const creating = ref(false)
const createError = ref<string | null>(null)
const createForm = ref<{ title: string; technical_spec: string; budget: number | null; call_id: string }>({
  title: '',
  technical_spec: '',
  budget: null,
  call_id: '',
})
const programs = ref<ProgramOption[]>([])
const selectedProgramId = ref('')
const availableCalls = ref<CallOption[]>([])
const callsLoading = ref(false)
const roleLabels: Record<string, string> = { owner: 'Owner', manager: 'Manager', member: 'Member' }
const myRoleLabel = computed(() => (myRole.value ? roleLabels[myRole.value] : ''))

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('sk-SK')
}

onMounted(load)

async function load() {
  loading.value = true
  const companyId = (authStore.user as any)?.company_id
  if (!companyId) {
    loading.value = false
    return
  }
  try {
    const res = await companyApi.get(companyId)
    company.value = res.company
    await loadMembers(companyId)
    await loadChallenges()
    await loadAcceptedApps()
  } catch {
    company.value = null
  } finally {
    loading.value = false
  }
}

async function loadChallenges() {
  if (!isManager.value) return
  challengesLoading.value = true
  try {
    const res = await challengesApi.list()
    challenges.value = res.challenges
  } catch {
    challenges.value = []
  } finally {
    challengesLoading.value = false
  }
}

async function toggleCandidates(ch: Challenge) {
  if (expandedId.value === ch.id) {
    expandedId.value = null
    return
  }
  expandedId.value = ch.id
  await loadCandidates(ch.id)
}

async function loadCandidates(challengeId: string) {
  candidatesLoading.value = true
  try {
    const res = await challengesApi.candidates(challengeId)
    candidates.value = { ...candidates.value, [challengeId]: res.applications }
  } catch {
    candidates.value = { ...candidates.value, [challengeId]: [] }
  } finally {
    candidatesLoading.value = false
  }
}

async function handlePublish(ch: Challenge) {
  try {
    await challengesApi.updateStatus(ch.id, 'published')
    await loadChallenges()
  } catch (e: any) {
    alert(e.response?.data?.message ?? 'Failed to publish challenge.')
  }
}

async function handleSelect(ch: Challenge, app: Application) {
  if (!confirm(`Select "${app.team?.name}" for "${ch.title}"? Other teams will be rejected.`)) return
  selectingId.value = app.id
  try {
    await challengeApplicationsApi.select(app.id)
    await loadCandidates(ch.id)
    await loadChallenges()
  } catch (e: any) {
    alert(e.response?.data?.message ?? 'Failed to select team.')
  } finally {
    selectingId.value = null
  }
}

async function openCreate() {
  createForm.value = { title: '', technical_spec: '', budget: null, call_id: '' }
  selectedProgramId.value = ''
  availableCalls.value = []
  createError.value = null
  showCreate.value = true
  try {
    const res = await programsApi.listProgramB()
    programs.value = res.programs
    // Auto-select when there is exactly one program.
    if (programs.value.length === 1 && programs.value[0]) {
      selectedProgramId.value = programs.value[0].id
      await onProgramChange()
    }
  } catch {
    programs.value = []
  }
}

function closeCreate() {
  showCreate.value = false
}

async function onProgramChange() {
  createForm.value.call_id = ''
  availableCalls.value = []
  if (!selectedProgramId.value) return
  callsLoading.value = true
  try {
    const res = await programsApi.callsFor(selectedProgramId.value)
    availableCalls.value = res.calls ?? []
  } catch {
    availableCalls.value = []
  } finally {
    callsLoading.value = false
  }
}

async function handleCreate() {
  createError.value = null
  if (!createForm.value.title || !createForm.value.technical_spec) {
    createError.value = 'Title and technical specification are required.'
    return
  }
  if (!createForm.value.call_id) {
    createError.value = 'Please select a program and call.'
    return
  }
  creating.value = true
  try {
    await challengesApi.create({
      title: createForm.value.title,
      technical_spec: createForm.value.technical_spec,
      call_id: createForm.value.call_id,
      budget: createForm.value.budget ?? null,
    })
    showCreate.value = false
    await loadChallenges()
  } catch (e: any) {
    createError.value = e.response?.data?.message ?? 'Failed to create challenge.'
  } finally {
    creating.value = false
  }
}

async function loadMembers(companyId: string) {
  try {
    const res = await companyApi.members(companyId)
    members.value = res.members
    invitations.value = res.invitations
  } catch {
    members.value = []
    invitations.value = []
  }
}

async function refreshUser() {
  try {
    const fresh = await authApi.me()
    authStore.setUser(fresh)
  } catch {
    /* non-fatal */
  }
}

async function handleRegister() {
  formError.value = null
  if (!form.value.name || !form.value.ico || !form.value.sector) {
    formError.value = 'Name, IČO and sector are required.'
    return
  }
  registering.value = true
  try {
    const res = await companyApi.register(form.value)
    company.value = res.company
    await refreshUser()
    await loadMembers(res.company.id)
    await loadChallenges()
  } catch (e: any) {
    formError.value = e.response?.data?.message ?? 'Failed to register company.'
  } finally {
    registering.value = false
  }
}

function openInvite() {
  inviteEmail.value = ''
  inviteRole.value = 'member'
  inviteError.value = null
  inviteSuccess.value = null
  showInvite.value = true
}

function closeInvite() {
  showInvite.value = false
  inviteSuccess.value = null
}

async function handleInvite() {
  if (!company.value) return
  inviting.value = true
  inviteError.value = null
  try {
    await companyApi.invite(company.value.id, inviteEmail.value, inviteRole.value)
    inviteSuccess.value = `Invitation sent to ${inviteEmail.value}`
    await loadMembers(company.value.id)
  } catch (e: any) {
    inviteError.value = e.response?.data?.message ?? 'Failed to send invitation.'
  } finally {
    inviting.value = false
  }
}

async function handleRoleChange(member: CompanyMember, role: string) {
  if (!company.value) return
  try {
    await companyApi.updateRole(company.value.id, member.id, role as CompanyRole)
    await loadMembers(company.value.id)
  } catch (e: any) {
    alert(e.response?.data?.message ?? 'Failed to change role.')
    await loadMembers(company.value.id)
  }
}

async function handleKick(member: CompanyMember) {
  if (!company.value) return
  if (!confirm(`Remove ${member.name} from the company?`)) return
  try {
    await companyApi.kick(company.value.id, member.id)
    await loadMembers(company.value.id)
  } catch (e: any) {
    alert(e.response?.data?.message ?? 'Failed to remove member.')
  }
}

async function handleLeave() {
  if (!company.value) return
  if (!confirm('Leave this company?')) return
  try {
    await companyApi.leave(company.value.id)
    await refreshUser()
    company.value = null
    members.value = []
    invitations.value = []
  } catch (e: any) {
    alert(e.response?.data?.message ?? 'Failed to leave company.')
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.company-page { max-width: 900px; }
.loading { color: #8892a4; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 0 0 2rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.header-content { display: flex; align-items: center; gap: 1rem; }

.company-icon {
  width: 52px;
  height: 52px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.page-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f1117;
  margin: 0 0 0.25rem 0;
}

.page-subtitle { color: #8892a4; font-size: 0.9rem; margin: 0; display: flex; align-items: center; gap: 0.5rem; }

.role-pill {
  padding: 0.15rem 0.6rem;
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: capitalize;
}
.role-pill.owner { background: #fef3c7; color: #92400e; }
.role-pill.manager { background: #ede9fe; color: #6d28d9; }
.role-pill.member { background: #eff6ff; color: #1d4ed8; }

.section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.section-header h2, .section h2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #0f1117;
  margin: 0 0 0 0;
}
.section h2 { margin-bottom: 1.25rem; }

.members-list { display: flex; flex-direction: column; gap: 0.75rem; }

.member-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid #f3f4f6;
  border-radius: 10px;
  transition: border-color 0.15s;
}
.member-card:hover { border-color: #e5e7eb; }

.member-avatar {
  width: 38px;
  height: 38px;
  background: #0f1117;
  color: #6ee7b7;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
}
.member-avatar.invite { background: #f0fdf4; color: #16a34a; }

.member-info { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
.member-info strong { font-size: 0.9rem; color: #0f1117; }
.email { color: #8892a4; font-size: 0.8rem; }

.member-right { display: flex; align-items: center; gap: 0.75rem; }

.role-badge {
  padding: 0.2rem 0.7rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}
.role-badge.owner { background: #fef3c7; color: #92400e; }
.role-badge.manager { background: #ede9fe; color: #6d28d9; }
.role-badge.member { background: #eff6ff; color: #1d4ed8; }
.role-badge.pending { background: #fef3c7; color: #92400e; }

.role-select {
  padding: 0.3rem 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.8rem;
  background: white;
  cursor: pointer;
}
.role-select.full { width: 100%; padding: 0.6rem 0.8rem; font-size: 0.95rem; }

.form-section { max-width: 540px; }
.field { margin-bottom: 1rem; }
label { display: block; margin-bottom: 0.4rem; font-weight: 600; font-size: 0.9rem; color: #374151; }
input, textarea {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  box-sizing: border-box;
  font-family: inherit;
}
input:focus, textarea:focus { outline: none; border-color: #6ee7b7; }
.form-actions { margin-top: 1.25rem; }

.btn-primary {
  background: #0f1117;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-danger {
  background: #fee2e2;
  color: #991b1b;
  border: none;
  padding: 0.3rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
}

.btn-danger-outline {
  background: white;
  color: #991b1b;
  border: 1px solid #fca5a5;
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 600;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}
.modal h2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f1117;
  margin-bottom: 1.5rem;
}
.modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem; }

.error { color: #ef4444; font-size: 0.9rem; }
.success { color: #16a34a; font-size: 0.9rem; }

/* Challenges */
.empty { color: #8892a4; font-size: 0.9rem; }
.challenge-list { display: flex; flex-direction: column; gap: 0.75rem; }

.challenge-card {
  border: 1px solid #f3f4f6;
  border-radius: 10px;
  padding: 0.85rem 1rem;
  transition: border-color 0.15s;
}
.challenge-card:hover { border-color: #e5e7eb; }

.challenge-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.challenge-main { display: flex; align-items: center; gap: 0.75rem; }
.challenge-main strong { font-size: 0.95rem; color: #0f1117; }
.challenge-link { font-size: 0.95rem; font-weight: 700; color: #0f1117; text-decoration: none; }
.challenge-link:hover { color: #16a34a; text-decoration: underline; }
.challenge-actions { display: flex; align-items: center; gap: 0.6rem; }

.status-badge {
  padding: 0.2rem 0.65rem;
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: capitalize;
}
.status-badge.draft { background: #f3f4f6; color: #6b7280; }
.status-badge.published { background: #dbeafe; color: #1d4ed8; }
.status-badge.matching { background: #fef3c7; color: #92400e; }
.status-badge.assigned { background: #ede9fe; color: #6d28d9; }
.status-badge.in_progress { background: #cffafe; color: #0e7490; }
.status-badge.closed { background: #dcfce7; color: #166534; }

.candidates {
  margin-top: 0.85rem;
  padding-top: 0.85rem;
  border-top: 1px dashed #e5e7eb;
}
.candidate-list { display: flex; flex-direction: column; gap: 0.6rem; }
.candidate-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.6rem 0.85rem;
  background: #fafafa;
  border-radius: 8px;
}
</style>
