# Stage 7 — Vue 심화와 실무 도구

> 전체 로드맵: [README](README.md) · 이전: [06 백엔드](06-backend.md) · 다음: [08 어떤 프로젝트든 만드는 법](08-build-any-project.md)

## 목표

05 를 끝냈다면 "동작하는 앱" 은 만들 수 있다. 이 단계는 **오래 유지되고, 남이 읽을 수 있고, 밖에 내놓을 수 있는 앱**으로 가는 길이다.

| 장 | 주제 | 이 프로젝트의 예 |
| --- | --- | --- |
| 1 | 컴포저블 설계 | `useMediaQuery`, `useLeaveGuard`, `usePagedList` |
| 2 | 반응성 깊이 보기 | `watchEffect`, `shallowRef`, `nextTick`, `defineModel` |
| 3 | 내장 컴포넌트 | `Teleport`(BaseModal), `Transition`, `KeepAlive` |
| 4 | provide / inject | — (직접 만들어 본다) |
| 5 | ESLint + Prettier | `eslint.config.js`, `.prettierrc.json` |
| 6 | 자동 테스트 | `*.test.js` 28개 |
| 7 | TypeScript 입문 | — (전환 연습) |
| 8 | 보안 | `textContent`/`{{ }}`, 401 처리, 토큰 저장 |
| 9 | 성능 | 지연 로딩, `loading="lazy"`, 페이지네이션 |
| 10 | 빌드와 배포 | `npm run build` → 정적 호스팅 + API 서버 |
| 11 | 생태계 지도 | 무엇을 언제 도입할까 |

---

## 1. 컴포저블 설계

### 1-1. 컴포저블이란

**컴포넌트에서 "상태 + 로직" 을 떼어 내 재사용하는 함수.** 이름은 `use` 로 시작한다.

```
컴포넌트 = 화면(template) + 상태(ref) + 로직(함수, watch, 생명주기)
                            └──────────── 이 부분을 꺼낸 것이 컴포저블 ───────────┘
```

언제 만드나?

1. **같은 로직이 두 컴포넌트 이상**에서 필요할 때 (`usePagedList` — 내 목록과 피드)
2. 한 컴포넌트가 **너무 길어서** 의미 단위로 나누고 싶을 때
3. **등록/해제가 짝인 로직** (`useMediaQuery`, `useLeaveGuard` — 해제를 잊을 수 없게 만든다)

### 1-2. 이 프로젝트의 컴포저블 세 개 비교

| 컴포저블 | 입력 | 출력 | 생명주기 사용 |
| --- | --- | --- | --- |
| [useMediaQuery](../frontend/src/composables/useMediaQuery.js) | 미디어 쿼리 문자열 | `matches` (ref) | `onMounted` / `onBeforeUnmount` |
| [useLeaveGuard](../frontend/src/composables/useLeaveGuard.js) | "물어볼까?" 함수 | 없음 (부수 효과) | `onBeforeRouteLeave` + 위 둘 |
| [usePagedList](../frontend/src/composables/usePagedList.js) | `loadPage(cursor)` 함수 | 목록 상태 + `reload`/`loadMore` | 없음 (스토어 안에서도 쓸 수 있다) |

### 1-3. 좋은 컴포저블의 규칙

```js
// ✓ 1) 반환은 객체로 — 쓰는 쪽에서 필요한 것만 구조 분해한다
const { items, hasMore, loadMore } = usePagedList(load)

// ✓ 2) 반환하는 상태는 ref — 구조 분해해도 반응성이 유지된다
return { items, total }            // items, total 은 ref
// ✗ return reactive({ items, total }) → 구조 분해하면 반응성이 끊긴다

// ✓ 3) 입력이 바뀔 수 있다면 ref 나 getter 함수를 받는다
useLeaveGuard(() => dirty.value)   // 호출될 때마다 "지금" 값을 읽는다
// ✗ useLeaveGuard(dirty.value)    → 처음 값(false)에 영원히 고정된다

// ✓ 4) 등록한 것은 같은 컴포저블 안에서 해제한다

// ✓ 5) 바깥(라우터, 스토어, API)은 매개변수로 받거나 최소한만 의존한다
//      usePagedList 는 API 를 모른다. "페이지를 가져오는 함수" 만 받는다 → 테스트가 쉽다
```

### 1-4. 과제

