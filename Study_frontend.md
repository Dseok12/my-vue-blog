# 프론트엔드 교과서 — Vue 3 로 다이어리 앱 만들기

이 문서 하나만 보고 **입문자 수준에서 시작해 이 프로젝트(`frontend/`) 수준, 그리고 그 이상까지** 도달하는 것을 목표로 한다.
읽기만 하는 문서가 아니라 **여러 번 반복해서 만들어 보는 훈련 교재**다.

---

## 0. 이 문서 사용법

### 0-1. 3회독 반복 학습법

같은 내용을 세 번 다르게 반복한다. 이 방법이 이 문서의 핵심이다.

| 회독 | 방식 | 목표 | 걸리는 시간 |
| --- | --- | --- | --- |
| **1회독 — 따라 만들기** | 문서의 코드를 보면서 그대로 입력한다. 이해가 안 가도 일단 동작시킨다. | "어디에 무엇이 있는지" 지도를 그린다 | 레벨당 1~3일 |
| **2회독 — 백지 재현** | 문서를 **덮고** 각 레벨 끝의 `백지 재현 과제`를 혼자 만든다. 막히면 그 부분만 열어 본다. | "왜 그렇게 쓰는지" 이해한다 | 레벨당 1~2일 |
| **3회독 — 변형·확장** | 각 레벨 끝의 `확장 과제`를 푼다. 요구사항을 바꿔서 다시 만든다. | "다른 상황에도 적용" 할 수 있게 된다 | 레벨당 1일 |

> **중요:** 2회독에서 막히는 지점이 곧 당신이 아직 모르는 부분이다.
> 막힌 곳을 메모해 두고, 그 부분만 1회독을 다시 한다.

### 0-2. 진도표

직접 체크하면서 진행한다.

```
Level 1  Vue 기초           [ ]1회독  [ ]2회독  [ ]3회독
Level 2  컴포넌트와 CSS     [ ]1회독  [ ]2회독  [ ]3회독
Level 3  라우터와 상태관리  [ ]1회독  [ ]2회독  [ ]3회독
Level 4  서버 통신과 인증   [ ]1회독  [ ]2회독  [ ]3회독
Level 5  품질과 최적화      [ ]1회독  [ ]2회독  [ ]3회독
최종 관문  백지에서 앱 전체 만들기            [ ]
```

### 0-3. 시작 전 필요한 것

- Node.js 18 이상 (`node -v` 로 확인)
- 코드 편집기 (VS Code + Vue 공식 확장 `Vue - Official`)
- 브라우저 개발자 도구 사용법 (F12 → Console, Network, Elements 탭)
- 선행 지식: HTML 태그, CSS 선택자, JavaScript 변수/함수/배열/객체

선행 지식이 부족하면 Level 0 부터 시작한다.

---

## Level 0 — 출발선 점검 (입문 이전)

Vue 를 배우기 전에 이만큼은 알아야 한다. 아래 코드를 **보고 무슨 일이 일어나는지 설명할 수 있으면** Level 1 로 넘어간다.

```js
// 1) 배열 메서드 — Vue 에서 가장 많이 쓴다
const items = [
  { id: 1, title: '오늘의 기록', visibility: 'private' },
  { id: 2, title: '독서기록', visibility: 'public' },
]

items.filter((item) => item.visibility === 'public') // 조건에 맞는 것만 골라 새 배열
items.map((item) => item.title)                      // 각 요소를 변환해 새 배열
items.find((item) => item.id === 2)                  // 조건에 맞는 첫 요소 (없으면 undefined)
items.some((item) => item.id === 3)                  // 하나라도 있으면 true
items.reduce((sum, item) => sum + 1, 0)              // 하나의 값으로 누적

// 2) 구조 분해와 펼침 — props 와 스토어에서 계속 등장한다
const { title, visibility } = items[0]     // 객체에서 꺼내기
const [first, second] = items              // 배열에서 꺼내기
const copy = { ...items[0], title: '수정' } // 복사하면서 일부만 바꾸기
const merged = [...items, { id: 3 }]       // 배열 합치기

// 3) 옵셔널 체이닝과 기본값 — undefined 오류를 막는다
const nickname = user?.profile?.nickname ?? '이름 없음'

// 4) 비동기 — API 호출의 기본형
async function load() {
  try {
    const result = await fetchSomething()  // 끝날 때까지 기다림
    return result
  } catch (error) {
    console.error(error)                   // 실패하면 여기로
  } finally {
    console.log('성공하든 실패하든 실행')
  }
}

// 5) 모듈 — 파일을 나누는 방법
export const A = 1          // 이름 있는 내보내기
export default function () {} // 기본 내보내기
import defaultThing, { A } from './file.js'
```

**Level 0 체크리스트**

- [ ] `filter` 와 `map` 의 차이를 설명할 수 있다
- [ ] `const copy = original` 과 `const copy = { ...original }` 의 차이를 안다
- [ ] `async/await` 가 `.then()` 과 같은 일을 한다는 것을 안다
- [ ] `??` 와 `||` 의 차이를 안다 (`0 ?? 5` 는 `0`, `0 || 5` 는 `5`)

---

## Level 1 — Vue 기초 (입문)

### 목표

Vue 가 "데이터가 바뀌면 화면이 저절로 바뀌는" 도구라는 것을 몸으로 이해한다.

### 1-1. 프로젝트 만들기

```bash
npm create vite@latest my-app -- --template vue
cd my-app
npm install
npm run dev
```

이 프로젝트의 설정은 [frontend/vite.config.js](frontend/vite.config.js) 에 있다.

```js
export default defineConfig({
  plugins: [vue()],
  resolve: {
    // '@' 를 src 폴더의 별명으로 쓴다. '../../..' 지옥을 피하는 방법이다.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 3000,
    proxy: {
      // 개발 중 '/api' 로 시작하는 요청을 백엔드(4000번)로 넘긴다.
      // 브라우저 입장에서는 같은 주소이므로 CORS 문제가 생기지 않는다.
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
})
```

> **왜 프록시를 쓰나?** 브라우저는 보안 때문에 `localhost:3000` 페이지가 `localhost:4000` 을
> 직접 부르는 것을 막는다(CORS). 프록시를 두면 브라우저는 `localhost:3000/api` 를 부르고,
> Vite 가 대신 백엔드로 전달한다. 브라우저는 다른 서버가 있다는 사실 자체를 모른다.

### 1-2. 단일 파일 컴포넌트(SFC)

`.vue` 파일 하나가 곧 하나의 부품이다. 세 부분으로 되어 있다.

```vue
<script setup>
// 1) 로직 — 이 컴포넌트가 쓸 데이터와 함수
import { ref } from 'vue'
const count = ref(0)
function increase() {
  count.value += 1
}
</script>

<template>
  <!-- 2) 화면 — 어떻게 보일지 -->
  <button @click="increase">{{ count }}번 눌렀습니다</button>
</template>

<style scoped>
/* 3) 스타일 — 이 프로젝트에서는 이 부분을 쓰지 않고 별도 CSS 파일로 뺀다 */
</style>
```

> **이 프로젝트의 규칙:** `<style>` 블록을 쓰지 않는다. CSS 는 `src/css/` 아래 별도 파일로 만들고
> `import '@/css/components/BaseButton.css'` 처럼 불러온다. 이유는 Level 2 에서 설명한다.

### 1-3. 반응성 — `ref` 와 `reactive`

Vue 의 심장이다. **값이 바뀌면 그 값을 쓰는 화면이 자동으로 다시 그려진다.**

```js
import { ref, reactive, computed, watch } from 'vue'

// ref — 하나의 값을 담는다. 어떤 타입이든 가능.
const count = ref(0)
const name = ref('')
const user = ref(null)

count.value += 1        // script 안에서는 .value 를 붙인다
// template 안에서는 {{ count }} 처럼 .value 없이 쓴다

// reactive — 객체 전용. .value 가 없다.
const form = reactive({ email: '', password: '' })
form.email = 'a@b.com'  // .value 없이 바로 접근

// computed — 다른 값에서 "계산되어 나오는" 값. 재료가 바뀌면 자동으로 다시 계산된다.
const isEmpty = computed(() => count.value === 0)

// watch — 값이 바뀌는 "순간에 무언가를 실행"한다.
watch(count, (newValue, oldValue) => {
  console.log(oldValue + ' -> ' + newValue)
})
```

