import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTransition } from '../composables/useTransition'
import LandingView from '../views/LandingView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView,
      meta: { requiresAuth: false },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/invitation/accept',
      name: 'invitation-accept',
      component: () => import('../views/InvitationAcceptView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/programy',
      name: 'programs',
      component: () => import('../views/ProgramsView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/dianie',
      name: 'feed',
      component: () => import('../views/FeedView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/teams',
      name: 'teams',
      component: () => import('../views/TeamsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/teams/:id',
      name: 'team-detail',
      component: () => import('../views/TeamDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/applications',
      name: 'applications',
      component: () => import('../views/ApplicationsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/applications/:id',
      name: 'application-detail',
      component: () => import('../views/ApplicationDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/applications-b',
      name: 'applications-b',
      component: () => import('../views/ProgramBView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/applications-b/:id',
      name: 'application-b-detail',
      component: () => import('../views/ProgramBDetailView.vue'),
    },
  ],
})

router.beforeEach((to, from) => {
  const authStore = useAuthStore()
  const { targetPath, shouldAnimate } = useTransition()

  targetPath.value = to.path
  shouldAnimate.value =
    to.meta.requiresAuth === false &&
    from.meta.requiresAuth === false &&
    !!from.name

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }

  if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }
})

export default router
