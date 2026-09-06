import { createRouter, createWebHistory } from 'vue-router'

import { APP_TITLE } from '@/config'
import { useAuthStore } from '@/stores/auth'

/**
 * meta.requiresAuth : 로그인한 회원만 볼 수 있는 화면
 * meta.guestOnly    : 비회원만 볼 수 있는 화면(로그인/회원가입)
 * meta.layout       : 'default' | 'auth'
 * meta.wide         : auth 레이아웃을 넓게 쓸지 (소개가 함께 있는 로그인 화면)
 */
const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    // wide: 소개 패널과 로그인 카드를 나란히 놓기 위해 넓은 레이아웃을 쓴다.
    meta: { guestOnly: true, layout: 'auth', wide: true, title: '로그인' },
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('@/views/SignupView.vue'),
    meta: { guestOnly: true, layout: 'auth', title: '회원가입' },
  },
  {
    path: '/',
    name: 'diary-list',
    component: () => import('@/views/DiaryListView.vue'),
    meta: { requiresAuth: true, title: '내 다이어리' },
  },
  {
    path: '/diaries/new',
    name: 'diary-create',
    component: () => import('@/views/DiaryEditorView.vue'),
    meta: { requiresAuth: true, title: '새 다이어리' },
  },
  {
    path: '/diaries/:id',
    name: 'diary-detail',
    component: () => import('@/views/DiaryDetailView.vue'),
    meta: { requiresAuth: true, title: '다이어리' },
  },
  {
    path: '/diaries/:id/edit',
    name: 'diary-edit',
    component: () => import('@/views/DiaryEditorView.vue'),
    meta: { requiresAuth: true, title: '다이어리 수정' },
  },
  {
    path: '/feed',
    name: 'feed',
    component: () => import('@/views/FeedView.vue'),
    meta: { requiresAuth: true, title: '공개 다이어리' },
  },
  {
    path: '/users/:id',
    name: 'user-page',
    component: () => import('@/views/MyPageView.vue'),
    meta: { requiresAuth: true, title: '마이페이지' },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, title: '신고 관리' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { layout: 'auth', title: '페이지를 찾을 수 없음' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  await authStore.restore()

  // 비회원의 첫 랜딩 페이지는 로그인 화면이다.
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guestOnly && authStore.isLoggedIn) {
    return { name: 'diary-list' }
  }
  // 관리자 전용 화면은 관리자만 들어갈 수 있다.
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return { name: 'diary-list' }
  }
  return true
})

router.afterEach((to) => {
  document.title = to.meta.title ? to.meta.title + ' · ' + APP_TITLE : APP_TITLE
})

export default router