**`ref` 와 `reactive` 중 무엇을 쓸까?**

| 상황 | 선택 | 이 프로젝트의 예 |
| --- | --- | --- |
| 값 하나 (숫자, 문자, 불리언, 배열, 객체) | `ref` | `const loading = ref(false)` |
| 폼처럼 여러 필드를 한 덩어리로 | `reactive` | `const form = reactive({ email: '', password: '' })` |
| 통째로 교체해야 할 때 | `ref` (필수) | `items.value = 새배열` |

> **자주 하는 실수:** `reactive` 로 만든 것을 통째로 바꾸면 반응성이 끊긴다.
> ```js
> const list = reactive([])
> list = newArray        // 오류 (const)
> list.value = newArray  // 동작 안 함
> // 해결 1: list.splice(0, list.length, ...newArray)
> // 해결 2: 애초에 ref 를 쓴다 → const list = ref([]); list.value = newArray
> ```

**`computed` 와 `watch` 중 무엇을 쓸까?**

- **값을 만들어 내면** → `computed` (예: 목록 개수, 필터 적용 여부)
- **부수 효과를 일으키면** → `watch` (예: API 호출, 라우터 이동, localStorage 저장)

[frontend/src/stores/diary.js](frontend/src/stores/diary.js) 의 실제 예:

```js
// computed — 필터가 하나라도 걸려 있는지 "계산"
const hasFilter = computed(() =>
  Boolean(filters.dateKey || filters.category || filters.visibility || filters.keyword),
)
```

[frontend/src/views/DiaryListView.vue](frontend/src/views/DiaryListView.vue) 의 실제 예:

```js
// watch — 주소의 날짜가 바뀌면 목록을 "다시 불러온다"(부수 효과)
watch(
  selectedDate,
  (value) => {
    diaryStore.applyFilter({ dateKey: value })
    diaryStore.fetchMine()
  },
  { immediate: true }, // 처음 한 번도 실행한다
)
```

### 1-4. 템플릿 문법

이 6가지가 전부다.

```vue
<template>
  <!-- 1) 보간 — 값을 글자로 출력 -->
  <p>{{ diary.title }}</p>
  <p>{{ items.length }}개</p>

  <!-- 2) v-bind (:) — 속성에 값 넣기 -->
  <img :src="image.url" :alt="image.name" />
  <button :disabled="loading">저장</button>
  <div :class="{ 'card--active': isSelected }"></div>
  <div :class="[`btn--${variant}`, `btn--${size}`]"></div>

  <!-- 3) v-on (@) — 이벤트 듣기 -->
  <button @click="save">저장</button>
  <form @submit.prevent="onSubmit">   <!-- .prevent = 새로고침 막기 -->
  <button @click.stop="onLike">      <!-- .stop = 부모로 전파 막기 -->

  <!-- 4) v-if / v-else — 조건에 따라 그리거나 안 그린다 -->
  <LoadingBlock v-if="loading" />
  <EmptyState v-else-if="!items.length" />
  <ul v-else>...</ul>

  <!-- 5) v-for — 목록 반복. :key 는 반드시 넣는다 -->
  <li v-for="diary in items" :key="diary.id">
    {{ diary.title }}
  </li>

  <!-- 6) v-model — 양방향 묶기 (입력창 전용) -->
  <input v-model="form.email" />
</template>
```

> **`:key` 를 왜 반드시 넣나?** Vue 는 목록이 바뀔 때 `key` 로 "같은 항목"을 식별한다.
> `key` 가 없거나 배열 인덱스를 쓰면, 중간 항목을 지웠을 때 엉뚱한 요소가 남거나
> 입력 중이던 값이 다른 줄로 옮겨 가는 버그가 생긴다. **항상 고유한 id 를 쓴다.**

> **`v-if` 와 `v-show` 의 차이:** `v-if` 는 DOM 에서 아예 제거하고, `v-show` 는 `display:none` 으로 숨긴다.
> 자주 켜고 끄면 `v-show`, 조건이 거의 안 바뀌면 `v-if`.

### 1-5. 생명주기

```js
import { onMounted, onBeforeUnmount } from 'vue'

onMounted(() => {
  // 화면에 그려진 직후. DOM 접근, 초기 데이터 로딩, 이벤트 등록.
})

onBeforeUnmount(() => {
  // 사라지기 직전. 등록한 이벤트/타이머를 반드시 정리한다.
})
```

[frontend/src/components/layout/AppSidebar.vue](frontend/src/components/layout/AppSidebar.vue) 의 실제 예 —
**등록했으면 반드시 해제한다**는 원칙을 보여 준다.

```js
let mediaQuery = null

function onMediaChange(event) {
  isNarrow.value = event.matches
}

onMounted(() => {
  mediaQuery = window.matchMedia('(max-width: 1023px)')
  isNarrow.value = mediaQuery.matches
  mediaQuery.addEventListener('change', onMediaChange)
})

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', onMediaChange) // 정리하지 않으면 메모리 누수
})
```

### 1-6. 자주 하는 실수

| 실수 | 증상 | 해결 |
| --- | --- | --- |
| `script` 안에서 `.value` 안 붙임 | 값이 안 바뀌거나 `[object Object]` 출력 | `count.value` |
| `template` 에서 `.value` 붙임 | `undefined` 출력 | `{{ count }}` |
| `v-for` 에 `:key` 없음 | 목록 수정 시 이상한 동작 | `:key="item.id"` |
| `@submit` 에 `.prevent` 없음 | 폼 제출 시 페이지 새로고침 | `@submit.prevent` |
| `reactive` 통째 교체 | 화면이 안 바뀜 | `ref` 로 바꾸고 `.value =` |

### 백지 재현 과제 (2회독)

문서를 덮고 다음을 만든다.

1. **카운터** — 숫자, 증가/감소 버튼, "0일 때 감소 버튼 비활성화"(`computed`), "10이 되면 콘솔에 메시지"(`watch`)
2. **할 일 목록** — 입력창(`v-model`), 추가 버튼, 목록 출력(`v-for` + `:key`), 각 항목 삭제, "할 일이 없습니다" 빈 화면(`v-if`)
3. **완료 토글** — 각 항목에 체크박스, 완료된 항목은 취소선(`:class`), 하단에 "3개 중 1개 완료"(`computed`)

### 확장 과제 (3회독)

1. 할 일 목록을 `localStorage` 에 저장해 새로고침해도 남아 있게 한다 (`watch` + `JSON.stringify`)
2. "전체 / 진행 중 / 완료" 필터 버튼을 추가한다 (`computed` 로 걸러낸 목록을 `v-for` 에 넣는다)
3. 항목을 두 번 클릭하면 수정 모드로 바뀌게 한다 (`v-if` 로 `<span>` 과 `<input>` 을 전환)

### Level 1 체크리스트

- [ ] `ref` 와 `reactive` 를 언제 쓰는지 설명할 수 있다
- [ ] `computed` 와 `watch` 를 구분해서 쓸 수 있다
- [ ] `v-if`, `v-for`, `v-bind`, `v-on`, `v-model` 을 보지 않고 쓸 수 있다
- [ ] `:key` 가 왜 필요한지 설명할 수 있다
- [ ] `onMounted` 에서 등록한 것을 `onBeforeUnmount` 에서 정리하는 이유를 안다

---

## Level 2 — 컴포넌트 설계와 CSS (초급)

### 목표

같은 코드를 두 번 쓰지 않는 구조를 만든다. 이 프로젝트에 컴포넌트가 20개 있는 이유를 이해한다.

### 2-1. props — 부모가 자식에게 값을 준다

```vue
<!-- 자식: BaseButton.vue -->
<script setup>
defineProps({
  variant: { type: String, default: 'primary' },  // primary | outline | ghost | danger
  size: { type: String, default: 'md' },          // sm | md | lg
  block: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})
</script>

<template>
  <button
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`, { 'btn--block': block }]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true"></span>
    <slot />
  </button>
