<template>
  <section v-if="adminStore.stats" class="stats-grid">
    <div class="stat-card"><h3>Total applications</h3><p>{{ adminStore.stats.total_applications }}</p></div>
    <div class="stat-card"><h3>Approved</h3><p>{{ adminStore.stats.approved_applications }}</p></div>
    <div class="stat-card"><h3>Rejected</h3><p>{{ adminStore.stats.rejected_applications }}</p></div>
    <div class="stat-card"><h3>Pending applications</h3><p>{{ adminStore.stats.pending_applications }}</p></div>
    <div class="stat-card"><h3>Open calls</h3><p>{{ adminStore.stats.open_calls }}</p></div>
    <div class="stat-card"><h3>Programs</h3><p>{{ adminStore.stats.total_programs }}</p></div>
    <div class="stat-card"><h3>Mentors</h3><p>{{ adminStore.stats.mentors_count }}</p></div>
    <div class="stat-card"><h3>Pending users</h3><p>{{ adminStore.stats.pending_users_count }}</p></div>
  </section>
</template>

<script setup lang="ts">
import { useAdminStore } from '@/stores/admin.ts'

const adminStore = useAdminStore()
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.stat-card h3 {
  font-size: 0.8rem;
  font-weight: 500;
  color: #8892a4;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.stat-card p {
  font-family: 'Plus Jakarta Sans', sans-serif;
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f1117;
}
</style>
