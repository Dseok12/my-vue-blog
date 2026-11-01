# Stage 5 — Vue 3 로 다이어리 앱 만들기

> 전체 로드맵: [study/README.md](README.md) · 이전: [04 브라우저 JavaScript](04-javascript-browser.md) · 다음: [06 백엔드](06-backend.md)

이 문서는 **JavaScript 를 아는 사람이 이 프로젝트(`frontend/`) 수준, 그리고 그 이상까지** 도달하는 것을 목표로 한다.
읽기만 하는 문서가 아니라 **여러 번 반복해서 만들어 보는 훈련 교재**다.
프로그래밍이 처음이라면 [00 시작하기](00-start.md) 부터 순서대로 온다.

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
─────────────────────────  여기까지 = 이 프로젝트 수준  ─────────────────────────
Level 6  대형 아키텍처      [ ]1회독  [ ]2회독  [ ]3회독
Level 7  팀·릴리스·운영     [ ]1회독  [ ]2회독  [ ]3회독
최종 관문 II  대형 프로젝트 시뮬레이션         [ ]
```

> Level 6~7 은 이 프로젝트 코드에 없는 내용이다. 실무 대형 프로젝트에서 쓰는
> 아키텍처·도구·프로세스를 다룬다. 최종 관문(Level 1~5)을 통과한 뒤에 시작한다.

### 0-3. 시작 전 필요한 것

- Node.js 22 LTS 이상 (`node -v` 로 확인, 최소 20.19)
- 코드 편집기 (VS Code + Vue 공식 확장 `Vue - Official`)
- 브라우저 개발자 도구 사용법 (F12 → Console, Network, Elements 탭)
- 선행 지식: HTML 태그, CSS 선택자, JavaScript 변수/함수/배열/객체, DOM 이벤트, async/await

선행 지식이 부족하면 아래 Level 0 을 풀어 본다. 하나라도 막히면 [01~04](README.md) 로 돌아간다.

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

이 프로젝트의 설정은 [frontend/vite.config.js](../frontend/vite.config.js) 에 있다.

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

[frontend/src/stores/diary.js](../frontend/src/stores/diary.js) 의 실제 예:

```js
// computed — 필터가 하나라도 걸려 있는지 "계산"
const hasFilter = computed(() =>
  Boolean(filters.dateKey || filters.category || filters.visibility || filters.keyword),
)
```

[frontend/src/views/DiaryListView.vue](../frontend/src/views/DiaryListView.vue) 의 실제 예:

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

[frontend/src/composables/useMediaQuery.js](../frontend/src/composables/useMediaQuery.js) 의 실제 예 —
**등록했으면 반드시 해제한다**는 원칙을 보여 준다.

```js
export function useMediaQuery(query) {
  const matches = ref(false)
  let mediaQuery = null

  function onChange(event) {
    matches.value = event.matches
  }

  onMounted(() => {
    mediaQuery = window.matchMedia(query)
    matches.value = mediaQuery.matches
    mediaQuery.addEventListener('change', onChange)
  })

  onBeforeUnmount(() => {
    mediaQuery?.removeEventListener('change', onChange) // 정리하지 않으면 메모리 누수
  })

  return matches
}
```

```js
// AppSidebar.vue — 쓰는 쪽은 한 줄이다
const isNarrow = useMediaQuery('(max-width: 1023px)')
```

> `useXxx` 로 시작하는 이 함수를 **컴포저블(composable)** 이라고 부른다.
> 컴포넌트 안의 `ref` + 생명주기 로직을 함수로 빼낸 것이다. 자세한 내용은 [07 Vue 심화](07-vue-advanced.md) 1장.

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

[frontend/src/components/layout/AppSidebar.vue](../frontend/src/components/layout/AppSidebar.vue) 에서는
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
│              (화면 한 곳에서만 쓰지만 성격이 같은 것도 여기 둔다 — AuthCard, IntroPanel)
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

`base/` 만 [frontend/src/main.js](../frontend/src/main.js) 에서 한 번 불러오고, 나머지는 각 컴포넌트가 직접 불러온다.

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

[frontend/src/css/base/variables.css](../frontend/src/css/base/variables.css)

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

[frontend/src/router/index.js](../frontend/src/router/index.js)

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

[frontend/src/App.vue](../frontend/src/App.vue) 에서 `meta.layout` 으로 껍데기를 바꾼다.

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

로그인/회원가입/404 는 가운데에 카드를 놓는 `AuthLayout`,
나머지는 헤더 + 사이드바가 있는 `DefaultLayout` 을 쓴다.

**`meta` 는 가드 말고 다른 용도로도 쓴다.** 로그인 화면은 옆에 서비스 소개(`IntroPanel`)를
함께 보여 줘야 해서 더 넓은 폭이 필요하다. 그래서 라우트에 `meta.wide` 를 두고
`AuthLayout` 이 그 값을 읽어 클래스를 바꾼다.

```js
// router/index.js — 로그인 화면만 넓게
meta: { guestOnly: true, layout: 'auth', wide: true, title: '로그인' },
```

```vue
<!-- layouts/AuthLayout.vue -->
<script setup>
const route = useRoute()
const isWide = computed(() => Boolean(route.meta.wide))
</script>

<template>
  <div class="auth-layout">
    <div class="auth-layout__inner" :class="{ 'auth-layout__inner--wide': isWide }">
      <slot />
    </div>
  </div>
