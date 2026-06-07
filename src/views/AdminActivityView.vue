<template>
  <AppLayout>
    <div class="activity-page">
      <div class="page-header">
        <div>
          <span class="kicker">Monitoring</span>
          <h1>Activity Log</h1>
          <p>Simple history of admin actions in the portal.</p>
        </div>

        <button class="refresh-btn" type="button" :disabled="loading" @click="loadEvents(1)">
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>

      <div class="admin-switch">
        <RouterLink to="/admin" class="switch-link">
          <span>★</span>
          Admin Panel
        </RouterLink>

        <RouterLink to="/admin/activity" class="switch-link active-switch">
          <span>◷</span>
          Activity Log
        </RouterLink>

        <RouterLink to="/admin/reports" class="switch-link">
          <span>&#9635;</span>
          Reports
        </RouterLink>
      </div>

      <p v-if="error" class="alert error-alert">{{ error }}</p>

      <section class="toolbar-card">
        <div class="search-box">
          <span>⌕</span>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search by user, action, entity or IP..."
            @input="scheduleSearch"
          />
        </div>

        <div class="filter-row">
          <button
            v-for="item in entityFilters"
            :key="item.value"
            type="button"
            class="filter-pill"
            :class="{ active: filters.entity_type === item.value }"
            @click="setEntity(item.value)"
          >
            {{ item.label }}
          </button>
        </div>

        <div class="filter-row">
          <button
            v-for="item in dateFilters"
            :key="item.value"
            type="button"
            class="filter-pill soft"
            :class="{ active: activeDatePreset === item.value }"
            @click="setDatePreset(item.value)"
          >
            {{ item.label }}
          </button>

          <button type="button" class="filter-pill clear" @click="resetFilters">
            Clear
          </button>
        </div>
      </section>

      <section class="summary-grid">
        <div class="summary-card">
          <span class="summary-icon">◷</span>
          <div>
            <p>Total logs</p>
            <strong>{{ pagination.total }}</strong>
          </div>
        </div>

        <div class="summary-card">
          <span class="summary-icon green">◎</span>
          <div>
            <p>Shown</p>
            <strong>{{ events.length }}</strong>
          </div>
        </div>

        <div class="summary-card">
          <span class="summary-icon yellow">⌁</span>
          <div>
            <p>Filters</p>
            <strong>{{ activeFiltersCount }}</strong>
          </div>
        </div>
      </section>

      <section class="feed-card">
        <div class="feed-header">
          <div>
            <h2>Recent activity</h2>
            <p>Logs appear here after admin creates, updates, approves, rejects or deletes something.</p>
          </div>

          <select v-model.number="filters.per_page" @change="loadEvents(1)">
            <option :value="10">10</option>
            <option :value="15">15</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
          </select>
        </div>

        <div v-if="loading" class="empty-state">
          <span>◷</span>
          <h3>Loading activity...</h3>
        </div>

        <div v-else-if="!events.length" class="empty-state">
          <span>◷</span>
          <h3>No activity yet</h3>
          <p>
            Audit log saves only new admin actions. Go to Admin page, approve/update/delete something,
            then refresh this page.
          </p>
        </div>

        <div v-else class="activity-feed">
          <article v-for="event in events" :key="event.id" class="activity-item">
            <div class="event-icon" :class="actionInfo(event.action).tone">
              {{ actionInfo(event.action).icon }}
            </div>

            <div class="event-body">
              <div class="event-top">
                <div>
                  <h3>{{ formatAction(event.action) }}</h3>
                  <p>
                    {{ actorName(event) }}
                    <span>·</span>
                    {{ entityName(event.entity_type) }}
                    <template v-if="event.entity_id">
                      #{{ shortId(event.entity_id) }}
                    </template>
                  </p>
                </div>

                <time>{{ formatDate(event.created_at) }}</time>
              </div>

              <div class="meta-row">
                <span v-if="event.ip_address">IP: {{ event.ip_address }}</span>
                <span v-if="event.actor?.email">{{ event.actor.email }}</span>
              </div>

              <details v-if="payloadRows(event.payload).length" class="payload-details">
                <summary>Details</summary>

                <div class="payload-grid">
                  <div v-for="row in payloadRows(event.payload)" :key="row.key">
                    <span>{{ row.key }}</span>
                    <strong>{{ row.value }}</strong>
                  </div>
                </div>
              </details>
            </div>
          </article>
        </div>

        <div v-if="pagination.last_page > 1" class="pagination">
          <button
            type="button"
            :disabled="pagination.current_page <= 1 || loading"
            @click="loadEvents(pagination.current_page - 1)"
          >
            Previous
          </button>

          <span>Page {{ pagination.current_page }} / {{ pagination.last_page }}</span>

          <button
            type="button"
            :disabled="pagination.current_page >= pagination.last_page || loading"
            @click="loadEvents(pagination.current_page + 1)"
          >
            Next
          </button>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import { adminApi } from '../api/admin'

interface AuditActor {
  id: string
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  account_type?: string | null
}

