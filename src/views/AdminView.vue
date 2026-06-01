<template>
  <AppLayout>
    <div class="admin">
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Admin Panel</h1>
          <p class="page-subtitle">User approvals, calls, programs, mentor assignment and reporting.</p>
        </div>
        <button
          class="btn-secondary"
          @click="adminStore.loadAll"
          :disabled="adminStore.loading || adminStore.saving"
        >
          Refresh
        </button>
      </div>

      <div v-if="adminStore.accessDenied" class="empty">
        <div class="empty-icon">⛔</div>
        <h2>403 — Access denied</h2>
        <p>You do not have enough permissions to access this page.</p>
      </div>

      <div v-else-if="adminStore.loading && !adminStore.stats" class="loading">
        Loading admin data...
      </div>

      <template v-else>
        <p v-if="adminStore.error" class="banner error">{{ adminStore.error }}</p>
        <p v-if="adminStore.successMessage" class="banner success">{{ adminStore.successMessage }}</p>

        <AdminStats />

        <AdminUsers />

        <AdminPrograms />

        <AdminCalls />

        <AdminApplications />
      </template>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin' // Проверь путь к стору
import AppLayout from '../components/AppLayout.vue'

// Импортируем новые атомарные компоненты
import AdminStats from '../components/admin/AdminStats.vue'
import AdminUsers from '../components/admin/AdminUsers.vue'
import AdminPrograms from '../components/admin/AdminPrograms.vue'
import AdminCalls from '../components/admin/AdminCalls.vue'
import AdminApplications from '../components/admin/AdminApplications.vue'

const adminStore = useAdminStore()

// Триггерим загрузку всех данных один раз при инициализации страницы
onMounted(() => {
  adminStore.loadAll()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.admin { max-width: 1280px; font-family: 'DM Sans', sans-serif; color: #0f1117; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; padding: 2rem 0 1.5rem 0; border-bottom: 1px solid #e5e7eb; }
.page-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem; }
.page-subtitle { color: #8892a4; font-size: 0.95rem; }
.banner { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem; }
.banner.error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
.banner.success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.loading { color: #8892a4; padding: 2rem 0; }
.empty { text-align: center; padding: 4rem 2rem; color: #8892a4; }
.empty-icon { font-size: 2.5rem; margin-bottom: 1rem; }
.empty h2 { font-family: 'Plus Jakarta Sans', sans-serif; color: #0f1117; margin-bottom: 0.5rem; }
</style>

<style>
.card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); margin-bottom: 1.25rem; }
.card h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; }

/* Формы */
input, textarea, select {
  width: 100%; padding: 0.6rem 0.8rem; border: 1px solid #e5e7eb; border-radius: 8px;
  font-size: 0.92rem; font-family: 'DM Sans', sans-serif; background: #fff; color: #0f1117;
  box-sizing: border-box; transition: border-color 0.15s;
}
input:focus, textarea:focus, select:focus { outline: none; border-color: #6ee7b7; }
select {
  appearance: none; -webkit-appearance: none; -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238892a4' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e");
  background-repeat: no-repeat; background-position: right 0.75rem center;
  padding-right: 2.25rem; cursor: pointer;
}
select.is-placeholder { color: #8892a4; }
select option { color: #0f1117; }
select option[disabled] { color: #8892a4; }

/* Кнопки */
.btn-primary, .btn-secondary, .btn-success, .btn-danger {
  border: none; border-radius: 8px; padding: 0.6rem 1.1rem; cursor: pointer; font-size: 0.9rem; font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif; transition: opacity 0.15s, background 0.15s;
}
.btn-primary { background: #0f1117; color: white; }
.btn-secondary { background: #f3f4f6; color: #374151; }
.btn-success { background: #16a34a; color: white; }
.btn-danger { background: #dc2626; color: white; }
.btn-primary:hover:not(:disabled), .btn-success:hover:not(:disabled), .btn-danger:hover:not(:disabled) { opacity: 0.88; }
.btn-secondary:hover:not(:disabled) { background: #e5e7eb; }
.btn-primary:disabled, .btn-secondary:disabled, .btn-success:disabled, .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
.small { padding: 0.4rem 0.75rem; font-size: 0.82rem; }

/* Таблицы */
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
th, td { text-align: left; padding: 0.75rem 0.85rem; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
th { background: #fafafa; color: #8892a4; font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #e5e7eb; }
tbody tr:hover { background: #fafbfc; }
.action-row { display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap; }

/* Утилиты */
.tag { background: #eff6ff; color: #2563eb; padding: 0.18rem 0.55rem; border-radius: 6px; font-size: 0.78rem; font-weight: 600; text-transform: capitalize; }
.muted { color: #8892a4; font-size: 0.9rem; }
</style>