</template>
```

> 화면마다 조금씩 다른 껍데기가 필요할 때, 레이아웃을 새로 만드는 대신
> **`meta` 값 하나로 변형**하는 방법이다. 레이아웃이 2개에서 3개로 늘지 않는다.

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

[frontend/src/stores/auth.js](../frontend/src/stores/auth.js)

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

**중복 코드를 함수로 묶기** — [frontend/src/stores/diary.js](../frontend/src/stores/diary.js)

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

**파생 데이터는 computed 로** — [frontend/src/stores/comment.js](../frontend/src/stores/comment.js)

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

### 3-3. "더 보기" 목록 — 페이지네이션 상태 관리

글이 수천 개가 되면 한 번에 다 받을 수 없다. 서버는 10개씩 주고, 다음 위치(`nextCursor`)를 알려 준다.

```
첫 요청   GET /diaries?limit=10            → { items: [10개], nextCursor: 'A', total: 37 }
더 보기   GET /diaries?limit=10&cursor=A   → { items: [10개], nextCursor: 'B', total: 37 }
...
마지막    GET /diaries?limit=10&cursor=C   → { items: [7개],  nextCursor: null, total: 37 }
```

화면은 커서의 내용을 몰라도 된다. **받은 `nextCursor` 를 그대로 다음 요청에 돌려줄 뿐이다.**
(서버는 `날짜_작성시각_id`, mock 은 `id` 를 쓰지만 화면 코드는 같다.)

"내 다이어리"와 "공개 피드" 가 똑같은 상태(목록, 커서, 개수, 더보기 로딩)를 가지므로
[frontend/src/composables/usePagedList.js](../frontend/src/composables/usePagedList.js) 로 한 번만 만든다.

```js
export function usePagedList(loadPage) {
  const items = ref([])
  const nextCursor = ref(null)
  const total = ref(0)
  const loadingMore = ref(false)
  const hasMore = computed(() => Boolean(nextCursor.value))

  let version = 0   // 요청 번호표

  async function reload() {          // 필터가 바뀌면 첫 페이지부터
    version += 1
    const requestVersion = version
    const page = await loadPage(null)
    if (requestVersion !== version) return items.value   // ← 늦게 온 옛날 응답은 버린다
    items.value = page.items
    nextCursor.value = page.nextCursor
    total.value = page.total
  }

  async function loadMore() {        // 이어 붙이기
    if (!nextCursor.value || loadingMore.value) return
    ...
    items.value.push(...page.items)
  }
  return { items, nextCursor, total, loadingMore, hasMore, reload, loadMore, removeItem }
}
```

스토어에서는 API 함수만 넘겨 준다.

```js
// stores/diary.js
const mine = usePagedList((cursor) => diaryApi.listMine({ ...filters, cursor, limit: PAGE_SIZE }))
const feed = usePagedList((cursor) => diaryApi.listFeed({ keyword: filters.keyword, cursor, limit: PAGE_SIZE }))
```

> **"늦게 온 응답" 문제 (경쟁 상태, race condition)**
> 검색어를 `a` → `ab` 로 빠르게 바꾸면 요청이 두 번 나간다. 네트워크 사정으로 `a` 의 응답이 **나중에**
> 도착하면, 화면에는 `ab` 를 검색했는데 `a` 결과가 보인다. 요청마다 번호(`version`)를 붙이고
> **가장 마지막 번호의 응답만 반영**하면 해결된다. 이 동작은
> [usePagedList.test.js](../frontend/src/composables/usePagedList.test.js) 가 자동으로 확인한다.

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

[frontend/src/api/client.js](../frontend/src/api/client.js)

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

[frontend/src/api/server.js](../frontend/src/api/server.js) — 얇게 유지한다. 로직은 스토어에 둔다.

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

**API 명세를 문서로 남긴다.** [frontend/src/api/index.js](../frontend/src/api/index.js) 맨 위 주석처럼
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

**⑦ 사용 중에 토큰이 만료되면?** 화면을 켜 둔 채로 7일이 지나면, 다음 요청이 401 을 받는다.
이때 사용자를 로그인 화면으로 보내고, 다시 로그인하면 **보던 화면으로 돌려보낸다.**

```js
// api/client.js — api 폴더는 라우터·스토어를 모른다. "401 이 오면 이 함수를 불러 줘" 만 안다.
let unauthorizedHandler = null
export function onUnauthorized(handler) {
  unauthorizedHandler = handler
}

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status ?? 0
    // 로그인 실패(비밀번호 틀림)도 401 이므로 /auth/ 요청은 제외한다.
    if (status === 401 && !isAuthRequest(error.config)) unauthorizedHandler?.()
    ...
  },
)
```

```js
// main.js — 실제로 무엇을 할지는 앱을 조립하는 곳에서 정한다.
onUnauthorized(() => {
  const authStore = useAuthStore()
  if (!authStore.isLoggedIn) return
  authStore.clearSession()
  useUiStore().notify.error('로그인이 만료되었습니다. 다시 로그인해 주세요.')
  router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
})
```

> **왜 client.js 에서 바로 router 를 import 하지 않나?** `router → stores/auth → api → client → router`
> 로 서로가 서로를 불러오는 **순환 참조**가 생긴다. "등록 함수" 를 두면 의존 방향이 한쪽으로만 흐른다.
> 이 기법을 **의존성 역전**이라고 부른다.

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

**검증 함수는 컴포넌트 밖으로 뺀다.** [frontend/src/utils/validators.js](../frontend/src/utils/validators.js)

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

[frontend/src/utils/image.js](../frontend/src/utils/image.js) 의 검증 함수:

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

업로드 컴포넌트의 흐름 ([ImageUploader.vue](../frontend/src/components/diary/ImageUploader.vue)):

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

작업 결과를 항상 알려 준다. [frontend/src/stores/ui.js](../frontend/src/stores/ui.js)

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
| 작성 중에 화면을 떠나려 함 | `useLeaveGuard` 확인 창 (4-8) |

### 4-8. 작성 중 이탈 경고

긴 일기를 쓰다가 실수로 로고를 누르면 내용이 날아간다. 두 가지 길을 모두 막는다.

```js
// composables/useLeaveGuard.js
export function useLeaveGuard(shouldConfirm, message = DEFAULT_MESSAGE) {
  // ① 앱 안에서 다른 화면으로 이동 — 라우터 가드. false 를 돌려주면 이동이 취소된다.
  onBeforeRouteLeave(() => {
    if (!shouldConfirm()) return true
    return window.confirm(message)
  })

  // ② 새로고침 / 탭 닫기 — 브라우저 이벤트
  function onBeforeUnload(event) {
    if (!shouldConfirm()) return
    event.preventDefault()
    event.returnValue = ''
  }
  onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
  onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload))
}
```

"바뀌었는가?" 는 폼이 직접 판단해서 부모에게 알린다. 처음 상태를 문자열로 찍어 두고 비교한다.

```js
// DiaryForm.vue
const initialSnapshot = ref(JSON.stringify(form))
const dirty = computed(() => JSON.stringify(form) !== initialSnapshot.value)
watch(dirty, (value) => emit('dirty-change', value))
```

```js
// DiaryEditorView.vue
const dirty = ref(false)
const saved = ref(false)
useLeaveGuard(() => dirty.value && !saved.value)   // 저장에 성공한 뒤에는 묻지 않는다

async function onSubmit(payload) {
  ...
  saved.value = true                 // ← router.push 보다 먼저!
  router.push({ name: 'diary-detail', params: { id: diary.id } })
}
```

> `saved.value = true` 를 `router.push` 뒤에 두면, 저장했는데도 "떠날까요?" 가 뜬다.
> **순서가 곧 로직이다.**

### 백지 재현 과제 (2회독)

1. `client.js` 를 만든다 — axios 인스턴스, 토큰 자동 첨부, `response.data` 추출, `ApiError` 정규화
2. 로그인 → 토큰 저장 → 새로고침 후 `/auth/me` 로 복구되는 전체 흐름을 만든다
3. 폼 검증 유틸을 만들고 회원가입 폼(이메일/닉네임/비밀번호/비밀번호 확인)에 적용한다
4. 이미지 업로드 컴포넌트를 만든다 — 파일 선택, 드래그 앤 드롭, 용량·확장자 검증, 미리보기, 개별 삭제

### 확장 과제 (3회독)

1. 401 처리(4-4 의 ⑦)를 문서를 보지 않고 다시 만든다. 로그인 실패의 401 은 왜 제외해야 하는지 설명한다
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

**사례 ① — 링크 안에 버튼을 넣지 않는다** ([DiaryCard.vue](../frontend/src/components/diary/DiaryCard.vue))

카드 전체를 `<a>` 로 만들고 그 안에 좋아요 `<button>` 을 넣으면 **잘못된 HTML** 이다.
스크린리더는 "링크 안의 버튼" 을 제대로 읽지 못하고, 좋아요를 누르면 상세로 이동해 버린다
(그래서 예전 코드는 `@click.stop.prevent` 로 억지로 막고 있었다).

```vue
<article class="card">
  <h3 class="card__title">
    <router-link class="card__link" :to="...">{{ diary.title }}</router-link>
  </h3>
  ...
  <LikeButton class="card__like" :diary="diary" />