interface AuditEvent {
  id: string
  actor_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  payload: Record<string, unknown> | string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  actor?: AuditActor | null
}

interface Pagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

const loading = ref(false)
const error = ref('')
const events = ref<AuditEvent[]>([])
const searchTimer = ref<number | null>(null)
const activeDatePreset = ref('all')

const pagination = reactive<Pagination>({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
})

const filters = reactive({
  search: '',
  entity_type: '',
  date_from: '',
  date_to: '',
  sort: 'newest',
  per_page: 15,
})

const entityFilters = [
  { label: 'All', value: '' },
  { label: 'Users', value: 'user' },
  { label: 'Applications', value: 'application' },
  { label: 'Calls', value: 'call' },
  { label: 'Programs', value: 'program' },
]

const dateFilters = [
  { label: 'All time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: '7 days', value: '7days' },
  { label: '30 days', value: '30days' },
]

const activeFiltersCount = computed(() => {
  let count = 0

  if (filters.search) count++
  if (filters.entity_type) count++
  if (filters.date_from || filters.date_to) count++

  return count
})

onMounted(() => {
  loadEvents(1)
})

async function loadEvents(page = 1) {
  loading.value = true
  error.value = ''

  try {
    const response = await adminApi.getAuditEvents({
      search: filters.search || undefined,
      entity_type: filters.entity_type || undefined,
      date_from: filters.date_from || undefined,
      date_to: filters.date_to || undefined,
      sort: filters.sort as 'newest' | 'oldest',
      per_page: filters.per_page,
      page,
    })

    events.value = response.data ?? []

    pagination.current_page = response.current_page ?? page
    pagination.last_page = response.last_page ?? 1
    pagination.per_page = response.per_page ?? filters.per_page
    pagination.total = response.total ?? events.value.length
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Failed to load audit log.'
  } finally {
    loading.value = false
  }
}

function scheduleSearch() {
  if (searchTimer.value) {
    window.clearTimeout(searchTimer.value)
  }

  searchTimer.value = window.setTimeout(() => {
    loadEvents(1)
  }, 350)
}

function setEntity(entity: string) {
  filters.entity_type = entity
  loadEvents(1)
}

function setDatePreset(type: string) {
  activeDatePreset.value = type

  if (type === 'all') {
    filters.date_from = ''
    filters.date_to = ''
    loadEvents(1)
    return
  }

  const today = new Date()
  const from = new Date()

  if (type === '7days') {
    from.setDate(today.getDate() - 7)
  }

  if (type === '30days') {
    from.setDate(today.getDate() - 30)
  }

  filters.date_from = toDateInput(type === 'today' ? today : from)
  filters.date_to = toDateInput(today)

  loadEvents(1)
}

function resetFilters() {
  filters.search = ''
  filters.entity_type = ''
  filters.date_from = ''
  filters.date_to = ''
  filters.sort = 'newest'
  filters.per_page = 15
  activeDatePreset.value = 'all'

  loadEvents(1)
}

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10)
}

function actionInfo(action: string) {
  const value = action.toLowerCase()

  if (value.includes('approve')) {
    return { icon: '✓', tone: 'success' }
  }

  if (value.includes('reject') || value.includes('delete')) {
    return { icon: '!', tone: 'danger' }
  }

  if (value.includes('create') || value.includes('open')) {
    return { icon: '+', tone: 'create' }
  }

  if (value.includes('assign')) {
    return { icon: '★', tone: 'assign' }
  }

  if (value.includes('update') || value.includes('close')) {
    return { icon: '✎', tone: 'update' }
  }

  return { icon: '◷', tone: 'default' }
}