</template>
```

```vue
<!-- 부모 -->
<BaseButton variant="danger" size="sm" :loading="removing">삭제</BaseButton>
```

**props 규칙**

- `type` 과 `default` 를 항상 적는다. 문서 역할을 하고, 잘못된 값이 들어오면 콘솔에 경고가 뜬다.
- **props 는 읽기 전용이다.** 자식이 직접 바꾸면 안 된다. 바꿔야 하면 `emit` 으로 부모에게 알린다.
- 문자열 값이 정해져 있으면 주석으로 목록을 남긴다 (`/** primary | outline | ghost | danger */`).

### 2-2. emit — 자식이 부모에게 알린다

```vue
<!-- 자식 -->
<script setup>
const emit = defineEmits(['submit', 'cancel'])

function onSubmit() {
  emit('submit', { title: form.title, content: form.content })
}
</script>
```

```vue
<!-- 부모 -->
<DiaryForm @submit="save" @cancel="router.back()" />
```

**데이터는 아래로(props), 이벤트는 위로(emit).** 이것이 컴포넌트 통신의 기본 원칙이다.

### 2-3. 커스텀 v-model

`v-model` 은 마법이 아니라 **`modelValue` prop + `update:modelValue` emit** 의 줄임말이다.

```vue
<!-- BaseInput.vue -->
<script setup>
import { useId } from 'vue'

defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  error: { type: String, default: '' },
})
defineEmits(['update:modelValue'])

const inputId = useId()  // 라벨과 입력창을 연결할 고유 id 를 Vue 가 만들어 준다
</script>

<template>
  <div class="field" :class="{ 'field--error': error }">
    <label v-if="label" class="field__label" :for="inputId">{{ label }}</label>
    <input
      :id="inputId"
      class="field__control"
      :value="modelValue"
      :aria-invalid="Boolean(error)"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <p v-if="error" class="field__message">{{ error }}</p>
  </div>
</template>
```

이렇게 만들면 부모에서 이렇게 쓸 수 있다.

```vue
<BaseInput v-model="form.email" label="이메일" :error="errors.email" required />
```

> `v-model="form.email"` 은 `:model-value="form.email"` + `@update:model-value="form.email = $event"` 와 같다.

**응용 — `computed` 의 get/set 으로 v-model 만들기**

[frontend/src/components/layout/AppSidebar.vue](frontend/src/components/layout/AppSidebar.vue) 에서는
**주소창의 쿼리 파라미터**를 `v-model` 로 다룬다. 고급 기법이다.

```js
const selectedDate = computed({
  get: () => String(route.query.date || ''),      // 읽을 때: 주소에서 가져온다
  set: (value) => {                                // 쓸 때: 주소를 바꾼다
    router.push({ name: 'diary-list', query: value ? { date: value } : {} })
    if (isNarrow.value) uiStore.setSidebar(false)
  },
})
```

```vue
<CalendarPanel v-model="selectedDate" :counts="monthlyCounts" />
```

캘린더에서 날짜를 고르면 → `set` 이 실행되어 → 주소가 바뀌고 → 목록 화면의 `watch` 가 감지해 → 목록을 다시 불러온다.
**상태를 주소에 두었기 때문에 새로고침해도, 링크를 공유해도 같은 화면이 나온다.**

### 2-4. slot — 자식 안에 부모의 내용을 끼워 넣는다

```vue
<!-- EmptyState.vue -->
<template>
  <div class="empty">
    <p class="empty__icon">{{ icon }}</p>
    <p class="empty__title">{{ title }}</p>
    <p class="empty__description">{{ description }}</p>
    <div class="empty__action">
      <slot name="action" />   <!-- 이름 있는 슬롯 -->
    </div>
  </div>
</template>
```

```vue
<EmptyState icon="🕊️" title="아직 기록이 없습니다." description="...">
  <template #action>
    <BaseButton @click="router.push({ name: 'diary-create' })">첫 기록 남기기</BaseButton>
  </template>
</EmptyState>
```

**props 와 slot 중 무엇을 쓸까?**
- 문자열/숫자/불리언 같은 **값** → props
- 버튼, 아이콘, 마크업 같은 **화면 조각** → slot

### 2-5. 컴포넌트 나누는 기준

이 프로젝트의 폴더 구조가 곧 기준이다.

```
components/
├─ common/     프로젝트와 무관하게 재사용 — BaseButton, BaseInput, BaseModal, AppToast
├─ layout/     화면 뼈대 — AppHeader, AppSidebar
├─ diary/      다이어리 도메인 — DiaryCard, DiaryForm, LikeButton, ImageUploader
├─ comment/    댓글 도메인 — CommentSection, CommentItem, CommentForm
└─ calendar/   캘린더 — CalendarPanel
```

**나눠야 할 신호**

1. 같은 마크업이 **두 번째로** 등장할 때
2. 한 파일이 **150줄**을 넘을 때
3. 한 컴포넌트가 **두 가지 일**을 할 때 (예: 목록을 불러오면서 폼도 그린다)
4. 이름을 붙일 수 있을 때 ("이 부분은 좋아요 버튼이다")

**나누지 말아야 할 때**

- 한 곳에서만 쓰고, 짧고, 이름 붙이기 애매한 것 → 그냥 두는 게 낫다. 과도한 분리는 읽기를 어렵게 한다.

### 2-6. CSS 설계

이 프로젝트는 `<style scoped>` 를 쓰지 않고 **CSS 파일을 분리**한다.

```
css/
├─ base/        전역 — variables.css, reset.css, typography.css, form.css, utilities.css
├─ components/  컴포넌트와 1:1 — BaseButton.css, DiaryCard.css, ...
├─ layouts/     레이아웃 — AppHeader.css, AppSidebar.css, DefaultLayout.css
└─ views/       페이지 — DiaryListView.css, LoginView.css, ...
```

`base/` 만 [frontend/src/main.js](frontend/src/main.js) 에서 한 번 불러오고, 나머지는 각 컴포넌트가 직접 불러온다.

```js
// main.js — 전역 스타일만
import '@/css/base/variables.css'
import '@/css/base/reset.css'
import '@/css/base/typography.css'
import '@/css/base/form.css'
import '@/css/base/utilities.css'
```

```js
// BaseButton.vue — 자기 스타일만
import '@/css/components/BaseButton.css'
```

> **왜 이렇게 하나?** ① 파일 이름만 보고 어디를 고칠지 바로 안다 ② 디자이너나 다른 사람이
> `.vue` 를 안 열고 CSS 만 고칠 수 있다 ③ 컴포넌트를 지우면 CSS 파일도 같이 지우면 된다.

**① 디자인 토큰 — 모든 값의 단일 출처**

[frontend/src/css/base/variables.css](frontend/src/css/base/variables.css)

```css
:root {
  /* 색상 */
  --color-bg: #f7f6f3;
  --color-surface: #ffffff;
  --color-text: #23211e;
  --color-text-sub: #5f5a53;
  --color-primary: #3f6f5f;
  --color-danger: #b4483c;
  --color-border: #e4e1db;

  /* 간격 — 4px 배수로만 쓴다 */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-5: 20px; --space-6: 24px;

  /* 모서리 / 그림자 / 글자 크기 / 레이아웃 / 전환 / z-index */
  --radius-md: 10px;
  --shadow-sm: 0 1px 2px rgba(35, 33, 30, 0.06);
  --font-size-md: 15px;
  --header-height: 60px;
  --transition-fast: 0.15s ease;
  --z-modal: 50;
}
```

**규칙: CSS 안에 숫자와 색상 코드를 직접 쓰지 않는다.** 항상 변수를 쓴다.
그래야 나중에 "간격을 전체적으로 넓히자", "포인트 색을 바꾸자" 를 **한 줄 수정**으로 끝낼 수 있다.

**② BEM 이름 규칙**

```
.블록 { }              /* .card       — 독립적인 덩어리 */
.블록__요소 { }        /* .card__title — 블록 안의 부품 */
.블록--변형 { }        /* .card--wide  — 블록의 다른 모습 */
```

이 프로젝트 규칙: **되도록 4단어 이하**, 파일 이름과 블록 이름을 맞춘다.

```css
/* DiaryCard.css → 블록 이름은 .card */
.card { }
.card__title { }
.card__excerpt { }
.card__thumb { }
.card__foot { }
.card__spacer { }
```

> **BEM 을 쓰는 이유:** CSS 는 전역이라 `.title` 같은 이름은 반드시 충돌한다.
> `.card__title` 이면 충돌하지 않고, 클래스 이름만 봐도 어느 컴포넌트인지 안다.

**③ 모바일 반응형**

이 프로젝트는 **모바일 반응형 웹**이 요구사항이다. 두 가지만 지킨다.

```css
/* 1) 기본은 모바일, 넓어지면 덧붙인다 (모바일 퍼스트) */
.card { padding: var(--space-4); }

