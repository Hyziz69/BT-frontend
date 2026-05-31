<template>
  <AppLayout>
    <div class="profile-page">
      <div class="page-header">
        <div>
          <h1>My Profile</h1>
          <p>Manage your account details, role access, CV, project history and security.</p>
        </div>
      </div>

      <p v-if="pageError" class="alert error-alert">{{ pageError }}</p>
      <p v-if="successMessage" class="alert success-alert">{{ successMessage }}</p>

      <section class="profile-card hero-card">
        <div class="avatar-wrap">
          <img
            v-if="account?.avatar_url"
            :src="account.avatar_url"
            alt="Profile avatar"
            class="avatar-img"
          />

          <div v-else class="avatar">{{ initials }}</div>

          <button
            class="avatar-edit"
            type="button"
            title="Upload avatar"
            :disabled="savingAvatar"
            @click="triggerAvatarInput"
          >
            ✎
          </button>

          <input
            ref="avatarInput"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            class="hidden-input"
            @change="handleAvatarChange"
          />
        </div>

        <div class="hero-info">
          <h2>{{ fullName }}</h2>
          <p>{{ account?.email }}</p>

          <div class="badges">
            <span class="role-badge">{{ roleLabel }}</span>

            <button
              v-if="account?.avatar_url"
              class="remove-avatar-btn"
              type="button"
              :disabled="savingAvatar"
              @click="removeAvatar"
            >
              Remove avatar
            </button>
          </div>
        </div>

        <div class="hero-side">
          <span>Account ID</span>
          <strong>{{ shortId }}</strong>

          <RouterLink v-if="account?.id" :to="`/users/${account.id}/profile`" class="public-profile-btn">
            View public profile
          </RouterLink>
        </div>
      </section>

      <section class="stats-grid">
        <div class="stat-card">
          <span class="stat-icon">◈</span>
          <div>
            <span class="stat-label">Teams</span>
            <strong>{{ overview?.stats.teams_count ?? 0 }}</strong>
          </div>
        </div>

        <div class="stat-card">
          <span class="stat-icon green">◎</span>
          <div>
            <span class="stat-label">Applications</span>
            <strong>{{ overview?.stats.applications_count ?? 0 }}</strong>
          </div>
        </div>

        <div class="stat-card">
          <span class="stat-icon yellow">✓</span>
          <div>
            <span class="stat-label">Approved</span>
            <strong>{{ overview?.stats.approved_applications_count ?? 0 }}</strong>
          </div>
        </div>

        <div class="stat-card">
          <span class="stat-icon purple">★</span>
          <div>
            <span class="stat-label">Mentorships</span>
            <strong>{{ overview?.stats.mentor_assignments_count ?? 0 }}</strong>
          </div>
        </div>
      </section>

      <div class="grid">
        <section class="card">
          <div class="card-header">
            <h3>Personal information</h3>
            <p>Update your basic public and private account details.</p>
          </div>

          <form @submit.prevent="saveDetails">
            <div class="field two-columns">
              <div>
                <label>First name</label>
                <input v-model="detailsForm.first_name" type="text" required />
              </div>

              <div>
                <label>Last name</label>
                <input v-model="detailsForm.last_name" type="text" required />
              </div>
            </div>

            <div class="field">
              <label>Bio</label>
              <textarea
                v-model="detailsForm.bio"
                placeholder="Short description about you, your role, skills or interests."
                rows="4"
              ></textarea>
            </div>

            <div class="field">
              <label>Phone</label>

              <div class="professional-phone">
                <button
                  type="button"
                  class="country-trigger"
                  @click="phoneDropdownOpen = !phoneDropdownOpen"
                >
                  <span class="country-flag">{{ selectedPhoneCountry.flag }}</span>
                  <span class="country-code">{{ selectedPhoneCountry.code }}</span>
                  <span class="chevron">⌄</span>
                </button>

                <div v-if="phoneDropdownOpen" class="country-dropdown">
                  <button
                    v-for="country in phoneCountries"
                    :key="country.code"
                    type="button"
                    class="country-option"
                    :class="{ active: phoneCountryCode === country.code }"
                    @click="selectPhoneCountry(country.code)"
                  >
                    <span>{{ country.flag }}</span>
                    <div>
                      <strong>{{ country.name }}</strong>
                      <small>{{ country.code }}</small>
                    </div>
                  </button>
                </div>

                <input
                  v-model="phoneLocalNumber"
                  type="tel"
                  placeholder="Phone number"
                  inputmode="tel"
                  @focus="phoneDropdownOpen = false"
                />
              </div>

              <small class="field-hint">
                Saved as: {{ buildPhoneValue() || 'No phone added' }}
              </small>
            </div>

            <div class="field">
              <label>LinkedIn URL</label>
              <input v-model="detailsForm.linkedin_url" type="url" placeholder="https://linkedin.com/in/..." />
            </div>

            <div class="field">
              <label>GitHub URL</label>
              <input v-model="detailsForm.github_url" type="url" placeholder="https://github.com/..." />
            </div>

            <div class="field">
              <label>Portfolio URL</label>
              <input v-model="detailsForm.portfolio_url" type="url" placeholder="https://..." />
            </div>

            <div class="info-row">
              <span>Email</span>
              <strong>{{ account?.email || '—' }}</strong>
            </div>

            <div class="info-row">
              <span>Role</span>
              <strong>{{ roleLabel }}</strong>
            </div>

            <div class="info-row">
              <span>Status</span>
              <strong class="capitalize">{{ account?.status || '—' }}</strong>
            </div>

            <div class="info-row">
              <span>Joined</span>
              <strong>{{ joinedDate }}</strong>
            </div>

            <button class="primary-btn" type="submit" :disabled="savingDetails">
              {{ savingDetails ? 'Saving...' : 'Save details' }}
            </button>
          </form>
        </section>

        <section class="card">
          <div class="card-header">
            <h3>Quick actions</h3>
            <p>Open the most important pages for your role.</p>
          </div>

          <RouterLink v-for="item in actionItems" :key="item.to" :to="item.to" class="action-link">
            <span class="action-icon" :class="item.variant">{{ item.icon }}</span>
            <div>
              <strong>{{ item.title }}</strong>
              <p>{{ item.text }}</p>
            </div>
            <span class="arrow">→</span>
          </RouterLink>
        </section>
      </div>

      <div class="grid">
        <section v-if="isStudent" class="card">
          <div class="card-header">
            <h3>Student profile</h3>
            <p>Information used for student participation and evaluation.</p>
          </div>

          <form @submit.prevent="saveStudentProfile">
            <div class="field">
              <label>Study program</label>
              <input
                v-model="studentForm.study_program"
                type="text"
                placeholder="e.g. Applied Informatics"
              />
            </div>

            <div class="field">
              <label>Study year</label>
              <input
                v-model.number="studentForm.study_year"
                type="number"
                min="1"
                max="8"
                placeholder="1"
              />
            </div>

            <div class="field">
              <label>Skills</label>
              <div class="skill-input-row">
                <input
                  v-model="skillInput"
                  type="text"
                  placeholder="Add skill and press Add"
                  @keyup.enter.prevent="addSkill"
                />
                <button class="secondary-btn" type="button" @click="addSkill">Add</button>
              </div>

              <div v-if="studentForm.skills.length" class="skills-list">
                <button
                  v-for="skill in studentForm.skills"
                  :key="skill"
                  type="button"
                  @click="removeSkill(skill)"
                >
                  {{ skill }} ×
                </button>
              </div>
            </div>

            <label class="checkbox-row">
              <input v-model="studentForm.academic_declaration" type="checkbox" />
              <span>I confirm that my academic declaration is correct.</span>
            </label>

            <button class="primary-btn" type="submit" :disabled="savingStudentProfile">
              {{ savingStudentProfile ? 'Saving...' : 'Save student profile' }}
            </button>
          </form>
        </section>

        <section v-if="isStudent" class="card">
          <div class="card-header">
            <h3>CV</h3>
            <p>Upload your CV for program evaluation and profile overview.</p>
          </div>

          <div class="cv-box">
            <div class="cv-icon">CV</div>

            <div>
              <strong>{{ currentCvUrl ? 'CV uploaded' : 'No CV uploaded yet' }}</strong>
              <p>PDF, DOC, DOCX or TXT file. Maximum 5 MB.</p>
            </div>
          </div>

          <div class="cv-actions">
            <button class="secondary-btn" type="button" :disabled="savingCv" @click="triggerCvInput">
              {{ savingCv ? 'Uploading...' : currentCvUrl ? 'Replace CV' : 'Upload CV' }}
            </button>

            <a v-if="currentCvUrl" :href="currentCvUrl" target="_blank" class="secondary-link">
              Open CV
            </a>

            <button
              v-if="currentCvUrl"
              class="danger-btn"
              type="button"
              :disabled="savingCv"
              @click="removeCv"
            >
              Delete CV
            </button>

            <input
              ref="cvInput"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              class="hidden-input"
              @change="handleCvChange"
            />
          </div>
        </section>

        <section class="card">
          <div class="card-header">
            <h3>Security</h3>
            <p>Change your password using your current password.</p>
          </div>

          <form @submit.prevent="changePassword">
            <div class="field">
              <label>Current password</label>
              <input v-model="passwordForm.current_password" type="password" required />
            </div>

            <div class="field">
              <label>New password</label>
              <input v-model="passwordForm.password" type="password" required minlength="8" />
            </div>

            <div class="field">
              <label>Confirm new password</label>
              <input
                v-model="passwordForm.password_confirmation"
                type="password"
                required
                minlength="8"
              />
            </div>

            <button class="primary-btn" type="submit" :disabled="savingPassword">
              {{ savingPassword ? 'Changing...' : 'Change password' }}
            </button>
          </form>
        </section>
      </div>

      <div class="grid">
        <section class="card">
          <div class="card-header">
            <h3>Access overview</h3>
            <p>What your current role allows you to do.</p>
          </div>

          <div class="access-list">
            <div v-for="item in accessItems" :key="item.title" class="access-item">
              <span class="access-icon">{{ item.icon }}</span>
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.text }}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="card">
          <div class="card-header">
            <h3>Project history</h3>
            <p>Your latest application activity and statuses.</p>
          </div>

          <div v-if="overview?.recent_applications.length" class="recent-list">
            <div
              v-for="application in overview.recent_applications"
              :key="application.id"
              class="recent-item"
            >
              <div>
                <strong>{{ application.call?.title ?? 'Application' }}</strong>
                <p>{{ application.team?.name ?? 'No team' }}</p>
              </div>
              <span class="status-chip">{{ application.status }}</span>
            </div>
          </div>

          <div v-else class="empty-state">
            <span>◎</span>
            <p>No project history yet.</p>
          </div>
        </section>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import { useAuthStore } from '../stores/auth'