1. `useDebouncedRef(value, delay)` — 값이 바뀌고 `delay` 가 지나야 바뀌는 ref. 검색창에 적용한다
2. `useLocalStorage(key, defaultValue)` — localStorage 와 동기화되는 ref. `stores/ui.js` 의 사이드바 상태를 이걸로 바꾼다
3. `useIntersection(target, callback)` — 요소가 화면에 보이면 콜백. "더 보기" 버튼을 **무한 스크롤**로 바꾼다

```js
// 3번 힌트
export function useIntersection(targetRef, onVisible) {
  let observer = null
  onMounted(() => {
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) onVisible()
    })
    if (targetRef.value) observer.observe(targetRef.value)
  })
  onBeforeUnmount(() => observer?.disconnect())
}
```

> 직접 만든 뒤에는 **VueUse**(<https://vueuse.org>) 를 구경한다. 이런 컴포저블 200여 개를 모아 둔 라이브러리다.
> 실무에서는 직접 만들기 전에 VueUse 에 있는지 먼저 본다. 하지만 **한 번은 직접 만들어 봐야** 고를 수 있다.

---

## 2. 반응성 깊이 보기

### 2-1. watch vs watchEffect

```js
// watch — 무엇을 지켜볼지 명시. 이전 값도 받는다. 기본은 "바뀔 때만"
watch(selectedDate, (value, oldValue) => fetchList(value), { immediate: true })

// watchEffect — 안에서 읽은 ref 를 자동으로 추적. 즉시 한 번 실행
watchEffect(() => {
  document.title = (diaryStore.current?.title ?? '다이어리') + ' · diary'
})
```

**이 프로젝트는 `watch` 만 쓴다.** 무엇에 반응하는지 코드에 드러나서 읽기 쉽기 때문이다.
`watchEffect` 는 추적 대상이 여러 개이고 명확할 때만 쓴다.

### 2-2. nextTick — 화면이 다시 그려진 뒤에

ref 를 바꿔도 DOM 은 **바로** 바뀌지 않는다. Vue 가 모아 뒀다가 한 번에 그린다.

```js
// BaseModal.vue
watch(() => props.open, async (open) => {
  if (open) {
    await nextTick()          // v-if 로 패널이 실제로 그려질 때까지 기다린다
    panel.value?.focus()      // 기다리지 않으면 panel.value 가 아직 null
  }
})
```

### 2-3. shallowRef, markRaw — 큰 데이터 다루기

```js
const chartData = shallowRef(hugeArray)   // .value 를 통째로 바꿀 때만 반응. 안쪽 변화는 추적 안 함
chartData.value = newHugeArray             // ✓ 화면 갱신
chartData.value.push(1)                    // ✗ 갱신 안 됨 (의도된 것)

const map = markRaw(new LeafletMap())      // 외부 라이브러리 객체는 반응형으로 만들지 않는다
```

수천 개 행, 차트 데이터, 지도·에디터 같은 외부 객체에 쓴다.

### 2-4. defineModel — v-model 을 한 줄로 (Vue 3.4+)

05 에서는 `modelValue` prop + `update:modelValue` emit 을 직접 썼다. 원리를 알았으니 이제 줄여 쓴다.

```vue
<!-- 전: BaseInput.vue -->
<script setup>
defineProps({ modelValue: { type: String, default: '' } })
defineEmits(['update:modelValue'])
</script>
<template>
  <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
</template>
```

```vue
<!-- 후 -->
<script setup>
const model = defineModel({ type: String, default: '' })
</script>
<template>
  <input v-model="model" />
</template>
```

```js
// 이름 있는 v-model — DiaryForm 의 dirty-change 를 이렇게 바꿀 수도 있다
const dirty = defineModel('dirty', { type: Boolean, default: false })
// 부모: <DiaryForm v-model:dirty="dirty" />
```

**과제**: `BaseInput`, `BaseTextarea`, `CalendarPanel` 을 `defineModel` 로 바꾸고, 테스트(`npm test`)가 통과하는지 확인한다.

### 2-5. useTemplateRef (Vue 3.5+)

```js
// 전
const fileInput = ref(null)        // 템플릿의 ref="fileInput" 과 이름이 같아야 한다
// 후 — 이름이 문자열로 드러나서 덜 헷갈린다
const fileInput = useTemplateRef('fileInput')
```

---

## 3. 내장 컴포넌트

### 3-1. Teleport — 다른 곳에 그리기

```vue
<Teleport to="body">
  <div v-if="open" class="modal">...</div>
</Teleport>
```

컴포넌트는 `DiaryDetailView` 안에 있지만, 실제 DOM 은 `<body>` 바로 아래에 생긴다.
부모의 `overflow: hidden` 이나 `z-index` 에 갇히지 않는다. **모달, 토스트, 드롭다운 메뉴**에 쓴다.
([BaseModal.vue](../frontend/src/components/common/BaseModal.vue))

> 주의: `Teleport` 를 쓰면 컴포넌트 루트가 여러 개(fragment)가 된다. 부모가 넘긴 `class` 같은
> 속성이 자동으로 붙지 않으니, 필요하면 `inheritAttrs: false` + `v-bind="$attrs"` 로 직접 붙인다.

### 3-2. Transition / TransitionGroup

```vue
<transition name="fade" mode="out-in">       <!-- 하나가 나타나고 사라질 때 -->
  <component :is="Component" />
</transition>

<transition-group name="toast">              <!-- 목록의 항목이 추가/삭제될 때 -->
  <p v-for="toast in toasts" :key="toast.id">{{ toast.message }}</p>
</transition-group>
```

Vue 가 `fade-enter-from` → `fade-enter-active` → `fade-enter-to` 클래스를 차례로 붙여 준다.
CSS 는 [utilities.css](../frontend/src/css/base/utilities.css) 의 `.fade-*`.

### 3-3. KeepAlive — 화면을 떠나도 상태 유지

피드에서 스크롤을 한참 내리고 글을 열었다가 뒤로 가면, 목록이 처음부터 다시 그려진다.

```vue
<!-- App.vue -->
<router-view v-slot="{ Component }">
  <keep-alive :include="['FeedView']">       <!-- 이 컴포넌트는 없애지 않고 숨겨 둔다 -->
    <component :is="Component" />
  </keep-alive>
</router-view>
```

```js
// FeedView.vue — KeepAlive 안의 컴포넌트는 onMounted 대신 이것을 쓴다
onActivated(() => { /* 다시 보일 때 */ })
onDeactivated(() => { /* 숨겨질 때 */ })
```

**과제**: 피드에 `KeepAlive` 를 적용하고, `scrollBehavior` 의 `savedPosition` 과 함께 "뒤로 가면 보던 위치" 를 구현한다.

### 3-4. Suspense, defineAsyncComponent

```js
// 무거운 컴포넌트(차트, 에디터)를 필요할 때만 내려받기
const ChartPanel = defineAsyncComponent(() => import('@/components/stats/ChartPanel.vue'))
```

`Suspense` 는 아직 실험 단계 기능이 포함되어 있어 이 프로젝트에서는 쓰지 않는다.
비동기 데이터는 지금처럼 `loading` 상태로 처리하는 것이 명확하다.

---

## 4. provide / inject — 멀리 있는 자손에게 값 전달

```
App
└─ DefaultLayout          provide('theme', theme)
   └─ ...
      └─ ...
         └─ DiaryCard     inject('theme')   ← 중간 단계를 거치지 않고 받는다
```

```js
// 조상
import { provide, ref } from 'vue'
const theme = ref('light')
provide('theme', { theme, toggle: () => (theme.value = theme.value === 'light' ? 'dark' : 'light') })

// 자손
import { inject } from 'vue'
const { theme, toggle } = inject('theme')
```

**props drilling**(A→B→C→D 로 props 를 계속 넘기는 것)을 피할 때 쓴다.

| 상황 | 선택 |
| --- | --- |
| 부모 → 바로 아래 자식 | props |
| 특정 컴포넌트 묶음 안에서만 공유 (탭 그룹, 폼과 필드들) | provide / inject |
| 앱 전체에서 공유, 화면 간 이동해도 유지 | Pinia 스토어 |

**과제 — 다크 모드**: `variables.css` 에 `[data-theme='dark'] { --color-bg: ...; }` 를 추가하고,
`useTheme` 컴포저블 + `provide` 로 헤더에 토글 버튼을 만든다. 선택은 localStorage 에 저장하고,
처음에는 `prefers-color-scheme` 을 따른다.

---

## 5. ESLint + Prettier — 사람 대신 검사하는 도구

| 도구 | 하는 일 | 예 |
| --- | --- | --- |
| **ESLint** | 버그가 될 코드를 찾는다 | 안 쓰는 변수, 정의 안 된 변수, `v-for` 에 `:key` 없음 |
| **Prettier** | 모양을 통일한다 | 따옴표, 세미콜론, 줄바꿈, 들여쓰기 |

```bash
npm run lint           # 문제 찾기
npm run format         # 자동 정렬
npm run format:check   # 정렬이 안 된 파일이 있는지만 확인 (CI 용)
```

설정 파일 — [frontend/eslint.config.js](../frontend/eslint.config.js)

```js
export default [
  { ignores: ['dist/', 'coverage/'] },
  js.configs.recommended,                    // JavaScript 기본 규칙
  ...pluginVue.configs['flat/recommended'],  // Vue 권장 규칙
  prettier,                                  // 모양 규칙은 끈다 (Prettier 와 싸우지 않게)
  { rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }] } },
]
```

**VS Code 연동**: ESLint, Prettier 확장을 설치하고 설정에서 `Format On Save` 를 켜면
저장할 때마다 자동으로 정리되고, 문제가 있는 줄에 빨간 밑줄이 생긴다.

> 이 프로젝트에 ESLint 를 처음 켰을 때 `CommentForm.vue` 의 **안 쓰는 `props` 변수**가 나왔다.
> 규칙: **경고를 끄지 말고 코드를 고친다.** 정말 예외라면 `// eslint-disable-next-line 규칙 -- 이유` 로 이유를 남긴다.

---

## 6. 자동 테스트

### 6-1. 왜 테스트를 쓰나

기능이 30개인 앱에서 하나를 고치면, 나머지 29개가 멀쩡한지 **매번 손으로 확인**해야 한다.
테스트는 그 확인을 1초 만에 자동으로 해 준다. **고치는 것이 두렵지 않게** 해 준다.

```bash
npm test             # 한 번 실행
npm run test:watch   # 파일을 저장할 때마다 다시 실행 (개발 중에 켜 둔다)
```

### 6-2. 테스트의 모양 — 준비, 실행, 확인

```js
import { describe, expect, it } from 'vitest'
import { validatePassword } from './validators'

describe('validatePassword', () => {          // 무엇을 테스트하나
  it('8자 미만이면 오류 메시지', () => {        // 어떤 경우에 어떻게 돼야 하나
    const result = validatePassword('1234567')   // 실행
    expect(result).not.toBe('')                  // 확인
  })
})
```

### 6-3. 이 프로젝트의 테스트 지도 — 쉬운 것부터

| 종류 | 파일 | 배울 기법 |
| --- | --- | --- |
| 순수 함수 | [date.test.js](../frontend/src/utils/date.test.js), [validators.test.js](../frontend/src/utils/validators.test.js) | `expect(...).toBe / toEqual / toMatchObject` |
| 컴포저블 | [usePagedList.test.js](../frontend/src/composables/usePagedList.test.js) | 가짜 loader 함수, Promise 순서 조작 |
| 스토어 | [comment.test.js](../frontend/src/stores/comment.test.js) | `vi.mock` 으로 API 바꿔치기, `setActivePinia` |
| 컴포넌트 | [BaseButton.test.js](../frontend/src/components/common/BaseButton.test.js), [CalendarPanel.test.js](../frontend/src/components/calendar/CalendarPanel.test.js), [DiaryCard.test.js](../frontend/src/components/diary/DiaryCard.test.js) | `mount`, `props`, `trigger('click')`, `emitted()`, `RouterLinkStub` |

```js
// 스토어 테스트 — 서버 없이 스토어 로직만 확인한다
vi.mock('@/api', () => ({
  comments: { list: vi.fn(), create: vi.fn(), remove: vi.fn() },
}))

it('댓글을 지우면 그 답글도 함께 사라진다', async () => {
  comments.list.mockResolvedValue({ items: [...] })   // "list 를 부르면 이걸 돌려줘"
  const store = useCommentStore()
  await store.fetch('d1')
  await store.remove('d1', '1')
  expect(store.items.map((item) => item.id)).toEqual(['3'])
})
```

```js
// 컴포넌트 테스트 — 실제로 그려 보고 사용자처럼 누른다
const wrapper = mount(CalendarPanel, { props: { modelValue: '2026-08-30' } })
await day('15').trigger('click')
expect(wrapper.emitted('update:modelValue')).toEqual([['2026-08-15']])
```

### 6-4. 무엇을 테스트할까

**우선순위** (위일수록 먼저)

1. **규칙** — 검증, 권한, 날짜 계산. 틀리면 사고가 나는 것
2. **버그가 났던 곳** — 고친 뒤 테스트를 추가하면 다시는 같은 버그가 안 생긴다
3. **복잡한 상태 변화** — 페이지네이션, 늦게 온 응답, 트리 만들기
4. **공통 컴포넌트** — 여러 곳에서 쓰는 Base 컴포넌트

**테스트하지 않아도 되는 것**: CSS 색상, Vue 자체의 동작(`v-if` 가 동작하는지), 단순한 화면 문구

> **실제 사례**: `DiaryCard.test.js` 를 처음 썼을 때 루트 요소가 `ARTICLE` 이 아니라 `DIV` 로 나와 실패했다.
> 원인은 템플릿 맨 위의 **HTML 주석** 때문에 루트가 두 개(fragment)가 된 것이었다.
> 눈으로는 절대 못 찾는 버그를 테스트가 찾았다.

### 6-5. 과제

1. `utils/diary.js` 의 `summarize`, `getMoodLabel` 테스트를 쓴다
2. `stores/diary.js` 의 `remove` 가 목록과 `total` 을 함께 줄이는지 테스트한다 (`vi.mock('@/api')`)
3. `BaseModal` 이 열리면 ESC 로 `cancel` 을 emit 하고, `loading` 중에는 emit 하지 않는지 테스트한다
4. (도전) **Playwright** 로 "로그인 → 글 작성 → 목록에서 확인 → 삭제" 전체 흐름을 실제 브라우저로 테스트한다

---

## 7. TypeScript 입문

### 7-1. 무엇을 얻나

```js
diary.titel        // JavaScript: 실행해야 undefined 인 걸 안다
```

```ts
diary.titel        // TypeScript: 저장하기도 전에 빨간 줄 — "titel 은 Diary 에 없습니다. title 이 아닌가요?"
```

### 7-2. 이 프로젝트의 데이터에 타입 붙이기

[api/index.js](../frontend/src/api/index.js) 맨 위 주석이 사실상 타입 정의다. 이것을 코드로 옮긴다.

```ts
// src/types.ts
export type Category = 'diary' | 'book' | 'emotion'     // 이 셋 중 하나만
export type Visibility = 'public' | 'private'

export interface Author {
  id: string
  nickname: string
}

export interface Diary {
  id: string
  authorId: string
  author: Author
  title: string
  content: string
  category: Category
  mood: string
  dateKey: string                // 'YYYY-MM-DD'
  visibility: Visibility
  images: { url: string; name: string }[]
  likeCount: number
  likedByMe: boolean
  commentCount: number
  createdAt: string
  updatedAt: string
}

export interface Page<T> {       // 제네릭 — "무엇의 목록" 인지를 나중에 정한다
  items: T[]
  nextCursor: string | null
  total: number
}
```

```vue
<script setup lang="ts">
import type { Diary } from '@/types'

const props = defineProps<{ diary: Diary; showAuthor?: boolean }>()
const emit = defineEmits<{ like: [id: string] }>()
</script>
```

### 7-3. 전환 순서 (한 번에 다 바꾸지 않는다)

1. `npm install -D typescript vue-tsc @vue/tsconfig` 후 `tsconfig.json` 생성
2. `utils/*.js` → `.ts` (순수 함수라 가장 쉽다)
3. `types.ts` 작성 → `api/server.ts` 의 반환 타입 지정 (`client.get<Page<Diary>>(...)`)
4. 스토어 → 컴포넌트 순서로 `lang="ts"`
5. `package.json` 에 `"typecheck": "vue-tsc --noEmit"` 추가

**과제**: 새 Vite 프로젝트(`--template vue-ts`)에서 08 의 "프로젝트 사다리 3번" 을 TypeScript 로 만든다.

---

## 8. 보안 — 프론트엔드가 지켜야 할 것

| 위협 | 이 프로젝트의 대응 | 주의할 것 |
| --- | --- | --- |
| **XSS** (악성 스크립트 삽입) | `{{ }}` 는 자동으로 글자로만 출력한다 | **`v-html` 에 사용자 입력을 절대 넣지 않는다.** 꼭 필요하면 DOMPurify 로 소독 |
| **토큰 탈취** | 토큰을 localStorage 에 둔다 (학습용으로 충분) | 실무: HttpOnly 쿠키 + CSRF 토큰, 또는 짧은 액세스 토큰 + 리프레시 토큰 |
| **권한 우회** | 화면에서 막고, **서버에서 다시 막는다** | 화면의 `v-if="isMine"` 은 편의일 뿐 보안이 아니다 |
| **만료된 세션** | 401 → 세션 정리 → 로그인 화면 (`main.js`) | |
| **비밀 노출** | `.env` 의 `VITE_` 값만 화면 코드에 들어간다 | **`VITE_` 로 시작하는 값은 누구나 볼 수 있다.** API 비밀 키를 넣지 않는다 |
| **업로드 악용** | 확장자 + MIME 검사, 서버의 `nosniff` 헤더 | 화면 검사는 우회 가능 — 서버 검사가 진짜 |

```bash
npm audit            # 설치한 라이브러리에 알려진 취약점이 있는지
npm audit fix        # 호환되는 범위에서 고친다 (--force 는 내용을 읽고 나서)
```

---

## 9. 성능

**먼저 측정한다. 추측으로 최적화하지 않는다.**

```bash
npm run build        # dist/ 에 각 파일 크기가 출력된다
```

개발자 도구 → **Lighthouse** 탭 → 분석. 점수와 함께 "무엇이 느린지" 를 알려 준다.

| 증상 | 원인 후보 | 이 프로젝트의 대응 |
| --- | --- | --- |
| 첫 화면이 느림 | JS 파일이 큼 | 라우트별 지연 로딩 (`() => import(...)`) |
| 목록이 길어질수록 느림 | 데이터를 한꺼번에 받음 | 커서 페이지네이션 + "더 보기" |
| 스크롤이 버벅임 | 이미지가 큼 / 한꺼번에 로딩 | `loading="lazy"`, 썸네일 크기 고정 |
| 입력할 때마다 요청 | 디바운스 없음 | 검색은 버튼/엔터로만 요청 |
| 수천 행 표가 느림 | DOM 이 너무 많음 | 가상 스크롤 (`vue-virtual-scroller`) |

---

## 10. 빌드와 배포

### 10-1. 빌드

```bash
cd frontend
npm run build        # dist/ 폴더에 압축된 HTML/CSS/JS 가 생긴다
npm run preview      # 빌드 결과를 내 컴퓨터에서 미리 보기
```

`dist/` 는 그냥 정적 파일이다. **어떤 웹 서버에 올려도 동작한다.**

### 10-2. 배포 구조 — 두 가지 방법

```
방법 A: 따로 배포 (추천 — 각자 알맞은 곳에)
  frontend/dist  →  Netlify, Vercel, Cloudflare Pages  (정적 호스팅, 무료)
  backend        →  Render, Railway, Fly.io, 클라우드 VM  (Node 서버)
  MySQL          →  관리형 DB (PlanetScale 류, 클라우드 DB) 또는 VM 에 설치

방법 B: 한 서버에
  backend 가 frontend/dist 도 같이 서빙한다 (06 Level 5-1 의 ④)
```

### 10-3. 방법 A 에서 꼭 할 것 세 가지

**① API 주소** — 개발 중에는 Vite 프록시가 `/api` 를 4000번으로 넘겼지만, 배포하면 프록시가 없다.

```bash
# frontend/.env.production
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://api.my-diary.example.com/api
```

**② CORS** — 백엔드 `.env` 의 `CLIENT_ORIGIN` 에 프론트 주소를 넣는다.

```bash
CLIENT_ORIGIN=https://my-diary.netlify.app
```

**③ SPA 새로고침 404** — `/diaries/12` 에서 새로고침하면 호스팅 서버는 그런 파일이 없어서 404 를 낸다.
"모든 주소를 `index.html` 로" 보내도록 설정한다.

```
# Netlify: frontend/public/_redirects
/*  /index.html  200
```

```json
// Vercel: frontend/vercel.json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

### 10-4. 백엔드 배포 점검표

- [ ] `NODE_ENV=production`, 긴 랜덤 `JWT_SECRET`
- [ ] DB 는 root 가 아닌 앱 전용 계정
- [ ] `uploads/` 폴더가 서버 재시작/재배포 후에도 남는가? (많은 호스팅은 파일이 지워진다 → S3 같은 객체 저장소로)
- [ ] 프록시 뒤라면 `app.set('trust proxy', 1)` (요청 제한이 실제 IP 를 보게)
- [ ] HTTPS
- [ ] `npm test`, `npm run lint` 통과

### 10-5. CI — 올릴 때마다 자동 검사 (GitHub Actions)

```yaml
# .github/workflows/check.yml
name: check
on: [push, pull_request]
jobs:
  frontend:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: frontend } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check
      - run: npm test
      - run: npm run build
  backend:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: backend } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm run lint
      - run: npm test
