import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { onUnauthorized } from './api/client'
import { useAuthStore } from './stores/auth'
import { useUiStore } from './stores/ui'

// 전역 스타일 (컴포넌트 스타일은 각 컴포넌트에서 직접 import 한다)
import '@/css/base/variables.css'
import '@/css/base/reset.css'
import '@/css/base/typography.css'
import '@/css/base/form.css'
import '@/css/base/utilities.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// 사용 중에 로그인이 만료되면(401) 세션을 지우고 로그인 화면으로 보낸다.
// 로그인하면 원래 보던 화면으로 돌아온다. (router/index.js 의 redirect)
onUnauthorized(() => {
  const authStore = useAuthStore()
  if (!authStore.isLoggedIn) return

  authStore.clearSession()
  useUiStore().notify.error('로그인이 만료되었습니다. 다시 로그인해 주세요.')
  router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
})

app.mount('#app')
