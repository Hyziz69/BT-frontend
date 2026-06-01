<template>
  <section class="grid-two">
    <div class="card">
      <h2>{{ editingCallId ? 'Edit call' : 'Create call' }}</h2>

      <div class="form-grid">
        <div class="field">
          <label>Program</label>
          <select
            v-model="callForm.program_id"
            :class="{ 'is-placeholder': !callForm.program_id }"
          >
            <option value="" disabled>Select program</option>
            <option v-for="program in adminStore.programs" :key="program.id" :value="program.id">
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
        <button class="btn-primary" @click="submitCall" :disabled="adminStore.saving">
          {{ editingCallId ? 'Update call' : 'Create call' }}
        </button>
        <button class="btn-secondary" @click="resetCallForm" :disabled="adminStore.saving">Reset</button>
      </div>
    </div>

    <div class="card">
      <h2>Calls</h2>
      <div class="table-wrap" v-if="adminStore.calls.length">
        <table>
          <thead>
          <tr><th>Title</th><th>Program</th><th>Status</th><th>Apps</th><th>Actions</th></tr>
          </thead>
          <tbody>
          <tr v-for="call in adminStore.calls" :key="call.id">
            <td>{{ call.title }}</td>
            <td>{{ call.program?.name }}</td>
            <td><span class="tag">{{ call.status }}</span></td>
            <td>{{ call.applications_count ?? 0 }}</td>
            <td class="action-row">
              <button class="btn-secondary small" @click="editCall(call)">Edit</button>
              <button class="btn-success small" @click="adminStore.openCall(call.id)" :disabled="call.status === 'open'">Open</button>
              <button class="btn-danger small" @click="adminStore.closeCall(call.id)" :disabled="call.status === 'closed'">Close</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="muted">No calls found.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAdminStore } from '@/stores/admin.ts'
import type { AdminCall } from '@/api/admin.ts'

const adminStore = useAdminStore()

const editingCallId = ref<string | null>(null)
const callForm = ref({
  program_id: '',
  title: '',
  description: '',
  opens_at: '',
  closes_at: '',
})

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
  callForm.value = {
    program_id: call.program_id,
    title: call.title,
    description: call.description ?? '',
    opens_at: formatDateTimeLocal(call.opens_at),
    closes_at: formatDateTimeLocal(call.closes_at),
  }
}

async function submitCall() {
  const payload = {
    program_id: callForm.value.program_id,
    title: callForm.value.title,
    description: callForm.value.description || null,
    opens_at: toApiDate(callForm.value.opens_at),
    closes_at: toApiDate(callForm.value.closes_at),
  }

  if (editingCallId.value) {
    await adminStore.updateCall(editingCallId.value, payload)
  } else {
    await adminStore.createCall(payload)
  }
  resetCallForm()
}
</script>

<style scoped>
.grid-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.9rem;
}
.field { display: flex; flex-direction: column; }
.field.full, .checkbox.full { grid-column: 1 / -1; }
.field label {
  margin-bottom: 0.4rem;
  font-weight: 600;
  font-size: 0.85rem;
  color: #374151;
}
.checkbox {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #374151;
  font-weight: 500;
}
.checkbox input { width: auto; }
.actions {
  display: flex;
  gap: 0.6rem;
  margin-top: 1.25rem;
  flex-wrap: wrap;
}

@media (max-width: 1100px) {
  .grid-two, .form-grid { grid-template-columns: 1fr; }
}
</style>
