<template>
  <div class="feed-page">

    <nav class="nav">
      <RouterLink to="/" class="nav-back">← NTI Portal</RouterLink>
      <div class="nav-right">
        <button
          class="anim-toggle"
          :class="{ off: !transEnabled }"
          :title="transEnabled ? 'Vypnúť animáciu prechodu' : 'Zapnúť animáciu prechodu'"
          @click="transToggle"
        >
          <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
            <path d="M2 11V4l4 3.5L2 11zM8 4h5M8 7.5h4M8 11h3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
          <span>{{ transEnabled ? 'Animácia: ZAP' : 'Animácia: VYP' }}</span>
        </button>
        <RouterLink to="/login" class="nav-login">Prihlásiť sa →</RouterLink>
      </div>
    </nav>

    <div class="page-wrap">

      <!-- Left: feed -->
      <main class="feed-main">
        <div class="feed-header">
          <div>
            <p class="page-label">Čo sa deje</p>
            <h1 class="page-title">Dianie v NTI</h1>
          </div>
          <div class="filters">
            <button
              v-for="f in filters"
              :key="f.key"
              class="filter-btn"
              :class="{ active: activeFilter === f.key }"
              @click="activeFilter = f.key"
            >
              <span class="filter-dot" :class="`dot-${f.key}`" />
              {{ f.label }}
            </button>
          </div>
        </div>

        <div class="feed">
          <TransitionGroup name="feed-anim">
            <div
              v-for="event in filteredFeed"
              :key="event.id"
              class="feed-item"
              :class="`type-${event.type}`"
            >
              <div class="item-aside">
                <div class="item-dot" />
                <div class="item-line" />
              </div>
              <div class="item-body">
                <div class="item-meta">
                  <span class="item-tag" :class="`tag-${event.type}`">{{ typeLabel[event.type] }}</span>
                  <span class="item-time">{{ event.time }}</span>
                </div>
                <p class="item-text">
                  <span class="item-actor">{{ event.actor }}</span>
                  {{ event.action }}
                  <span v-if="event.subject" class="item-subject">„{{ event.subject }}"</span>
                </p>
                <p v-if="event.detail" class="item-detail">{{ event.detail }}</p>
              </div>
            </div>
          </TransitionGroup>

          <p v-if="filteredFeed.length === 0" class="feed-empty">
            Žiadne udalosti pre tento filter.
          </p>
        </div>
      </main>

      <!-- Right: sidebar -->
      <aside class="sidebar">

        <div class="sidebar-card">
          <h3 class="sidebar-title">Najbližšie termíny</h3>
          <div class="deadline-list">
            <div v-for="d in deadlines" :key="d.id" class="deadline-row">
              <div class="deadline-info">
                <span class="dl-dot" :class="`dl-${d.urgency}`" />
                <span class="dl-name">{{ d.name }}</span>
              </div>
              <span class="dl-date" :class="`dl-${d.urgency}`">{{ d.date }}</span>
            </div>
          </div>
        </div>

        <div class="sidebar-card">
          <h3 class="sidebar-title">Aktívne projekty</h3>
          <div class="project-list">
            <div v-for="p in activeProjects" :key="p.id" class="project-row">
              <div class="proj-indicator" :class="`prog-${p.program}`" />
              <div class="proj-info">
                <span class="proj-name">{{ p.name }}</span>
                <span class="proj-program">Program {{ p.program }}</span>
              </div>
              <span class="proj-members">{{ p.members }}×</span>
            </div>
          </div>
        </div>

        <RouterLink to="/login" class="cta-card">
          <p class="cta-text">Chceš vidieť dianie svojho tímu?</p>
          <span class="cta-link">Prihlásiť sa →</span>
        </RouterLink>

      </aside>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { gsap } from 'gsap'
import { useTransition } from '../composables/useTransition'

const { enabled: transEnabled, toggle: transToggle } = useTransition()

// ─── Types ────────────────────────────────────────────────────────────────────

