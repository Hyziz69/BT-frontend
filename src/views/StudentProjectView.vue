<template>
  <AppLayout>
    <div class="project-detail">
      <button @click="router.back()" class="back-btn">← Back</button>

      <div v-if="loading" class="state">Loading…</div>
      <div v-else-if="error" class="state error">{{ error }}</div>

      <div v-else-if="project">
        <!-- Header -->
        <div class="page-header">
          <div class="header-content">
            <div class="p-icon">🚀</div>
            <div>
              <h1 class="page-title">{{ project.challenge?.title ?? 'Project' }}</h1>
              <p class="page-subtitle">{{ project.challenge?.company?.name ?? 'Your project' }}</p>
            </div>
          </div>
          <span class="status-badge" :class="statusClass">{{ statusLabel }}</span>
        </div>

        <!-- Overview -->
        <div class="section">
          <h2>Overview</h2>
          <div class="detail-grid">
            <div class="detail-row"><span class="label">Team</span><span class="strong">{{ project.team?.name ?? '—' }}</span></div>
            <div class="detail-row" v-if="project.challenge?.budget"><span class="label">Budget</span><span>{{ formatBudget(project.challenge.budget) }} €</span></div>
            <div class="detail-row"><span class="label">Mentor</span><span :class="{ strong: mentorName }">{{ mentorName ?? 'Not assigned yet' }}</span></div>
            <div class="detail-row"><span class="label">Started</span><span>{{ fmt(project.decided_at) }}</span></div>
          </div>
        </div>

        <!-- Milestones -->
        <div class="section">
          <h2>Milestones</h2>
          <div v-if="milestones.length === 0" class="empty">No milestones yet.</div>
          <div v-else class="milestone-list">
            <div v-for="m in milestones" :key="m.id" class="milestone-row">
              <span class="m-status" :class="m.status">{{ msLabel(m.status) }}</span>
              <div class="m-info">
                <strong>{{ m.title }}</strong>
                <span v-if="m.due_date" class="muted">Due {{ fmt(m.due_date) }}</span>
                <p v-if="m.comment" class="m-comment">{{ m.comment }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Mentor feedback -->
        <div class="section">
          <h2>Mentor feedback</h2>
          <div v-if="consultations.length === 0" class="empty">
            No consultations yet. Your mentor's notes and feedback will appear here.
          </div>
          <div v-else class="timeline">
            <div v-for="c in consultations" :key="c.id" class="consult-card">
              <div class="consult-date">{{ fmt(c.scheduled_at) }}</div>
              <div class="consult-body">
                <p v-if="c.notes" class="consult-notes">{{ c.notes }}</p>
                <p v-if="c.feedback" class="consult-feedback"><strong>Feedback:</strong> {{ c.feedback }}</p>
                <p v-if="!c.notes && !c.feedback" class="muted">No details.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Team -->
        <div class="section" v-if="members.length">
          <h2>Team members</h2>
          <div class="member-list">
            <div v-for="m in members" :key="m.id" class="member-row" style="cursor:pointer" @click="router.push(`/users/${m.id}/profile`)">
              <div class="avatar">{{ initials(m) }}</div>
              <div class="member-info">
                <strong>{{ m.first_name }} {{ m.last_name }}</strong>
                <span class="muted">{{ m.email }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { challengeApplicationsApi } from '../api/challenges'
import AppLayout from '../components/AppLayout.vue'
import type { Consultation, MentorshipPerson, Milestone, StudentProject } from '../types'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const loading = ref(true)
const error = ref('')
const project = ref<StudentProject | null>(null)

const milestones = computed<Milestone[]>(() => project.value?.milestones ?? [])
const members = computed<MentorshipPerson[]>(() => project.value?.team?.members ?? [])

const mentorName = computed(() => {
  const mentor = project.value?.mentorships?.find((m) => m.mentor)?.mentor
  return mentor ? `${mentor.first_name} ${mentor.last_name}`.trim() : null
})

const consultations = computed<Consultation[]>(() => {
  const all = (project.value?.mentorships ?? []).flatMap((m) => m.consultations ?? [])
  return all.sort((a, b) => (b.scheduled_at ?? '').localeCompare(a.scheduled_at ?? ''))
})

const STATUS: Record<string, { label: string; cls: string }> = {
  approved: { label: 'Selected', cls: 'green' },
  active: { label: 'In progress', cls: 'green' },
  completed: { label: 'Completed', cls: 'violet' },
  rejected: { label: 'Not selected', cls: 'red' },
  submitted: { label: 'Pending review', cls: 'amber' },
}
const statusLabel = computed(() => STATUS[project.value?.status ?? '']?.label ?? project.value?.status ?? '')
const statusClass = computed(() => STATUS[project.value?.status ?? '']?.cls ?? 'grey')

const MS: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Done',
  overdue: 'Overdue',
}
const msLabel = (s: string) => MS[s] ?? s

const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString('sk-SK') : '—')
const formatBudget = (b: number | string) => Number(b).toLocaleString('sk-SK')
const initials = (m: MentorshipPerson) =>
  ((m.first_name?.[0] ?? '') + (m.last_name?.[0] ?? '')).toUpperCase()

