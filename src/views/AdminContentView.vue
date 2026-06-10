<template>
  <AppLayout>
    <div class="content-page">
      <div class="page-header">
        <div class="header-content">
          <span class="kicker">CMS</span>
          <h1 class="page-title">Content Management</h1>
          <p class="page-subtitle">Edit the public landing page text blocks.</p>
        </div>
      </div>

      <div class="admin-switch">
        <RouterLink to="/admin" class="switch-link">
          <span>★</span>
          Admin Panel
        </RouterLink>

        <RouterLink to="/admin/activity" class="switch-link">
          <span>⊙</span>
          Activity Log
        </RouterLink>

        <RouterLink to="/admin/reports" class="switch-link">
          <span>▣</span>
          Reports
        </RouterLink>

        <RouterLink to="/admin/content" class="switch-link active-switch">
          <span>✎</span>
          Content
        </RouterLink>
      </div>

      <p v-if="error" class="banner error">{{ error }}</p>
      <p v-if="success" class="banner success">{{ success }}</p>

      <div v-if="loading" class="loading">Loading content blocks...</div>

      <div v-else class="blocks-list">
        <div v-for="block in blocks" :key="block.key" class="block-card">
          <div class="block-header">
            <div>
              <strong>{{ block.label }}</strong>
              <span class="block-key">{{ block.key }}</span>
            </div>
            <button
              class="btn-primary small"
              :disabled="saving === block.key"
              @click="saveBlock(block)"
            >
              {{ saving === block.key ? 'Saving...' : 'Save' }}
            </button>
          </div>
          <textarea
            v-model="block.value"
            rows="2"
            class="block-textarea"
          />
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import { contentApi } from '../api/content'

const loading = ref(true)
const saving = ref<string | null>(null)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const blocks = ref<Array<{ id: string; key: string; label: string; type: string; value: string }>>([])

onMounted(async () => {
  try {
    blocks.value = await contentApi.getAll()
  } catch {
    error.value = 'Failed to load content blocks.'
  } finally {
    loading.value = false
  }
})

async function saveBlock(block: { key: string; value: string }) {
  saving.value = block.key
  error.value = null
  success.value = null
  try {
    await contentApi.update(block.key, block.value)
    success.value = `"${block.key}" updated successfully.`
    setTimeout(() => success.value = null, 3000)
  } catch {
    error.value = 'Failed to save block.'
  } finally {
    saving.value = null
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

.content-page { max-width: 900px; font-family: 'DM Sans', sans-serif; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 2rem 0 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.kicker {
  display: inline-flex;
  background: #ecfdf5;
  color: #047857;
  border-radius: 999px;
  padding: 0.25rem 0.7rem;
  font-size: 0.78rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
}

.page-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  color: #0f1117;
  margin-bottom: 0.25rem;
}

.page-subtitle { color: #8892a4; font-size: 0.95rem; }

.admin-switch {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-bottom: 1.25rem;
}

.switch-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.9rem;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #334155;
  text-decoration: none;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: 0.86rem;
  transition: all 0.15s ease;
}

.switch-link:hover, .active-switch {
  background: #0f1117;
  border-color: #0f1117;
  color: #6ee7b7;
}

.banner {
  padding: 0.85rem 1rem;
  border-radius: 14px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  border: 1px solid transparent;
}
.banner.error { background: #fef2f2; color: #991b1b; border-color: #fecaca; }
.banner.success { background: #ecfdf5; color: #047857; border-color: #a7f3d0; }

.loading { color: #8892a4; padding: 2rem 0; }

.blocks-list { display: flex; flex-direction: column; gap: 1rem; }

.block-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.block-header strong {
  display: block;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f1117;
}

.block-key {
  font-size: 0.75rem;
  color: #8892a4;
  font-family: monospace;
}

.block-textarea {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.65rem 0.85rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  color: #0f1117;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.block-textarea:focus {
  outline: none;
  border-color: #6ee7b7;
  box-shadow: 0 0 0 3px rgba(110,231,183,0.15);
}

.btn-primary {
  background: #0f1117;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  transition: opacity 0.15s;
}
.btn-primary:hover:not(:disabled) { opacity: 0.85; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.small { padding: 0.4rem 0.8rem; font-size: 0.8rem; }
</style>