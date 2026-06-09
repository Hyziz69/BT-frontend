<template>
  <div class="programs-page">

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

    <section class="page-hero">
      <p class="hero-label">Programy NTI</p>
      <h1 class="hero-title">Dve cesty.<br>Jeden cieľ.</h1>
      <p class="hero-desc">
        Vyber si program, ktorý ti sedí — vlastný nápad alebo reálne zadanie od firmy.
      </p>
    </section>

    <!-- ══════════════════════════════════════════════════ PROGRAM A ══ -->
    <section class="program-section prog-a" ref="sectionARef">
      <div class="prog-header">
        <div class="prog-badge badge-a">A</div>
        <div>
          <p class="prog-label">Program A</p>
          <h2>Grantový inkubačný program</h2>
          <p class="prog-desc">
            Máš vlastný nápad? Program A ti dá financovanie, mentora a priestor na jeho
            realizáciu. Cieľom je funkčný produkt alebo startup so medzinárodným potenciálom.
          </p>
        </div>
      </div>

      <div class="prog-meta-row">
        <div class="meta-chip">
          <span class="meta-k">Tím</span>
          <span class="meta-v">3 – 6 členov</span>
        </div>
        <div class="meta-chip">
          <span class="meta-k">Hodnotenie</span>
          <span class="meta-v">Kvartálne</span>
        </div>
        <div class="meta-chip">
          <span class="meta-k">Podpora</span>
          <span class="meta-v">Grant + mentor</span>
        </div>
        <div class="meta-chip">
          <span class="meta-k">Výstup</span>
          <span class="meta-v">Startup / produkt</span>
        </div>
      </div>

      <h3 class="projects-label">Ukážkové projekty</h3>
      <div class="projects-grid">
        <div class="proj-card" v-for="p in projectsA" :key="p.id">
          <div class="proj-top">
            <span class="status-dot" :class="p.active ? 'active' : 'done'" />
            <span class="proj-status">{{ p.active ? 'Aktívny' : 'Dokončený' }}</span>
            <span class="proj-year">{{ p.year }}</span>
          </div>
          <h4>{{ p.name }}</h4>
          <div class="proj-stack">
            <span v-for="t in p.stack" :key="t" class="stack-chip">{{ t }}</span>
          </div>
          <p class="proj-team">{{ p.team }} členov tímu</p>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════ PROGRAM B ══ -->
    <section class="program-section prog-b" ref="sectionBRef">
      <div class="prog-header">
        <div class="prog-badge badge-b">B</div>
        <div>
          <p class="prog-label">Program B</p>
          <h2>Program živej praxe</h2>
          <p class="prog-desc">
            Pracuj na reálnom projekte pre skutočnú firmu. Každý tím dostane Product Ownera
            z praxe, technickú špecifikáciu a za odvedenú prácu finančné ohodnotenie.
          </p>
        </div>
      </div>

      <div class="prog-meta-row">
        <div class="meta-chip">
          <span class="meta-k">Zadávateľ</span>
          <span class="meta-v">Reálna firma</span>
        </div>
        <div class="meta-chip">
          <span class="meta-k">Vedenie</span>
          <span class="meta-v">Product Owner</span>
        </div>
        <div class="meta-chip">
          <span class="meta-k">Odmena</span>
          <span class="meta-v">Platená prax</span>
        </div>
        <div class="meta-chip">
          <span class="meta-k">Výstup</span>
          <span class="meta-v">Zákazkový softvér</span>
        </div>
      </div>

      <h3 class="projects-label">Ukážkové projekty</h3>
      <div class="projects-grid">
        <div class="proj-card" v-for="p in projectsB" :key="p.id">
          <div class="proj-top">
            <span class="status-dot" :class="p.active ? 'active' : 'done'" />
            <span class="proj-status">{{ p.active ? 'Aktívny' : 'Dokončený' }}</span>
            <span class="proj-year">{{ p.year }}</span>
          </div>
          <h4>{{ p.name }}</h4>
          <div class="proj-stack">
            <span v-for="t in p.stack" :key="t" class="stack-chip">{{ t }}</span>
          </div>
          <p class="proj-team">{{ p.team }} členov tímu</p>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <h2>Chceš sa zapojiť?</h2>
      <p>Registruj sa a podaj prihlášku do programu, ktorý ti sedí.</p>
      <RouterLink to="/login" class="btn-primary">Začať prihlášku</RouterLink>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTransition } from '../composables/useTransition'