type EventType = 'team' | 'announce' | 'report' | 'mentor' | 'deadline'

interface FeedEvent {
  id: number
  type: EventType
  actor: string
  action: string
  subject?: string
  detail?: string
  time: string
}

// ─── Feed data ────────────────────────────────────────────────────────────────

const feed: FeedEvent[] = [
  {
    id: 1, type: 'announce',
    actor: 'NTI',
    action: 'oznamuje otvorenie prihlášok na',
    subject: 'jar 2026',
    detail: 'Prihlášky do Programu A aj B sú otvorené do 31. mája 2026.',
    time: 'pred 3 hod',
  },
  {
    id: 2, type: 'team',
    actor: 'Tím WebFlow',
    action: 'sa zaregistroval do',
    subject: 'Program B',
    time: 'pred 5 hod',
  },
  {
    id: 3, type: 'report',
    actor: 'Projekt AppX',
    action: 'odovzdal štvrťročnú správu',
    subject: 'Q1 2026',
    detail: 'Správa zahŕňa výsledky sprintu, demo a plán na Q2.',
    time: 'pred 1 dňom',
  },
  {
    id: 4, type: 'mentor',
    actor: 'Ján Novák',
    action: 'bol pridaný ako mentor projektu',
    subject: 'DataLab',
    time: 'pred 2 dňami',
  },
  {
    id: 5, type: 'deadline',
    actor: 'Termín',
    action: 'sa blíži pre odovzdanie',
    subject: 'Q2 správa',
    detail: 'Zostáva 14 dní — deadline 15. júna 2026.',
    time: 'pred 2 dňami',
  },
  {
    id: 6, type: 'team',
    actor: 'Tím AlphaCode',
    action: 'aktualizoval popis a skladbu tímu',
    time: 'pred 3 dňami',
  },
  {
    id: 7, type: 'announce',
    actor: 'NTI',
    action: 'zverejnilo výsledky hodnotenia za',
    subject: 'Q4 2025',
    detail: '3 projekty postúpili do ďalšej fázy, 1 program bol ukončený.',
    time: 'pred 4 dňami',
  },
  {
    id: 8, type: 'report',
    actor: 'Projekt BioTrack',
    action: 'prešiel do fázy',
    subject: 'MVP vývoj',
    time: 'pred 5 dňami',
  },
  {
    id: 9, type: 'mentor',
    actor: 'Eva Kováčová',
    action: 'pridala komentár k projektu',
    subject: 'CityNav',
    time: 'pred 6 dňami',
  },
  {
    id: 10, type: 'team',
    actor: 'Tím NovaSpark',
    action: 'podal prihlášku do',
    subject: 'Program A',
    time: 'pred 1 týžd.',
  },
]

const typeLabel: Record<EventType, string> = {
  team:     'Tím',
  announce: 'Oznam',
  report:   'Správa',
  mentor:   'Mentor',
  deadline: 'Termín',
}

const filters = [
  { key: 'all',      label: 'Všetko' },
  { key: 'announce', label: 'Oznamy' },
  { key: 'team',     label: 'Tímy' },
  { key: 'report',   label: 'Správy' },
  { key: 'mentor',   label: 'Mentori' },
  { key: 'deadline', label: 'Termíny' },
]

const activeFilter = ref('all')
const filteredFeed = computed(() =>
  activeFilter.value === 'all'
    ? feed
    : feed.filter(e => e.type === activeFilter.value)
)

// ─── Sidebar data ─────────────────────────────────────────────────────────────

const deadlines = [
  { id: 1, name: 'Prihlášky Program A/B', date: '31. máj',  urgency: 'hot' },
  { id: 2, name: 'Štvrťročná správa Q2',  date: '15. jún',  urgency: 'mid' },
  { id: 3, name: 'Prezentácia výsledkov', date: '10. júl',  urgency: 'low' },
]