import { profileApi, type ProfileOverview, type ProfileUser } from '../api/profile'

const authStore = useAuthStore()

const overview = ref<ProfileOverview | null>(null)
const loadingOverview = ref(false)
const savingDetails = ref(false)
const savingStudentProfile = ref(false)
const savingPassword = ref(false)
const savingAvatar = ref(false)
const savingCv = ref(false)
const pageError = ref('')
const successMessage = ref('')
const skillInput = ref('')
const avatarInput = ref<HTMLInputElement | null>(null)
const cvInput = ref<HTMLInputElement | null>(null)

const phoneCountries = [
  { flag: '🇸🇰', code: '+421', name: 'Slovakia' },
  { flag: '🇺🇦', code: '+380', name: 'Ukraine' },
  { flag: '🇩🇪', code: '+49', name: 'Germany' },
  { flag: '🇨🇿', code: '+420', name: 'Czech Republic' },
  { flag: '🇵🇱', code: '+48', name: 'Poland' },
  { flag: '🇦🇹', code: '+43', name: 'Austria' },
  { flag: '🇭🇺', code: '+36', name: 'Hungary' },
  { flag: '🇪🇸', code: '+34', name: 'Spain' },
  { flag: '🇮🇹', code: '+39', name: 'Italy' },
  { flag: '🇫🇷', code: '+33', name: 'France' },
  { flag: '🇳🇱', code: '+31', name: 'Netherlands' },
  { flag: '🇧🇪', code: '+32', name: 'Belgium' },
  { flag: '🇬🇧', code: '+44', name: 'United Kingdom' },
  { flag: '🇺🇸', code: '+1', name: 'United States' },
  { flag: '🇨🇦', code: '+1', name: 'Canada' },
  { flag: '🇹🇷', code: '+90', name: 'Turkey' },
  { flag: '🇦🇿', code: '+994', name: 'Azerbaijan' },
  { flag: '🇬🇪', code: '+995', name: 'Georgia' },
  { flag: '🇰🇿', code: '+7', name: 'Kazakhstan' },
  { flag: '🇮🇳', code: '+91', name: 'India' },
  { flag: '🇨🇳', code: '+86', name: 'China' },
  { flag: '🇯🇵', code: '+81', name: 'Japan' },
  { flag: '🇰🇷', code: '+82', name: 'South Korea' },
  { flag: '🌍', code: '+', name: 'Other country' },
]

