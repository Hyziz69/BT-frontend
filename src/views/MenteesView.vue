<template>
  <AppLayout>
    <div class="mentees-page">
      <div class="page-header">
        <div class="header-content">
          <div class="page-icon">🧑‍🏫</div>
          <div>
            <h1 class="page-title">My Mentees</h1>
            <p class="page-subtitle">Teams and projects you're mentoring.</p>
          </div>
        </div>
      </div>

      <div v-if="loading" class="state">Loading…</div>
      <div v-else-if="mentorships.length === 0" class="state empty">
        You have no mentees yet. Once an admin assigns you to a project, it will appear here.
      </div>

      <template v-else>
        <!-- Program A -->
        <div v-if="programAMentorships.length > 0" class="program-section">
          <div class="program-label">
            Program A
          </div>
          <div class="mentee-list">
            <RouterLink v-for="m in programAMentorships" :key="m.id" :to="`/mentorships/${m.id}`" class="mentee-card">
              <div class="mentee-main">
                <strong>{{ m.application?.team?.name ?? 'Team' }}</strong>
                <span class="muted">{{ projectLabel(m) }}</span>
              </div>
              <div class="mentee-right">
                <span class="pill" :class="m.ended_at ? 'grey' : 'green'">{{ m.ended_at ? 'Ended' : 'Active' }}</span>
                <span class="consults">{{ m.consultations_count ?? 0 }} consultation(s)</span>
                <span class="arrow">→</span>
              </div>
            </RouterLink>
          </div>
        </div>

        <!-- Program B -->
        <div v-if="programBMentorships.length > 0" class="program-section">
          <div class="program-label">
            Program B
          </div>
          <div class="mentee-list">
            <RouterLink v-for="m in programBMentorships" :key="m.id" :to="`/mentorships/${m.id}`" class="mentee-card">
              <div class="mentee-main">
                <strong>{{ m.application?.team?.name ?? 'Team' }}</strong>
                <span class="muted">{{ projectLabel(m) }}</span>
              </div>
              <div class="mentee-right">
                <span class="pill" :class="m.ended_at ? 'grey' : 'green'">{{ m.ended_at ? 'Ended' : 'Active' }}</span>
                <span class="consults">{{ m.consultations_count ?? 0 }} consultation(s)</span>
                <span class="arrow">→</span>
              </div>
            </RouterLink>
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { mentorApi } from '../api/mentor'
import AppLayout from '../components/AppLayout.vue'
import type { Mentorship } from '../types'

const router = useRouter()
const loading = ref(true)
const mentorships = ref<Mentorship[]>([])

const programAMentorships = computed(() =>
  mentorships.value.filter(m => !m.application?.challenge)
)

const programBMentorships = computed(() =>
  mentorships.value.filter(m => !!m.application?.challenge)
)

function projectLabel(m: Mentorship): string {
  return (
    m.application?.challenge?.title ??
    m.application?.call?.program?.name ??
    'Program A application'
  )
}

onMounted(async () => {
  try {
    const res = await mentorApi.mentorships()
    mentorships.value = res.mentorships
  } catch {
    mentorships.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.mentees-page { max-width: 820px; font-family: 'DM Sans', sans-serif; }

.page-header { display: flex; align-items: center; margin-bottom: 2rem; padding: 0 0 2rem 0; border-bottom: 1px solid #e5e7eb; }
.header-content { display: flex; align-items: center; gap: 1rem; }
.page-icon { width: 52px; height: 52px; background: #f0fdf4; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
.page-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.75rem; font-weight: 700; color: #0f1117; margin: 0 0 0.25rem 0; }
.page-subtitle { color: #8892a4; font-size: 0.9rem; margin: 0; }

.state { color: #8892a4; padding: 2rem 0; }
.state.empty { background: #f9fafb; border: 1px dashed #d1d5db; border-radius: 10px; padding: 2rem; text-align: center; }



.program-section { margin-bottom: 2rem; }

.program-label {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #16a34a;
  margin-bottom: 0.75rem;
}

.program-badge {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 800;
}

.badge-a { background: #f0fdf4; color: #16a34a; border: 1px solid #6ee7b7; }
.badge-b { background: #eff6ff; color: #2563eb; border: 1px solid #93c5fd; }
.mentee-list { display: flex; flex-direction: column; gap: 0.75rem; }
.mentee-card {
  background: #fff; border-radius: 12px; padding: 1.1rem 1.4rem;
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid transparent;
  text-decoration: none; transition: all 0.15s ease;
}
.mentee-card:hover { border-color: #6ee7b7; transform: translateX(3px); }
.mentee-main { display: flex; flex-direction: column; gap: 0.2rem; }
.mentee-main strong { font-size: 0.95rem; color: #0f1117; }
.muted { color: #8892a4; font-size: 0.82rem; }
.mentee-right { display: flex; align-items: center; gap: 1rem; }
.consults { font-size: 0.8rem; color: #6b7280; }
.arrow { color: #8892a4; font-size: 1.05rem; }

.pill { padding: 0.25rem 0.7rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
.pill.green { background: #dcfce7; color: #166534; }
.pill.grey { background: #f3f4f6; color: #4b5563; }
</style>
