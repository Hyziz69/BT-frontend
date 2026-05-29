import { ref } from 'vue'

// Singleton refs — zdieľané medzi App.vue, router a nav komponentmi
const enabled = ref(localStorage.getItem('nti_anim') !== '0')
const targetPath = ref('/')
const shouldAnimate = ref(false)

const LABELS: Record<string, string> = {
  '/':         'Domov',
  '/programy': 'Programy',
  '/login':    'Prihlásenie',
}

export function useTransition() {
  function toggle() {
    enabled.value = !enabled.value
    localStorage.setItem('nti_anim', enabled.value ? '1' : '0')
  }

  function label() {
    return LABELS[targetPath.value] ?? targetPath.value
  }

  return { enabled, toggle, targetPath, shouldAnimate, label }
}