const phoneCountryCode = ref('+421')
const phoneLocalNumber = ref('')
const phoneDropdownOpen = ref(false)

const detailsForm = reactive({
  first_name: '',
  last_name: '',
  bio: '',
  linkedin_url: '',
  github_url: '',
  portfolio_url: '',
})

const studentForm = reactive({
  study_program: '',
  study_year: null as number | null,
  skills: [] as string[],
  academic_declaration: false,
})

const passwordForm = reactive({
  current_password: '',
  password: '',
  password_confirmation: '',
})

const account = computed<ProfileUser | null>(() => {
  return overview.value?.user ?? (authStore.user as ProfileUser | null) ?? null
})

const selectedPhoneCountry = computed(() => {
  return phoneCountries.find((country) => country.code === phoneCountryCode.value) ?? phoneCountries[0]
})

const fullName = computed(() => {
  const first = account.value?.first_name ?? ''
  const last = account.value?.last_name ?? ''

  return account.value?.full_name || `${first} ${last}`.trim() || 'NTI User'
})

const initials = computed(() => {
  const first = account.value?.first_name?.[0] ?? ''
  const last = account.value?.last_name?.[0] ?? ''

  return (first + last).toUpperCase() || 'NT'
})

const isStudent = computed(() => account.value?.account_type === 'student')

