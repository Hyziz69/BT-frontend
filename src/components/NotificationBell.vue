<template>
  <div class="notif-bell">
    <button class="bell-btn" @click="toggle" :title="`${unread} unread`">
      <span class="bell-icon">🔔</span>
      <span v-if="unread > 0" class="bell-badge">{{ unread > 9 ? '9+' : unread }}</span>
    </button>

    <!-- Dropdown -->
    <template v-if="open">
      <div class="notif-backdrop" @click="open = false"></div>
      <div class="notif-panel">
        <div class="notif-head">
          <strong>Notifications</strong>
          <button v-if="unread > 0" class="link-btn" @click="markAll">Mark all read</button>
        </div>

        <div v-if="loading" class="notif-state">Loading…</div>
        <div v-else-if="items.length === 0" class="notif-state">You're all caught up 🎉</div>

        <div v-else class="notif-list">
          <div
            v-for="n in items"
            :key="n.id"
            class="notif-item"
            :class="{ unread: !n.is_read }"
            @click="onClick(n)"
          >
            <span class="dot" :class="{ on: !n.is_read }"></span>
            <span class="notif-body">
              <span class="notif-subject">{{ n.subject }}</span>
              <span class="notif-text">{{ n.body }}</span>
              <span class="notif-time">{{ timeAgo(n.created_at) }}</span>
            </span>
            <button class="notif-close" title="Dismiss" @click.stop="remove(n)">×</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { notificationsApi, type AppNotification } from '../api/notifications'

const open = ref(false)
const loading = ref(false)
const items = ref<AppNotification[]>([])
const unread = ref(0)

async function load() {
  loading.value = true
  try {
    const res = await notificationsApi.list()
    items.value = res.notifications
    unread.value = res.unread_count
  } catch {
    items.value = []
    unread.value = 0
  } finally {
    loading.value = false
  }
}

function toggle() {
  open.value = !open.value
  if (open.value) load()
}

async function onClick(n: AppNotification) {
  if (!n.is_read) {
    n.is_read = true
    unread.value = Math.max(0, unread.value - 1)
    try {
      await notificationsApi.markRead(n.id)
    } catch {
      /* optimistic; ignore */
    }
  }
}

async function markAll() {
  items.value.forEach((n) => (n.is_read = true))
  unread.value = 0
  try {
    await notificationsApi.markAllRead()
  } catch {
    /* ignore */
  }
}

async function remove(n: AppNotification) {
  const wasUnread = !n.is_read
  items.value = items.value.filter((i) => i.id !== n.id)
  if (wasUnread) unread.value = Math.max(0, unread.value - 1)
  try {
    await notificationsApi.remove(n.id)
  } catch {
    /* optimistic; ignore */
  }
}

function timeAgo(iso: string): string {
  const d = new Date(iso).getTime()
  const diff = Date.now() - d
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('sk-SK')
}

onMounted(load)
</script>

<style scoped>
.notif-bell { position: fixed; top: 1.1rem; right: 1.5rem; z-index: 60; }

.bell-btn {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  font-size: 1.1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}
.bell-btn:hover { border-color: #6ee7b7; transform: translateY(-1px); }
.bell-icon { line-height: 1; filter: grayscale(0.2); }

.bell-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  background: #ef4444;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.notif-backdrop { position: fixed; inset: 0; z-index: 59; }

.notif-panel {
  position: absolute;
  top: 52px;
  right: 0;
  width: 340px;
  max-height: 460px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  border: 1px solid #f0f0f0;
  z-index: 61;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.notif-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.1rem;
  border-bottom: 1px solid #f3f4f6;
}
.notif-head strong {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.95rem;
  color: #0f1117;
}
.link-btn {
  background: none;
  border: none;
  color: #16a34a;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}
.link-btn:hover { text-decoration: underline; }

.notif-state { padding: 2rem 1.1rem; color: #8892a4; font-size: 0.9rem; text-align: center; }

.notif-list { overflow-y: auto; }

.notif-item {
  width: 100%;
  display: flex;
  gap: 0.7rem;
  align-items: flex-start;
  padding: 0.85rem 1.1rem;
  background: none;
  border: none;
  border-bottom: 1px solid #f7f7f8;
  cursor: pointer;
  text-align: left;
}
.notif-item:hover { background: #f9fafb; }
.notif-item.unread { background: #f0fdf4; }
.notif-item.unread:hover { background: #e8fbef; }

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 0.4rem;
  flex-shrink: 0;
  background: transparent;
}
.dot.on { background: #16a34a; }

.notif-body { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
.notif-subject { font-size: 0.86rem; font-weight: 700; color: #0f1117; }
.notif-text { font-size: 0.82rem; color: #4b5563; line-height: 1.35; }
.notif-time { font-size: 0.72rem; color: #9ca3af; margin-top: 0.1rem; }

.notif-close {
  margin-left: auto;
  align-self: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border: none;
  background: none;
  color: #9ca3af;
  font-size: 1.1rem;
  line-height: 1;
  border-radius: 6px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.12s ease;
}
.notif-item:hover .notif-close { opacity: 1; }
.notif-close:hover { background: #f3f4f6; color: #ef4444; }
</style>
