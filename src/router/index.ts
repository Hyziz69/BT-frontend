import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTransition } from '../composables/useTransition'
import LandingView from '../views/LandingView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', name: 'landing', component: LandingView, meta: { requiresAuth: false } },
    { path: '/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { requiresAuth: false } },
    { path: '/register', name: 'register', component: () => import('../views/RegisterView.vue'), meta: { requiresAuth: false } },
    { path: '/forgot-password', name: 'forgot-password', component: () => import('../views/ForgotPasswordView.vue'), meta: { requiresAuth: false } },
    { path: '/reset-password', name: 'reset-password', component: () => import('../views/ResetPasswordView.vue'), meta: { requiresAuth: false } },
    { path: '/verify-email', name: 'verify-email', component: () => import('../views/VerifyEmailView.vue'), meta: { requiresAuth: false } },
    { path: '/invitation/accept', name: 'invitation-accept', component: () => import('../views/InvitationAcceptView.vue'), meta: { requiresAuth: false } },
    { path: '/company-invitation/accept', name: 'company-invitation-accept', component: () => import('../views/CompanyInvitationAcceptView.vue'), meta: { requiresAuth: false } },
    { path: '/programy', name: 'programs', component: () => import('../views/ProgramsView.vue'), meta: { requiresAuth: false } },
    { path: '/dianie', name: 'feed', component: () => import('../views/FeedView.vue'), meta: { requiresAuth: false } },
    { path: '/dashboard', name: 'dashboard', component: () => import('../views/DashboardView.vue'), meta: { requiresAuth: true } },
    { path: '/teams', name: 'teams', component: () => import('../views/TeamsView.vue'), meta: { requiresAuth: true } },
    { path: '/teams/:id', name: 'team-detail', component: () => import('../views/TeamDetailView.vue'), meta: { requiresAuth: true } },
    { path: '/applications', name: 'applications', component: () => import('../views/ApplicationsView.vue'), meta: { requiresAuth: true } },
    { path: '/applications/:id', name: 'application-detail', component: () => import('../views/ApplicationDetailView.vue'), meta: { requiresAuth: true } },
    { path: '/challenges', name: 'challenges', component: () => import('../views/ChallengesView.vue'), meta: { requiresAuth: true } },
    { path: '/challenges/:id', name: 'challenge-detail', component: () => import('../views/ChallengeDetailView.vue'), meta: { requiresAuth: true } },
    { path: '/company', name: 'company', component: () => import('../views/CompanyView.vue'), meta: { requiresAuth: true } },
    { path: '/projects/:id', name: 'student-project', component: () => import('../views/StudentProjectView.vue'), meta: { requiresAuth: true } },
    { path: '/mentees', name: 'mentees', component: () => import('../views/MenteesView.vue'), meta: { requiresAuth: true } },
    { path: '/mentorships/:id', name: 'mentorship-detail', component: () => import('../views/MentorshipDetailView.vue'), meta: { requiresAuth: true } },
    { path: '/profile', name: 'profile', component: () => import('../views/ProfileView.vue'), meta: { requiresAuth: true } },
    { path: '/users/:id/profile', name: 'user-profile', component: () => import('../views/UserProfileView.vue'), meta: { requiresAuth: true } },
    { path: '/admin', name: 'admin', component: () => import('../views/AdminView.vue'), meta: { requiresAuth: true } },
    { path: '/admin/activity', name: 'admin-activity', component: () => import('../views/AdminActivityView.vue'), meta: { requiresAuth: true } },
    { path: '/admin/reports', name: 'admin-reports', component: () => import('../views/AdminReportsView.vue'), meta: { requiresAuth: true } },
    { path: '/applications-b', name: 'applications-b', component: () => import('../views/program-b/ApplicationsView.vue'), meta: { requiresAuth: true } },
    { path: '/applications-b/:id', name: 'application-b-detail', component: () => import('../views/program-b/ApplicationDetailView.vue'), meta: { requiresAuth: true } },
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
