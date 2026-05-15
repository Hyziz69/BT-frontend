<template>
  <div class="dashboard">
    <nav class="navbar">
      <span class="brand">NTI Portal</span>
      <div class="nav-links">
        <RouterLink to="/teams">Teams</RouterLink>
        <RouterLink to="/applications">Applications</RouterLink>
        <RouterLink v-if="isAdmin" to="/admin">Admin</RouterLink>
        <button @click="handleLogout" class="btn-logout">Logout</button>
      </div>
    </nav>

    <div class="content">

      <!-- Greeting -->
      <div class="greeting">
        <div>
          <p class="greeting-label">Dobré ráno</p>
          <h1 class="greeting-name">{{ authStore.user?.first_name ?? 'User' }}</h1>
        </div>
        <span class="role-badge">{{ roleLabel }}</span>
      </div>

      <!-- Quick nav cards -->
      <div class="quick-cards">
        <RouterLink to="/teams" class="qcard qcard-blue">
          <div class="qcard-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="9" cy="7" r="3" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="17" cy="9" r="2.5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M3 20c0-4 2.7-6 6-6h6c3.3 0 6 2 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div>
            <p class="qcard-title">Moje tímy</p>
            <p class="qcard-sub">Správa a detail tímov</p>
          </div>
          <span class="qcard-arrow">→</span>
        </RouterLink>

        <RouterLink to="/applications" class="qcard qcard-green">
          <div class="qcard-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="1.5"/>
              <path d="M8 12l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <p class="qcard-title">Prihlášky</p>
            <p class="qcard-sub">Program A & B</p>
          </div>
          <span class="qcard-arrow">→</span>
        </RouterLink>

        <RouterLink v-if="isAdmin" to="/admin" class="qcard qcard-purple">
          <div class="qcard-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div>
            <p class="qcard-title">Admin panel</p>
            <p class="qcard-sub">Správa používateľov</p>
          </div>
          <span class="qcard-arrow">→</span>
        </RouterLink>
      </div>

      <!-- Two-column layout -->
      <div class="main-grid">

        <!-- Feed -->
        <section class="feed-section">
          <div class="section-head">
            <h2>Dianie</h2>
            <div class="feed-filters">
              <button
                v-for="f in filters"
                :key="f.key"
                class="filter-btn"
                :class="{ active: activeFilter === f.key }"
                @click="activeFilter = f.key"
              >{{ f.label }}</button>
            </div>
          </div>

          <div class="feed">
            <div
              v-for="event in filteredFeed"
              :key="event.id"
              class="feed-item"
              :class="`feed-${event.type}`"
            >
              <div class="feed-dot" />
              <div class="feed-body">
                <p class="feed-text">
                  <span class="feed-actor">{{ event.actor }}</span>
                  {{ event.action }}
                  <span v-if="event.subject" class="feed-subject">"{{ event.subject }}"</span>
                </p>
                <span class="feed-time">{{ event.time }}</span>
              </div>
            </div>

            <p v-if="filteredFeed.length === 0" class="feed-empty">Žiadne udalosti.</p>
          </div>
        </section>

        <!-- Sidebar -->
        <aside class="sidebar">

          <!-- Deadlines -->
          <div class="sidebar-card">
            <h3 class="sidebar-title">Termíny</h3>
            <div class="deadline-list">
              <div v-for="d in deadlines" :key="d.id" class="deadline-item">
                <div class="deadline-left">
                  <span class="deadline-dot" :class="`dl-${d.urgency}`" />
                  <span class="deadline-name">{{ d.name }}</span>
                </div>
                <span class="deadline-date" :class="`dl-${d.urgency}`">{{ d.date }}</span>
              </div>
            </div>
          </div>

          <!-- Quick stats -->
          <div class="sidebar-card">
            <h3 class="sidebar-title">Štatistiky</h3>
            <div class="stats-grid">
              <div class="stat-item" v-for="s in stats" :key="s.label">
                <span class="stat-value">{{ s.value }}</span>
                <span class="stat-label">{{ s.label }}</span>
              </div>
            </div>
          </div>

        </aside>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../api/axios'

const router = useRouter()
const authStore = useAuthStore()
const isAdmin = ref(false)

const roleMap: Record<string, string> = {
  student: 'Študent',
  mentor: 'Mentor',
  nti_admin: 'Admin',
  superadmin: 'Superadmin',
  evaluator: 'Hodnotiteľ',
  firm: 'Firma',
}
const roleLabel = computed(() =>
  roleMap[authStore.user?.account_type ?? ''] ?? authStore.user?.account_type ?? ''
)