```

**과제**: 위 파일을 이 저장소에 추가하고 push 해서 GitHub 의 Actions 탭에 초록 체크가 뜨게 한다.

---

## 11. 생태계 지도 — 무엇을 언제 도입할까

**원칙: 문제가 생기기 전에 도구부터 들이지 않는다.** 아래 표의 "이럴 때" 가 실제로 생기면 그때 도입한다.

| 이럴 때 | 도구 | 비고 |
| --- | --- | --- |
| 버튼·모달·표를 직접 만들 시간이 없다 | UI 라이브러리 (PrimeVue, Vuetify, Element Plus, Naive UI) | 디자인 자유도와 맞바꾼다 |
| 컴포저블을 또 만들고 있다 | VueUse | |
| 캐시·재요청·중복 요청 제거를 직접 짜고 있다 | TanStack Query (Vue Query) | 서버 상태를 Pinia 대신 맡긴다 |
| 폼 검증 규칙이 수십 개 | VeeValidate + Zod | |
| 한국어/영어 두 벌 | vue-i18n | |
| 검색 노출, 첫 화면 속도가 중요 | **Nuxt** (Vue 의 SSR 프레임워크) | 블로그, 쇼핑몰, 마케팅 페이지 |
| 앱처럼 설치하고 오프라인 | vite-plugin-pwa | |
| 휴대폰 앱으로 | Capacitor, Ionic Vue | 같은 Vue 코드로 |
| 실시간 (채팅, 알림) | WebSocket (socket.io), Server-Sent Events | 08 사다리 8번 |
| 컴포넌트 카탈로그, 협업 | Storybook | |
| 그래프 | Chart.js(vue-chartjs), ECharts | 08 사다리 4번 |

### Nuxt 맛보기

Nuxt 는 Vue 위에 **파일 기반 라우팅, 서버 렌더링, API 라우트**를 얹은 프레임워크다.
05 에서 배운 것이 거의 그대로 통하고, 라우터 설정을 손으로 쓰지 않는다.

```
pages/
├─ index.vue           →  /
├─ login.vue           →  /login
└─ diaries/
   ├─ [id].vue         →  /diaries/:id
   └─ new.vue          →  /diaries/new
