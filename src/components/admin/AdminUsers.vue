<template>
  <section class="card">
    <h2>User approvals</h2>

    <div class="filters">
      <input v-model="userSearch" type="text" placeholder="Search by name or email" />
      <select v-model="userStatusFilter">
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="active">Approved</option>
        <option value="suspended">Rejected</option>
      </select>
      <select v-model="userTypeFilter">
        <option value="">All types</option>
        <option value="student">Student</option>
        <option value="mentor">Mentor</option>
        <option value="company_contact">Company contact</option>
        <option value="nti_admin">Admin</option>
      </select>
    </div>

    <div class="table-wrap" v-if="filteredUsers.length">
      <table>
        <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Account type</th>
          <th>Status</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="user in filteredUsers" :key="user.id">
          <td>{{ user.first_name }} {{ user.last_name }}</td>
          <td>{{ user.email }}</td>
          <td><span class="tag">{{ user.account_type }}</span></td>
          <td><span class="status-badge" :class="statusClass(user.status)">{{ user.status }}</span></td>
          <td>{{ formatDate(user.created_at) }}</td>
          <td class="action-row">
            <button
              class="btn-success small"
              @click="adminStore.approveUser(user.id)"
              :disabled="adminStore.saving || user.status === 'active'"
            >
              Approve
            </button>
            <button
              class="btn-danger small"
              @click="adminStore.rejectUser(user.id)"
              :disabled="adminStore.saving || user.status === 'suspended'"
            >
              Reject
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="muted">No users found.</p>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAdminStore } from '@/stores/admin.ts'

const adminStore = useAdminStore()

// Локальные фильтры (хранятся внутри компонента)
const userSearch = ref('')
const userStatusFilter = ref('')
const userTypeFilter = ref('')

const filteredUsers = computed(() => {
  return adminStore.users.filter((user) => {
    const search = userSearch.value.trim().toLowerCase()
    const matchesSearch =
      !search ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)

    const matchesStatus = !userStatusFilter.value || user.status === userStatusFilter.value
    const matchesType = !userTypeFilter.value || user.account_type === userTypeFilter.value

    return matchesSearch && matchesStatus && matchesType
  })
})

function formatDate(value: string) {
  return new Date(value).toLocaleString()
}

function statusClass(status: string) {
  if (status === 'active') return 'status-active'
  if (status === 'pending') return 'status-pending'
  if (status === 'suspended') return 'status-rejected'
  return 'status-default'
}
</script>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1rem;
}
.filters input { flex: 1; min-width: 220px; }
.filters select { width: auto; min-width: 160px; }

.status-badge {
  display: inline-block;
  border-radius: 999px;
  padding: 0.2rem 0.7rem;
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: capitalize;
}
.status-active { background: #f0fdf4; color: #16a34a; }
.status-pending { background: #fef3c7; color: #b45309; }
.status-rejected { background: #fef2f2; color: #dc2626; }
.status-default { background: #f3f4f6; color: #6b7280; }
</style>
