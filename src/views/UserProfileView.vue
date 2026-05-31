<template>
  <AppLayout>
    <div class="public-profile-page">
      <div class="page-header">
        <div>
          <h1>User Profile</h1>
          <p>Public role, team and project history overview.</p>
        </div>

        <RouterLink to="/dashboard" class="back-btn">Back</RouterLink>
      </div>

      <p v-if="error" class="alert error-alert">{{ error }}</p>

      <div v-if="loading" class="loading-card">
        Loading profile...
      </div>

      <template v-else-if="profile">
        <section class="hero-card">
          <img
            v-if="profile.user.avatar_url"
            :src="profile.user.avatar_url"
            alt="User avatar"
            class="avatar-img"
          />

          <div v-else class="avatar">
            {{ initials }}
          </div>

          <div class="hero-info">
            <h2>{{ fullName }}</h2>
            <p v-if="profile.user.email">{{ profile.user.email }}</p>
            <p v-else>{{ roleLabel }}</p>

            <div class="badges">
              <span class="role-badge">{{ roleLabel }}</span>
              <span v-if="profile.user.company" class="company-badge">
                {{ profile.user.company.name }}
              </span>
            </div>
          </div>

          <div class="hero-side">
            <span>Member since</span>
            <strong>{{ joinedDate }}</strong>
          </div>
        </section>

        <section v-if="profile.user.bio" class="card bio-card">
          <h3>About</h3>
          <p>{{ profile.user.bio }}</p>
        </section>

        <section class="stats-grid">
          <div class="stat-card">
            <span class="stat-icon">◈</span>
            <div>
              <span>Teams</span>
              <strong>{{ profile.stats.teams_count }}</strong>
            </div>
          </div>

          <div class="stat-card">
            <span class="stat-icon green">◎</span>
            <div>
              <span>Applications</span>
              <strong>{{ profile.stats.applications_count }}</strong>
            </div>
          </div>

          <div class="stat-card">
            <span class="stat-icon yellow">✓</span>
            <div>
              <span>Approved</span>
              <strong>{{ profile.stats.approved_applications_count }}</strong>
            </div>
          </div>

          <div class="stat-card">
            <span class="stat-icon purple">★</span>
            <div>
              <span>Mentorships</span>
              <strong>{{ profile.stats.mentor_assignments_count }}</strong>
            </div>
          </div>
        </section>

        <div class="grid">
          <section class="card">
            <h3>Profile information</h3>

            <div class="info-row">
              <span>Name</span>
              <strong>{{ fullName }}</strong>
            </div>

            <div class="info-row">
              <span>Role</span>
              <strong>{{ roleLabel }}</strong>
            </div>

            <div class="info-row" v-if="profile.user.company">
              <span>Company</span>
              <strong>{{ profile.user.company.name }}</strong>
            </div>

            <div class="info-row" v-if="profile.student_profile?.study_program">
              <span>Study program</span>
              <strong>{{ profile.student_profile.study_program }}</strong>
            </div>

            <div class="info-row" v-if="profile.student_profile?.study_year">
              <span>Study year</span>
              <strong>{{ profile.student_profile.study_year }}</strong>
            </div>

            <div class="links" v-if="hasLinks">
              <a v-if="profile.user.linkedin_url" :href="profile.user.linkedin_url" target="_blank">
                LinkedIn
              </a>
              <a v-if="profile.user.github_url" :href="profile.user.github_url" target="_blank">
                GitHub
              </a>
              <a v-if="profile.user.portfolio_url" :href="profile.user.portfolio_url" target="_blank">
                Portfolio
              </a>
            </div>
          </section>

          <section class="card">
            <h3>Skills</h3>

            <div v-if="profile.student_profile?.skills?.length" class="skills-list">
              <span v-for="skill in profile.student_profile.skills" :key="skill">
                {{ skill }}
              </span>
            </div>

            <div v-else class="empty-state">
              No public skills added yet.
            </div>
          </section>
        </div>

        <div class="grid">
          <section class="card">
            <h3>Teams</h3>

            <div v-if="profile.teams.length" class="list">
              <div v-for="team in profile.teams" :key="team.id" class="list-item">
                <div>
                  <strong>{{ team.name }}</strong>
                  <p v-if="team.role">{{ team.role }}</p>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              No teams found.
            </div>
          </section>

          <section class="card">
            <h3>Project history</h3>

            <div v-if="profile.recent_applications.length" class="list">
              <div
                v-for="application in profile.recent_applications"
                :key="application.id"
                class="list-item"
              >
                <div>
                  <strong>{{ application.call?.title ?? 'Application' }}</strong>
                  <p>{{ application.team?.name ?? 'No team' }}</p>
                </div>

                <span class="status-chip">{{ application.status }}</span>
              </div>
            </div>

            <div v-else class="empty-state">
              No project history yet.
            </div>
          </section>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import { profileApi, type ProfileOverview } from '../api/profile'

