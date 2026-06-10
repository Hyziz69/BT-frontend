<template>
  <AppLayout>
    <div class="reports-page">
      <div class="page-header">
        <div>
          <span class="kicker">Admin exports</span>
          <h1>Reports</h1>
          <p>Export platform data to CSV for administration, analysis and documentation.</p>
        </div>

        <button class="refresh-btn" type="button" :disabled="loading" @click="loadReports">
          {{ loading ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>

      <div class="admin-switch">
        <RouterLink to="/admin" class="switch-link">
          <span>★</span>
          Admin Panel
        </RouterLink>

        <RouterLink to="/admin/activity" class="switch-link">
          <span>⊙</span>
          Activity Log
        </RouterLink>

        <RouterLink to="/admin/reports" class="switch-link active-switch">
          <span>▣</span>
          Reports
        </RouterLink>

        <RouterLink to="/admin/content" class="switch-link">
          <span>✎</span>
          Content
        </RouterLink>
      </div>

      <p v-if="error" class="alert error-alert">{{ error }}</p>

      <section class="filters-card">
        <div class="field">
          <label>Status</label>
          <select v-model="filters.status">
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="formally_verified">Formally verified</option>
            <option value="in_evaluation">In evaluation</option>
            <option value="pending_supplement">Pending supplement</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div class="field">
          <label>User role</label>
          <select v-model="filters.account_type">
            <option value="">All roles</option>
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
            <option value="company_contact">Company contact</option>
            <option value="nti_admin">NTI admin</option>
            <option value="superadmin">Super admin</option>
          </select>
        </div>

        <div class="field">
          <label>Program</label>
          <select v-model="filters.program_type">
            <option value="">All programs</option>
            <option value="program_a">Program A</option>
            <option value="program_b">Program B</option>
          </select>
        </div>

        <div class="field">
            <label>From</label>
            <input
                v-model="filters.date_from"
                type="date"
                lang="en-CA"
            />
            </div>

            <div class="field">
            <label>To</label>
            <input
                v-model="filters.date_to"
                type="date"
                lang="en-CA"
            />
        </div>

        <button class="filter-btn" type="button" :disabled="loading" @click="loadReports">
          Apply
        </button>
      </section>

      <section class="summary-grid">
        <div v-for="card in summaryCards" :key="card.label" class="summary-card">
          <span class="summary-icon">{{ card.icon }}</span>
          <div>
            <p>{{ card.label }}</p>
            <strong>{{ card.value }}</strong>
          </div>
        </div>
      </section>

      <section class="reports-grid">
        <article v-for="report in reports" :key="report.type" class="report-card">
          <div>
            <span class="report-icon">▣</span>
            <h3>{{ report.name }}</h3>
            <p>{{ report.description }}</p>
          </div>

          <button
            class="download-btn"
            type="button"
            :disabled="downloading === report.type"
            @click="download(report.type)"
          >
            {{ downloading === report.type ? 'Downloading...' : 'Download CSV' }}
          </button>
        </article>
      </section>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import { reportsApi, type AdminReportFilters, type AdminReportInfo } from '../api/reports'

const loading = ref(false)
const downloading = ref<string | null>(null)
const error = ref('')
const reports = ref<AdminReportInfo[]>([])
const summary = ref<Record<string, any>>({})

const filters = ref<AdminReportFilters>({
  status: '',
  account_type: '',
  program_type: '',
  date_from: '',
  date_to: '',
})

const summaryCards = computed(() => [
  { label: 'Users', value: summary.value?.users?.total ?? '-', icon: '●' },
  { label: 'Programs', value: summary.value?.programs?.total ?? '-', icon: '▣' },
  { label: 'Calls', value: summary.value?.calls?.total ?? '-', icon: '⊙' },
  { label: 'Applications', value: summary.value?.applications?.total ?? '-', icon: '◆' },
  { label: 'Teams', value: summary.value?.teams?.total ?? '-', icon: '★' },
  { label: 'Mentorships', value: summary.value?.mentorships?.total ?? '-', icon: '✓' },
])

onMounted(loadReports)

async function loadReports() {
  loading.value = true
  error.value = ''

  try {
    const response = await reportsApi.getReports(filters.value)
    reports.value = response.reports
    summary.value = response.summary
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Failed to load reports.'
  } finally {
    loading.value = false
  }
}

async function download(type: AdminReportInfo['type']) {
  downloading.value = type
  error.value = ''

  try {
    await reportsApi.downloadCsv(type, filters.value)
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Failed to download report.'
  } finally {
    downloading.value = null
  }
}
</script>

<style scoped>
.reports-page {
  max-width: 1100px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 2.5rem 0 2rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.25rem;
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

.refresh-btn,
.filter-btn,
.download-btn {
  height: 42px;
  background: #0f1117;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 0 1rem;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
}

.refresh-btn:disabled,
.filter-btn:disabled,
.download-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
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

.filters-card,
.summary-card,
.report-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}

.filters-card {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr)) auto;
  gap: 0.85rem;
  align-items: end;
  padding: 1rem;
  margin-bottom: 1rem;
}

.field label {
  display: block;
  color: #334155;
  font-weight: 800;
  font-size: 0.78rem;
  margin-bottom: 0.35rem;
}

.field input,
.field select {
  width: 100%;
  height: 42px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 0 0.75rem;
  font: inherit;
  background: #ffffff;
  color: #0f172a;
}

.field input::placeholder {
  color: #94a3b8;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.85rem;
  margin-bottom: 1rem;
}

.summary-card {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.summary-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #ecfdf5;
  color: #047857;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
}

.summary-card p {
  color: #8892a4;
  font-size: 0.8rem;
  margin-bottom: 0.15rem;
}

.summary-card strong {
  color: #0f1117;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.15rem;
  font-weight: 800;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.report-card {
  min-height: 210px;
  padding: 1.15rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.report-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #ecfdf5;
  color: #047857;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  margin-bottom: 0.9rem;
}

.report-card h3 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #0f1117;
  font-size: 1rem;
  font-weight: 800;
  margin-bottom: 0.35rem;
}

.report-card p {
  color: #64748b;
  line-height: 1.45;
  font-size: 0.88rem;
}

.download-btn {
  margin-top: 1rem;
  width: fit-content;
}

@media (max-width: 1100px) {
  .filters-card,
  .summary-grid,
  .reports-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 760px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-card,
  .summary-grid,
  .reports-grid {
    grid-template-columns: 1fr;
  }
}
</style>