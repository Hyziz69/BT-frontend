<template>
  <section class="card">
    <h2>Applications / Assign mentor</h2>
    <div class="table-wrap" v-if="adminStore.applications.length">
      <table>
        <thead>
        <tr><th>Application</th><th>Team</th><th>Call</th><th>Status</th><th>Current mentors</th><th>Assign mentor</th></tr>
        </thead>
        <tbody>
        <tr v-for="application in adminStore.applications" :key="application.id">
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
              <option v-for="mentor in adminStore.mentors" :key="mentor.id" :value="mentor.id">
                {{ mentor.first_name }} {{ mentor.last_name }}
              </option>
            </select>
            <button
              class="btn-primary small"
              :disabled="!selectedMentorByApplication[application.id] || adminStore.saving"
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

<script setup lang="ts">
import { ref } from 'vue'
import { useAdminStore } from '@/stores/admin.ts'

const adminStore = useAdminStore()

const selectedMentorByApplication = ref<Record<string, string>>({})

function mentorName(mentor: any) {
  if (!mentor) return '-'
  return `${mentor.first_name} ${mentor.last_name}`
}

async function assignMentor(applicationId: string) {
  const mentorId = selectedMentorByApplication.value[applicationId]
  if (!mentorId) return

  await adminStore.assignMentor(applicationId, mentorId)
  selectedMentorByApplication.value[applicationId] = '' // Очищаем селект
}
</script>

<style scoped>
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.78rem; color: #6b7280; }

.assign-cell {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  flex-wrap: wrap;
}
.assign-cell select { min-width: 160px; }
</style>