</article>
```

```css
.card { position: relative; }
.card__link::after { content: ''; position: absolute; inset: 0; }  /* 링크가 카드 전체를 덮는다 */
.card__like { position: relative; z-index: 1; }                    /* 버튼은 그 위로 올린다 */
.card:has(.card__link:focus-visible) { outline: 2px solid var(--color-primary); }
```

**사례 ② — 모달** ([BaseModal.vue](../frontend/src/components/common/BaseModal.vue))

| 문제 | 해결 |
| --- | --- |
| 부모의 `overflow`/`z-index` 때문에 모달이 잘리거나 밑에 깔림 | `<Teleport to="body">` 로 body 바로 아래에 그린다 |
| ESC 가 모달에 포커스가 있을 때만 동작 | `document` 에 keydown 을 등록하고, 닫힐 때 해제 |
| 키보드 사용자가 모달이 열린 줄 모름 | 열리면 패널로 포커스를 옮기고, 닫히면 원래 버튼으로 돌려준다 |
| 스크린리더가 제목을 모름 | `aria-labelledby` 로 제목 요소와 연결 |

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

### 5-5. 코드 검사와 자동 테스트 — 이 프로젝트에 이미 있다

```bash
cd frontend
npm run lint          # ESLint — 안 쓰는 변수, Vue 문법 실수
npm run format        # Prettier — 줄바꿈·따옴표를 자동으로 통일
npm test              # Vitest — src/**/*.test.js 실행
```

ESLint 를 처음 켰을 때 `CommentForm.vue` 에서 **선언만 하고 안 쓰는 `props` 변수**를 찾았다.
테스트를 처음 썼을 때는 `DiaryCard.vue` 맨 위의 HTML 주석 때문에 **루트가 두 개**가 되는 문제를 찾았다.
둘 다 눈으로는 몇 달이 지나도 못 찾는 종류다. 자세한 사용법은 [07 Vue 심화](07-vue-advanced.md) 5~6장,
테스트를 어떻게 나눌지(피라미드)는 아래 Level 6-10.

### 5-6. 다음 단계 — 여기서 더 높은 수준으로

이 프로젝트를 완성한 뒤 도전할 주제들. 위에서부터 순서대로 하면 좋다. (Level 6~7, 07 에서 대부분 다룬다)

| 주제 | 무엇을 얻나 | 시작점 |
| --- | --- | --- |
| **TypeScript 전환** | `diary.titel` 같은 오타를 편집기가 잡아 준다 | `npm create vite -- --template vue-ts`, `interface Diary` 정의부터 |
| **E2E 테스트** | 실제 브라우저로 "가입→작성→삭제" 전체 흐름 확인 | Playwright |
| **무한 스크롤** | "더 보기" 버튼 없이 끝에 닿으면 자동으로 | `IntersectionObserver` + 이미 있는 `loadMore()` |
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

## Level 6 — 대형 프로젝트 아키텍처 (실무 고급)

### 목표

파일이 500개, 화면이 50개, 개발자가 5명이 되어도 무너지지 않는 구조를 만든다.
이 레벨부터는 "동작하는 코드"가 아니라 **"바꾸기 쉬운 코드"** 가 목표다.

> **대형 프로젝트의 유일한 진짜 문제는 "변경 비용"이다.**
> 기능 추가가 처음엔 1시간, 6개월 뒤엔 3일이 걸린다면 구조가 잘못된 것이다.
> 아래 모든 기법은 결국 "한 곳만 고치면 되게 만든다"는 한 가지 목적을 위한 것이다.

### 6-1. 폴더 구조 — 기술별에서 기능별로

이 프로젝트는 `components/`, `views/`, `stores/`, `api/` 처럼 **기술 종류로** 나눴다.
파일 100개까지는 괜찮다. 그 이상이면 **기능(feature) 단위로** 다시 묶는다.

```
src/
├─ app/                     앱 부팅 — main.js, App.vue, 전역 플러그인 등록
│  ├─ router/
│  ├─ providers/            pinia, i18n, query client 초기화
│  └─ layouts/
├─ pages/                   라우트와 1:1. 조립만 한다. 로직 없음.
│  ├─ diary-list/
│  ├─ diary-detail/
│  └─ login/
├─ features/                "사용자가 하는 행동" 단위
│  ├─ diary-editor/         쓰기/수정 폼 + 검증 + 제출
│  │  ├─ ui/                이 기능 전용 컴포넌트
│  │  ├─ model/             이 기능 전용 스토어/컴포저블
│  │  ├─ api/               이 기능이 쓰는 API 호출
│  │  └─ index.js           공개 API — 밖에서는 이 파일만 import
│  ├─ diary-like/
│  ├─ comment-thread/
│  └─ auth-by-password/
├─ entities/                "명사" 단위 — 도메인 데이터와 그 표현
│  ├─ diary/                DiaryCard, diary 타입, diary 직렬화
│  ├─ comment/
│  └─ user/
├─ shared/                  도메인을 모르는 순수 재사용 코드
│  ├─ ui/                   BaseButton, BaseInput, BaseModal ...
│  ├─ lib/                  date, debounce, 검증 헬퍼
│  ├─ api/                  axios 인스턴스, 인터셉터, ApiError
│  └─ config/
└─ widgets/                 여러 feature/entity 를 합친 큰 덩어리
   ├─ app-header/
   └─ calendar-sidebar/
```

이 구조를 **Feature-Sliced Design(FSD)** 라고 부른다. 핵심은 **의존성 방향 규칙** 하나다.

```
app → pages → widgets → features → entities → shared
     (위는 아래를 import 할 수 있다. 반대는 절대 안 된다.)
