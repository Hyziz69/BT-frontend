<template>
  <RouterView v-slot="{ Component }">
    <Transition :css="false" :mode="transitionMode" @leave="onLeave" @enter="onEnter">
      <component :is="Component" :key="$route.path" />
    </Transition>
  </RouterView>

  <div ref="overlayEl" class="term-overlay">
    <div class="term-window">
      <div class="term-titlebar">
        <div class="term-dots">
          <span class="dot red" />
          <span class="dot yellow" />
          <span class="dot green" />
        </div>
        <span class="term-title">nti-portal — bash</span>
      </div>
      <pre ref="termBodyEl" class="term-body" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { gsap } from 'gsap'
import { useTransition } from './composables/useTransition'

const { enabled, shouldAnimate, label } = useTransition()

// mode="out-in" тільки коли грає анімація — інакше старий і новий рендеряться одночасно
// без gap між ними (немає чорного екрану)
const transitionMode = computed(() =>
  enabled.value && shouldAnimate.value ? 'out-in' : undefined
)

const overlayEl = ref<HTMLElement | null>(null)
const termBodyEl = ref<HTMLElement | null>(null)

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

async function typeLines(lines: string[]) {
  if (!termBodyEl.value) return
  termBodyEl.value.textContent = ''
  for (const line of lines) {
    for (const char of line) {
      termBodyEl.value.textContent += char
      await sleep(18)
    }
    termBodyEl.value.textContent += '\n'
    await sleep(80)
  }
  await sleep(160)
}

function onLeave(el: Element, done: () => void) {
  if (!enabled.value || !shouldAnimate.value) {
    done()
    return
  }

  gsap.timeline({ onComplete: done })
    .to(el, { opacity: 0, y: -6, duration: 0.22, ease: 'power2.in' })
    .to(overlayEl.value!, { opacity: 1, pointerEvents: 'all', duration: 0.22 }, '<0.08')
}

function onEnter(el: Element, done: () => void) {
  if (!enabled.value || !shouldAnimate.value) {
    done()
    return
  }

  gsap.set(el, { opacity: 0, y: 8 })

  typeLines([
    `$ nti-portal --navigate ${label()}`,
    `> Načítavam "${label()}"...`,
    '> Pripájam sa k portálu...',
    '> ✓ Pripravené',
  ]).then(() => {
    gsap.timeline({ onComplete: done })
      .to(overlayEl.value!, { opacity: 0, pointerEvents: 'none', duration: 0.3 })
      .to(el, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '<0.12')
      .add(() => {
        if (termBodyEl.value) termBodyEl.value.textContent = ''
      })
  })
}
</script>

<style>
.term-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(2, 4, 10, 0.88);
  backdrop-filter: blur(6px);
  opacity: 0;
  pointer-events: none;
}

.term-window {
  width: min(460px, 90vw);
  background: #0d1117;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.7);
}

.term-titlebar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 1rem;
  background: #161b22;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.term-dots { display: flex; gap: 0.38rem; }
.dot { width: 12px; height: 12px; border-radius: 50%; }
.dot.red    { background: #ff5f57; }
.dot.yellow { background: #febc2e; }
.dot.green  { background: #28c840; }

.term-title {
  color: rgba(255, 255, 255, 0.38);
  font-size: 0.76rem;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
}

.term-body {
  padding: 1.2rem 1.5rem 1.5rem;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.84rem;
  line-height: 1.85;
  color: #4ade80;
  min-height: 110px;
  white-space: pre-wrap;
  margin: 0;
}
</style>
