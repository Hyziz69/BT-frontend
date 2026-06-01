<template>
  <section class="grid-two">
    <div class="card">
      <h2>{{ editingProgramId ? 'Edit program' : 'Create program' }}</h2>

      <div class="form-grid">
        <div class="field">
          <label>Type</label>
          <select v-model="programForm.type">
            <option value="program_a">program_a</option>
            <option value="program_b">program_b</option>
          </select>
        </div>
        <div class="field">
          <label>Name</label>
          <input v-model="programForm.name" type="text" placeholder="Program name" />
        </div>
        <div class="field">
          <label>Min team size</label>
          <input v-model.number="programForm.min_team_size" type="number" min="1" />
        </div>
        <div class="field">
          <label>Max team size</label>
          <input v-model.number="programForm.max_team_size" type="number" min="1" />
        </div>
        <div class="field full">
          <label>Description</label>
          <textarea v-model="programForm.description" rows="3" />
        </div>
        <label class="checkbox full">
          <input v-model="programForm.is_active" type="checkbox" />
          Active
        </label>
      </div>

      <div class="actions">
        <button class="btn-primary" @click="submitProgram" :disabled="adminStore.saving">
          {{ editingProgramId ? 'Update program' : 'Create program' }}
        </button>
        <button class="btn-secondary" @click="resetProgramForm" :disabled="adminStore.saving">Reset</button>
      </div>
    </div>

    <div class="card">
      <h2>Programs</h2>
      <div class="table-wrap" v-if="adminStore.programs.length">
        <table>
          <thead>
          <tr><th>Name</th><th>Type</th><th>Active</th><th>Calls</th><th></th></tr>
          </thead>
          <tbody>
          <tr v-for="program in adminStore.programs" :key="program.id">
            <td>{{ program.name }}</td>
            <td><span class="tag">{{ program.type }}</span></td>
            <td>{{ program.is_active ? 'yes' : 'no' }}</td>
            <td>{{ program.calls_count ?? 0 }}</td>
            <td><button class="btn-secondary small" @click="editProgram(program)">Edit</button></td>
          </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="muted">No programs found.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAdminStore } from '@/stores/admin.ts'
import type { AdminProgram } from '@/api/admin.ts'

const adminStore = useAdminStore()

const editingProgramId = ref<string | null>(null)
const programForm = ref({
  type: 'program_a' as 'program_a' | 'program_b',
  name: '',
  description: '',
  min_team_size: 3,
  max_team_size: 10,
  is_active: true,
})

function resetProgramForm() {
  editingProgramId.value = null
  programForm.value = {
    type: 'program_a',
    name: '',
    description: '',
    min_team_size: 3,
    max_team_size: 10,
    is_active: true,
  }
}

function editProgram(program: AdminProgram) {
  editingProgramId.value = program.id
  programForm.value = {
    type: program.type as 'program_a' | 'program_b',
    name: program.name,
    description: program.description ?? '',
    min_team_size: program.min_team_size,
    max_team_size: program.max_team_size,
    is_active: program.is_active,
  }
}

async function submitProgram() {
  if (editingProgramId.value) {
    await adminStore.updateProgram(editingProgramId.value, programForm.value)
  } else {
    await adminStore.createProgram(programForm.value)
  }
  resetProgramForm()
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
