<template>
  <div class="hover-wrap" @mouseenter="openCard" @mouseleave="closeCard">
    <slot />

    <div v-if="visible" class="hover-card">
      <div v-if="loading" class="hover-state">Loading...</div>

      <div v-else-if="error" class="hover-state error">{{ error }}</div>

      <template v-else-if="card">
        <div class="hover-header">
          <img
            v-if="card.user.avatar_url"
            :src="card.user.avatar_url"
            alt="User avatar"
            class="avatar-img"
          />

          <div v-else class="avatar">
            {{ initials }}
          </div>

          <div>
            <strong>{{ fullName }}</strong>
            <span>{{ roleLabel }}</span>
          </div>
        </div>

        <p v-if="card.user.bio" class="bio">{{ card.user.bio }}</p>

        <div v-if="card.user.company" class="mini-row">
          <span>Company</span>
          <strong>{{ card.user.company.name }}</strong>
        </div>

        <div v-if="card.teams.length" class="teams">
          <span>Teams</span>
          <div>
            <strong v-for="team in card.teams" :key="team.id">{{ team.name }}</strong>
          </div>
        </div>

        <RouterLink :to="`/users/${userId}/profile`" class="view-link">
          View full profile →
        </RouterLink>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { profileApi, type ProfileCard } from '../api/profile'

const props = defineProps<{
  userId: string
}>()

const visible = ref(false)
const loading = ref(false)
const error = ref('')
const card = ref<ProfileCard | null>(null)
let timer: number | null = null

const fullName = computed(() => {
  const user = card.value?.user
  const first = user?.first_name ?? ''
  const last = user?.last_name ?? ''

  return user?.full_name || `${first} ${last}`.trim() || 'NTI User'
})

const initials = computed(() => {
  const first = card.value?.user.first_name?.[0] ?? ''
  const last = card.value?.user.last_name?.[0] ?? ''

  return (first + last).toUpperCase() || 'NT'
})

const roleLabel = computed(() => {
  const role = card.value?.user.account_type ?? ''

  const labels: Record<string, string> = {
    student: 'Student',
    mentor: 'Mentor',
    company_contact: 'Company',
    nti_admin: 'NTI Administrator',
    superadmin: 'Super Admin',
  }

  return labels[role] ?? role
})

function openCard() {
  visible.value = true

  if (card.value || loading.value) {
    return
  }

  if (timer) {
    window.clearTimeout(timer)
  }

  timer = window.setTimeout(loadCard, 250)
}

function closeCard() {
  visible.value = false

  if (timer) {
    window.clearTimeout(timer)
    timer = null
  }
}

async function loadCard() {
  loading.value = true
  error.value = ''

  try {
    card.value = await profileApi.getProfileCard(props.userId)
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Failed to load profile.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.hover-wrap {
  position: relative;
  display: inline-flex;
}

.hover-card {
  position: absolute;
  left: 0;
  top: calc(100% + 0.5rem);
  width: 300px;
  z-index: 50;
  background: #ffffff;
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.18);
  border: 1px solid #e5e7eb;
}

.hover-header {
  display: flex;
  gap: 0.8rem;
  align-items: center;
}

.avatar,
.avatar-img {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  flex-shrink: 0;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a2e22;
  color: #6ee7b7;
  font-weight: 800;
}

.avatar-img {
  object-fit: cover;
}

.hover-header strong {
  display: block;
  color: #0f1117;
  font-weight: 800;
}

.hover-header span {
  display: block;
  color: #64748b;
  font-size: 0.84rem;
  margin-top: 0.15rem;
}

.bio {
  color: #64748b;
  font-size: 0.86rem;
  margin: 0.9rem 0;
  line-height: 1.45;
}

.mini-row,
.teams {
  padding: 0.7rem;
  border-radius: 12px;
  background: #f9fafb;
  margin-top: 0.65rem;
}

.mini-row span,
.teams span {
  display: block;
  color: #8892a4;
  font-size: 0.72rem;
  margin-bottom: 0.25rem;
}

.mini-row strong,
.teams strong {
  display: inline-flex;
  color: #0f1117;
  font-size: 0.84rem;
  margin-right: 0.35rem;
}

.view-link {
  display: block;
  margin-top: 0.9rem;
  color: #047857;
  text-decoration: none;
  font-weight: 800;
  font-size: 0.9rem;
}

.hover-state {
  color: #64748b;
  text-align: center;
  padding: 1rem;
}

.hover-state.error {
  color: #991b1b;
}
</style>