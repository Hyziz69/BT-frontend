import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const isStudent = computed(() => user.value?.account_type === 'student')
  const isAdmin = computed(
    () => user.value?.account_type === 'nti_admin' || user.value?.account_type === 'superadmin',
  )
  const isEvaluator = computed(() => user.value?.account_type === 'evaluator')
  const isMentor = computed(() => user.value?.account_type === 'mentor')

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUser(newUser: User) {
    user.value = newUser
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  return {
    token,
    user,
    isAuthenticated,
    isStudent,
    isAdmin,
    isEvaluator,
    isMentor,
    setToken,
    setUser,
    logout,
  }
})
