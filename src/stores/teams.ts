import { defineStore } from 'pinia'
import { ref } from 'vue'
import { teamsApi } from '../api/teams'
import type { Team } from '../types'

export const useTeamsStore = defineStore('teams', () => {
  const teams = ref<Team[]>([])
  const currentTeam = ref<Team | null>(null)

  const loading = ref(false)
  const error = ref<string | null>(null)
  const inviteError = ref<string | null>(null) // Специально для ошибок ввода инвайт-кода

  async function fetchTeams() {
    loading.value = true
    error.value = null
    try {
      const response = await teamsApi.getAll() as any
      teams.value = response.data ? response.data : response
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Failed to load teams'
    } finally {
      loading.value = false
    }
  }

  async function fetchTeam(id: string) {
    loading.value = true
    error.value = null
    try {
      const response = await teamsApi.getOne(id) as any

      // Берем команду по ключу 'team', как возвращает TeamController.php
      if (response.data) {
        currentTeam.value = response.data
      } else {
        currentTeam.value = response.data ?? response
      }

    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Failed to load team'
      currentTeam.value = null
    } finally {
      loading.value = false
    }
  }

  async function createTeam(name: string, competencies: string[]) {
    loading.value = true
    error.value = null
    try {
      const response = await teamsApi.create({ name, competencies }) as any

      await fetchTeams()

      return response
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Failed to create team'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function joinTeam(inviteCode: string) {
    loading.value = true
    inviteError.value = null
    try {
      // Убедись, что метод join есть в твоем файле api/teams.ts
      const response = await teamsApi.join(inviteCode) as any

      await fetchTeams()

      return response
    } catch (e: any) {
      inviteError.value = e.response?.data?.message ?? 'Neplatný pozývací kód alebo ste už v tíme.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function removeMember(teamId: string, userId: string) {
    loading.value = true
    error.value = null
    try {
      await teamsApi.removeMember(teamId, userId)
      if (currentTeam.value) {
        currentTeam.value.members = currentTeam.value.members.filter((m) => m.id !== userId)
      }
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Failed to remove member'
      throw e
    } finally {
      loading.value = false
    }
  }
  async function leaveTeam(teamId: string) {
    loading.value = true
    error.value = null
    try {
      await teamsApi.leave(teamId)
      currentTeam.value = null // Очищаем состояние текущей команды
      await fetchTeams()       // Обновляем список команд на главной странице
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Chyba pri opúšťaní tímu.'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    teams,
    currentTeam,
    loading,
    error,
    inviteError,
    fetchTeams,
    fetchTeam,
    createTeam,
    joinTeam, // Экспортируем новый метод
    removeMember,
    leaveTeam
  }
})