const isAdmin = computed(() =>
  ['nti_admin', 'superadmin'].includes(account.value?.account_type ?? ''),
)

const roleLabel = computed(() => {
  const role = account.value?.account_type ?? ''

  const labels: Record<string, string> = {
    student: 'Student',
    mentor: 'Mentor',
    company_contact: 'Company',
    editor: 'Editor',
    evaluator: 'Evaluator',
    nti_admin: 'NTI Administrator',
    superadmin: 'Super Admin',
  }

  return labels[role] ?? (role || 'User')
})

const shortId = computed(() => {
  if (!account.value?.id) {
    return '—'
  }

  return String(account.value.id).slice(0, 8)
})

const joinedDate = computed(() => {
  const createdAt = overview.value?.user.created_at

  if (!createdAt) {
    return '—'
  }

  return new Date(createdAt).toLocaleDateString()
})

const currentCvUrl = computed(() => overview.value?.student_profile?.cv_url ?? null)

const actionItems = computed(() => {
  const items = [
    {
      to: '/dashboard',
      icon: '⊞',
      title: 'Dashboard',
      text: 'Go back to your main workspace.',
      variant: '',
    },
    {
      to: '/applications',
      icon: '◎',
      title: 'Applications',
      text: 'View and track your applications.',
      variant: 'green',
    },
    {
      to: '/teams',
      icon: '◈',
      title: isStudent.value ? 'My Team' : 'Teams',
      text: 'Open team workspace.',
      variant: 'blue',
    },
  ]

  if (isAdmin.value) {
    items.push(
      {
        to: '/admin',
        icon: '★',
        title: 'Admin Panel',
        text: 'Manage users, calls and programs.',
        variant: 'yellow',
      },
      {
        to: '/admin/activity',
        icon: '◷',
        title: 'Activity Log',
        text: 'Review admin audit history.',
        variant: 'purple',
      },
    )
  }

  return items
})

