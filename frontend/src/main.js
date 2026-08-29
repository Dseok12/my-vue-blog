import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 전역 스타일 (컴포넌트 스타일은 각 컴포넌트에서 직접 import 한다)
import '@/css/base/variables.css'
import '@/css/base/reset.css'
import '@/css/base/typography.css'
import '@/css/base/form.css'
import '@/css/base/utilities.css'

createApp(App).use(createPinia()).use(router).mount('#app')