const route = useRoute()

const loading = ref(false)
const error = ref('')
const profile = ref<ProfileOverview | null>(null)

const userId = computed(() => String(route.params.id ?? ''))

const fullName = computed(() => {
  const user = profile.value?.user
  const first = user?.first_name ?? ''
  const last = user?.last_name ?? ''

  return user?.full_name || `${first} ${last}`.trim() || 'NTI User'
})

const initials = computed(() => {
  const first = profile.value?.user.first_name?.[0] ?? ''
  const last = profile.value?.user.last_name?.[0] ?? ''

  return (first + last).toUpperCase() || 'NT'
})

const roleLabel = computed(() => {
  const role = profile.value?.user.account_type ?? ''

  const labels: Record<string, string> = {
    student: 'Student',
    mentor: 'Mentor',
    company_contact: 'Company',
    nti_admin: 'NTI Administrator',
    superadmin: 'Super Admin',
  }

  return labels[role] ?? role
})

const joinedDate = computed(() => {
  const createdAt = profile.value?.user.created_at

  return createdAt ? new Date(createdAt).toLocaleDateString() : '—'
})

const hasLinks = computed(() => {
  const user = profile.value?.user

  return !!(user?.linkedin_url || user?.github_url || user?.portfolio_url)
})

onMounted(() => {
  loadProfile()
})

async function loadProfile() {
  loading.value = true
  error.value = ''

  try {
    profile.value = await profileApi.getPublicProfile(userId.value)
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Failed to load user profile.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.public-profile-page {
  max-width: 1050px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 2.5rem 0 2rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
}

.page-header h1 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #0f1117;
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
}

.page-header p {
  color: #8892a4;
}

.back-btn {
  align-self: flex-start;
  background: #ffffff;
  color: #1f2937;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 0.7rem 1rem;
  text-decoration: none;
  font-weight: 700;
}

.alert {
  padding: 0.9rem 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  font-weight: 700;
}

.error-alert {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.hero-card,
.card,
.stat-card,
.loading-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.hero-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.avatar,
.avatar-img {
  width: 76px;
  height: 76px;
  border-radius: 18px;
  flex-shrink: 0;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a2e22;
  color: #6ee7b7;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
}

.avatar-img {
  object-fit: cover;
}

.hero-info {
  flex: 1;
}

.hero-info h2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #0f1117;
  font-size: 1.45rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
}

.hero-info p {
  color: #8892a4;
  margin-bottom: 0.75rem;
}

.hero-side {
  min-width: 130px;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  background: #f9fafb;
  text-align: right;
}

.hero-side span {
  display: block;
  color: #8892a4;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.hero-side strong {
  color: #0f1117;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.role-badge,
.company-badge,
.status-chip {
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}

.role-badge {
  background: #0f1117;
  color: #6ee7b7;
}

.company-badge {
  background: #eff6ff;
  color: #2563eb;
}

.status-chip {
  background: #d1fae5;
  color: #065f46;
  text-transform: capitalize;
}

.bio-card {
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.bio-card h3,
.card h3 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #0f1117;
  font-size: 1.1rem;
  font-weight: 800;
  margin-bottom: 1rem;
}

.bio-card p {
  color: #64748b;
  line-height: 1.55;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #eff6ff;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: 800;
}

.stat-icon.green {
  background: #f0fdf4;
  color: #22c55e;
}

.stat-icon.yellow {
  background: #fef3c7;
  color: #d97706;
}

.stat-icon.purple {
  background: #f5f3ff;
  color: #7c3aed;
}

.stat-card span:not(.stat-icon) {
  color: #8892a4;
  font-size: 0.82rem;
}

.stat-card strong {
  display: block;
  color: #0f1117;
  font-size: 1.2rem;
  font-weight: 800;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.card {
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.85rem;
  margin-bottom: 0.85rem;
  border-bottom: 1px solid #f3f4f6;
}

.info-row span {
  color: #6b7280;
}

.info-row strong {
  text-align: right;
  color: #0f1117;
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.links a {
  background: #f0fdf4;
  color: #047857;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.82rem;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skills-list span {
  background: #ecfdf5;
  color: #047857;
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  font-weight: 700;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  padding: 0.9rem;
  border-radius: 12px;
  background: #f9fafb;
}

.list-item strong {
  color: #0f1117;
}

.list-item p {
  margin: 0.15rem 0 0;
  color: #8892a4;
  font-size: 0.85rem;
}

.empty-state,
.loading-card {
  color: #8892a4;
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
}

@media (max-width: 1050px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .page-header,
  .hero-card {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-side {
    text-align: left;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>