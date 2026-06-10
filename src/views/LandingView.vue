<template>
  <div class="landing">

    <!-- ═══════════════════════════════════════════════════════ HERO ══ -->
    <div class="hero-wrap">
      <div
        v-for="item in scene"
        :key="item.id"
        class="float-icon"
        :ref="(el) => setRef(item.id, el)"
        :style="{
          left: item.x + '%',
          top: item.y + '%',
          opacity: item.opacity,
          transform: `rotate(${item.rotate}deg)`,
          width: item.size + 'px',
          height: item.size + 'px',
        }"
        v-html="item.svg"
      />

      <nav class="nav">
        <span class="nav-brand">NTI Portal</span>
        <div class="nav-right">
          <RouterLink to="/dianie" class="nav-link">Dianie</RouterLink>
          <RouterLink to="/programy" class="nav-link">Programy</RouterLink>
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

      <section class="hero">
        <p ref="subtitleRef" class="hero-subtitle">{{ c('hero_subtitle', 'Nitriansky technologický inkubátor') }}</p>
        <h1 ref="titleRef" class="hero-title">{{ c('hero_title', 'Portál účastníka') }}</h1>
        <p ref="descRef" class="hero-desc">{{ c('hero_desc', 'Spravuj tímy, podávaj prihlášky a sleduj pokrok na jednom mieste') }}</p>
        <div ref="ctaBtnsRef" class="hero-btns">
          <RouterLink to="/login" class="btn-primary">Začať pracovať</RouterLink>
          <a href="#o-programe" class="btn-ghost">Zistiť viac</a>
        </div>
      </section>

      <div ref="scrollHintRef" class="scroll-hint">
        <span>Zobraziť viac</span>
        <div class="scroll-arrow">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4v12M4 10l6 6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════ O PROGRAME ══ -->
    <section id="o-programe" class="pillars-section">
      <div class="section-header">
        <p class="section-label">Čo je NTI</p>
        <h2 class="section-title">Štyri strategické piliere</h2>
        <p class="section-desc">
          NTI vznikol ako odpoveď na odliv technologických talentov a potrebu systematickej
          podpory inovatívnych projektov v regióne Nitry.
        </p>
      </div>

      <div class="pillars-grid">
        <div class="pillar-card" v-for="p in pillars" :key="p.title">
          <div class="pillar-icon" v-html="p.icon" />
          <h3>{{ p.title }}</h3>
          <p>{{ p.desc }}</p>
        </div>
      </div>

      <div class="programs-row">
        <div class="program-card program-a">
          <div class="program-badge">Program A</div>
          <h3>{{ c('program_a_title', 'Grantový inkubačný program') }}</h3>
          <p>{{ c('program_a_desc', 'Vlastný inovatívny nápad → financovanie + mentoring → startup alebo produkt') }}</p>
          <ul class="program-list">
            <li>Tím 3+ študentov</li>
            <li>Kvartálne hodnotenia</li>
            <li>Finančná podpora + mentor</li>
          </ul>
        </div>
        <div class="program-card program-b">
          <div class="program-badge">Program B</div>
          <h3>{{ c('program_b_title', 'Program živej praxe') }}</h3>
          <p>{{ c('program_b_desc', 'Reálne zadania od firiem → prax + odmena + Product Owner → zákazkový softvér') }}</p>
          <ul class="program-list">
            <li>Zadania od reálnych firiem</li>
            <li>Product Owner z praxe</li>
            <li>Odmeňovaná práca</li>
          </ul>
        </div>
      </div>
      <div class="programs-cta">
        <RouterLink to="/programy" class="btn-outline-blue">
          Pozrieť úspešné projekty →
        </RouterLink>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════ TIMELINE ══ -->
    <section class="timeline-section">
      <div class="section-header">
        <p class="section-label">Roadmapa</p>
        <h2 class="section-title">Plán realizácie</h2>
      </div>

      <div class="timeline">
        <div class="timeline-line" />

        <div
          v-for="(phase, i) in phases"
          :key="phase.num"
          class="timeline-item"
          :class="i % 2 === 0 ? 'tl-left' : 'tl-right'"
        >
          <div class="tl-card">
            <div class="tl-num">{{ phase.num }}</div>
            <h3>{{ phase.title }}</h3>
            <p class="tl-content">{{ phase.content }}</p>
            <div class="tl-badge">{{ phase.output }}</div>
          </div>
          <div class="tl-dot" />
        </div>
      </div>
    </section>

    <!-- ════════════════════════════════════════════════════ FOOTER ══ -->
    <footer class="footer">
      <span>{{ c('footer_copyright', '© 2026 Nitriansky technologický inkubátor') }}</span>
      <RouterLink to="/login">Prihlásiť sa</RouterLink>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTransition } from '../composables/useTransition'