server/api/
└─ diaries.get.ts      →  GET /api/diaries  (백엔드도 같은 프로젝트에)
```

**과제 (도전)**: 이 다이어리의 "공개 피드" 만 Nuxt 로 만들어, 검색 엔진이 글 내용을 읽을 수 있게 한다.

---

## 체크리스트

- [ ] 컴포저블을 만들고, 반환값을 ref 로 둬야 하는 이유를 설명할 수 있다
- [ ] getter 함수(`() => dirty.value`)를 넘겨야 하는 경우를 안다
- [ ] `nextTick` 이 필요한 상황을 안다
- [ ] `defineModel` 로 v-model 컴포넌트를 만든다
- [ ] `Teleport`, `Transition`, `KeepAlive` 를 상황에 맞게 쓴다
- [ ] props / provide·inject / Pinia 중 무엇을 쓸지 고른다
- [ ] ESLint 경고 0개를 유지한다
- [ ] 순수 함수, 스토어, 컴포넌트 테스트를 각각 하나 이상 쓸 수 있다
- [ ] `interface Diary` 를 쓰고 컴포넌트 props 에 타입을 붙일 수 있다
- [ ] `v-html` 이 위험한 이유와 `VITE_` 환경 변수가 공개된다는 사실을 안다
- [ ] 빌드 결과를 정적 호스팅에 배포하고, 새로고침 404 를 해결한다
- [ ] CI 로 lint / test / build 를 자동 실행한다

다음: [08 어떤 프로젝트든 만드는 법](08-build-any-project.md)