const accessItems = computed(() => {
  if (isAdmin.value) {
    return [
      {
        icon: '★',
        title: 'Administration',
        text: 'Approve users, manage accounts and control platform data.',
      },
      {
        icon: '◷',
        title: 'Audit access',
        text: 'View admin actions and system activity history.',
      },
      {
        icon: '◎',
        title: 'Application management',
        text: 'Review applications and assign mentors.',
      },
    ]
  }

  if (account.value?.account_type === 'mentor') {
    return [
      {
        icon: '◈',
        title: 'Team overview',
        text: 'View team and mentoring-related information.',
      },
      {
        icon: '◎',
        title: 'Applications',
        text: 'Track applications connected to the program.',
      },
    ]
  }

  if (account.value?.account_type === 'company_contact') {
    return [
      {
        icon: '◎',
        title: 'Company applications',
        text: 'Work with company-related innovation applications.',
      },
      {
        icon: '◈',
        title: 'Collaboration',
        text: 'View teams and project cooperation details.',
      },
    ]
  }

  return [
    {
      icon: '◈',
      title: 'Team workspace',
      text: 'Create or manage your team for the program.',
    },
    {
      icon: '◎',
      title: 'Applications',
      text: 'Submit and track Program A applications.',
    },
  ]
})

watch(
  account,
  (user) => {
    detailsForm.first_name = user?.first_name ?? ''
    detailsForm.last_name = user?.last_name ?? ''
    detailsForm.bio = user?.bio ?? ''
    detailsForm.linkedin_url = user?.linkedin_url ?? ''
    detailsForm.github_url = user?.github_url ?? ''
    detailsForm.portfolio_url = user?.portfolio_url ?? ''
    parsePhone(user?.phone ?? '')
  },
  { immediate: true },
)

watch(
  overview,
  (data) => {
    studentForm.study_program = data?.student_profile?.study_program ?? ''
    studentForm.study_year = data?.student_profile?.study_year ?? null
    studentForm.skills = [...(data?.student_profile?.skills ?? [])]
    studentForm.academic_declaration = data?.student_profile?.academic_declaration ?? false
  },
  { immediate: true },
)

onMounted(() => {
  loadOverview()
})

async function loadOverview() {
  loadingOverview.value = true
  pageError.value = ''

  try {
    overview.value = await profileApi.getOverview()
  } catch (e: any) {
    pageError.value = e?.response?.data?.message || 'Failed to load profile overview.'
  } finally {
    loadingOverview.value = false
  }
}

async function saveDetails() {
  savingDetails.value = true
  pageError.value = ''
  successMessage.value = ''

  try {
    const response = await profileApi.updateDetails({
      first_name: detailsForm.first_name,
      last_name: detailsForm.last_name,
      bio: detailsForm.bio || null,
      phone: buildPhoneValue(),
      linkedin_url: detailsForm.linkedin_url || null,
      github_url: detailsForm.github_url || null,
      portfolio_url: detailsForm.portfolio_url || null,
    })

    authStore.setUser(response.user)

    if (overview.value) {
      overview.value.user = response.user
    }

    successMessage.value = response.message
  } catch (e: any) {
    pageError.value = e?.response?.data?.message || 'Failed to save profile details.'
  } finally {
    savingDetails.value = false
  }
}

async function saveStudentProfile() {
  savingStudentProfile.value = true
  pageError.value = ''
  successMessage.value = ''

  try {
    const response = await profileApi.updateStudentProfile({
      study_program: studentForm.study_program || null,
      study_year: studentForm.study_year,
      skills: studentForm.skills,
      academic_declaration: studentForm.academic_declaration,
    })

    if (overview.value) {
      overview.value.student_profile = response.student_profile
    }

    successMessage.value = response.message
  } catch (e: any) {
    pageError.value = e?.response?.data?.message || 'Failed to save student profile.'
  } finally {
    savingStudentProfile.value = false
  }
}