```

| 규칙 | 이유 |
| --- | --- |
| `shared` 는 아무것도 import 하지 않는다 | 어디서든 안전하게 쓸 수 있어야 한다 |
| `entities` 끼리 서로 import 하지 않는다 | `comment` 가 `diary` 를 알면 둘을 따로 못 뗀다 |
| `features` 끼리 서로 import 하지 않는다 | 기능은 독립적으로 켜고 끌 수 있어야 한다 |
| 같은 층끼리 필요하면 → 상위 층(`widgets`, `pages`)에서 조립한다 | 조립은 위에서 |
| 각 슬라이스는 `index.js` 로만 밖에 노출한다 | 내부 파일을 바꿔도 밖이 안 깨진다 |

> **이 규칙을 손으로 지키긴 어렵다. 도구로 강제한다.**
> ```js
> // eslint.config.js — "아래 층이 위 층을 import" 하면 빌드를 막는다
> // (target = 검사 대상 폴더, from = 그 폴더가 import 하면 안 되는 곳)
> 'import/no-restricted-paths': ['error', {
>   zones: [
>     { target: './src/shared',   from: ['./src/entities', './src/features', './src/widgets', './src/pages'] },
>     { target: './src/entities', from: ['./src/features', './src/widgets', './src/pages'] },
>     { target: './src/features', from: ['./src/widgets', './src/pages'] },
>   ],
> }]
> // 참고: features → entities → shared 방향(위에서 아래)은 허용된다.
> ```

**언제 이 구조로 바꾸나?** 처음부터 하지 않는다. 이 프로젝트처럼 시작하고,
"이 컴포넌트가 어느 폴더에 속하는지 3초 안에 답이 안 나올 때" 옮긴다.

### 6-2. TypeScript — 경계에 타입을 세운다

대형 프로젝트에서 TS 는 선택이 아니다. `diary.titel` 오타 하나가 배포 후에 발견되면 늦다.

```bash
npm create vite@latest my-app -- --template vue-ts
```

**핵심 원칙: 타입은 "데이터가 들어오는 경계"에 정의하고, 안쪽은 추론에 맡긴다.**

```ts
// entities/diary/model/types.ts — 도메인 타입은 한 곳에서
export type DiaryCategory = 'diary' | 'book' | 'emotion'
export type Visibility = 'public' | 'private'

export interface DiaryImage {
  url: string
  name: string
}

export interface Diary {
  id: string
  authorId: string
  author: { id: string; nickname: string }
  title: string
  content: string
  category: DiaryCategory
  mood: string
  dateKey: string           // 'YYYY-MM-DD'
  visibility: Visibility
  images: DiaryImage[]
  likeCount: number
  likedByMe: boolean
  commentCount: number
  createdAt: string         // ISO
  updatedAt: string
}
```

**런타임 검증과 타입을 동시에 — zod**

TS 타입은 컴파일 후 사라진다. 서버 응답이 실제로 그 모양인지는 **런타임에** 확인해야 한다.

```ts
// entities/diary/model/schema.ts
import { z } from 'zod'