@media (min-width: 768px) {
  .card { padding: var(--space-5); }
}

/* 2) 또는 데스크톱 기준으로 쓰고 좁을 때 줄인다 (이 프로젝트 방식) */
.card { padding: var(--space-5); }

@media (max-width: 600px) {
  .card { padding: var(--space-4); }
  .card__thumb { width: 60px; height: 60px; }
}
```

이 프로젝트가 쓰는 분기점: `600px`(모바일), `1023px`(태블릿 — 사이드바가 덮개로 바뀜).

**④ 레이아웃은 flex 와 grid 로**

```css
/* 가로로 늘어놓고 사이를 벌린다 */
.card__foot {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.card__spacer { flex: 1 1 auto; }  /* 남는 공간을 다 먹어서 뒤 요소를 오른쪽 끝으로 민다 */

/* 캘린더처럼 격자 */
.calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-1);
}
```

### 백지 재현 과제 (2회독)

1. **BaseButton** — `variant`(primary/outline/danger), `size`(sm/md/lg), `block`, `loading`, `disabled` 를 받는 버튼. 로딩 중이면 스피너를 보여 주고 클릭을 막는다. CSS 는 별도 파일 + BEM + 디자인 토큰.
2. **BaseInput** — `label`, `error`, `required` 를 받고 `v-model` 이 되는 입력창. 오류가 있으면 빨간 테두리와 메시지.
3. **BaseModal** — `open`, `title`, `message`, `confirmText` 를 받고 `@confirm`, `@cancel` 을 emit. 배경을 누르면 닫힌다.
4. 위 3개로 "삭제하시겠습니까?" 확인 흐름을 만든다.

### 확장 과제 (3회독)

1. `BaseSelect` 를 만들어 `DiaryFilterBar` 처럼 옵션 배열(`[{ value, label }]`)을 받게 한다
2. 디자인 토큰만 바꿔서 **다크 테마**를 만든다 (`:root` 와 `[data-theme="dark"]` 두 벌 정의)
3. `BaseButton` 에 `icon` 슬롯을 추가하고, 아이콘만 있는 원형 버튼 변형을 만든다

### Level 2 체크리스트

- [ ] props / emit / slot 을 상황에 맞게 고를 수 있다
- [ ] 커스텀 `v-model` 을 `modelValue` + `update:modelValue` 로 직접 만들 수 있다
- [ ] BEM 으로 클래스 이름을 지을 수 있다
- [ ] CSS 에 숫자를 직접 쓰지 않고 디자인 토큰을 쓴다
- [ ] 컴포넌트를 나눠야 할 때와 나누지 말아야 할 때를 구분한다

---

## Level 3 — 라우터와 상태 관리 (중급)

### 목표

여러 화면을 오가고, 화면 간에 데이터를 공유하는 구조를 만든다.

### 3-1. Vue Router — 화면 전환

[frontend/src/router/index.js](frontend/src/router/index.js)

```js
const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),  // 지연 로딩
    meta: { guestOnly: true, layout: 'auth', title: '로그인' },
  },
  {
    path: '/',
    name: 'diary-list',
    component: () => import('@/views/DiaryListView.vue'),
    meta: { requiresAuth: true, title: '내 다이어리' },
  },
  {
    path: '/diaries/:id',        // 동적 세그먼트
    name: 'diary-detail',
    component: () => import('@/views/DiaryDetailView.vue'),
    meta: { requiresAuth: true, title: '다이어리' },
  },
  {
    path: '/:pathMatch(.*)*',    // 나머지 전부 → 404
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { layout: 'auth', title: '페이지를 찾을 수 없음' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),  // 화면을 옮기면 맨 위로
})
```

**꼭 알아야 할 4가지**

```js
// 1) 지연 로딩 — () => import(...) 로 쓰면 그 화면에 처음 갈 때 다운로드된다.
//    첫 화면 로딩이 빨라진다. (빌드 결과가 파일 여러 개로 쪼개진다)

// 2) name 으로 이동 — path 문자열을 직접 쓰지 않는다. 주소가 바뀌어도 코드를 안 고쳐도 된다.
router.push({ name: 'diary-detail', params: { id: diary.id } })
router.push({ name: 'diary-list', query: { date: '2026-08-30' } })

// 3) 현재 정보 읽기
const route = useRoute()
route.params.id     // '/diaries/:id' 의 id — 항상 문자열이다
route.query.date    // '?date=...' 의 값
route.meta.title    // 라우트에 붙여 둔 부가 정보

// 4) meta — 라우트에 붙이는 메모. 가드와 레이아웃 선택에 쓴다.
```

> **`params.id` 는 항상 문자열이다.** 그래서 이 프로젝트의 백엔드는 id 를 **문자열로** 응답한다.
> 숫자로 응답하면 `diary.id === route.params.id` 가 `1 === '1'` 이 되어 항상 `false` 다.
> 확실하게 하려면 `String(route.params.id)` 로 감싼다.

**네비게이션 가드 — 로그인 검사**

```js
router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  await authStore.restore()   // 새로고침 후 토큰으로 로그인 상태 복구

  // 비회원의 첫 랜딩 페이지는 로그인 화면이다.
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }  // 원래 가려던 곳 기억
  }
  // 로그인한 사람이 로그인 화면에 가면 목록으로 보낸다
  if (to.meta.guestOnly && authStore.isLoggedIn) {
    return { name: 'diary-list' }
  }
  return true   // 통과
})

router.afterEach((to) => {
  document.title = to.meta.title ? to.meta.title + ' · ' + APP_TITLE : APP_TITLE
})
```

가드의 반환값: `true` = 통과, `false` = 취소, `{ name: '...' }` = 다른 곳으로 보냄.

**레이아웃 전환**

[frontend/src/App.vue](frontend/src/App.vue) 에서 `meta.layout` 으로 껍데기를 바꾼다.

```vue
<script setup>
const route = useRoute()
const layouts = { default: DefaultLayout, auth: AuthLayout }
const layout = computed(() => layouts[route.meta.layout] || DefaultLayout)
</script>

<template>
  <component :is="layout">          <!-- 동적 컴포넌트 -->
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </component>
  <AppToast />
</template>
```

로그인/회원가입/404 는 가운데 카드 하나만 있는 `AuthLayout`,
나머지는 헤더 + 사이드바가 있는 `DefaultLayout` 을 쓴다.

### 3-2. Pinia — 화면 간 상태 공유

**언제 스토어를 쓰나?**

| 상태 | 두는 곳 |
| --- | --- |
| 이 컴포넌트만 쓰는 값 (폼 입력값, 열림/닫힘) | 컴포넌트 안 `ref` |
| 여러 화면이 공유하는 값 (로그인 사용자, 목록, 필터) | Pinia 스토어 |
| 화면 주소로 표현되는 값 (선택한 날짜, 검색어) | 라우터 query |

이 프로젝트의 스토어 4개:

| 스토어 | 담는 것 |
| --- | --- |
| `auth` | 로그인한 사용자, 토큰, 로그인/가입/로그아웃 |
| `diary` | 내 목록, 피드, 상세, 필터, 월별 개수 |
| `comment` | 댓글 목록, 트리 구조 |
| `ui` | 사이드바 열림 여부, 토스트 메시지 |

**setup store 형태** — 컴포넌트의 `<script setup>` 과 똑같이 쓴다.

[frontend/src/stores/auth.js](frontend/src/stores/auth.js)

```js
export const useAuthStore = defineStore('auth', () => {
  // state — ref
  const user = ref(null)
  const token = ref(localStorage.getItem(STORAGE_KEYS.token) || '')
  const loading = ref(false)
  const error = ref('')
  const restored = ref(false)

  // getters — computed
  const isLoggedIn = computed(() => Boolean(user.value))
  const nickname = computed(() => user.value?.nickname || '')

  // actions — function
  function saveSession(payload) {
    user.value = payload.user
    token.value = payload.token
    localStorage.setItem(STORAGE_KEYS.token, payload.token)
  }

  function clearSession() {
    user.value = null
    token.value = ''
    localStorage.removeItem(STORAGE_KEYS.token)
  }

  /** 새로고침 후 토큰으로 로그인 상태를 복구한다. */
  async function restore() {
    if (restored.value) return isLoggedIn.value  // 한 번만 실행
    restored.value = true
    if (!token.value) return false

    try {
      const { user: me } = await authApi.me()
      user.value = me
      return true
    } catch {
      clearSession()   // 토큰이 만료됐으면 지운다
      return false
    }
  }

  async function login(form) {
    loading.value = true
    error.value = ''
    try {
      saveSession(await authApi.login(form))
      restored.value = true
      return true
    } catch (err) {
      error.value = err.message   // 화면은 이 값을 보고 오류를 표시한다
      return false
    } finally {
      loading.value = false
    }
  }

  return { user, token, loading, error, isLoggedIn, nickname, restore, login, ... }
})
```

**`loading` / `error` 패턴을 기억한다.** 모든 비동기 스토어가 이 세 가지를 갖는다:
데이터, `loading`(로딩 중 표시), `error`(오류 메시지). 화면은 이 값만 보고 그린다.

**스토어 쓰기 — `storeToRefs` 를 잊지 않는다**

```js
const diaryStore = useDiaryStore()

