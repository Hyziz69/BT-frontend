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
.programs-page {
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
.anim-toggle.off {
  color: rgba(255,255,255,0.25);
  border-color: rgba(255,255,255,0.06);
}

.nav-back, .nav-login {
  color: rgba(255,255,255,0.45);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}
.nav-back:hover, .nav-login:hover { color: white; }

/* ── Hero ── */
.page-hero {
  text-align: center;
  padding: 5rem 2rem 4rem;
  max-width: 640px;
  margin: 0 auto;
}
.hero-label {
  color: #60a5fa;
  font-size: 0.78rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 1rem;
}
.hero-title {
  font-size: clamp(2.2rem, 5vw, 3.6rem);
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 1.1rem;
}
.hero-desc {
  color: rgba(255,255,255,0.45);
  font-size: 1rem;
  line-height: 1.7;
}

/* ── Program sections ── */
.program-section {
  max-width: 1080px;
  margin: 0 auto;
  padding: 4rem 3rem 5rem;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.prog-header {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.prog-badge {
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
  background: rgba(37,99,235,0.15);
  border: 1px solid rgba(37,99,235,0.35);
  color: #60a5fa;
}
.badge-b {
  background: rgba(16,185,129,0.12);
  border: 1px solid rgba(16,185,129,0.3);
  color: #34d399;
}

.prog-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: rgba(255,255,255,0.35);
  margin-bottom: 0.4rem;
}
.prog-a .prog-label { color: #60a5fa; }
.prog-b .prog-label { color: #34d399; }

.prog-header h2 {
  font-size: 1.7rem;
  font-weight: 700;
  margin-bottom: 0.7rem;
}
.prog-desc {
  color: rgba(255,255,255,0.5);
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
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  min-width: 120px;
}
.meta-k {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.meta-v {
  font-size: 0.92rem;
  font-weight: 600;
  color: white;
}

/* ── Projects grid ── */
.projects-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: rgba(255,255,255,0.28);
  margin-bottom: 1.2rem;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  align-items: start;
}

@media (max-width: 900px) {
  .projects-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }
}

.proj-card {
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  transition: border-color 0.2s, transform 0.2s;
}
.prog-a .proj-card:hover {
  border-color: rgba(96,165,250,0.3);
  transform: translateY(-3px);
}
.prog-b .proj-card:hover {
  border-color: rgba(52,211,153,0.3);
  transform: translateY(-3px);
}

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
.status-dot.active { background: #34d399; box-shadow: 0 0 6px rgba(52,211,153,0.6); }
.status-dot.done   { background: rgba(255,255,255,0.2); }

.proj-status {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.35);
  flex: 1;
}
.proj-year {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.2);
}

.proj-card h4 {
  font-size: 1rem;
  font-weight: 700;
  color: white;
}

.proj-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.stack-chip {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.35);
  border: 1px solid rgba(255,255,255,0.07);
}

.proj-team {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.25);
  margin-top: auto;
}

/* ── CTA ── */
.cta-section {
  text-align: center;
  padding: 5rem 2rem;
  border-top: 1px solid rgba(255,255,255,0.06);
  background: linear-gradient(to bottom, transparent, rgba(37,99,235,0.06));
}
.cta-section h2 { font-size: 1.9rem; font-weight: 800; margin-bottom: 0.7rem; }
.cta-section p  { color: rgba(255,255,255,0.45); margin-bottom: 2rem; }

.btn-primary {
  display: inline-block;
  padding: 0.85rem 2.4rem;
  background: #2563eb;
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: background 0.2s, transform 0.2s;
}
.btn-primary:hover { background: #1d4ed8; transform: translateY(-2px); }

/* ── Responsive ── */
@media (max-width: 640px) {
  .nav, .program-section { padding-left: 1.25rem; padding-right: 1.25rem; }
  .prog-header { flex-direction: column; gap: 1rem; }
  .prog-badge { width: 64px; height: 64px; font-size: 2.2rem; border-radius: 14px; }
}
</style>