onMounted(async () => {
  try {
    const res = await challengeApplicationsApi.project(id)
    project.value = res.application
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Could not load this project.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.project-detail { max-width: 820px; font-family: 'DM Sans', sans-serif; }

.back-btn { background: none; border: none; color: #8892a4; font-size: 0.9rem; cursor: pointer; padding: 0.5rem 0; margin-bottom: 0.5rem; }
.back-btn:hover { color: #0f1117; }

.state { padding: 2rem 0; color: #8892a4; }
.state.error { color: #ef4444; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 1rem 0 2rem 0; border-bottom: 1px solid #e5e7eb; margin-bottom: 1.5rem; }
.header-content { display: flex; gap: 1rem; align-items: center; }
.p-icon { width: 48px; height: 48px; border-radius: 12px; background: #f0fdf4; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }
.page-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.7rem; font-weight: 700; color: #0f1117; margin: 0; }
.page-subtitle { color: #8892a4; font-size: 0.9rem; margin: 0.2rem 0 0 0; }

.section { background: #fff; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.section h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1rem; font-weight: 700; color: #0f1117; margin: 0 0 1rem 0; }

.detail-grid { display: flex; flex-direction: column; }
.detail-row { display: flex; justify-content: space-between; padding: 0.6rem 0; border-bottom: 1px solid #f3f4f6; font-size: 0.9rem; }
.detail-row:last-child { border-bottom: none; }
.label { color: #8892a4; }
.strong { font-weight: 700; color: #0f1117; }
.muted { color: #8892a4; font-size: 0.8rem; }
.empty { color: #8892a4; font-size: 0.9rem; }

.milestone-list { display: flex; flex-direction: column; gap: 0.6rem; }
.milestone-row { display: flex; gap: 0.9rem; align-items: flex-start; padding: 0.7rem 0; border-bottom: 1px solid #f7f7f8; }
.milestone-row:last-child { border-bottom: none; }
.m-info { display: flex; flex-direction: column; gap: 0.15rem; }
.m-info strong { font-size: 0.9rem; color: #0f1117; }
.m-comment { margin: 0.2rem 0 0 0; font-size: 0.84rem; color: #4b5563; }
.m-status { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.72rem; font-weight: 700; white-space: nowrap; height: fit-content; }
.m-status.completed { background: #dcfce7; color: #166534; }
.m-status.in_progress { background: #fef3c7; color: #92400e; }
.m-status.pending { background: #f3f4f6; color: #4b5563; }
.m-status.overdue { background: #fee2e2; color: #991b1b; }

.timeline { display: flex; flex-direction: column; gap: 0.75rem; }
.consult-card { display: flex; gap: 1rem; padding: 0.9rem 1rem; border: 1px solid #f3f4f6; border-radius: 10px; }
.consult-date { font-size: 0.8rem; font-weight: 700; color: #16a34a; white-space: nowrap; min-width: 90px; }
.consult-body { display: flex; flex-direction: column; gap: 0.35rem; }
.consult-notes { margin: 0; font-size: 0.88rem; color: #374151; line-height: 1.45; }
.consult-feedback { margin: 0; font-size: 0.85rem; color: #4b5563; line-height: 1.45; }

.member-list { display: flex; flex-direction: column; gap: 0.6rem; }
.member-row { display: flex; align-items: center; gap: 0.8rem; }
.avatar { width: 38px; height: 38px; border-radius: 50%; background: #0f1117; color: #6ee7b7; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; }
.member-info { display: flex; flex-direction: column; }
.member-info strong { font-size: 0.9rem; color: #0f1117; }

.status-badge { padding: 0.3rem 0.8rem; border-radius: 999px; font-size: 0.78rem; font-weight: 600; }
.status-badge.green { background: #dcfce7; color: #166534; }
.status-badge.violet { background: #ede9fe; color: #6d28d9; }
.status-badge.amber { background: #fef3c7; color: #92400e; }
.status-badge.red { background: #fee2e2; color: #991b1b; }
.status-badge.grey { background: #f3f4f6; color: #4b5563; }
</style>