// 상태는 storeToRefs 로 꺼낸다 (반응성 유지)
const { items, filters, loading, error } = storeToRefs(diaryStore)

// 함수는 그냥 꺼내도 된다
const { fetchMine, applyFilter } = diaryStore
// 또는 diaryStore.fetchMine() 처럼 그대로 쓴다
```

> **가장 흔한 Pinia 실수:** `const { items } = diaryStore` — 이렇게 하면 **반응성이 끊겨서**
> 스토어가 바뀌어도 화면이 안 바뀐다. 상태는 반드시 `storeToRefs` 로 꺼낸다.

**중복 코드를 함수로 묶기** — [frontend/src/stores/diary.js](frontend/src/stores/diary.js)

```js
// 모든 비동기 작업이 loading/error 처리를 반복하므로 하나로 묶는다
async function run(task) {
  loading.value = true
  error.value = ''
  try {
    return await task()
  } catch (err) {
    error.value = err.message
    throw err            // 화면에서도 잡을 수 있게 다시 던진다
  } finally {
    loading.value = false
  }
}

async function fetchMine() {
  return run(async () => {
    const { items: list } = await diaryApi.listMine({ ...filters })
    items.value = list
    return list
  })
}
```

**여러 목록의 정합성 맞추기 — 낙관적 동기화**

같은 글이 "내 목록", "피드", "상세"에 동시에 떠 있을 수 있다. 좋아요를 누르면 셋 다 바뀌어야 한다.

```js
/** 목록/상세에 있는 같은 글의 좋아요·댓글 수를 함께 맞춘다. */
function syncDiary(id, patch) {
  const update = (list) => {
    const target = list.find((item) => item.id === id)
    if (target) Object.assign(target, patch)
  }
  update(items.value)
  update(feedItems.value)
  if (current.value?.id === id) Object.assign(current.value, patch)
}

async function toggleLike(id) {
  const { liked, likeCount } = await diaryApi.toggleLike(id)
  syncDiary(id, { likedByMe: liked, likeCount })   // 전체 목록을 다시 안 불러도 된다
  return liked
}
```

**파생 데이터는 computed 로** — [frontend/src/stores/comment.js](frontend/src/stores/comment.js)

서버는 댓글을 **평평한 배열**로 준다. 화면에는 **트리**로 그려야 한다.
저장은 평평하게, 표시는 계산으로.

```js
const items = ref([])   // [{ id, parentId, content, ... }]

/** 부모 댓글 아래에 대댓글을 붙인 트리 구조 */
const tree = computed(() => {
  const roots = items.value.filter((comment) => !comment.parentId)
  return roots.map((root) => ({
    ...root,
    replies: items.value.filter((comment) => comment.parentId === root.id),
  }))
})
```

> **원칙: 같은 데이터를 두 벌 저장하지 않는다.** 하나만 저장하고 나머지는 `computed` 로 만든다.
> 두 벌 저장하면 반드시 어긋난다.

### 백지 재현 과제 (2회독)

1. 라우터에 4개 화면(목록 `/`, 상세 `/items/:id`, 작성 `/items/new`, 404)을 만들고 `name` 으로만 이동한다
2. `meta.requiresAuth` 와 `beforeEach` 가드로 로그인 안 한 사람을 `/login` 으로 보낸다 (`query.redirect` 로 원래 목적지 기억)
3. Pinia 스토어를 만들어 목록/로딩/오류를 담고, 화면에서 `storeToRefs` 로 꺼내 쓴다
4. `meta.layout` 으로 로그인 화면과 나머지 화면의 껍데기를 다르게 한다

### 확장 과제 (3회독)

1. 검색어를 라우터 `query` 에 넣어 새로고침해도 유지되게 한다
2. 상세 화면에서 뒤로 갔다가 다시 들어와도 스크롤 위치가 유지되도록 `scrollBehavior` 를 개선한다
3. 스토어에 "이미 불러온 목록은 5분간 다시 안 부르기" 캐시를 넣는다

### Level 3 체크리스트

- [ ] `path` 대신 `name` 으로 이동하는 이유를 안다
- [ ] `beforeEach` 가드로 접근 제어를 구현할 수 있다
- [ ] 지연 로딩(`() => import()`)의 효과를 설명할 수 있다
- [ ] 상태를 컴포넌트 / 스토어 / 라우터 중 어디에 둘지 판단할 수 있다
- [ ] `storeToRefs` 를 왜 써야 하는지 설명할 수 있다
- [ ] 같은 데이터를 두 벌 저장하는 대신 `computed` 로 파생시킬 수 있다

---

## Level 4 — 서버 통신과 인증 (중상급)

### 목표

백엔드와 안전하고 일관되게 대화한다. 이 레벨이 실무의 핵심이다.

### 4-1. API 계층 분리

**컴포넌트가 `axios` 를 직접 부르면 안 된다.** 이유:
① URL 이 여기저기 흩어져 바꾸기 어렵고 ② 오류 처리가 제각각이 되고 ③ 테스트가 불가능하다.

이 프로젝트의 구조:

```
api/
├─ client.js       axios 인스턴스 + 인터셉터 + ApiError
├─ server.js       실제 백엔드 호출
├─ mock/           백엔드 없이 동작하는 가짜 구현
└─ index.js        둘 중 하나를 골라 내보낸다
```

```js
// api/index.js
const api = USE_MOCK ? mockApi : serverApi
export const { auth, diaries, comments, uploads } = api
```

`.env` 의 `VITE_USE_MOCK` 한 줄로 전환된다.

> **mock 을 만드는 이유:** 백엔드가 준비되기 전에도 화면을 완성할 수 있다.
> 그리고 mock 을 만드는 과정에서 **API 명세가 자연스럽게 확정된다.**
> 실무에서 프론트와 백엔드가 동시에 개발할 때 쓰는 방법이다.

### 4-2. axios 인스턴스와 인터셉터

[frontend/src/api/client.js](frontend/src/api/client.js)

```js
export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const client = axios.create({
  baseURL: API_BASE_URL,   // '/api'
  timeout: 15000,
})

// 요청 인터셉터 — 모든 요청에 토큰을 자동으로 붙인다
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.token)
  if (token) {
    config.headers.Authorization = 'Bearer ' + token
  }
  return config
})