export const diarySchema = z.object({
  id: z.string(),
  authorId: z.string(),
  author: z.object({ id: z.string(), nickname: z.string() }),
  title: z.string(),
  content: z.string(),
  category: z.enum(['diary', 'book', 'emotion']),
  visibility: z.enum(['public', 'private']),
  images: z.array(z.object({ url: z.string(), name: z.string() })),
  likeCount: z.number(),
  likedByMe: z.boolean(),
  commentCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// 타입을 스키마에서 자동으로 뽑는다 — 스키마와 타입이 절대 어긋나지 않는다
export type Diary = z.infer<typeof diarySchema>
```

```ts
// api 계층에서 — 파싱하면서 검증한다
const raw = await client.get('/diaries/' + id)
const diary = diarySchema.parse(raw.diary)   // 모양이 다르면 여기서 즉시 터진다
```

> **왜 이렇게까지 하나?** 백엔드가 필드 이름을 몰래 바꿨을 때, 화면 여기저기서
> `undefined` 로 조용히 깨지는 대신 **API 경계에서 명확한 오류**로 잡힌다.
> 디버깅 시간이 10분에서 10초로 준다.

**제네릭 컴포넌트 타입**

```vue
<script setup lang="ts" generic="T">
defineProps<{
  items: T[]
  itemKey: (item: T) => string | number
}>()
defineEmits<{ select: [item: T] }>()
</script>
```

**스토어 타입** — setup store 는 자동 추론된다. 반환 타입만 신경 쓴다.

```ts
export const useDiaryStore = defineStore('diary', () => {
  const items = ref<Diary[]>([])
  const current = ref<Diary | null>(null)
  // 반환하는 것에서 타입이 자동으로 잡힌다
  return { items, current }
})
```

### 6-3. 서버 상태와 클라이언트 상태를 분리한다

이 프로젝트는 `diary` 스토어에 **서버 데이터(목록, 상세)** 와 **화면 상태(필터, 로딩)** 를 같이 담았다.
소규모에서는 괜찮지만, 커지면 다음 문제가 생긴다.

- 같은 데이터를 여러 스토어가 중복 저장
- "이 목록이 최신인가?" 를 아무도 모른다 → 새로고침을 남발하거나, 낡은 데이터를 보여준다
- 캐시, 재요청, 중복 제거, 재시도를 전부 손으로 짠다

**해법: 서버 상태는 전용 라이브러리에 맡긴다 — TanStack Query (Vue Query)**

```bash
npm install @tanstack/vue-query
```

```ts
// entities/diary/api/queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

export function useDiaryList(filters: Ref<DiaryFilters>) {
  return useQuery({
    queryKey: ['diaries', filters],           // 필터가 바뀌면 자동으로 다시 불러온다
    queryFn: () => diaryApi.listMine(filters.value),
    staleTime: 60_000,                        // 1분간은 "신선함" — 다시 안 부른다
  })
}

export function useToggleLike() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => diaryApi.toggleLike(id),
    // 낙관적 업데이트 — 클릭 즉시 화면을 바꾸고, 실패하면 되돌린다
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['diaries'] })
      const prev = qc.getQueryData(['diaries'])
      qc.setQueryData(['diaries'], (old: Diary[]) =>
        old.map((d) => (d.id === id ? { ...d, likedByMe: !d.likedByMe } : d)),
      )
      return { prev }
    },
    onError: (_err, _id, ctx) => qc.setQueryData(['diaries'], ctx?.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ['diaries'] }),
  })
}
```

**분리 후 각자의 역할**

| 상태 종류 | 도구 | 예 |
| --- | --- | --- |
| 서버에서 온 데이터 | Vue Query | 다이어리 목록, 상세, 댓글, 피드 |
| 여러 화면이 공유하는 순수 클라이언트 상태 | Pinia | 로그인 사용자 정보, 사이드바 열림, 토스트, 테마 |
| 한 화면/컴포넌트 안의 상태 | `ref` | 폼 입력값, 드롭다운 열림 |
| 주소로 표현되는 상태 | 라우터 query | 선택 날짜, 검색어, 페이지 번호 |

> Pinia 를 버리는 게 아니다. **Pinia 에서 "서버 데이터 캐싱" 책임만 덜어낸다.**
> `auth` 스토어는 그대로 Pinia 가 맞다.

### 6-4. 컴포넌트 설계 심화

**① 컴포저블(composable) — 로직을 컴포넌트에서 뗀다**

`use` 로 시작하는 함수. 반응성 있는 로직을 재사용한다.

```ts
// shared/lib/useDebouncedRef.ts
export function useDebouncedRef<T>(source: Ref<T>, delay = 300): Ref<T> {
  const debounced = ref(source.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout>
  watch(source, (value) => {
    clearTimeout(timer)
    timer = setTimeout(() => { debounced.value = value }, delay)
  })
  onScopeDispose(() => clearTimeout(timer))   // 컴포넌트가 사라지면 정리
  return debounced
}
```

```ts
// features/diary-search/model/useDiarySearch.ts — 이 기능의 모든 로직이 여기 모인다
export function useDiarySearch() {
  const route = useRoute()
  const router = useRouter()
  const keyword = ref(String(route.query.q ?? ''))
  const debounced = useDebouncedRef(keyword, 400)

  watch(debounced, (q) => {
    router.replace({ query: { ...route.query, q: q || undefined } })
  })

  const query = useDiaryList(computed(() => ({ keyword: debounced.value })))
  return { keyword, ...query }
}
```

**컴포저블 규칙**

- `use` 접두사, 반응성 있는 값을 `ref`/`computed` 로 반환
- 생명주기 훅(`onMounted` 등)은 컴포저블 안에서 써도 된다 — 호출한 컴포넌트에 붙는다
- 정리(clean-up)는 `onScopeDispose` 로
- **컴포저블은 UI 를 모른다.** 마크업은 컴포넌트에, 로직은 컴포저블에.

**② 프레젠테이션 / 컨테이너 분리**

```
DiaryListPage.vue     ← 컨테이너: 데이터를 가져오고, 이벤트를 처리한다
  └─ DiaryList.vue    ← 프레젠테이션: props 로 받은 것만 그린다. 스토어를 모른다.
       └─ DiaryCard.vue
```

프레젠테이션 컴포넌트는 스토어·라우터·API 를 import 하지 않는다.
→ Storybook 에서 단독으로 렌더링되고, 테스트가 쉽고, 재사용된다.

**③ 디자인 시스템 — `shared/ui` 를 별도 패키지로**

`BaseButton`, `BaseInput` 같은 것이 20개가 넘고 여러 앱에서 쓰이면
`packages/ui` 로 분리하고 Storybook 으로 문서화한다.

```bash
npm install -D @storybook/vue3-vite
```

```ts
// BaseButton.stories.ts
export default { component: BaseButton, title: 'shared/BaseButton' }
export const Primary = { args: { variant: 'primary' }, render: (a) => ({ ... }) }
export const Loading = { args: { loading: true } }
```

> **디자인 시스템의 진짜 가치:** 디자이너와 개발자가 **같은 컴포넌트 이름**으로 대화하게 된다.
> "카드 컴포넌트의 padding-lg 변형" 이라고 하면 서로 정확히 같은 것을 떠올린다.

### 6-5. 대형 폼 — 라이브러리를 쓴다

이 프로젝트의 검증 유틸은 필드 4개까지는 훌륭하다.
필드 20개, 배열 필드(이미지 목록), 조건부 필드, 서버 오류 매핑이 들어오면 라이브러리가 낫다.

```bash
npm install vee-validate zod @vee-validate/zod
```

```vue
<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

const schema = toTypedSchema(z.object({
  title: z.string().min(1, '제목을 입력해 주세요.').max(60, '60자 이하'),
  content: z.string().min(1, '내용을 입력해 주세요.'),
  visibility: z.enum(['public', 'private']),
  images: z.array(z.object({ url: z.string(), name: z.string() })).max(5, '최대 5장'),
}))

const { handleSubmit, errors, defineField, setErrors } = useForm({ validationSchema: schema })
const [title] = defineField('title')

const onSubmit = handleSubmit(async (values) => {
  try {
    await diaryApi.create(values)
  } catch (e) {
    if (e instanceof ApiError && e.fields) setErrors(e.fields)  // 서버 오류를 필드에 매핑
  }
})
</script>
```

### 6-6. 라우팅 심화

**① 중첩 라우트와 레이아웃**

```ts
const routes = [
  {
    path: '/',
    component: DefaultLayout,       // 부모 = 레이아웃
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'diary-list', component: () => import('@/pages/diary-list') },
      {
        path: 'diaries/:id',
        component: () => import('@/pages/diary-detail'),
        children: [                 // 상세 안의 탭
          { path: '', name: 'diary-detail', component: DiaryContent },
          { path: 'comments', name: 'diary-comments', component: DiaryComments },
        ],
      },
    ],
  },
]
```

**② 권한을 라우트 메타로 선언하고, 가드에서 한 번에 검사**

```ts
meta: { requiresAuth: true, roles: ['admin'] }

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) return { name: 'login', query: { redirect: to.fullPath } }
  if (to.meta.roles && !to.meta.roles.includes(auth.role)) return { name: 'forbidden' }
})
```

**③ 코드 스플리팅 + 프리페치**

`() => import()` 는 이미 청크를 쪼갠다. 여기에 **마우스가 링크에 올라가면 미리 받기** 를 더한다.

```vue
<RouterLink :to="link" @mouseenter="prefetch(link)">…</RouterLink>
```

**④ 데이터 로딩 위치** — 3가지 전략

| 전략 | 방식 | 장단 |
| --- | --- | --- |
| 컴포넌트 안에서 | `onMounted` / Vue Query | 간단. 화면 깜빡임 있음 |
| 라우트 진입 전 | `beforeEnter` 에서 fetch | 깜빡임 없음. 이동이 느려 보임 |
| 라우트 진입 + 스켈레톤 | 진입은 즉시, 데이터는 로딩 UI | **대부분 이게 정답** |

### 6-7. 에러 처리 아키텍처

**① 전역 에러 핸들러 — 놓친 오류를 잡는 그물**

```ts
// app/providers/errorHandler.ts
app.config.errorHandler = (err, instance, info) => {
  console.error(err, info)
  Sentry.captureException(err)                  // 에러 추적 서비스로
  useUiStore().notify.error('예상치 못한 오류가 발생했습니다.')
}

window.addEventListener('unhandledrejection', (e) => Sentry.captureException(e.reason))
```

**② 에러 바운더리 컴포넌트 — 한 화면이 깨져도 앱 전체가 죽지 않게**

```vue
<!-- shared/ui/ErrorBoundary.vue -->
<script setup>
import { onErrorCaptured, ref } from 'vue'
const error = ref(null)
onErrorCaptured((err) => { error.value = err; return false })  // 위로 전파 막기
</script>
<template>
  <slot v-if="!error" />
  <div v-else class="error-boundary">
    <p>이 영역을 불러오지 못했습니다.</p>
    <BaseButton @click="error = null">다시 시도</BaseButton>
  </div>
</template>
```

```vue
<ErrorBoundary><CalendarSidebar /></ErrorBoundary>   <!-- 캘린더가 깨져도 본문은 산다 -->
```

**③ 에러 추적 도입 — Sentry**

```bash
npm install @sentry/vue
```

```ts
Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 0.1,
  environment: import.meta.env.MODE,
})
```

이걸 넣으면 "사용자가 뭘 눌렀을 때 어디서 터졌는지" 가 스택 트레이스와 함께 대시보드에 쌓인다.
대형 프로젝트에서 **console.log 디버깅은 불가능**하다. 사용자 화면을 볼 수 없기 때문이다.

### 6-8. 성능 심화

**① 번들 분석 — 뭐가 무거운지 눈으로 본다**

```bash
npm install -D rollup-plugin-visualizer
```

```js
// vite.config.js
import { visualizer } from 'rollup-plugin-visualizer'
plugins: [vue(), visualizer({ open: true, gzipSize: true })]
```

빌드하면 트리맵이 뜬다. `moment`(무겁다 → `date-fns`), `lodash`(전체 import → 함수별 import) 같은 범인을 찾는다.

**② 렌더링 최적화**

```vue
<!-- 큰 목록: 화면에 보이는 것만 그린다 (가상 스크롤) -->
<script setup>
import { useVirtualizer } from '@tanstack/vue-virtual'
</script>