const activeProjects = [
  { id: 1, name: 'AppX',      program: 'A', members: 4 },
  { id: 2, name: 'DataLab',   program: 'B', members: 5 },
  { id: 3, name: 'BioTrack',  program: 'A', members: 3 },
  { id: 4, name: 'CityNav',   program: 'B', members: 4 },
]

// ─── Animations ───────────────────────────────────────────────────────────────

onMounted(() => {
  gsap.from('.feed-header', { opacity: 0, y: 24, duration: 0.7, ease: 'power3.out' })
  gsap.from('.feed-item', {
    opacity: 0, x: -20, duration: 0.5, stagger: 0.06, ease: 'power3.out', delay: 0.15,
  })
  gsap.from('.sidebar-card, .cta-card', {
    opacity: 0, y: 20, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.2,
  })
})
</script>

<style scoped>
.feed-page {
  min-height: 100vh;
  background: #050a14;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* ── Nav ── */
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.4rem 3rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.nav-right { display: flex; align-items: center; gap: 1rem; }
.nav-back, .nav-login {
  color: rgba(255,255,255,0.45);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}
.nav-back:hover, .nav-login:hover { color: white; }

.anim-toggle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.55);
  border-radius: 6px;
  padding: 0.3rem 0.7rem;
  font-size: 0.72rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  white-space: nowrap;
}
.anim-toggle:hover { background: rgba(255,255,255,0.1); color: white; }
.anim-toggle.off { color: rgba(255,255,255,0.25); border-color: rgba(255,255,255,0.06); }

/* ── Layout ── */
.page-wrap {
  max-width: 1100px;
  margin: 0 auto;
  padding: 3rem 2rem;
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 2rem;
  align-items: start;
}

/* ── Feed header ── */
.feed-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}
.page-label {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #60a5fa;
  margin-bottom: 0.4rem;
}
.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: white;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  padding: 0.3rem 0.75rem;
  border-radius: 50px;
  border: 1px solid rgba(255,255,255,0.1);
  background: transparent;
  color: rgba(255,255,255,0.35);
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
  white-space: nowrap;
}
.filter-btn:hover { color: white; border-color: rgba(255,255,255,0.25); }
.filter-btn.active {
  background: rgba(96,165,250,0.1);
  border-color: rgba(96,165,250,0.3);
  color: #93c5fd;
}