// 응답 인터셉터 — 성공하면 data 만 꺼내고, 실패하면 화면에 쓸 수 있는 오류로 바꾼다
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status ?? 0
    const message =
      error.response?.data?.message ||
      (status === 0 ? '서버에 연결할 수 없습니다.' : '요청을 처리하지 못했습니다.')
    return Promise.reject(new ApiError(message, status))
  },
)
```

**인터셉터가 해 주는 일 3가지**

1. **토큰 자동 첨부** — 모든 API 함수에서 헤더를 안 써도 된다
2. **`response.data` 자동 추출** — `const { items } = await client.get(...)` 처럼 바로 쓴다
3. **오류 정규화** — 네트워크 오류든 400 이든 500 이든 `ApiError` 하나로 통일된다.
   화면에서는 항상 `error.message` 만 보면 된다.

> **오류 정규화가 왜 중요한가?** 이것이 없으면 화면마다
> `error.response?.data?.message || error.message || '알 수 없는 오류'` 를 반복해야 한다.
> 한 곳에서 처리하면 화면은 `{{ error }}` 만 쓰면 된다.

### 4-3. API 함수 정의

[frontend/src/api/server.js](frontend/src/api/server.js) — 얇게 유지한다. 로직은 스토어에 둔다.

```js
export const auth = {
  signup: (payload) => client.post('/auth/signup', payload),
  login: (payload) => client.post('/auth/login', payload),
  me: () => client.get('/auth/me'),
  logout: () => client.post('/auth/logout'),
}

export const diaries = {
  listMine: (params) => client.get('/diaries', { params }),
  listFeed: (params) => client.get('/diaries/feed', { params }),
  monthlyCounts: (params) => client.get('/diaries/monthly-counts', { params }),
  get: (id) => client.get('/diaries/' + id),
  create: (payload) => client.post('/diaries', payload),
  update: (id, payload) => client.put('/diaries/' + id, payload),
  remove: (id) => client.delete('/diaries/' + id),
  toggleLike: (id) => client.post('/diaries/' + id + '/like'),
}