async function changePassword() {
  savingPassword.value = true
  pageError.value = ''
  successMessage.value = ''

  try {
    const response = await profileApi.changePassword(passwordForm)
    passwordForm.current_password = ''
    passwordForm.password = ''
    passwordForm.password_confirmation = ''
    successMessage.value = response.message
  } catch (e: any) {
    pageError.value = e?.response?.data?.message || 'Failed to change password.'
  } finally {
    savingPassword.value = false
  }
}

function selectPhoneCountry(code: string) {
  phoneCountryCode.value = code
  phoneDropdownOpen.value = false
}

function parsePhone(phone: string) {
  const value = phone.trim()

  if (!value) {
    phoneCountryCode.value = '+421'
    phoneLocalNumber.value = ''
    return
  }

  const country = phoneCountries
    .slice()
    .sort((a, b) => b.code.length - a.code.length)
    .find((item) => item.code !== '+' && value.startsWith(item.code))

  if (country) {
    phoneCountryCode.value = country.code
    phoneLocalNumber.value = value.slice(country.code.length).trim()
    return
  }

  phoneCountryCode.value = '+'
  phoneLocalNumber.value = value.replace(/^\+/, '').trim()
}

function buildPhoneValue(): string | null {
  const number = phoneLocalNumber.value.trim()

  if (!number) {
    return null
  }

  if (phoneCountryCode.value === '+') {
    return number.startsWith('+') ? number : `+${number}`
  }

  return `${phoneCountryCode.value} ${number}`.trim()
}

function triggerAvatarInput() {
  pageError.value = ''
  successMessage.value = ''
  avatarInput.value?.click()
}

async function handleAvatarChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files && input.files.length > 0 ? input.files[0] : null

  if (!file) {
    input.value = ''
    return
  }

  savingAvatar.value = true
  pageError.value = ''
  successMessage.value = ''

  try {
    const response = await profileApi.updateAvatar(file)
    authStore.setUser(response.user)

    if (overview.value) {
      overview.value.user = response.user
    }

    successMessage.value = response.message
  } catch (e: any) {
    pageError.value = e?.response?.data?.message || 'Failed to upload avatar.'
  } finally {
    savingAvatar.value = false
    input.value = ''
  }
}

async function removeAvatar() {
  savingAvatar.value = true
  pageError.value = ''
  successMessage.value = ''

  try {
    const response = await profileApi.deleteAvatar()
    authStore.setUser(response.user)

    if (overview.value) {
      overview.value.user = response.user
    }

    successMessage.value = response.message
  } catch (e: any) {
    pageError.value = e?.response?.data?.message || 'Failed to remove avatar.'
  } finally {
    savingAvatar.value = false
  }
}

function triggerCvInput() {
  pageError.value = ''
  successMessage.value = ''
  cvInput.value?.click()
}

async function handleCvChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files && input.files.length > 0 ? input.files[0] : null

  if (!file) {
    input.value = ''
    return
  }

  savingCv.value = true
  pageError.value = ''
  successMessage.value = ''

  try {
    const response = await profileApi.uploadCv(file)

    if (overview.value) {
      overview.value.student_profile = response.student_profile
    }

    successMessage.value = response.message
  } catch (e: any) {
    pageError.value = e?.response?.data?.message || 'Failed to upload CV.'
  } finally {
    savingCv.value = false
    input.value = ''
  }
}

async function removeCv() {
  savingCv.value = true
  pageError.value = ''
  successMessage.value = ''

  try {
    const response = await profileApi.deleteCv()

    if (overview.value) {
      overview.value.student_profile = response.student_profile
    }

    successMessage.value = response.message
  } catch (e: any) {
    pageError.value = e?.response?.data?.message || 'Failed to remove CV.'
  } finally {
    savingCv.value = false
  }
}

function addSkill() {
  const value = skillInput.value.trim()

  if (!value || studentForm.skills.includes(value)) {
    skillInput.value = ''
    return
  }

  studentForm.skills.push(value)
  skillInput.value = ''
}

function removeSkill(skill: string) {
  studentForm.skills = studentForm.skills.filter((item) => item !== skill)
}
</script>

<style scoped>
.profile-page {
  max-width: 1050px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 2.5rem 0 2rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
}

