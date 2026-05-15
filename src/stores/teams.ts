import { defineStore } from 'pinia'
import { ref } from 'vue'
import { teamsApi } from '../api/teams'
import type { Team } from '../types'

export const useTeamsStore = defineStore('teams', () => {
  const teams = ref<Team[]>([])
  const currentTeam = ref<Team | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchTeams() {
    loading.value = true
    error.value = null
    try {
      const response = await teamsApi.getAll()
      teams.value = response.data
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
      const response = await teamsApi.getOne(id)
      currentTeam.value = response.data
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Failed to load team'
    } finally {
      loading.value = false
    }
  }

  async function createTeam(name: string, competencies: string[]) {
    loading.value = true
    error.value = null
    try {
      const response = await teamsApi.create({ name, competencies })
      teams.value.push(response.data)
      return response.data
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Failed to create team'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function addMember(teamId: string, email: string) {
    loading.value = true
    error.value = null
    try {
      const response = await teamsApi.addMember(teamId, email)
      currentTeam.value = response.data
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Failed to add member'
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

  return {
    teams,
    currentTeam,
    loading,
    error,
    fetchTeams,
    fetchTeam,
    createTeam,
    addMember,
    removeMember,
  }
})