export const uploads = {
  image: (file) => {
    const form = new FormData()      // 파일은 JSON 이 아니라 FormData 로 보낸다
    form.append('image', file)
    return client.post('/uploads/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
```

**API 명세를 문서로 남긴다.** [frontend/src/api/index.js](frontend/src/api/index.js) 맨 위 주석처럼
응답 형태와 권한 규칙을 적어 두면, 백엔드와 프론트가 같은 문서를 보고 개발할 수 있다.

```
User    { id, email, nickname, createdAt }
Diary   { id, authorId, author: { id, nickname }, title, content,
          category, mood, dateKey, visibility, images: [{ url, name }],
          likeCount, likedByMe, commentCount, createdAt, updatedAt }
Comment { id, diaryId, parentId, author: { id, nickname }, content, createdAt }
```

### 4-4. 인증 흐름 전체

```
① 로그인 요청 → 서버가 { user, token } 응답
② token 을 localStorage 에 저장 + 스토어의 user 에 담음
③ 이후 모든 요청에 인터셉터가 자동으로 Authorization 헤더를 붙임
④ 새로고침 → 스토어의 user 는 사라지지만 localStorage 의 token 은 남음
⑤ 라우터 가드가 restore() 호출 → GET /auth/me 로 user 복구
⑥ 토큰이 만료됐으면 401 → clearSession() → 로그인 화면
```

**핵심은 ⑤번이다.** 이게 없으면 새로고침할 때마다 로그아웃된다.

```js
async function restore() {
  if (restored.value) return isLoggedIn.value   // 화면을 옮길 때마다 부르지 않게
  restored.value = true
  if (!token.value) return false

  try {
    const { user: me } = await authApi.me()
    user.value = me
    return true
  } catch {
    clearSession()
    return false
  }
}
```

> **보안 주의:** `localStorage` 에 토큰을 두면 XSS(악성 스크립트 삽입) 공격에 노출된다.
> 학습용/개인 프로젝트에는 충분하지만, 실무에서는 `HttpOnly` 쿠키 + CSRF 토큰 조합을 쓰거나
> 짧은 수명의 액세스 토큰 + 리프레시 토큰 구조를 쓴다. Level 5 에서 다시 다룬다.

### 4-5. 폼과 검증

**검증 함수는 컴포넌트 밖으로 뺀다.** [frontend/src/utils/validators.js](frontend/src/utils/validators.js)

```js
// 규칙: 문제가 있으면 오류 메시지(문자열), 없으면 빈 문자열을 반환한다
export function validateEmail(value) {
  if (!value) return '이메일을 입력해 주세요.'
  if (!EMAIL_PATTERN.test(value)) return '이메일 형식이 올바르지 않습니다.'
  return ''
}

export function validatePassword(value) {
  if (!value) return '비밀번호를 입력해 주세요.'
  if (value.length < 8) return '비밀번호는 8자 이상이어야 합니다.'
  return ''
}

/** 검증 결과 객체에 오류가 하나도 없으면 true */
export function isValid(errors) {
  return Object.values(errors).every((message) => !message)
}
```

화면에서 쓰기:

```js
const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })

function validate() {
  errors.email = validateEmail(form.email)
  errors.password = validatePassword(form.password)
  return isValid(errors)
}

async function onSubmit() {
  if (!validate()) return
  const success = await authStore.login({ ...form })
  if (!success) return
  uiStore.notify.success(authStore.nickname + ' 님, 반갑습니다.')
  router.push(route.query.redirect || { name: 'diary-list' })
}
```

> **화면에서 검증했다고 끝이 아니다.** 브라우저의 검증은 사용자 편의를 위한 것이고,
> 개발자 도구로 얼마든지 우회할 수 있다. **백엔드에서 반드시 다시 검증해야 한다.**
> (백엔드 교과서 Level 4 참고)

### 4-6. 파일 업로드

[frontend/src/utils/image.js](frontend/src/utils/image.js) 의 검증 함수:

```js
export function validateImageFile(file) {
  if (!file) return '파일을 선택해 주세요.'

  const extension = getExtension(file.name)
  const allowedExtension = IMAGE_ALLOWED_EXTENSIONS.includes(extension)
  const allowedMime = IMAGE_ALLOWED_MIME_TYPES.includes(file.type)
  if (!allowedExtension || !allowedMime) {
    return IMAGE_ALLOWED_EXTENSIONS.join(', ') + ' 형식만 업로드할 수 있습니다.'
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return '이미지 용량은 ' + formatBytes(IMAGE_MAX_BYTES) + ' 이하여야 합니다.'
  }
  return ''
}
```

**확장자와 MIME 타입을 둘 다 본다.** 확장자만 보면 `.png` 로 이름만 바꾼 파일이 통과하고,
MIME 만 보면 브라우저마다 값이 달라 오작동한다.

업로드 컴포넌트의 흐름 ([ImageUploader.vue](frontend/src/components/diary/ImageUploader.vue)):

```js
async function addFiles(fileList) {
  const files = Array.from(fileList || [])
  const room = IMAGE_MAX_COUNT - props.modelValue.length   // 남은 자리
  if (room <= 0) { message.value = '최대 5장까지...'; return }

  uploading.value = true
  const next = [...props.modelValue]
  try {
    for (const file of files.slice(0, room)) {
      const invalid = validateImageFile(file)
      if (invalid) { message.value = invalid; continue }   // 하나 실패해도 나머지는 계속
      const image = await uploads.image(file)
      next.push({ url: image.url, name: image.name })
    }
    emit('update:modelValue', next)
  } catch (error) {
    message.value = error.message
  } finally {
    uploading.value = false
  }
}
```

**드래그 앤 드롭도 같은 함수를 쓴다:**

```vue
<div
  @dragover.prevent="dragging = true"
  @dragleave.prevent="dragging = false"
  @drop.prevent="dragging = false; addFiles($event.dataTransfer.files)"
>
```

### 4-7. 사용자 피드백 — 토스트

작업 결과를 항상 알려 준다. [frontend/src/stores/ui.js](frontend/src/stores/ui.js)

```js
function pushToast(message, type = 'info') {
  if (!message) return
  toastSequence += 1
  const id = toastSequence
  toasts.value.push({ id, message, type })
  setTimeout(() => removeToast(id), 2600)   // 2.6초 뒤 자동으로 사라진다
}

const notify = {
  info: (message) => pushToast(message, 'info'),
  success: (message) => pushToast(message, 'success'),
  error: (message) => pushToast(message, 'error'),
}
```

```js
uiStore.notify.success('다이어리를 삭제했습니다.')
uiStore.notify.error(err.message)
```

**어떤 피드백을 언제 쓰나?**

| 상황 | 방법 |
| --- | --- |
| 데이터를 불러오는 중 | `LoadingBlock` (스켈레톤/스피너) |
| 데이터가 없음 | `EmptyState` (안내 + 행동 버튼) |
| 작업 성공 | 토스트 (성공) |
| 작업 실패 | 토스트 (오류) 또는 폼 위 오류 문구 |
| 되돌릴 수 없는 작업 | `BaseModal` 확인 창 |

### 백지 재현 과제 (2회독)

1. `client.js` 를 만든다 — axios 인스턴스, 토큰 자동 첨부, `response.data` 추출, `ApiError` 정규화
2. 로그인 → 토큰 저장 → 새로고침 후 `/auth/me` 로 복구되는 전체 흐름을 만든다
3. 폼 검증 유틸을 만들고 회원가입 폼(이메일/닉네임/비밀번호/비밀번호 확인)에 적용한다
4. 이미지 업로드 컴포넌트를 만든다 — 파일 선택, 드래그 앤 드롭, 용량·확장자 검증, 미리보기, 개별 삭제

### 확장 과제 (3회독)

1. 401 응답을 받으면 자동으로 로그아웃하고 로그인 화면으로 보내는 응답 인터셉터를 추가한다
2. 검색어 입력에 **디바운스**(입력이 멈춘 뒤 300ms 후에 요청)를 적용한다
3. 같은 요청이 연달아 나가지 않도록 진행 중인 요청을 취소한다 (`AbortController`)
4. 업로드 진행률 표시를 추가한다 (`onUploadProgress`)

### Level 4 체크리스트

- [ ] 컴포넌트에서 `axios` 를 직접 부르지 않는 이유를 설명할 수 있다
- [ ] 인터셉터로 토큰 첨부와 오류 정규화를 구현할 수 있다
- [ ] 새로고침 후 로그인 상태를 복구하는 흐름을 그림으로 그릴 수 있다
- [ ] 화면 검증과 서버 검증이 둘 다 필요한 이유를 안다
- [ ] `FormData` 로 파일을 보낼 줄 안다
- [ ] 로딩 / 빈 상태 / 오류 / 성공 네 가지 상태를 모두 처리한다

---

## Level 5 — 품질과 최적화 (고급)

### 목표

"동작하는 코드"에서 "오래 유지되는 코드"로 넘어간다.

### 5-1. 성능

**① 코드 분할** — 이미 하고 있다. 라우트를 `() => import()` 로 쓰면 화면마다 파일이 쪼개진다.

```
dist/assets/index-BlnT_Z2q.js         121 kB   ← 공통 (Vue, Router, Pinia)
dist/assets/DiaryDetailView-...js       8 kB   ← 상세 화면에 갈 때만 받음
dist/assets/LoginView-...js             2 kB   ← 로그인 화면에 갈 때만 받음
```

**② 불필요한 재계산 막기** — `computed` 는 재료가 안 바뀌면 다시 계산하지 않는다(캐시).
반면 템플릿에서 함수를 호출하면 **매번 실행된다.**

```vue
<!-- 나쁨 — 화면이 그려질 때마다 실행 -->
<p>{{ getFormattedDate(diary.createdAt) }}</p>

<!-- 좋음 — createdAt 이 바뀔 때만 실행 -->
<script setup>
const formatted = computed(() => formatDate(diary.createdAt))
</script>
<p>{{ formatted }}</p>
```

**③ 목록 최적화** — `v-for` 에 안정적인 `:key`, 목록이 길면 페이지네이션이나 무한 스크롤.

**④ 이미지** — `object-fit: cover` 로 레이아웃이 흔들리지 않게 하고, 썸네일은 작은 크기를 쓴다.

**⑤ 전체 목록 재요청 피하기** — 좋아요처럼 작은 변경은 `syncDiary` 로 부분 갱신한다(Level 3).

### 5-2. 접근성 (a11y)

이 프로젝트가 이미 지키고 있는 것들:

```vue
<!-- 라벨과 입력창 연결 — 스크린리더가 읽고, 라벨 클릭 시 포커스가 간다 -->
<label :for="inputId">이메일</label>
<input :id="inputId" :aria-invalid="Boolean(error)" />

<!-- 장식용 요소는 읽지 않게 -->
<span aria-hidden="true">♥</span>

<!-- 아이콘만 있는 버튼에는 설명을 -->
<button aria-label="이전 달">‹</button>

<!-- 토글 버튼의 상태를 알림 -->
<button :aria-expanded="sidebarOpen">캘린더 펼치기</button>
<button :aria-pressed="diary.likedByMe">♥</button>

<!-- 동적으로 나타나는 알림 -->
<div role="status" aria-live="polite">...</div>

<!-- 영역에 이름 붙이기 -->
<aside aria-label="캘린더">
```

**추가로 확인할 것**

- [ ] 마우스 없이 Tab 키만으로 모든 기능을 쓸 수 있는가?
- [ ] 포커스된 요소가 눈에 보이는가? (`:focus-visible` 스타일)
- [ ] 색상 대비가 충분한가? (본문 4.5:1 이상)
- [ ] 색상만으로 정보를 전달하지 않는가? (공개/비공개를 색뿐 아니라 글자로도)

### 5-3. 전환 효과

```vue
<transition name="fade" mode="out-in">
  <component :is="Component" />
</transition>

<transition-group name="toast">
  <p v-for="toast in toasts" :key="toast.id">{{ toast.message }}</p>
</transition-group>
```

```css
.fade-enter-active, .fade-leave-active { transition: opacity var(--transition-base); }
.fade-enter-from,  .fade-leave-to      { opacity: 0; }
```

`mode="out-in"` = 나가는 것이 끝난 뒤 들어온다(겹치지 않음).

> **움직임을 싫어하는 사용자를 배려한다:**
> ```css
> @media (prefers-reduced-motion: reduce) {
>   * { transition: none !important; animation: none !important; }
> }
> ```

### 5-4. 오류를 다루는 3단계

```
1단계 — 예방:  타입 지정, 검증, 기본값(?? , default)
2단계 — 처리:  try/catch, 인터셉터, 스토어의 error 상태
3단계 — 표시:  토스트, 폼 오류 문구, 빈 상태 화면
```

**절대 하면 안 되는 것: 조용히 삼키기**

```js
try {
  await something()
} catch {
  // 아무것도 안 함 ← 사용자는 왜 안 되는지 영원히 모른다
}
```

의도적으로 무시할 때는 **이유를 주석으로 남긴다.** 이 프로젝트의 예:

```js
try {
  await diaryStore.fetchOne(String(id))
} catch {
  // 오류 메시지는 스토어의 error 로 화면에 표시한다
}
```

### 5-5. 다음 단계 — 여기서 더 높은 수준으로

이 프로젝트를 완성한 뒤 도전할 주제들. 위에서부터 순서대로 하면 좋다.

| 주제 | 무엇을 얻나 | 시작점 |
| --- | --- | --- |
| **TypeScript 전환** | `diary.titel` 같은 오타를 편집기가 잡아 준다 | `npm create vite -- --template vue-ts`, `interface Diary` 정의부터 |
| **자동 테스트** | 고쳐도 안 깨지는 확신 | Vitest(유틸/스토어) → Vue Test Utils(컴포넌트) → Playwright(전체 흐름) |
| **ESLint + Prettier** | 스타일 논쟁 없이 일관된 코드 | `npm create @eslint/config`, 저장 시 자동 정렬 |
| **무한 스크롤 / 페이지네이션** | 데이터가 많아져도 느려지지 않음 | `IntersectionObserver` + 커서 기반 페이징 |
| **다크 모드** | 디자인 토큰 설계의 실전 | `variables.css` 를 `[data-theme]` 별로 두 벌 |
| **국제화(i18n)** | 글자를 코드에서 분리 | `vue-i18n`, 한국어/영어 두 벌 |
| **PWA** | 설치 가능한 앱, 오프라인 | `vite-plugin-pwa` |
| **낙관적 업데이트** | 클릭 즉시 반응하는 UI | 좋아요를 먼저 바꾸고, 실패하면 되돌리기 |
| **가상 스크롤** | 수천 개 목록도 부드럽게 | 화면에 보이는 것만 그리기 |
| **서버 상태 라이브러리** | 캐시·재요청·중복 제거를 직접 안 짜도 됨 | TanStack Query for Vue |
| **Nuxt (SSR)** | 검색 노출, 첫 화면 속도 | 이 앱을 Nuxt 로 옮겨 보기 |
| **실시간** | 댓글이 즉시 나타남 | WebSocket / Server-Sent Events |
| **컴포넌트 문서화** | 팀 협업의 기본 | Storybook 으로 Base 컴포넌트 카탈로그 |

### Level 5 체크리스트

- [ ] 빌드 결과가 왜 여러 파일로 쪼개지는지 설명할 수 있다
- [ ] 템플릿에서 함수 호출 대신 `computed` 를 쓰는 이유를 안다
- [ ] `aria-label`, `aria-hidden`, `aria-pressed` 를 상황에 맞게 쓸 수 있다
- [ ] 오류를 조용히 삼키지 않는다
- [ ] 로딩·빈 상태·오류·성공을 모두 처리한 화면을 만든다

---

## 최종 관문 — 백지에서 앱 전체 만들기

**문서를 완전히 덮고**, 아래 명세만 보고 처음부터 만든다. 이것을 해내면 이 프로젝트 수준에 도달한 것이다.

### 요구사항 명세

```
[화면]
1. 로그인      — 비회원의 첫 화면. 이메일 + 비밀번호.
2. 회원가입    — 이메일, 닉네임(2~12자), 비밀번호(8자 이상), 비밀번호 확인.
3. 내 다이어리 — 로그인 후 첫 화면. 내가 쓴 글 목록.
4. 상세        — 글 내용, 이미지, 좋아요, 댓글/대댓글.
5. 작성/수정   — 같은 화면을 재사용한다.
6. 공개 피드   — 다른 회원의 공개 글 목록.
7. 404

[기능]
- 글 종류: 일기 / 독서기록 / 감정기록
- 감정: 행복, 평온, 지침, 슬픔, 화남, 설렘
- 공개 여부: 공개 / 비공개
- 공개 글에만 좋아요와 댓글(대댓글 1단계까지)
- 이미지 첨부: 최대 5장, 10MB 이하, jpg/jpeg/png/gif/webp
- 왼쪽 하단에 캘린더를 접었다 펼치는 토글 버튼
- 캘린더의 첫 요일은 일요일, 글이 있는 날에는 점 표시
- 날짜는 모두 한국 시간(KST) 기준
- 목록 필터: 날짜, 종류, 공개 여부, 검색어
- 모바일 반응형

[제약]
- CSS 는 src/css/ 아래 별도 파일, BEM, 디자인 토큰만 사용
- 컴포넌트를 적극적으로 나눈다
- 콘솔에 경고나 오류가 없어야 한다
```

### 완성 기준

- [ ] 새로고침해도 로그인이 유지된다
- [ ] 로그인 안 하고 `/` 에 가면 로그인 화면으로 가고, 로그인하면 원래 가려던 곳으로 돌아온다
- [ ] 남의 비공개 글에 접근하면 오류 메시지가 뜬다
- [ ] 좋아요를 누르면 목록·상세 어디서든 즉시 숫자가 맞는다
- [ ] 댓글을 지우면 그 대댓글도 함께 사라진다
- [ ] 캘린더에서 날짜를 고르면 주소가 바뀌고, 그 주소를 새 탭에서 열어도 같은 화면이다
- [ ] 폰 크기(375px)에서 가로 스크롤이 생기지 않는다
- [ ] 모든 비동기 작업에 로딩 표시와 오류 처리가 있다
- [ ] 빈 목록에 안내 문구와 행동 버튼이 있다
- [ ] Tab 키만으로 로그인부터 글 작성까지 할 수 있다

### 그다음 — 더 높은 수준

같은 앱을 조건을 바꿔 다시 만든다. 이것이 진짜 실력이 되는 단계다.

1. **TypeScript 로 다시 만들기** — 모든 API 응답에 타입을 붙인다
2. **테스트를 먼저 쓰고 만들기** — 유틸 → 스토어 → 컴포넌트 순으로
3. **다른 도메인으로 바꿔 만들기** — 가계부, 운동 기록, 레시피 등 (구조는 그대로, 도메인만 교체)
4. **Nuxt 로 옮기기** — 서버 사이드 렌더링

---

## 부록 A — 자주 쓰는 코드 조각

```js
// 로딩/오류를 묶는 패턴
async function run(task) {
  loading.value = true
  error.value = ''
  try { return await task() }
  catch (err) { error.value = err.message; throw err }
  finally { loading.value = false }
}

// 디바운스 — 입력이 멈춘 뒤 실행
let timer = null
function debounce(fn, delay = 300) {
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// query 를 v-model 로 쓰기
const value = computed({
  get: () => String(route.query.key || ''),
  set: (v) => router.push({ query: { ...route.query, key: v || undefined } }),
})

// 부모의 배열 prop 을 바꾸지 않고 갱신하기
const next = [...props.modelValue]
next.push(newItem)
emit('update:modelValue', next)

// 조건부 클래스
:class="[`btn--${variant}`, { 'btn--block': block, 'btn--on': isActive }]"
```

## 부록 B — 오류 메시지와 원인

| 메시지 / 증상 | 원인 | 해결 |
| --- | --- | --- |
| `Cannot read properties of null` | 데이터가 오기 전에 접근 | `v-if="current"` 로 감싸거나 `current?.title` |
| 화면이 안 바뀜 | `storeToRefs` 없이 구조 분해 | `const { items } = storeToRefs(store)` |
| `[Vue warn] Missing required prop` | 필수 prop 을 안 넘김 | 부모에서 값 전달 |
| `Maximum recursive updates` | `watch` 안에서 감시 대상을 바꿈 | 조건을 걸거나 `computed` 로 바꾼다 |
| 폼 제출 시 새로고침 | `.prevent` 누락 | `@submit.prevent` |
| 목록 수정 시 엉뚱한 동작 | `:key` 없음 또는 인덱스 사용 | `:key="item.id"` |
| CORS 오류 | 프록시 미설정 또는 다른 주소 직접 호출 | `vite.config.js` 의 `server.proxy` |
| 새로고침하면 404 | SPA 라우팅을 서버가 모름 | 서버에서 모든 경로를 `index.html` 로 |
| 401 이 계속 뜸 | 토큰 만료 또는 헤더 누락 | 인터셉터 확인, `restore()` 확인 |

## 부록 C — 용어 사전

| 용어 | 뜻 |
| --- | --- |
| SFC | Single File Component. `.vue` 파일 하나 |
| 반응성(reactivity) | 값이 바뀌면 화면이 자동으로 갱신되는 성질 |
| props / emit | 부모→자식 데이터 / 자식→부모 이벤트 |
| slot | 자식 안에 부모의 마크업을 끼워 넣는 자리 |
| 가드(guard) | 화면 전환 전에 끼어들어 허용/차단하는 함수 |
| 스토어(store) | 여러 화면이 공유하는 상태 보관소 |
| 인터셉터 | 요청/응답을 가로채 공통 처리를 하는 함수 |
| 디자인 토큰 | 색·간격 등을 이름으로 정의한 값 (CSS 변수) |
| BEM | Block\_\_Element--Modifier 클래스 이름 규칙 |
| 지연 로딩 | 필요할 때 비로소 코드를 내려받는 것 |
| 낙관적 업데이트 | 서버 응답 전에 화면을 먼저 바꾸고, 실패하면 되돌리는 것 |

---

## 학습 순서 요약

```
Level 0  JS 기초 점검
   ↓
Level 1  ref / computed / watch / 템플릿 문법        ← 반응성을 몸에 익힌다
   ↓
Level 2  props / emit / slot / BEM / 디자인 토큰     ← 재사용 구조를 익힌다
   ↓
Level 3  라우터 / 가드 / Pinia                       ← 앱의 뼈대를 익힌다
   ↓
Level 4  axios / 인터셉터 / 인증 / 업로드            ← 서버와 대화한다
   ↓
Level 5  성능 / 접근성 / 오류 처리                   ← 품질을 올린다
   ↓
최종 관문  백지에서 전체 만들기 → 조건 바꿔 다시 만들기
```

백엔드는 [Study_backend.md](Study_backend.md) 를 함께 본다.
Level 4(서버 통신)를 할 때 백엔드 Level 4(인증·권한)를 같이 보면 이해가 빠르다.