<!-- 자주 안 바뀌는 무거운 서브트리: v-memo -->
<DiaryCard v-for="d in items" :key="d.id" v-memo="[d.likeCount, d.commentCount]" :diary="d" />

<!-- 조건부로만 필요한 무거운 컴포넌트: 지연 + Suspense -->
<Suspense><template #default><HeavyChart /></template><template #fallback><Spinner /></template></Suspense>
```

**③ Core Web Vitals 를 지표로 관리**

| 지표 | 뜻 | 목표 | 프론트에서 하는 일 |
| --- | --- | --- | --- |
| LCP | 가장 큰 콘텐츠가 뜨는 시간 | < 2.5s | 히어로 이미지 프리로드, 폰트 최적화, 코드 스플리팅 |
| INP | 클릭 후 반응까지 | < 200ms | 무거운 계산은 웹 워커/디바운스, 긴 목록 가상화 |
| CLS | 레이아웃이 튀는 정도 | < 0.1 | 이미지·광고 자리에 `aspect-ratio` 미리 확보 |

```ts
import { onLCP, onINP, onCLS } from 'web-vitals'
onLCP((m) => analytics.send('web-vital', m))
```

**④ 이미지 파이프라인**

```vue
<img
  :src="thumb"
  :srcset="`${w320} 320w, ${w640} 640w`"
  sizes="(max-width: 600px) 100vw, 320px"
  loading="lazy" decoding="async"
  width="320" height="200"        
