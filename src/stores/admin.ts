import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  adminApi,
  type AdminApplication,
  type AdminCall,
  type AdminDashboardStats,
  type AdminProgram,
  type AdminUser,
} from '../api/admin' // Проверь путь, если нужно, замени на '@/api/admin'

export const useAdminStore = defineStore('admin', () => {
  // ==============================
  // 1. СОСТОЯНИЕ (STATE)
  // ==============================
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const successMessage = ref<string | null>(null)
  const accessDenied = ref(false) // Для отлова 403 ошибки

  const stats = ref<AdminDashboardStats | null>(null)
  const users = ref<AdminUser[]>([])
  const programs = ref<AdminProgram[]>([])
  const calls = ref<AdminCall[]>([])
  const applications = ref<AdminApplication[]>([])

  // ==============================
  // 2. ГЕТТЕРЫ (GETTERS)
  // ==============================
  const mentors = computed(() => {
    return users.value.filter(
      (user) => user.account_type === 'mentor' && user.status === 'active'
    )
  })

  // ==============================
  // 3. ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
  // ==============================
  function clearMessages() {
    error.value = null
    successMessage.value = null
    accessDenied.value = false
  }

  function handleApiError(e: any) {
    if (e.response?.status === 403) {
      accessDenied.value = true
    }
    // Если нужно обрабатывать 401 (выход из аккаунта), лучше это делать
    // через axios interceptors в файле api, чтобы не дублировать код.
    error.value = e.response?.data?.message ?? 'Request failed.'
  }

  // Умная обертка для всех мутаций: включает лоадинг, делает запрос, ловит ошибки и обновляет страницу
  async function runAction(action: () => Promise<any>, reloadAction: () => Promise<any>, successMsg: string) {
    saving.value = true
    clearMessages()
    try {
      await action()
      successMessage.value = successMsg
      await reloadAction() // <--- Обновляем ТОЛЬКО нужное!
    } catch (e: any) {
      handleApiError(e)
    } finally {
      saving.value = false
    }
  }

  // ==============================
  // 4. ОСНОВНЫЕ ДЕЙСТВИЯ (ACTIONS)
  // ==============================

// ==============================
  // АТОМАРНЫЕ ЗАГРУЗКИ
  // ==============================
  async function fetchStats() { stats.value = await adminApi.getDashboard() }
  async function fetchUsers() { users.value = await adminApi.getUsers() }
  async function fetchPrograms() { programs.value = await adminApi.getPrograms() }
  async function fetchCalls() { calls.value = await adminApi.getCalls() }
  async function fetchApplications() { applications.value = await adminApi.getApplications() }

  // Оставляем loadAll для первой загрузки страницы (в onMounted)
  async function loadAll() {
    loading.value = true
    clearMessages()
    try {
      await Promise.all([fetchStats(), fetchUsers(), fetchPrograms(), fetchCalls(), fetchApplications()])
    } catch (e: any) {
      handleApiError(e)
    } finally {
      loading.value = false
    }
  }

  // Действия с пользователями
// Действия с пользователями (обновляем только юзеров и статистику)
  const approveUser = (id: string) => runAction(
    () => adminApi.approveUser(id),
    () => Promise.all([fetchUsers(), fetchStats()]),
    'User approved successfully.'
  )
  const rejectUser = (id: string) => runAction(
    () => adminApi.rejectUser(id),
    () => Promise.all([fetchUsers(), fetchStats()]),
    'User rejected successfully.'
  )

  // Действия с программами (обновляем только программы и статистику)
  const createProgram = (payload: any) => runAction(
    () => adminApi.createProgram(payload),
    () => Promise.all([fetchPrograms(), fetchStats()]),
    'Program created successfully.'
  )
  const updateProgram = (id: string, payload: any) => runAction(
    () => adminApi.updateProgram(id, payload),
    () => fetchPrograms(), // При апдейте статистика даже не меняется, грузим только программы
    'Program updated successfully.'
  )

  // Действия со звонками (Calls)
  const createCall = (payload: any) => runAction(
    () => adminApi.createCall(payload),
    () => Promise.all([fetchCalls(), fetchStats()]),
    'Call created successfully.'
  )
  const updateCall = (id: string, payload: any) => runAction(
    () => adminApi.updateCall(id, payload),
    () => fetchCalls(),
    'Call updated successfully.'
  )
  const openCall = (id: string) => runAction(
    () => adminApi.openCall(id),
    () => fetchCalls(),
    'Call opened successfully.'
  )
  const closeCall = (id: string) => runAction(
    () => adminApi.closeCall(id),
    () => fetchCalls(),
    'Call closed successfully.'
  )

  // Действия с заявками
  const assignMentor = (appId: string, mentorId: string) => runAction(
    () => adminApi.assignMentor(appId, mentorId),
    () => fetchApplications(),
    'Mentor assigned successfully.'
  )

  const endMentorship = (appId: string, mentorshipId: string) => runAction(
    () => adminApi.endMentorship(appId, mentorshipId),
    () => fetchApplications(),
    'Mentorship ended successfully.'
  )


  // ==============================
  // 5. ЭКСПОРТ (ВОЗВРАТ)
  // ==============================
  return {
    // Переменные состояния
    loading, saving, error, successMessage, accessDenied,
    stats, users, programs, calls, applications,
    // Вычисляемые данные
    mentors,
    // Функции
    clearMessages, loadAll,
    approveUser, rejectUser,
    createProgram, updateProgram,
    createCall, updateCall, openCall, closeCall,
    assignMentor, fetchUsers, endMentorship
  }
})