const { enabled: transEnabled, toggle: transToggle } = useTransition()

gsap.registerPlugin(ScrollTrigger)

const sectionARef = ref<HTMLElement | null>(null)
const sectionBRef = ref<HTMLElement | null>(null)

// ─── Project data (placeholder) ───────────────────────────────────────────────

const projectsA = [
  { id: 1, name: 'Projekt 1', year: '2024', active: false, team: 4, stack: ['Vue.js', 'Python'] },
  { id: 2, name: 'Projekt 2', year: '2024', active: false, team: 3, stack: ['React', 'Node.js'] },
  { id: 3, name: 'Projekt 3', year: '2025', active: false, team: 5, stack: ['Flutter', 'Firebase'] },
  { id: 4, name: 'Projekt 4', year: '2025', active: true,  team: 4, stack: ['Vue.js', 'Laravel'] },
  { id: 5, name: 'Projekt 5', year: '2026', active: true,  team: 3, stack: ['Next.js', 'FastAPI'] },
  { id: 6, name: 'Projekt 6', year: '2026', active: true,  team: 5, stack: ['Nuxt.js', 'Go'] },
]

const projectsB = [
  { id: 1, name: 'Projekt 1', year: '2024', active: false, team: 4, stack: ['Vue.js', 'Laravel', 'MySQL'] },
  { id: 2, name: 'Projekt 2', year: '2024', active: false, team: 3, stack: ['React', 'MongoDB'] },
  { id: 3, name: 'Projekt 3', year: '2025', active: false, team: 4, stack: ['Flutter', 'Node.js'] },
  { id: 4, name: 'Projekt 4', year: '2025', active: true,  team: 5, stack: ['Vue.js', 'Django'] },
  { id: 5, name: 'Projekt 5', year: '2026', active: true,  team: 3, stack: ['Nuxt.js', 'Prisma'] },
  { id: 6, name: 'Projekt 6', year: '2026', active: true,  team: 4, stack: ['Angular', 'Spring'] },
]

// ─── Scroll animations ────────────────────────────────────────────────────────

onMounted(() => {
  gsap.from('.page-hero', { opacity: 0, y: 40, duration: 0.9, ease: 'power3.out' })

  ;[sectionARef.value, sectionBRef.value].forEach((section) => {
    if (!section) return

    gsap.from(section.querySelector('.prog-header'), {
      opacity: 0, x: -40, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: section, start: 'top 80%' },
    })

    gsap.from(section.querySelectorAll('.meta-chip'), {
      opacity: 0, y: 20, duration: 0.5, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: section.querySelector('.prog-meta-row'), start: 'top 85%' },
    })

    gsap.from(section.querySelectorAll('.proj-card'), {
      opacity: 0, y: 16, duration: 0.45, stagger: 0.04, ease: 'power3.out',
      scrollTrigger: { trigger: section.querySelector('.projects-grid'), start: 'top 85%' },
    })
  })

  gsap.from('.cta-section', {
    opacity: 0, y: 30, duration: 0.7, ease: 'power3.out',
    scrollTrigger: { trigger: '.cta-section', start: 'top 88%' },
  })
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.programs-page {
  min-height: 100vh;
  background: #f0f2f5;
  color: #0f1117;
  font-family: 'DM Sans', sans-serif;
}

/* ── Nav ── */
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 3rem;
  background: #0f1117;
  border-bottom: 1px solid #1e2130;
}
.nav-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

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