.filter-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-all      { background: rgba(255,255,255,0.3); }
.dot-announce { background: #fbbf24; }
.dot-team     { background: #60a5fa; }
.dot-report   { background: #34d399; }
.dot-mentor   { background: #a78bfa; }
.dot-deadline { background: #f87171; }

/* ── Feed items ── */
.feed {
  display: flex;
  flex-direction: column;
}

.feed-item {
  display: flex;
  gap: 1.1rem;
}

.item-aside {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  padding-top: 4px;
}
.item-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  z-index: 1;
}
.item-line {
  flex: 1;
  width: 1px;
  background: rgba(255,255,255,0.06);
  margin-top: 4px;
  min-height: 24px;
}
.feed-item:last-child .item-line { display: none; }

.type-team     .item-dot { background: #60a5fa; box-shadow: 0 0 7px rgba(96,165,250,0.6); }
.type-announce .item-dot { background: #fbbf24; box-shadow: 0 0 7px rgba(251,191,36,0.6); }
.type-report   .item-dot { background: #34d399; box-shadow: 0 0 7px rgba(52,211,153,0.6); }
.type-mentor   .item-dot { background: #a78bfa; box-shadow: 0 0 7px rgba(167,139,250,0.6); }
.type-deadline .item-dot { background: #f87171; box-shadow: 0 0 7px rgba(248,113,113,0.6); }

.item-body {
  flex: 1;
  padding-bottom: 1.75rem;
}
.item-meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.45rem;
}
.item-tag {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0.15rem 0.55rem;
  border-radius: 50px;
}
.tag-team     { background: rgba(96,165,250,0.12);  color: #93c5fd; }
.tag-announce { background: rgba(251,191,36,0.12);  color: #fcd34d; }
.tag-report   { background: rgba(52,211,153,0.12);  color: #6ee7b7; }
.tag-mentor   { background: rgba(167,139,250,0.12); color: #c4b5fd; }
.tag-deadline { background: rgba(248,113,113,0.12); color: #fca5a5; }

.item-time {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.2);
}

.item-text {
  font-size: 0.92rem;
  color: rgba(255,255,255,0.6);
  line-height: 1.5;
  margin-bottom: 0.4rem;
}
.item-actor  { color: white; font-weight: 600; }
.item-subject { color: rgba(255,255,255,0.85); }

.item-detail {
  font-size: 0.82rem;
  color: rgba(255,255,255,0.3);
  line-height: 1.6;
  margin-top: 0.35rem;
}

.feed-empty {
  text-align: center;
  color: rgba(255,255,255,0.2);
  font-size: 0.88rem;
  padding: 3rem 0;
}

/* ── Feed transition ── */
.feed-anim-enter-active { transition: opacity 0.25s, transform 0.25s; }
.feed-anim-leave-active { transition: opacity 0.15s; }
.feed-anim-enter-from  { opacity: 0; transform: translateX(-12px); }
.feed-anim-leave-to    { opacity: 0; }

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
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(255,255,255,0.25);
  margin-bottom: 1.1rem;
}

/* Deadlines */
.deadline-list { display: flex; flex-direction: column; gap: 0.8rem; }
.deadline-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.deadline-info { display: flex; align-items: center; gap: 0.5rem; }
.dl-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dl-hot            { color: #f87171; }
.dl-hot.dl-dot     { background: #f87171; box-shadow: 0 0 5px rgba(248,113,113,0.5); }
.dl-mid            { color: #fbbf24; }
.dl-mid.dl-dot     { background: #fbbf24; }
.dl-low            { color: rgba(255,255,255,0.25); }
.dl-low.dl-dot     { background: rgba(255,255,255,0.2); }
.dl-name {
  font-size: 0.82rem;
  color: rgba(255,255,255,0.55);
}
.dl-date { font-size: 0.78rem; font-weight: 600; white-space: nowrap; }

/* Active projects */
.project-list { display: flex; flex-direction: column; gap: 0.75rem; }
.project-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.proj-indicator {
  width: 3px;
  height: 32px;
  border-radius: 2px;
  flex-shrink: 0;
}
.prog-A { background: linear-gradient(to bottom, #2563eb, #60a5fa); }
.prog-B { background: linear-gradient(to bottom, #059669, #34d399); }

.proj-info { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
.proj-name    { font-size: 0.88rem; font-weight: 600; color: white; }
.proj-program { font-size: 0.72rem; color: rgba(255,255,255,0.3); }
.proj-members { font-size: 0.78rem; color: rgba(255,255,255,0.25); white-space: nowrap; }

/* CTA card */
.cta-card {
  display: block;
  background: linear-gradient(135deg, rgba(37,99,235,0.12), rgba(37,99,235,0.04));
  border: 1px solid rgba(37,99,235,0.3);
  border-radius: 14px;
  padding: 1.4rem;
  text-decoration: none;
  transition: border-color 0.2s, background 0.2s;
}
.cta-card:hover {
  border-color: rgba(37,99,235,0.55);
  background: linear-gradient(135deg, rgba(37,99,235,0.18), rgba(37,99,235,0.06));
}
.cta-text { font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-bottom: 0.6rem; line-height: 1.5; }
.cta-link { font-size: 0.85rem; font-weight: 600; color: #60a5fa; }

/* ── Responsive ── */
@media (max-width: 820px) {
  .page-wrap { grid-template-columns: 1fr; }
  .sidebar { flex-direction: row; flex-wrap: wrap; }
  .sidebar-card, .cta-card { flex: 1; min-width: 220px; }
}
@media (max-width: 560px) {
  .nav { padding: 1rem 1.25rem; }
  .page-wrap { padding: 2rem 1rem; }
  .feed-header { flex-direction: column; align-items: flex-start; }
}
</style>