function formatAction(action: string) {
  if (!action) {
    return 'Unknown action'
  }

  return action
    .replaceAll('_', ' ')
    .replaceAll('.', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function entityName(entity: string | null) {
  if (!entity) {
    return 'System'
  }

  return entity
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function actorName(event: AuditEvent) {
  const actor = event.actor

  if (!actor) {
    return event.actor_id ? `User #${shortId(event.actor_id)}` : 'System'
  }

  const fullName = `${actor.first_name ?? ''} ${actor.last_name ?? ''}`.trim()

  return fullName || actor.email || `User #${shortId(actor.id)}`
}

function shortId(value: string | null) {
  if (!value) {
    return '—'
  }

  return String(value).slice(0, 8)
}

function formatDate(value: string) {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleString()
}

function payloadRows(payload: AuditEvent['payload']) {
  if (!payload) {
    return []
  }

  let data: Record<string, unknown> = {}

  if (typeof payload === 'string') {
    try {
      data = JSON.parse(payload)
    } catch {
      return [{ key: 'details', value: payload }]
    }
  } else {
    data = payload
  }

  return Object.entries(data)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .slice(0, 6)
    .map(([key, value]) => ({
      key: key.replaceAll('_', ' '),
      value: formatPayloadValue(value),
    }))
}

function formatPayloadValue(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value)) {
    return value.join(', ')
  }

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}
</script>

<style scoped>
.activity-page {
  max-width: 1050px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 2.5rem 0 2rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1rem;
}

.kicker {
  display: inline-flex;
  background: #ecfdf5;
  color: #047857;
  border-radius: 999px;
  padding: 0.25rem 0.7rem;
  font-size: 0.78rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
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

.admin-switch {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-bottom: 1.25rem;
}

.switch-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.9rem;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #334155;
  text-decoration: none;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: 0.86rem;
  transition: all 0.15s ease;
}

.switch-link:hover,
.active-switch {
  background: #0f1117;
  border-color: #0f1117;
  color: #6ee7b7;
}

.refresh-btn {
  height: 42px;
  background: #0f1117;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 0 1rem;
  font-weight: 800;
  cursor: pointer;
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

.toolbar-card,
.summary-card,
.feed-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}

.toolbar-card {
  padding: 1.25rem;
  margin-bottom: 1.25rem;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  height: 46px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 0 0.9rem;
  margin-bottom: 1rem;
}

.search-box span {
  color: #8892a4;
}

.search-box input {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  font: inherit;
}

.search-box:focus-within {
  border-color: #6ee7b7;
  box-shadow: 0 0 0 3px rgba(110, 231, 183, 0.15);
}

.search-box input:focus {
  outline: none;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-row + .filter-row {
  margin-top: 0.65rem;
}

.filter-pill {
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #374151;
  border-radius: 999px;
  padding: 0.45rem 0.8rem;
  font-weight: 800;
  cursor: pointer;
}

.filter-pill:hover,
.filter-pill.active {
  background: #0f1117;
  border-color: #0f1117;
  color: #6ee7b7;
}

.filter-pill.soft.active {
  background: #ecfdf5;
  border-color: #bbf7d0;
  color: #047857;
}

.filter-pill.clear {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fecaca;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.15rem;
}

.summary-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #eff6ff;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
}

.summary-icon.green {
  background: #f0fdf4;
  color: #22c55e;
}

.summary-icon.yellow {
  background: #fef3c7;
  color: #d97706;
}

.summary-card p {
  color: #8892a4;
  font-size: 0.82rem;
  margin-bottom: 0.15rem;
}

.summary-card strong {
  color: #0f1117;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.15rem;
  font-weight: 800;
}

.feed-card {
  padding: 1.25rem;
}

.feed-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.feed-header h2 {
  color: #0f1117;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.15rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
}

.feed-header p {
  color: #8892a4;
  font-size: 0.88rem;
}

.feed-header select {
  width: 90px;
  height: 42px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 0 0.7rem;
  background: #ffffff;
  font: inherit;
}

.activity-feed {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.activity-item {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 0.9rem;
  padding: 1rem;
  border-radius: 14px;
  background: #f9fafb;
  border: 1px solid #f1f5f9;
}

.event-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
}

.event-icon.success {
  background: #dcfce7;
  color: #15803d;
}

.event-icon.danger {
  background: #fee2e2;
  color: #b91c1c;
}

.event-icon.create {
  background: #ecfdf5;
  color: #047857;
}

.event-icon.assign {
  background: #f5f3ff;
  color: #7c3aed;
}

.event-icon.update {
  background: #fef3c7;
  color: #d97706;
}

.event-top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.event-top h3 {
  color: #0f1117;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1rem;
  font-weight: 800;
  margin-bottom: 0.2rem;
}

.event-top p,
.event-top time {
  color: #8892a4;
  font-size: 0.82rem;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.65rem;
}

.meta-row span {
  background: #ffffff;
  color: #64748b;
  border-radius: 999px;
  padding: 0.3rem 0.6rem;
  font-size: 0.76rem;
}

.payload-details {
  margin-top: 0.75rem;
}

.payload-details summary {
  cursor: pointer;
  color: #047857;
  font-size: 0.82rem;
  font-weight: 800;
}

.payload-grid {
  margin-top: 0.6rem;
  background: #ffffff;
  border-radius: 12px;
  padding: 0.75rem;
}

.payload-grid div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.35rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.payload-grid div:last-child {
  border-bottom: none;
}

.payload-grid span {
  color: #64748b;
  font-size: 0.78rem;
  text-transform: capitalize;
}

.payload-grid strong {
  color: #0f1117;
  font-size: 0.78rem;
  text-align: right;
  overflow-wrap: anywhere;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #8892a4;
  background: #f9fafb;
  border-radius: 14px;
}

.empty-state span {
  display: block;
  color: #6ee7b7;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.empty-state h3 {
  color: #0f1117;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  margin-bottom: 0.35rem;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.85rem;
  margin-top: 1rem;
}

.pagination button {
  background: #ffffff;
  color: #0f1117;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 0.6rem 0.9rem;
  font-weight: 800;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination span {
  color: #64748b;
  font-weight: 700;
  font-size: 0.85rem;
}

@media (max-width: 900px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .page-header,
  .feed-header,
  .event-top {
    flex-direction: column;
    align-items: stretch;
  }

  .activity-item {
    grid-template-columns: 1fr;
  }
}
</style>