.page-header h1 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  color: #0f1117;
  margin-bottom: 0.25rem;
}

.page-header p {
  color: #8892a4;
}

.primary-btn,
.secondary-btn,
.danger-btn {
  border: none;
  border-radius: 10px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.secondary-btn {
  background: #ffffff;
  color: #1f2937;
  border: 1px solid #d1d5db;
  padding: 0.7rem 1rem;
}

.primary-btn {
  background: #0f1117;
  color: #ffffff;
  padding: 0.75rem 1.25rem;
  margin-top: 0.25rem;
}

.danger-btn {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.7rem 1rem;
}

.secondary-btn:hover {
  background: #f9fafb;
}

.primary-btn:hover {
  opacity: 0.9;
}

.danger-btn:hover {
  background: #fecaca;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.success-alert {
  background: #f0fdf4;
  color: #065f46;
  border: 1px solid #bbf7d0;
}

.profile-card,
.card,
.stat-card {
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

.avatar-wrap {
  position: relative;
  width: 76px;
  height: 76px;
  flex-shrink: 0;
}

.avatar,
.avatar-img {
  width: 76px;
  height: 76px;
  border-radius: 18px;
}

.avatar {
  background: #1a2e22;
  color: #6ee7b7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
}

.avatar-img {
  object-fit: cover;
  display: block;
  box-shadow: 0 0 0 3px #ffffff;
}

.avatar-edit {
  position: absolute;
  right: -7px;
  bottom: -7px;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 10px;
  background: #0f1117;
  color: #6ee7b7;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 800;
  box-shadow: 0 8px 20px rgba(15, 17, 23, 0.18);
}

.avatar-edit:hover {
  opacity: 0.9;
}

.hidden-input {
  display: none;
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
  min-width: 150px;
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
  display: block;
  color: #0f1117;
  font-family: 'Plus Jakarta Sans', sans-serif;
  margin-bottom: 0.65rem;
}

.public-profile-btn {
  display: inline-flex;
  color: #047857;
  font-size: 0.78rem;
  font-weight: 800;
  text-decoration: none;
  margin-bottom: 0.55rem;
}

.badges {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.role-badge,
.status-chip {
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: capitalize;
}

.role-badge {
  background: #0f1117;
  color: #6ee7b7;
}

.remove-avatar-btn {
  border: none;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 999px;
  padding: 0.25rem 0.7rem;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.remove-avatar-btn:hover {
  background: #fecaca;
}

.status-chip {
  background: #d1fae5;
  color: #065f46;
}

.capitalize {
  text-transform: capitalize;
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

.stat-icon,
.action-icon,
.access-icon {
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

.stat-icon.green,
.action-icon.green {
  background: #f0fdf4;
  color: #22c55e;
}

.stat-icon.yellow,
.action-icon.yellow {
  background: #fef3c7;
  color: #d97706;
}

.stat-icon.purple,
.action-icon.purple {
  background: #f5f3ff;
  color: #7c3aed;
}

.action-icon.blue {
  background: #eff6ff;
  color: #3b82f6;
}

.stat-label {
  display: block;
  color: #8892a4;
  font-size: 0.82rem;
  margin-bottom: 0.15rem;
}

.stat-card strong {
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #0f1117;
  font-size: 1.2rem;
  font-weight: 800;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.card {
  padding: 1.5rem;
}

.card-header {
  margin-bottom: 1.25rem;
}

.card h3 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #0f1117;
  font-size: 1.1rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
}

.card-header p {
  color: #8892a4;
  font-size: 0.9rem;
}

.field {
  margin-bottom: 1rem;
  position: relative;
}

.two-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  display: block;
  color: #374151;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
}

input,
textarea {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 0.75rem 0.85rem;
  font: inherit;
  color: #111827;
  background: #ffffff;
}

input {
  height: 43px;
}

textarea {
  resize: vertical;
  min-height: 96px;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #6ee7b7;
  box-shadow: 0 0 0 3px rgba(110, 231, 183, 0.15);
}

.professional-phone {
  display: flex;
  align-items: stretch;
  position: relative;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: #ffffff;
  transition: all 0.15s ease;
}

.professional-phone:focus-within {
  border-color: #6ee7b7;
  box-shadow: 0 0 0 3px rgba(110, 231, 183, 0.15);
}

.country-trigger {
  min-width: 118px;
  height: 43px;
  border: none;
  border-right: 1px solid #e5e7eb;
  border-radius: 10px 0 0 10px;
  background: #f9fafb;
  color: #0f1117;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  cursor: pointer;
  font-weight: 800;
}

.country-trigger:hover {
  background: #f3f4f6;
}

.country-flag {
  font-size: 1rem;
}

.country-code {
  font-size: 0.9rem;
}

.chevron {
  color: #8892a4;
  font-size: 0.9rem;
  margin-left: 0.1rem;
}

.professional-phone input {
  border: none;
  border-radius: 0 10px 10px 0;
  box-shadow: none;
}

.professional-phone input:focus {
  border: none;
  box-shadow: none;
}

.country-dropdown {
  position: absolute;
  top: calc(100% + 0.4rem);
  left: 0;
  width: 290px;
  max-height: 260px;
  overflow-y: auto;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.16);
  z-index: 30;
  padding: 0.4rem;
}

.country-option {
  width: 100%;
  border: none;
  border-radius: 10px;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.7rem;
  text-align: left;
  cursor: pointer;
}

.country-option:hover,
.country-option.active {
  background: #f0fdf4;
}

.country-option span {
  font-size: 1.1rem;
}

.country-option strong {
  display: block;
  color: #0f1117;
  font-size: 0.86rem;
}

.country-option small {
  display: block;
  color: #8892a4;
  font-size: 0.76rem;
  margin-top: 0.1rem;
}

.field-hint {
  display: block;
  margin-top: 0.35rem;
  color: #8892a4;
  font-size: 0.78rem;
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
  color: #0f1117;
  text-align: right;
}

.action-link {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  background: #f9fafb;
  padding: 0.9rem;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.15s ease;
}

.action-link:hover {
  background: #f0fdf4;
  transform: translateX(4px);
}

.action-link strong,
.access-item strong,
.recent-item strong {
  display: block;
  color: #0f1117;
  font-size: 0.92rem;
  margin-bottom: 0.15rem;
}

.action-link p,
.access-item p,
.recent-item p {
  color: #8892a4;
  font-size: 0.84rem;
  margin: 0;
}

.arrow {
  margin-left: auto;
  color: #8892a4;
}

.skill-input-row {
  display: flex;
  gap: 0.6rem;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.7rem;
}

.skills-list button {
  border: none;
  border-radius: 999px;
  background: #ecfdf5;
  color: #047857;
  padding: 0.35rem 0.7rem;
  cursor: pointer;
  font-weight: 700;
}

.checkbox-row {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  margin-bottom: 1rem;
  color: #374151;
  line-height: 1.4;
}

.checkbox-row input {
  width: 16px;
  height: 16px;
  margin-top: 0.15rem;
}

.cv-box {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem;
  border-radius: 12px;
  background: #f9fafb;
  margin-bottom: 1rem;
}

.cv-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #0f1117;
  color: #6ee7b7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.cv-box strong {
  display: block;
  color: #0f1117;
  margin-bottom: 0.2rem;
}

.cv-box p {
  color: #8892a4;
  font-size: 0.86rem;
  margin: 0;
}

.cv-actions {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  align-items: center;
}

.secondary-link {
  display: inline-flex;
  align-items: center;
  padding: 0.7rem 1rem;
  border-radius: 10px;
  background: #f0fdf4;
  color: #047857;
  text-decoration: none;
  font-weight: 800;
  font-size: 0.9rem;
}

.access-list,
.recent-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.access-item,
.recent-item {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 0.9rem;
  border-radius: 12px;
  background: #f9fafb;
}

.recent-item {
  align-items: center;
  justify-content: space-between;
}

.empty-state {
  padding: 1.5rem;
  text-align: center;
  color: #8892a4;
  background: #f9fafb;
  border-radius: 12px;
}

.empty-state span {
  display: block;
  color: #6ee7b7;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

@media (max-width: 1050px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .grid,
  .two-columns {
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