import { contentApi } from '../api/content'



const { enabled: transEnabled, toggle: transToggle } = useTransition()

gsap.registerPlugin(ScrollTrigger)

// ─── SVG icons ────────────────────────────────────────────────────────────────

const DOC = `<svg width="48" height="58" viewBox="0 0 48 58" fill="none"><path d="M4 2h28l12 12v42H4V2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M32 2v12h12" stroke="currentColor" stroke-width="1.5"/><line x1="12" y1="24" x2="36" y2="24" stroke="currentColor" stroke-width="1.5"/><line x1="12" y1="32" x2="36" y2="32" stroke="currentColor" stroke-width="1.5"/><line x1="12" y1="40" x2="26" y2="40" stroke="currentColor" stroke-width="1.5"/></svg>`
const PENCIL = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none"><path d="M36 4L48 16L16 48L4 48L4 36L36 4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><line x1="30" y1="10" x2="42" y2="22" stroke="currentColor" stroke-width="1.5"/><path d="M4 36L8 48" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`
const SETTINGS = `<svg width="52" height="44" viewBox="0 0 52 44" fill="none"><line x1="4" y1="10" x2="48" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="16" cy="10" r="4" stroke="currentColor" stroke-width="1.5"/><line x1="4" y1="22" x2="48" y2="22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="34" cy="22" r="4" stroke="currentColor" stroke-width="1.5"/><line x1="4" y1="34" x2="48" y2="34" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="22" cy="34" r="4" stroke="currentColor" stroke-width="1.5"/></svg>`
const MONITOR = `<svg width="64" height="54" viewBox="0 0 64 54" fill="none"><rect x="2" y="2" width="60" height="38" rx="3" stroke="currentColor" stroke-width="1.5"/><line x1="2" y1="30" x2="62" y2="30" stroke="currentColor" stroke-width="1"/><line x1="21" y1="40" x2="17" y2="52" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="43" y1="40" x2="47" y2="52" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="14" y1="52" x2="50" y2="52" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`
const CODE = `<svg width="60" height="44" viewBox="0 0 60 44" fill="none"><path d="M18 6L4 22L18 38" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M42 6L56 22L42 38" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="34" y1="4" x2="26" y2="40" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
const CALENDAR = `<svg width="52" height="52" viewBox="0 0 52 52" fill="none"><rect x="4" y="8" width="44" height="40" rx="3" stroke="currentColor" stroke-width="1.5"/><line x1="4" y1="20" x2="48" y2="20" stroke="currentColor" stroke-width="1.5"/><line x1="16" y1="2" x2="16" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="36" y1="2" x2="36" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="16" cy="30" r="2" fill="currentColor"/><circle cx="26" cy="30" r="2" fill="currentColor"/><circle cx="36" cy="30" r="2" fill="currentColor"/><circle cx="16" cy="40" r="2" fill="currentColor"/><circle cx="26" cy="40" r="2" fill="currentColor"/></svg>`

// ─── Floating background scene ────────────────────────────────────────────────

const scene = [
  { id: 0,  x: 3,   y: 6,   depth: 0.04, rotate: -15, opacity: 0.32, size: 56, svg: DOC },
  { id: 1,  x: 82,  y: 5,   depth: 0.06, rotate: 22,  opacity: 0.28, size: 52, svg: PENCIL },
  { id: 2,  x: 89,  y: 50,  depth: 0.03, rotate: -8,  opacity: 0.30, size: 52, svg: SETTINGS },
  { id: 3,  x: 5,   y: 60,  depth: 0.05, rotate: 6,   opacity: 0.27, size: 64, svg: MONITOR },
  { id: 4,  x: 44,  y: 2,   depth: 0.02, rotate: 0,   opacity: 0.24, size: 60, svg: CODE },
  { id: 5,  x: 73,  y: 76,  depth: 0.04, rotate: 12,  opacity: 0.29, size: 52, svg: CALENDAR },
  { id: 6,  x: 17,  y: 82,  depth: 0.05, rotate: -18, opacity: 0.26, size: 52, svg: PENCIL },
  { id: 7,  x: 91,  y: 26,  depth: 0.03, rotate: 8,   opacity: 0.28, size: 56, svg: DOC },
  { id: 8,  x: 55,  y: 88,  depth: 0.06, rotate: -5,  opacity: 0.25, size: 52, svg: CODE },
  { id: 9,  x: 32,  y: 4,   depth: 0.04, rotate: 15,  opacity: 0.22, size: 52, svg: SETTINGS },
  { id: 10, x: 60,  y: 10,  depth: 0.05, rotate: -10, opacity: 0.26, size: 48, svg: MONITOR },
  { id: 11, x: 22,  y: 18,  depth: 0.03, rotate: 20,  opacity: 0.24, size: 44, svg: CALENDAR },
  { id: 12, x: 76,  y: 38,  depth: 0.06, rotate: -25, opacity: 0.27, size: 48, svg: PENCIL },
  { id: 13, x: 10,  y: 38,  depth: 0.04, rotate: 5,   opacity: 0.23, size: 52, svg: CODE },
  { id: 14, x: 48,  y: 72,  depth: 0.03, rotate: -12, opacity: 0.25, size: 56, svg: DOC },
  { id: 15, x: 37,  y: 90,  depth: 0.05, rotate: 18,  opacity: 0.22, size: 48, svg: SETTINGS },
  { id: 16, x: 68,  y: 55,  depth: 0.04, rotate: -3,  opacity: 0.20, size: 44, svg: CALENDAR },
  { id: 17, x: 25,  y: 50,  depth: 0.02, rotate: 30,  opacity: 0.18, size: 40, svg: MONITOR },
]

// ─── Content data ─────────────────────────────────────────────────────────────

const pillars = computed(() => [
  {
    title: c('pillar_1_title', 'Inkubácia'),
    desc: c('pillar_1_desc', 'Podporujeme vznik a akceleráciu projektov...'),
    icon: `...existing svg...`,
  },
  {
    title: c('pillar_2_title', 'Partnerstvá'),
    desc: c('pillar_2_desc', 'Prepájame firmy, organizácie...'),
    icon: `...existing svg...`,
  },
  {
    title: c('pillar_3_title', 'Mentoring'),
    desc: c('pillar_3_desc', 'Každý tím dostane mentora...'),
    icon: `...existing svg...`,
  },
  {
    title: c('pillar_4_title', 'Retencia'),
    desc: c('pillar_4_desc', 'Budujeme komunitu absolventov...'),
    icon: `...existing svg...`,
  },
])

const phases = [
  {
    num: '00',
    title: 'Discovery & UX/IA',
    content: 'Spresnenie procesov, finálnych formulárov, rolí a wireframov. Definovanie branding rules a informačnej architektúry portálu.',
    output: 'Detailná analýza',
  },
  {
    num: '01',
    title: 'MVP jadro',
    content: 'Verejný web, CMS správa obsahu, registrácie, Program A a základná administrácia. Prvá produkčne použiteľná verzia systému.',
    output: 'Pilotná verzia',
  },
  {
    num: '02',
    title: 'Program B & workflow',
    content: 'Firemný onboarding, backlog zadaní, párovanie tímov, mentoring workflow a reportovanie. Plné pokrytie oboch programov.',
    output: 'Produkčné pokrytie',
  },
  {
    num: '03',
    title: 'BI & analytika',
    content: 'Pokročilé dashboardy, automatizované exporty, KPI sledovanie a enterprise-ready reporting pre administráciu NTI.',
    output: 'Enterprise verzia',
  },
]

// ─── Refs ─────────────────────────────────────────────────────────────────────

const floatRefs: Record<number, HTMLElement> = {}
const subtitleRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const descRef = ref<HTMLElement | null>(null)
const ctaBtnsRef = ref<HTMLElement | null>(null)
const scrollHintRef = ref<HTMLElement | null>(null)

function setRef(id: number, el: unknown) {
  if (el instanceof HTMLElement) floatRefs[id] = el
}

// ─── Mouse parallax ───────────────────────────────────────────────────────────

function onMouseMove(e: MouseEvent) {
  const cx = window.innerWidth / 2
  const cy = window.innerHeight / 2
  const dx = (e.clientX - cx) / cx
  const dy = (e.clientY - cy) / cy

  for (const item of scene) {
    const el = floatRefs[item.id]
    if (!el) continue
    gsap.to(el, {
      x: dx * item.depth * 160,
      y: dy * item.depth * 160,
      duration: 1.4,
      ease: 'power2.out',
    })
  }
}

const content = ref<Record<string, string>>({})

function c(key: string, fallback: string): string {
  return content.value[key] ?? fallback
}

contentApi.getPublic().then(data => {
  content.value = data
}).catch(() => {})

onMounted(() => {
  // Attach mouse listener only to hero
  const heroWrap = document.querySelector('.hero-wrap') as HTMLElement
  heroWrap?.addEventListener('mousemove', onMouseMove)

  // Icons entrance
  gsap.from('.float-icon', {
    opacity: 0,
    scale: 0.6,
    duration: 1.2,
    stagger: 0.06,
    ease: 'power3.out',
  })

  // Hero text entrance
  const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 }, delay: 0.2 })
  tl.from(subtitleRef.value, { opacity: 0, y: -20, duration: 0.6 })
    .from(titleRef.value, { opacity: 0, y: 40 }, '<0.2')
    .from(descRef.value, { opacity: 0, y: 20, duration: 0.6 }, '<0.3')
    .from(ctaBtnsRef.value, { opacity: 0, y: 16, duration: 0.5 }, '<0.2')
    .from(scrollHintRef.value, { opacity: 0, duration: 0.5 }, '<0.4')

  // Pillars — fade in on scroll
  gsap.from('.pillar-card', {
    opacity: 0,
    y: 40,
    duration: 0.7,
    stagger: 0.12,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.pillars-grid',
      start: 'top 80%',
    },
  })

  gsap.from('.program-card', {
    opacity: 0,
    y: 30,
    duration: 0.7,
    stagger: 0.15,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.programs-row',
      start: 'top 85%',
    },
  })

  document.querySelectorAll('.timeline-item').forEach((el, i) => {
    gsap.from(el, {
      opacity: 0,
      x: i % 2 === 0 ? -70 : 70,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 82%',
      },
    })
  })

  gsap.utils.toArray('.section-header').forEach((el) => {
    gsap.from(el as HTMLElement, {
      opacity: 0,
      y: 30,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el as HTMLElement,
        start: 'top 85%',
      },
    })
  })
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

/* ── Base ───────────────────────────────────────────────────────────────────── */
.landing {
  font-family: 'DM Sans', sans-serif;
  color: #0f1117;
}

/* ── Hero ───────────────────────────────────────────────────────────────────── */
.hero-wrap {
  position: relative;
  min-height: 100vh;
  background: #0f1117;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.float-icon {
  position: absolute;
  pointer-events: none;
  color: #6ee7b7;
  will-change: transform;
}

.float-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.nav {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 3rem;
}

.nav-brand {
  color: white;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  animation: drop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes drop-in {
  0%   { opacity: 0; transform: translateY(-30px); }
  100% { opacity: 1; transform: translateY(0); }
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

.nav-link {
  color: rgba(255,255,255,0.5);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}
.nav-link:hover { color: white; }

.nav-login {
  color: #6ee7b7;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: opacity 0.2s;
}
.nav-login:hover { opacity: 0.8; }

.hero {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;
  gap: 1.2rem;
}

.hero-subtitle {
  color: #6ee7b7;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin: 0;
}

.hero-title {
  color: white;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: clamp(2.5rem, 6vw, 5rem);
  font-weight: 800;
  line-height: 1.1;
  margin: 0;
}

.hero-desc {
  color: rgba(255,255,255,0.5);
  font-size: 1.1rem;
  line-height: 1.7;
  margin: 0;
}

.hero-btns {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-primary {
  padding: 0.9rem 2.5rem;
  background: #6ee7b7;
  color: #0f1117;
  text-decoration: none;
  border-radius: 50px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  transition: transform 0.2s, opacity 0.2s;
}
.btn-primary:hover { opacity: 0.9; transform: translateY(-2px); }

.btn-ghost {
  padding: 0.9rem 2.5rem;
  border: 1px solid rgba(110,231,183,0.35);
  color: rgba(255,255,255,0.75);
  text-decoration: none;
  border-radius: 50px;
  font-weight: 500;
  font-size: 1rem;
  transition: border-color 0.2s, color 0.2s, transform 0.2s;
}
.btn-ghost:hover { border-color: rgba(110,231,183,0.7); color: white; transform: translateY(-2px); }

.scroll-hint {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 1.5rem;
  color: rgba(255,255,255,0.35);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.scroll-arrow { animation: bounce 1.8s ease-in-out infinite; }

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(7px); }
}

/* ── Shared section styles ──────────────────────────────────────────────────── */
.section-header {
  text-align: center;
  margin-bottom: 3.5rem;
}

.section-label {
  color: #16a34a;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 0.6rem;
}

.section-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: clamp(1.8rem, 3.5vw, 2.8rem);
  font-weight: 800;
  margin-bottom: 1rem;
  color: #0f1117;
}

.section-desc {
  color: #8892a4;
  max-width: 540px;
  margin: 0 auto;
  line-height: 1.7;
}

/* ── Pillars section ────────────────────────────────────────────────────────── */
.pillars-section {
  background: #f0f2f5;
  padding: 6rem 3rem;
}

.pillars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  max-width: 1100px;
  margin: 0 auto 3rem;
}

.pillar-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 2rem 1.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  transition: border-color 0.3s, transform 0.3s;
}
.pillar-card:hover { border-color: #6ee7b7; transform: translateY(-3px); }

.pillar-icon { margin-bottom: 1rem; }
.pillar-icon :deep(svg) { stroke: #16a34a; }

.pillar-card h3 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.6rem;
  color: #0f1117;
}

.pillar-card p { color: #8892a4; font-size: 0.9rem; line-height: 1.6; }

.programs-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.program-card {
  border-radius: 14px;
  padding: 2rem;
  background: white;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  transition: border-color 0.3s, transform 0.3s;
}
.program-a:hover { border-color: #6ee7b7; transform: translateY(-2px); }
.program-b:hover { border-color: #93c5fd; transform: translateY(-2px); }

.program-badge {
  display: inline-block;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 0.25rem 0.7rem;
  border-radius: 50px;
  margin-bottom: 1rem;
}
.program-a .program-badge { background: #f0fdf4; color: #16a34a; border: 1px solid #6ee7b7; }
.program-b .program-badge { background: #eff6ff; color: #2563eb; border: 1px solid #93c5fd; }

.program-card h3 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 0.6rem;
  color: #0f1117;
}

.program-card p { color: #8892a4; font-size: 0.88rem; line-height: 1.6; margin-bottom: 1rem; }

.program-list { list-style: none; display: flex; flex-direction: column; gap: 0.4rem; }
.program-list li {
  color: #6b7280;
  font-size: 0.82rem;
  padding-left: 1rem;
  position: relative;
}
.program-list li::before { content: '—'; position: absolute; left: 0; color: #6ee7b7; }

.programs-cta { text-align: center; margin-top: 2.5rem; }

.btn-outline-blue {
  display: inline-block;
  padding: 0.75rem 2rem;
  border: 1px solid #e5e7eb;
  color: #0f1117;
  text-decoration: none;
  border-radius: 50px;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: border-color 0.2s, background 0.2s;
}
.btn-outline-blue:hover { border-color: #6ee7b7; background: #f0fdf4; }

/* ── Timeline ───────────────────────────────────────────────────────────────── */
.timeline-section {
  background: white;
  padding: 6rem 3rem;
}

.timeline {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
}

.timeline-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(to bottom, transparent, #e5e7eb 10%, #e5e7eb 90%, transparent);
  transform: translateX(-50%);
}

.timeline-item {
  display: flex;
  align-items: center;
  margin-bottom: 4rem;
  position: relative;
}

.tl-left { flex-direction: row; padding-right: calc(50% + 2.5rem); }
.tl-right { flex-direction: row-reverse; padding-left: calc(50% + 2.5rem); }

.tl-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 1.75rem;
  flex: 1;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  transition: border-color 0.3s, transform 0.3s;
}
.tl-card:hover { border-color: #6ee7b7; transform: translateY(-2px); }

.tl-num {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 2.5rem;
  font-weight: 900;
  color: #e5e7eb;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.tl-card h3 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f1117;
  margin-bottom: 0.6rem;
}

.tl-content { color: #8892a4; font-size: 0.88rem; line-height: 1.65; margin-bottom: 1rem; }

.tl-badge {
  display: inline-block;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #16a34a;
  background: #f0fdf4;
  border: 1px solid #6ee7b7;
  border-radius: 50px;
  padding: 0.2rem 0.8rem;
}

.tl-dot {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #6ee7b7;
  border: 2px solid white;
  box-shadow: 0 0 0 3px #e5e7eb;
  flex-shrink: 0;
}

/* ── Footer ─────────────────────────────────────────────────────────────────── */
.footer {
  background: #0f1117;
  border-top: 1px solid #1e2130;
  padding: 1.5rem 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.3);
}

.footer a { color: #6ee7b7; text-decoration: none; transition: opacity 0.2s; }
.footer a:hover { opacity: 0.8; }

/* ── Responsive ─────────────────────────────────────────────────────────────── */
@media (max-width: 700px) {
  .programs-row { grid-template-columns: 1fr; }
  .pillars-section, .timeline-section { padding: 4rem 1.5rem; }
  .timeline-line { display: none; }
  .tl-left, .tl-right { padding: 0; flex-direction: column; }
  .tl-dot { display: none; }
}
</style>