.nav-back {
  color: #6ee7b7;
  text-decoration: none;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  transition: opacity 0.2s;
}
.nav-back:hover { opacity: 0.8; }

.nav-login {
  color: rgba(255,255,255,0.6);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}
.nav-login:hover { color: white; }

/* ── Hero ── */
.page-hero {
  text-align: center;
  padding: 5rem 2rem 4rem;
  max-width: 640px;
  margin: 0 auto;
}
.hero-label {
  color: #6ee7b7;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 1rem;
}
.hero-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: clamp(2.2rem, 5vw, 3.6rem);
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 1.1rem;
  color: #0f1117;
}
.hero-desc {
  color: #8892a4;
  font-size: 1rem;
  line-height: 1.7;
}

/* ── Program sections ── */
.program-section {
  max-width: 1080px;
  margin: 0 auto;
  padding: 4rem 3rem 5rem;
  border-top: 1px solid #e5e7eb;
}

.prog-header {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.prog-badge {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 3.5rem;
  font-weight: 900;
  width: 96px;
  height: 96px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
}
.badge-a {
  background: #f0fdf4;
  border: 1px solid #6ee7b7;
  color: #0f1117;
}
.badge-b {
  background: #eff6ff;
  border: 1px solid #93c5fd;
  color: #0f1117;
}

.prog-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #8892a4;
  margin-bottom: 0.4rem;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
}
.prog-a .prog-label { color: #16a34a; }
.prog-b .prog-label { color: #2563eb; }

.prog-header h2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.7rem;
  font-weight: 700;
  margin-bottom: 0.7rem;
  color: #0f1117;
}
.prog-desc {
  color: #8892a4;
  font-size: 0.93rem;
  line-height: 1.7;
  max-width: 560px;
}

/* ── Meta chips ── */
.prog-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 3rem;
}
.meta-chip {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.6rem 1.1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  min-width: 120px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.meta-k {
  font-size: 0.7rem;
  color: #8892a4;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}
.meta-v {
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f1117;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* ── Projects grid ── */
.projects-label {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #8892a4;
  margin-bottom: 1.2rem;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  align-items: start;
}

@media (max-width: 900px) { .projects-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .projects-grid { grid-template-columns: 1fr; } }

.proj-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  transition: border-color 0.2s, transform 0.2s;
}
.prog-a .proj-card:hover { border-color: #6ee7b7; transform: translateY(-3px); }
.prog-b .proj-card:hover { border-color: #93c5fd; transform: translateY(-3px); }

.proj-top {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}
.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.status-dot.active { background: #16a34a; box-shadow: 0 0 6px rgba(22,163,74,0.4); }
.status-dot.done { background: #d1d5db; }

.proj-status { font-size: 0.75rem; color: #8892a4; flex: 1; }
.proj-year { font-size: 0.75rem; color: #d1d5db; }

.proj-card h4 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #0f1117;
}

.proj-stack { display: flex; flex-wrap: wrap; gap: 0.35rem; }
.stack-chip {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.proj-team { font-size: 0.78rem; color: #9ca3af; margin-top: auto; }

/* ── CTA ── */
.cta-section {
  text-align: center;
  padding: 5rem 2rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}
.cta-section h2 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.9rem;
  font-weight: 800;
  margin-bottom: 0.7rem;
  color: #0f1117;
}
.cta-section p { color: #8892a4; margin-bottom: 2rem; }

.btn-primary {
  display: inline-block;
  padding: 0.85rem 2.4rem;
  background: #0f1117;
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  transition: opacity 0.2s, transform 0.2s;
}
.btn-primary:hover { opacity: 0.85; transform: translateY(-2px); }

/* ── Responsive ── */
@media (max-width: 640px) {
  .nav, .program-section { padding-left: 1.25rem; padding-right: 1.25rem; }
  .prog-header { flex-direction: column; gap: 1rem; }
  .prog-badge { width: 64px; height: 64px; font-size: 2.2rem; border-radius: 14px; }
}
</style>