// ─── Feed data ────────────────────────────────────────────────────────────────

const feed = [
  { id: 1,  type: 'team',     actor: 'Tím WebFlow',    action: 'sa zaregistroval do',  subject: 'Program B',          time: 'pred 2 hod' },
  { id: 2,  type: 'announce', actor: 'NTI',            action: 'oznamuje otvorenie prihlášok na jar 2026', subject: '', time: 'pred 5 hod' },
  { id: 3,  type: 'report',   actor: 'Projekt AppX',   action: 'odovzdal štvrťročnú správu', subject: 'Q1 2026',       time: 'pred 1 dňom' },
  { id: 4,  type: 'mentor',   actor: 'Ján Novák',      action: 'bol pridaný ako mentor do', subject: 'DataLab',        time: 'pred 2 dňami' },
  { id: 5,  type: 'team',     actor: 'Tím AlphaCode',  action: 'aktualizoval profil tímu', subject: '',                time: 'pred 3 dňami' },
  { id: 6,  type: 'announce', actor: 'NTI',            action: 'zverejnilo výsledky hodnotenia za', subject: 'Q4 2025', time: 'pred 4 dňami' },
  { id: 7,  type: 'report',   actor: 'Projekt BioTrack', action: 'prešiel do fázy',     subject: 'MVP vývoj',          time: 'pred 5 dňami' },
  { id: 8,  type: 'mentor',   actor: 'Eva Kováčová',   action: 'pridala komentár k projektu', subject: 'CityNav',      time: 'pred 6 dňami' },
]

const filters = [
  { key: 'all',      label: 'Všetko' },
  { key: 'announce', label: 'Oznamy' },
  { key: 'team',     label: 'Tímy' },
  { key: 'report',   label: 'Správy' },
  { key: 'mentor',   label: 'Mentori' },
]
const activeFilter = ref('all')
const filteredFeed = computed(() =>
  activeFilter.value === 'all' ? feed : feed.filter(e => e.type === activeFilter.value)
)

// ─── Sidebar data ─────────────────────────────────────────────────────────────

const deadlines = [
  { id: 1, name: 'Podanie prihlášky Program A', date: '31. máj',  urgency: 'hot' },
  { id: 2, name: 'Štvrťročná správa Q2',        date: '15. jún',  urgency: 'mid' },
  { id: 3, name: 'Prezentácia výsledkov',        date: '10. júl',  urgency: 'low' },
]

const stats = [
  { value: '3',  label: 'Aktívne projekty' },
  { value: '12', label: 'Členov tímov' },
  { value: '2',  label: 'Prihlášky' },
  { value: '5',  label: 'Správy' },
]

// ─── Auth ─────────────────────────────────────────────────────────────────────

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) return
  try {
    const response = await api.get('/user', { headers: { Authorization: `Bearer ${token}` } })
    isAdmin.value = response.data.account_type === 'nti_admin'
  } catch {
    isAdmin.value = false
  }
})

function handleLogout() {
  authStore.logout()
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #050a14;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* ── Navbar ── */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 2.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: #070d1c;
}
.brand {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: white;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.nav-links a {
  color: rgba(255,255,255,0.5);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}
.nav-links a:hover { color: white; }
.btn-logout {
  background: rgba(239,68,68,0.15);
  border: 1px solid rgba(239,68,68,0.3);
  color: rgba(239,68,68,0.8);
  padding: 0.35rem 0.9rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.btn-logout:hover {
  background: rgba(239,68,68,0.25);
  color: #f87171;
}

/* ── Content ── */
.content {
  max-width: 1160px;
  margin: 0 auto;
  padding: 2.5rem 2rem;
}

/* ── Greeting ── */
.greeting {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}
.greeting-label {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.3);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 0.25rem;
}
.greeting-name {
  font-size: 2rem;
  font-weight: 800;
  color: white;
}
.role-badge {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0.3rem 0.9rem;
  border-radius: 50px;
  background: rgba(96,165,250,0.1);
  border: 1px solid rgba(96,165,250,0.25);
  color: #60a5fa;
}

/* ── Quick cards ── */
.quick-cards {
  display: flex;
  gap: 1rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
}
.qcard {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1.4rem;
  border-radius: 12px;
  text-decoration: none;
  border: 1px solid transparent;
  transition: transform 0.2s, border-color 0.2s;
}
.qcard:hover { transform: translateY(-2px); }
.qcard-blue {
  background: rgba(37,99,235,0.1);
  border-color: rgba(37,99,235,0.25);
  color: #93c5fd;
}
.qcard-blue:hover { border-color: rgba(37,99,235,0.5); }
.qcard-green {
  background: rgba(16,185,129,0.08);
  border-color: rgba(16,185,129,0.2);
  color: #6ee7b7;
}
.qcard-green:hover { border-color: rgba(16,185,129,0.45); }
.qcard-purple {
  background: rgba(139,92,246,0.08);
  border-color: rgba(139,92,246,0.2);
  color: #c4b5fd;
}
.qcard-purple:hover { border-color: rgba(139,92,246,0.45); }

.qcard-icon {
  opacity: 0.7;
  flex-shrink: 0;
}
.qcard-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.15rem;
}
.qcard-sub {
  font-size: 0.78rem;
  opacity: 0.5;
}
.qcard-arrow {
  margin-left: auto;
  opacity: 0.3;
  font-size: 1rem;
}