/>
```

빌드 타임 처리는 `vite-imagetools`, 런타임 리사이즈는 백엔드/CDN(예: Cloudflare Images)에 맡긴다.

### 6-9. i18n · 접근성 · 테마

**① 국제화 — 글자를 코드에서 뺀다**

```bash
npm install vue-i18n
```

```ts
// locales/ko.json, en.json
{ "diary": { "empty": "아직 기록이 없습니다.", "count": "{n}개의 기록" } }
```

```vue
<p>{{ t('diary.empty') }}</p>
<p>{{ t('diary.count', { n: items.length }) }}</p>
```

> 처음부터 `t()` 로 감싸는 습관을 들이면, 나중에 번역이 필요해질 때 파일만 추가하면 된다.
> 문자열이 코드에 박혀 있으면 전체를 다시 훑어야 한다.

**② 접근성 — 대형 앱에서 자동화한다**

```bash
npm install -D vitest-axe   # 컴포넌트 테스트에서 접근성 위반 검사
npm install -D @axe-core/playwright   # E2E 에서 페이지 전체 검사
```

**③ 다크 모드 아키텍처**

```css
/* shared/ui/theme.css — 역할(role) 토큰만 스왑한다 */
:root { --surface: #fff; --text: #23211e; }
:root[data-theme="dark"] { --surface: #1a1a1a; --text: #e8e8e8; }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { --surface: #1a1a1a; --text: #e8e8e8; }
}
```

```ts
// 시스템 설정 따르기 + 사용자 선택 저장
const theme = useLocalStorage('theme', 'system')
watchEffect(() => {
  document.documentElement.dataset.theme =
    theme.value === 'system' ? '' : theme.value
})
```

### 6-10. 테스트 전략

**테스트 피라미드 — 아래가 많고 위가 적다**

```
      /\        E2E (Playwright)         적게. 핵심 흐름 5~10개. 느리지만 진짜에 가깝다.
     /  \       느림·비쌈
    /----\      컴포넌트 (Testing Library + MSW)   중간. 화면 단위 동작.
   /      \
  /--------\    단위 (Vitest)            많이. 유틸·컴포저블·스토어. 빠르고 싸다.
```

```ts
// 단위 — shared/lib/date.spec.ts
import { toDateKey } from './date'
it('KST 새벽 2시는 그 날짜로 나온다', () => {
  expect(toDateKey(new Date('2026-08-29T17:00:00Z'))).toBe('2026-08-30')
})
```

```ts
// 컴포넌트 — MSW 로 네트워크를 가로챈다 (진짜 서버 없이)
import { render, screen } from '@testing-library/vue'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/msw'

it('빈 목록이면 안내와 버튼을 보여준다', async () => {
  server.use(http.get('/api/diaries', () => HttpResponse.json({ items: [] })))
  render(DiaryListPage)
  expect(await screen.findByText('아직 기록이 없습니다.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '첫 기록 남기기' })).toBeInTheDocument()
})
```

```ts
// E2E — 실제 브라우저, 실제(또는 테스트) 서버
test('로그인하고 다이어리를 쓴다', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('이메일').fill('a@b.com')
  await page.getByLabel('비밀번호').fill('test1234')
  await page.getByRole('button', { name: '로그인' }).click()
  await expect(page).toHaveURL('/')
  await page.getByRole('link', { name: '새 기록' }).click()
  await page.getByLabel('제목').fill('오늘의 기록')
  await page.getByRole('button', { name: '저장' }).click()
  await expect(page.getByText('오늘의 기록')).toBeVisible()
})
```

**무엇을 테스트하나?**

| 우선순위 | 대상 | 이유 |
| --- | --- | --- |
| 1 | 유틸·컴포저블 (날짜, 검증, 권한 판단) | 깨지면 사방이 조용히 틀어진다. 가장 싸다 |
| 2 | 스토어 액션 | 낙관적 동기화 같은 로직 |
| 3 | 핵심 화면 4~5개 (로그인, 목록, 작성, 상세) | 회귀 방지 |
| 4 | E2E 로 "가입→작성→조회" 한 줄기 | 배포 전 최종 확인 |

**하지 말 것:** 스타일·마크업 세부를 스냅샷으로 잔뜩 찍기. 리팩터링할 때마다 다 깨져서 아무도 안 본다.

> **이 프로젝트의 실제 테스트**: 피라미드의 아래 두 층이 이미 있다 — 단위(`utils/*.test.js`,
> `usePagedList.test.js`, `stores/comment.test.js`)와 컴포넌트(`BaseButton`, `CalendarPanel`, `DiaryCard`).
> 위 예시의 Testing Library + MSW 대신 기본 도구(Vue Test Utils, `vi.mock`)를 썼다. 지도는 [07 6장](07-vue-advanced.md).

### 백지 재현 과제 (2회독)

1. 이 프로젝트를 FSD 구조(`shared`/`entities`/`features`/`pages`)로 재배치하고, ESLint 로 의존성 방향을 강제한다
2. `Diary`, `Comment`, `User` 를 zod 스키마로 정의하고 API 응답을 파싱하며 검증한다
3. 다이어리 목록·상세·좋아요를 Vue Query 로 옮기고, 좋아요에 낙관적 업데이트를 넣는다
4. `useDiarySearch` 컴포저블로 검색 로직(디바운스 + 라우터 쿼리 동기화 + 조회)을 한 파일에 모은다
5. Vitest 단위 테스트 10개 + MSW 를 쓴 컴포넌트 테스트 3개 + Playwright E2E 1개를 작성한다

### 확장 과제 (3회독)

1. `shared/ui` 를 별도 워크스페이스 패키지로 분리하고 Storybook 을 붙인다
2. Sentry 를 연동하고, 일부러 오류를 던져 대시보드에 잡히는지 확인한다
3. `web-vitals` 로 LCP/INP/CLS 를 수집해 콘솔에 찍고, LCP 를 개선한다 (히어로 이미지 프리로드)
4. `vue-i18n` 으로 한국어/영어를 전환하고, 날짜·숫자도 로케일에 맞게 포맷한다

### Level 6 체크리스트

- [ ] 기술별 폴더와 기능별 폴더의 차이, 전환 시점을 설명할 수 있다
- [ ] FSD 의존성 방향 규칙을 말할 수 있고 도구로 강제하는 법을 안다
- [ ] TS 타입을 "경계에 둔다"는 말의 의미를 안다
- [ ] zod 로 타입과 런타임 검증을 동시에 얻는 이유를 안다
- [ ] 서버 상태와 클라이언트 상태를 나누는 기준을 안다
- [ ] 컴포저블과 컴포넌트의 책임 분리를 할 수 있다
- [ ] 에러 바운더리와 전역 에러 핸들러의 역할을 구분한다
- [ ] 테스트 피라미드에 따라 무엇을 얼마나 테스트할지 판단할 수 있다

---

## Level 7 — 팀·릴리스·운영 (프로덕션)

### 목표

혼자 만든 것을 **여러 명이 함께 고치고, 안전하게 배포하고, 문제를 빨리 찾는** 체계로 만든다.

### 7-1. Git 협업

**브랜치 전략 — 소규모 팀은 Trunk-Based 가 낫다**

```
main  ──●────●────●────●────●──   항상 배포 가능한 상태
         \       \       \
          feat/like  feat/i18n  fix/login   짧게 살고 (1~3일) 바로 머지
```

- `main` 에 직접 push 금지 (브랜치 보호 규칙)
- 브랜치는 작게, 짧게. 오래 살수록 충돌이 커진다
- 머지 후 브랜치 삭제

**커밋 컨벤션 — Conventional Commits**

```
feat: 다이어리 좋아요 낙관적 업데이트 추가
fix: KST 새벽에 날짜가 하루 밀리는 문제 수정
refactor: 검증 로직을 useDiaryForm 으로 분리
chore: @tanstack/vue-query 5.x 로 업데이트
docs: 백엔드 API 규약 문서 추가
```

→ 이 형식을 지키면 **CHANGELOG 와 버전 번호를 자동 생성**할 수 있다 (`changesets`, `semantic-release`).

**PR 규칙**

- 하나의 PR = 하나의 목적. 300줄 넘으면 쪼갠다 (리뷰어가 집중력을 잃는다)
- PR 설명에 "무엇을 왜" 와 "테스트 방법" 을 쓴다
- `CODEOWNERS` 파일로 특정 폴더 변경 시 담당자 자동 리뷰 지정

```
# .github/CODEOWNERS
/src/shared/ui/      @design-system-team
/src/features/auth/  @security-team
```

### 7-2. 모노레포

프론트와 백엔드, 공유 타입, 디자인 시스템이 한 저장소에 있으면 관리가 쉽다.

```
my-project/
├─ apps/
│  ├─ web/          (이 Vue 앱)
│  └─ api/          (백엔드)
├─ packages/
│  ├─ ui/           디자인 시스템
│  ├─ types/        프론트-백엔드 공유 타입 (API 응답 스키마)
│  └─ config/       공유 eslint / tsconfig
├─ pnpm-workspace.yaml
└─ turbo.json
```

```yaml
# pnpm-workspace.yaml
packages: ['apps/*', 'packages/*']
```

```json
// turbo.json — 바뀐 것만 빌드/테스트한다 (캐시). Turbo 2.x 는 "pipeline" 대신 "tasks".
{ "tasks": {
  "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
  "test":  { "dependsOn": ["build"] },
  "lint":  {}
}}
```

> **가장 큰 이득: 타입 공유.** `packages/types` 에 API 응답 스키마(zod)를 두면
> 백엔드가 응답 모양을 바꾸는 순간 프론트엔드 빌드가 깨진다. **배포 전에** 안다.

### 7-3. CI/CD

```yaml
# .github/workflows/ci.yml
name: CI
on: [pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test
      - run: pnpm build
      - run: pnpm exec playwright test         # E2E
```

**파이프라인 원칙**

- 빠른 것부터 (lint → type-check → 단위 테스트 → 빌드 → E2E). 앞에서 떨어지면 뒤는 안 돈다
- `--frozen-lockfile` 로 lockfile 과 다르면 실패시킨다 (재현성)
- PR 마다 **프리뷰 배포** (Vercel/Netlify/Cloudflare Pages 자동) → 리뷰어가 실제 화면을 본다
- `main` 머지 → 자동으로 프로덕션 배포

**배포 게이트 (품질 예산)**

```yaml
      - run: pnpm exec size-limit          # 번들 크기가 기준 초과면 실패
      - run: pnpm exec lhci autorun        # Lighthouse 점수 미달이면 실패
```

### 7-4. 환경 분리와 설정

```
.env                    로컬 (git 제외)
.env.development         개발 기본값 (git 포함, 비밀 아님)
.env.production         프로덕션 빌드 (비밀은 여기 아님 — 호스팅 환경변수)
```

```ts
// shared/config/index.ts — 한 곳에서 읽고 검증한다
import { z } from 'zod'
const env = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_ENV: z.enum(['development', 'staging', 'production']),
}).parse(import.meta.env)      // 필수 값이 없으면 빌드가 즉시 실패
export const config = { apiBaseUrl: env.VITE_API_BASE_URL, ... }
```

> **`import.meta.env.VITE_*` 를 컴포넌트 여기저기서 직접 읽지 않는다.**
> 백엔드 교과서 2-6 절과 같은 원칙 — 설정은 한 파일에서 읽고 검증한다.

**Feature Flag — 배포와 공개를 분리한다**

```ts
if (config.flags.newEditor) { /* 새 에디터 */ } else { /* 기존 */ }
```

미완성 기능도 `main` 에 머지하고 flag 를 꺼둔다 → 브랜치가 오래 살지 않는다.
특정 사용자에게만 켜서 점진적으로 배포(canary)할 수도 있다.

### 7-5. 관측 — 배포 후에 무슨 일이 일어나는지 본다

| 도구 종류 | 무엇을 답하나 | 예 |
| --- | --- | --- |
| 에러 추적 | "어디서 터졌나?" | Sentry |
| 제품 분석 | "사용자가 뭘 하나? 어디서 이탈하나?" | PostHog, Amplitude |
| 세션 리플레이 | "이 사용자가 정확히 뭘 눌렀나?" | PostHog, LogRocket |
| 실사용자 성능(RUM) | "실제 사용자의 LCP 는?" | web-vitals + 분석 도구 |
| 가동 모니터링 | "사이트가 살아있나?" | 업타임 체커 |

> **개인 프로젝트와 프로덕션의 가장 큰 차이가 이것이다.**
> 개인 프로젝트: 내가 브라우저를 열어 확인한다.
> 프로덕션: 수천 명이 각자 다른 기기·네트워크·브라우저에서 쓴다. **도구 없이는 장님이다.**

### 7-6. 문서화

| 문서 | 목적 | 위치 |
| --- | --- | --- |
| `README.md` | 5분 안에 로컬 실행 | 저장소 루트 |
| `CONTRIBUTING.md` | 브랜치·커밋·PR 규칙 | 저장소 루트 |
| `docs/adr/` | "왜 이렇게 결정했나" 기록 (ADR) | 예: `0001-use-vue-query.md` |
| Storybook | 컴포넌트 카탈로그 | 배포된 URL |
| API 규약 | 프론트-백 인터페이스 | 백엔드 OpenAPI |

**ADR(Architecture Decision Record) 예시**

```markdown
# 0003. 서버 상태를 Vue Query 로 관리한다
## 상태: 채택 (2026-09)
## 맥락
Pinia 스토어에 서버 데이터와 화면 상태가 섞여, 캐시 무효화 로직이 스토어마다 중복됨.
## 결정
서버에서 온 데이터는 Vue Query, 순수 클라이언트 상태만 Pinia.
## 결과
- 좋다: 재요청/중복제거/낙관적 업데이트를 라이브러리가 처리
- 비용: 팀이 새 라이브러리를 학습해야 함, 번들 +13KB
```

> ADR 은 **미래의 팀원(6개월 뒤의 나 포함)이 "왜 이렇게 짰지?" 라고 물을 때** 답이 된다.
> 코드는 "무엇을" 말하지만 "왜" 는 말하지 않는다.

### 7-7. 접근성·보안·성능을 CI 로 강제

```yaml
      - run: pnpm exec vitest run --coverage   # 커버리지 하한선
      - run: pnpm audit --audit-level=high     # 취약한 의존성
      - run: pnpm exec playwright test a11y.spec.ts   # axe 검사
```

**프론트엔드 보안 기본**

- 사용자 입력을 `v-html` 에 넣지 않는다. 꼭 필요하면 `DOMPurify` 로 정화
- 토큰은 XSS 에 노출되는 `localStorage` 대신 `HttpOnly` 쿠키 고려 (백엔드 협의)
- 외부 스크립트는 최소화, CSP 헤더 설정 (백엔드/CDN)
- 의존성은 `dependabot` / `renovate` 로 자동 업데이트 PR

### 백지 재현 과제 (2회독)

1. 저장소에 브랜치 보호, `CODEOWNERS`, PR 템플릿, Conventional Commits 린트(`commitlint`)를 설정한다
2. GitHub Actions 로 lint → type-check → test → build → E2E 파이프라인을 만든다
3. PR마다 프리뷰가 배포되도록 Cloudflare Pages(또는 Vercel)를 연결한다
4. `size-limit` 으로 번들 예산을 걸고, 일부러 큰 라이브러리를 추가해 CI 가 막는지 확인한다
5. ADR 3개를 쓴다 (라우터 선택, 상태관리 선택, CSS 전략)

### 확장 과제 (3회독)

1. 이 프로젝트를 pnpm 워크스페이스 모노레포로 만들고 `packages/types` 로 API 타입을 프론트-백이 공유하게 한다
2. Feature Flag 시스템을 만들어 "새 캘린더 UI" 를 flag 뒤에 둔다
3. PostHog(또는 유사 도구)를 붙여 "작성 버튼 클릭 → 저장 완료" 전환율을 추적한다
4. Lighthouse CI 를 붙이고 성능 점수 90 미만이면 배포를 막는다

### Level 7 체크리스트

- [ ] Trunk-Based 브랜치 전략과 짧은 브랜치의 이유를 안다
- [ ] Conventional Commits 가 자동화(CHANGELOG, 버전)로 이어지는 것을 안다
- [ ] CI 파이프라인의 단계 순서를 왜 그렇게 두는지 설명할 수 있다
- [ ] 모노레포에서 타입 공유의 이점을 안다
- [ ] "배포"와 "기능 공개"를 Feature Flag 로 분리하는 이유를 안다
- [ ] 프로덕션에서 관측 도구가 필수인 이유를 설명할 수 있다
- [ ] ADR 을 쓸 수 있고, 왜 코드 주석으로 부족한지 안다

---

## 최종 관문 II — 대형 프로젝트 시뮬레이션

Level 6~7 을 마친 뒤 도전한다. 혼자서도 "팀 프로젝트처럼" 만든다.

```
[구조]
- pnpm 모노레포: apps/web, apps/api, packages/ui, packages/types
- FSD 구조, ESLint 로 의존성 방향 강제
- TypeScript strict 모드, API 경계 zod 검증

[상태]
- 서버 상태: Vue Query, 클라이언트 상태: Pinia, URL 상태: 라우터
- 좋아요·댓글에 낙관적 업데이트

[품질]
- 단위 테스트 커버리지 60% 이상 (유틸·컴포저블·스토어)
- 컴포넌트 테스트 (MSW), E2E 5개 (Playwright)
- Storybook 에 shared/ui 전체

[릴리스]
- GitHub Actions: lint → type-check → test → build → E2E
- PR 프리뷰 배포, main 머지 시 프로덕션 배포
- 번들 예산(size-limit) + Lighthouse CI 게이트
- Conventional Commits + 자동 CHANGELOG

[운영]
- Sentry 에러 추적
- web-vitals 수집
- i18n (한/영), 다크 모드
- ADR 5개 이상
```

**완성 기준**

- [ ] 새 개발자가 `README` 만 보고 10분 안에 로컬을 띄운다
- [ ] `features/` 의 한 기능을 통째로 지워도 다른 기능이 빌드된다
- [ ] 백엔드가 API 필드를 바꾸면 프론트 `type-check` 가 실패한다
- [ ] 잘못된 방향의 import 를 하면 ESLint 가 막는다
- [ ] 큰 라이브러리를 추가하면 CI 가 번들 예산 초과로 막는다
- [ ] 프로덕션에서 오류가 나면 Sentry 에 사용자 행동과 함께 잡힌다
- [ ] 미완성 기능이 flag 뒤에서 `main` 에 머지되어 있다

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
   ↓
═══ 이 프로젝트 수준 달성. 아래는 대형 프로젝트로 ═══
   ↓
Level 6  FSD 구조 / TS·zod / 서버상태 분리 / 테스트 전략   ← 바꾸기 쉬운 코드
   ↓
Level 7  Git 협업 / 모노레포 / CI·CD / 관측 / ADR          ← 팀과 프로덕션
   ↓
최종 관문 II  대형 프로젝트 시뮬레이션 (혼자서 팀처럼)
```

백엔드는 [06 백엔드](06-backend.md) 를 함께 본다.
Level 4(서버 통신)를 할 때 백엔드 Level 4(인증·권한)를 같이 보면 이해가 빠르다.

다 끝나면 [07 Vue 심화](07-vue-advanced.md) → [08 어떤 프로젝트든 만드는 법](08-build-any-project.md) → [09 배포](09-deploy.md) 로 간다.