/* ── Main grid ── */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1.5rem;
  align-items: start;
}

/* ── Feed ── */
.feed-section {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  padding: 1.75rem;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.section-head h2 {
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
}

.feed-filters {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.filter-btn {
  font-size: 0.72rem;
  padding: 0.25rem 0.7rem;
  border-radius: 50px;
  border: 1px solid rgba(255,255,255,0.1);
  background: transparent;
  color: rgba(255,255,255,0.35);
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
  white-space: nowrap;
}
.filter-btn:hover {
  color: white;
  border-color: rgba(255,255,255,0.25);
}
.filter-btn.active {
  background: rgba(96,165,250,0.12);
  border-color: rgba(96,165,250,0.35);
  color: #93c5fd;
}

.feed {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.feed-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  position: relative;
}
.feed-item:last-child { border-bottom: none; }

.feed-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 5px;
  flex-shrink: 0;
}
.feed-team     .feed-dot { background: #60a5fa; box-shadow: 0 0 6px rgba(96,165,250,0.5); }
.feed-announce .feed-dot { background: #fbbf24; box-shadow: 0 0 6px rgba(251,191,36,0.5); }
.feed-report   .feed-dot { background: #34d399; box-shadow: 0 0 6px rgba(52,211,153,0.5); }
.feed-mentor   .feed-dot { background: #a78bfa; box-shadow: 0 0 6px rgba(167,139,250,0.5); }

.feed-body {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}
.feed-text {
  font-size: 0.88rem;
  color: rgba(255,255,255,0.6);
  line-height: 1.5;
}
.feed-actor  { color: white; font-weight: 600; }
.feed-subject { color: rgba(255,255,255,0.8); font-style: italic; }
.feed-time {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.2);
  white-space: nowrap;
  flex-shrink: 0;
}
.feed-empty {
  color: rgba(255,255,255,0.2);
  font-size: 0.85rem;
  text-align: center;
  padding: 2rem 0;
}

/* ── Sidebar ── */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.sidebar-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  padding: 1.4rem;
}
.sidebar-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255,255,255,0.28);
  margin-bottom: 1.1rem;
}

/* Deadlines */
.deadline-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.deadline-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.deadline-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.deadline-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dl-hot { color: #f87171; }
.dl-hot.deadline-dot { background: #f87171; box-shadow: 0 0 5px rgba(248,113,113,0.6); }
.dl-mid { color: #fbbf24; }
.dl-mid.deadline-dot { background: #fbbf24; }
.dl-low { color: rgba(255,255,255,0.3); }
.dl-low.deadline-dot { background: rgba(255,255,255,0.2); }

.deadline-name {
  font-size: 0.82rem;
  color: rgba(255,255,255,0.6);
}
.deadline-date {
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.stat-item {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px;
  padding: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.stat-value {
  font-size: 1.6rem;
  font-weight: 800;
  color: white;
  line-height: 1;
}
.stat-label {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.3);
  line-height: 1.3;
}

/* ── Responsive ── */
@media (max-width: 860px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
  .sidebar {
    flex-direction: row;
    flex-wrap: wrap;
  }
  .sidebar-card {
    flex: 1;
    min-width: 240px;
  }
}
@media (max-width: 560px) {
  .content { padding: 1.5rem 1rem; }
  .navbar  { padding: 1rem 1.25rem; }
  .quick-cards { flex-direction: column; }
}
</style>
