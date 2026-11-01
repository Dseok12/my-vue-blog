# Stage 4 — 브라우저 JavaScript: 화면을 움직이고 서버와 대화하기

> 전체 로드맵: [README](README.md) · 이전: [03 JavaScript 기초](03-javascript.md) · 다음: [05 Vue](05-vue.md)

## 목표

- DOM 으로 HTML 요소를 찾고, 바꾸고, 만든다
- 클릭·입력·제출 같은 이벤트에 반응한다
- `localStorage` 에 데이터를 저장한다
- 비동기(Promise, async/await)를 이해하고 `fetch` 로 서버와 대화한다
- **Vue 없이** 할 일 앱을 완성하고, 그 불편함으로 **Vue 가 왜 필요한지** 몸으로 이해한다

---

## 4-1. DOM — HTML 을 JavaScript 로 다루기

브라우저는 HTML 을 읽어서 **DOM(Document Object Model)** 이라는 나무 모양 객체를 만든다.
JavaScript 는 이 나무를 읽고 고칠 수 있다. **화면을 바꾼다 = DOM 을 바꾼다.**

```
document
└─ html
   ├─ head
   │  └─ title
   └─ body
      ├─ h1        "내 다이어리"
      ├─ form#todo-form
      │  ├─ input
      │  └─ button
      └─ ul.todo-list
```

```html
<!-- index.html — script 는 body 맨 끝에 둔다 (HTML 을 다 읽은 뒤 실행되도록) -->
<body>
  <h1 class="title">내 다이어리</h1>
  <p id="count">0개</p>
  <button type="button" class="add-button">추가</button>
  <ul class="list"></ul>
  <script src="app.js"></script>
</body>
```

```js
// app.js

// 찾기
const title = document.querySelector('.title')         // CSS 선택자로 첫 번째 하나
const buttons = document.querySelectorAll('button')    // 전부 (배열 비슷한 것)
const count = document.querySelector('#count')

// 내용 바꾸기
title.textContent = '오늘의 다이어리'                    // 글자만 (안전)
count.textContent = 3 + '개'

// 속성·클래스 바꾸기
title.classList.add('title--active')
title.classList.remove('title--active')
title.classList.toggle('title--active')                // 있으면 빼고 없으면 넣는다
button.disabled = true
image.src = 'photo.jpg'

// 새로 만들어 붙이기
const item = document.createElement('li')
item.textContent = '새 할 일'
item.className = 'list__item'
document.querySelector('.list').append(item)

// 지우기
item.remove()
```

> **`innerHTML` 주의 — 보안**
> `el.innerHTML = '<b>' + userInput + '</b>'` 처럼 **사용자가 입력한 값**을 HTML 로 넣으면,
> 누군가 `<img src=x onerror="토큰훔치기()">` 를 입력했을 때 그 코드가 실행된다 (XSS 공격).
> **사용자 입력은 항상 `textContent` 로 넣는다.** Vue 의 `{{ }}` 는 자동으로 이렇게 처리해 준다.

---

## 4-2. 이벤트 — 사용자 행동에 반응하기

```js
const button = document.querySelector('.add-button')

button.addEventListener('click', () => {
  console.log('눌렸다!')
})

// 이벤트 객체 — 무슨 일이 있었는지 정보가 담겨 온다
input.addEventListener('input', (event) => {
  console.log(event.target.value)       // 지금 입력창에 적힌 값
})

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') console.log('엔터!')
  if (event.key === 'Escape') console.log('ESC!')
})

// 폼 제출 — 반드시 기본 동작(새로고침)을 막는다
form.addEventListener('submit', (event) => {
  event.preventDefault()
  // ... 저장 처리
})
```

| 이벤트 | 언제 |
| --- | --- |
| `click` | 클릭 |
| `input` | 입력창 값이 바뀔 때마다 (글자 하나하나) |
| `change` | 값이 확정됐을 때 (체크박스, select, 파일 선택) |
| `submit` | 폼 제출 (엔터 또는 submit 버튼) |
| `keydown` | 키를 눌렀을 때 |
| `focus` / `blur` | 포커스를 얻었을 때 / 잃었을 때 |
| `dragover` / `drop` | 파일을 끌어다 놓을 때 (이 프로젝트의 이미지 업로드) |

### 이벤트 위임 — 목록의 버튼을 한 번에

목록의 항목마다 삭제 버튼이 있으면, 버튼마다 리스너를 다는 대신 **부모 하나**에 단다.

```js
list.addEventListener('click', (event) => {
  const button = event.target.closest('.list__remove')   // 누른 곳에서 가장 가까운 삭제 버튼
  if (!button) return
  const id = button.dataset.id                           // <button data-id="3"> 의 값
  removeTodo(id)
})
```

### 이벤트 전파 — 클릭은 위로 올라간다

```
<li>                     ③ li 도 click 을 받는다
  <article>              ② article 도 받는다
    <button>             ① 여기를 클릭하면
```

`event.stopPropagation()` 으로 막을 수 있지만, 필요해지면 **구조를 의심**한다.
(이 프로젝트가 카드 링크 안의 좋아요 버튼을 고친 이유 — [05 Vue 5-2](05-vue.md))

---

## 4-3. 저장하기 — localStorage

브라우저에 문자열을 저장한다. 새로고침해도, 브라우저를 껐다 켜도 남는다.

```js
localStorage.setItem('theme', 'dark')
localStorage.getItem('theme')        // 'dark' (없으면 null)
localStorage.removeItem('theme')

// 객체·배열은 문자열로 바꿔서 저장한다 (JSON)
const todos = [{ id: 1, text: '공부하기', done: false }]
localStorage.setItem('todos', JSON.stringify(todos))         // 객체 → 문자열
const saved = JSON.parse(localStorage.getItem('todos') || '[]')   // 문자열 → 객체
```

이 프로젝트는 로그인 토큰([stores/auth.js](../frontend/src/stores/auth.js))과
사이드바 열림 상태([stores/ui.js](../frontend/src/stores/ui.js))를 localStorage 에 둔다.
mock 모드에서는 **다이어리 데이터 전체**를 localStorage 에 둔다 ([api/mock/db.js](../frontend/src/api/mock/db.js)).

> **비밀번호 같은 민감한 값은 절대 localStorage 에 두지 않는다.** 그 페이지의 모든 스크립트가 읽을 수 있다.

---

## 4-4. 실습 — 순수 JavaScript 할 일 앱

**이 실습이 Stage 4 의 핵심이다.** 직접 타이핑하고, 동작시키고, 기능을 덧붙인다.

### 요구사항

1. 입력창에 쓰고 엔터(또는 추가 버튼)를 누르면 목록에 추가된다. 빈 값은 추가하지 않는다
2. 각 항목에 체크박스(완료)와 삭제 버튼이 있다. 완료하면 취소선
3. 아래에 "3개 중 1개 완료" 가 표시된다
4. 할 일이 없으면 "할 일이 없습니다" 가 보인다
5. 새로고침해도 남아 있다 (localStorage)

### `todo.html`

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>할 일</title>
    <link rel="stylesheet" href="todo.css" />
  </head>
  <body>
    <main class="todo">
      <h1 class="todo__title">할 일</h1>

      <form class="todo__form">
        <label class="u-sr-only" for="todo-input">할 일</label>
        <input id="todo-input" class="todo__input" placeholder="할 일을 입력하세요" />
        <button class="todo__add" type="submit">추가</button>
      </form>

      <p class="todo__empty">할 일이 없습니다.</p>
      <ul class="todo__list"></ul>
      <p class="todo__summary"></p>
    </main>
    <script src="todo.js"></script>
  </body>
</html>
```

### `todo.js`

```js
const STORAGE_KEY = 'todo.items'

// ① 상태(데이터) — 화면은 이 배열을 "그린 결과" 일 뿐이다
let todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')

// ② 요소 찾기
const form = document.querySelector('.todo__form')
const input = document.querySelector('.todo__input')
const list = document.querySelector('.todo__list')
const empty = document.querySelector('.todo__empty')
const summary = document.querySelector('.todo__summary')

// ③ 상태를 저장하고, 화면을 다시 그린다
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

function render() {
  list.innerHTML = ''                       // 목록을 비우고 처음부터 다시 그린다

  for (const todo of todos) {
    const item = document.createElement('li')
    item.className = 'todo__item' + (todo.done ? ' todo__item--done' : '')

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = todo.done
    checkbox.dataset.id = todo.id
    checkbox.className = 'todo__check'

    const text = document.createElement('span')
    text.textContent = todo.text            // 사용자 입력은 textContent 로!

    const remove = document.createElement('button')
    remove.type = 'button'
    remove.textContent = '삭제'
    remove.dataset.id = todo.id
    remove.className = 'todo__remove'

    item.append(checkbox, text, remove)
    list.append(item)
  }

  const doneCount = todos.filter((todo) => todo.done).length
  summary.textContent = todos.length + '개 중 ' + doneCount + '개 완료'
  empty.hidden = todos.length > 0
  summary.hidden = todos.length === 0
}

// ④ 상태를 바꾸는 함수들 — 바꾼 뒤 항상 save + render
function addTodo(text) {
  todos.push({ id: Date.now(), text, done: false })
  save()
  render()
}

function toggleTodo(id) {
  const target = todos.find((todo) => todo.id === id)
  if (target) target.done = !target.done
  save()
  render()
}

function removeTodo(id) {
  todos = todos.filter((todo) => todo.id !== id)
  save()
  render()
}

// ⑤ 이벤트 연결
form.addEventListener('submit', (event) => {
  event.preventDefault()
  const text = input.value.trim()
  if (!text) return
  addTodo(text)
  input.value = ''
  input.focus()
})

list.addEventListener('click', (event) => {           // 이벤트 위임
  const id = Number(event.target.dataset.id)
  if (event.target.matches('.todo__check')) toggleTodo(id)
  if (event.target.matches('.todo__remove')) removeTodo(id)
})

render()   // 처음 한 번 그린다
```

`todo.css` 는 02 에서 배운 것과 이 프로젝트의 `variables.css` 로 직접 꾸민다.

### 확장 과제

1. "전체 / 진행 중 / 완료" 필터 버튼
2. 항목을 더블클릭하면 수정 모드 (`<span>` ↔ `<input>` 전환)
3. "완료한 항목 모두 지우기" 버튼

### 그리고 느껴 보자 — 무엇이 불편했나?

확장 과제까지 하고 나면 이런 생각이 든다.

1. **`render()` 를 부르는 것을 잊으면 화면과 데이터가 어긋난다.** 매번 `save(); render()` 를 직접 불러야 한다
2. **`createElement`, `append`, `className` …** 화면 하나 그리는 코드가 너무 길다. HTML 처럼 보이지 않는다
3. 목록 전체를 지우고 다시 그린다 — 입력 중이던 수정 창도 날아간다
4. 화면이 10개가 되면? 이 파일 하나에 다 넣을 수 없다. 나누는 방법이 없다

**Vue 는 정확히 이 네 가지를 해결한다.**

| 순수 JS 의 불편 | Vue 의 해결 | 배우는 곳 |
| --- | --- | --- |
| 데이터를 바꾸고 `render()` 를 직접 호출 | **반응성** — `ref` 를 바꾸면 화면이 저절로 바뀐다 | 05 Level 1 |
| `createElement` 지옥 | **템플릿** — HTML 처럼 쓰고 `v-for`, `v-if` 를 덧붙인다 | 05 Level 1 |
| 전부 지우고 다시 그림 | **가상 DOM** — 바뀐 부분만 골라서 고친다 (`:key` 로 구분) | 05 Level 1 |
| 파일 하나에 다 들어감 | **컴포넌트** — `.vue` 파일 하나가 부품 하나 | 05 Level 2 |

같은 할 일 앱을 Vue 로 쓰면 이렇게 된다. (지금 이해 안 돼도 괜찮다. 05 에서 처음부터 배운다)

```vue
<script setup>
import { computed, ref, watch } from 'vue'

const todos = ref(JSON.parse(localStorage.getItem('todo.items') || '[]'))
const text = ref('')
const doneCount = computed(() => todos.value.filter((todo) => todo.done).length)

watch(todos, (value) => localStorage.setItem('todo.items', JSON.stringify(value)), { deep: true })

function addTodo() {
  if (!text.value.trim()) return
  todos.value.push({ id: Date.now(), text: text.value.trim(), done: false })
  text.value = ''
}
</script>

<template>
  <form @submit.prevent="addTodo">
    <input v-model="text" placeholder="할 일을 입력하세요" />
    <button type="submit">추가</button>
  </form>

  <p v-if="!todos.length">할 일이 없습니다.</p>
  <ul v-else>
    <li v-for="todo in todos" :key="todo.id" :class="{ 'todo__item--done': todo.done }">
      <input v-model="todo.done" type="checkbox" />
      <span>{{ todo.text }}</span>
      <button type="button" @click="todos = todos.filter((t) => t.id !== todo.id)">삭제</button>
    </li>
  </ul>
  <p v-if="todos.length">{{ todos.length }}개 중 {{ doneCount }}개 완료</p>
</template>
```

`render()` 가 없다. `save()` 도 `watch` 한 번이면 끝이다.

---

## 4-5. 비동기 — 기다려야 하는 일

서버에 요청하면 답이 오기까지 0.1초~수 초가 걸린다. 그동안 화면이 멈추면 안 된다.
그래서 JavaScript 는 **"끝나면 알려 줘" 하고 다음 줄로 넘어간다.** 이것이 비동기다.

```js
console.log('1. 주문')
setTimeout(() => console.log('3. 커피 나왔습니다'), 2000)   // 2초 뒤에 실행해 줘
console.log('2. 진동벨 받고 자리로')

// 출력 순서: 1 → 2 → (2초 뒤) 3
```

### Promise — "나중에 줄게" 약속

```js
// 시간이 걸리는 일을 Promise 로 감싼다
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function fetchDiary(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === '1') resolve({ id: '1', title: '오늘의 기록' })   // 성공
      else reject(new Error('다이어리를 찾을 수 없습니다.'))         // 실패
    }, 500)
  })
}
```

이 프로젝트의 mock API 는 진짜 서버처럼 보이게 하려고 `delay()` 를 쓴다 ([api/mock/index.js](../frontend/src/api/mock/index.js) 맨 위).

### async / await — 비동기를 순서대로 읽히게

```js
async function showDiary() {
  try {
    console.log('불러오는 중...')
    const diary = await fetchDiary('1')    // 끝날 때까지 "이 함수 안에서만" 기다린다
    console.log(diary.title)
  } catch (error) {
    console.log('실패: ' + error.message)  // reject 되면 여기로
  } finally {
    console.log('로딩 표시 끄기')
  }
}
```

**`try / catch / finally` + `loading` 은 이 프로젝트의 모든 비동기 코드의 기본형이다.**

```js
// stores/diary.js 의 run 함수 — 이 모양을 외운다
async function run(task) {
  loading.value = true
  error.value = ''
  try {
    return await task()
  } catch (err) {
    error.value = err.message
    throw err
  } finally {
    loading.value = false
  }
}
```

```js
// 여러 개를 동시에 — 하나씩 기다리는 것보다 빠르다
const [user, diaries] = await Promise.all([fetchUser(), fetchDiaries()])
```

> **가장 흔한 실수: `await` 를 빼먹기**
> ```js
> const diary = fetchDiary('1')
> console.log(diary.title)    // undefined — diary 에는 아직 "약속(Promise)" 이 들어 있다
> ```

---

## 4-6. fetch — 서버와 대화하기

```js
// 읽기 (GET)
async function loadUsers() {
  const response = await fetch('https://jsonplaceholder.typicode.com/users')
  if (!response.ok) throw new Error('불러오지 못했습니다. (' + response.status + ')')
  const users = await response.json()       // 응답 본문(JSON 문자열) → 객체
  return users
}

// 보내기 (POST)
async function createPost(title) {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),          // 객체 → JSON 문자열
  })
  return response.json()
}
```

**JSON** 은 서버와 주고받는 데이터 형식이다. JavaScript 객체와 거의 같지만, 키에 반드시 큰따옴표를 쓴다.

```json
{ "id": "12", "title": "오늘의 기록", "likeCount": 3, "images": [] }
```

**Network 탭으로 확인하기**: `F12` → Network → 페이지 새로고침 → 요청을 클릭 →
Headers(무엇을 보냈나), Response(무엇이 왔나), 상태 코드(200, 404, 500…)를 본다.
**"화면에 안 나와요" 의 절반은 여기서 원인이 보인다.**

> 이 프로젝트는 `fetch` 대신 **axios** 라는 라이브러리를 쓴다. 하는 일은 같고,
> JSON 변환·오류 처리·토큰 첨부를 한 곳에서 할 수 있어서 편하다. ([05 Vue 4-2](05-vue.md))

### 실습 — 사용자 목록 페이지

<https://jsonplaceholder.typicode.com/users> (연습용 무료 API)를 써서:

1. 페이지가 열리면 "불러오는 중…" 을 보여 주고 사용자 목록을 불러온다
2. 이름과 이메일을 카드로 보여 준다
3. 검색창에 입력하면 이름으로 걸러 보여 준다 (다시 요청하지 않고 이미 받은 배열을 `filter`)
4. 주소를 일부러 틀리게 바꿔서, 실패하면 "불러오지 못했습니다" 와 다시 시도 버튼이 나오게 한다

**네 가지 상태 — 로딩 / 성공 / 빈 결과 / 실패** 를 모두 화면에 표현해야 완성이다.
이것이 이 프로젝트 모든 화면의 기본 원칙이다.

---

## 4-7. 타이머와 디바운스

```js
const timer = setTimeout(() => console.log('3초 뒤'), 3000)
clearTimeout(timer)          // 취소

const interval = setInterval(() => console.log('1초마다'), 1000)
clearInterval(interval)      // 반드시 멈춘다 (안 그러면 영원히 돈다)
```

**디바운스**: 검색창에 "다이어리" 를 칠 때 글자마다(`ㄷ`, `다`, `다이`…) 요청하면 낭비다.
**입력이 멈추고 300ms 뒤에 한 번만** 요청한다.

```js
let searchTimer = null
input.addEventListener('input', (event) => {
  clearTimeout(searchTimer)                       // 이전 예약 취소
  searchTimer = setTimeout(() => {
    search(event.target.value)                    // 마지막 입력 후 300ms 가 지나면 실행
  }, 300)
})
```

---

## 4-8. 모듈과 개발 도구 — Vite 로 넘어가기

파일이 많아지면 브라우저에서도 `import` 를 쓰고 싶다.

```html
<script type="module" src="main.js"></script>
```

하지만 실제 프로젝트에서는 라이브러리(`npm install` 로 받은 것)를 불러오고, 코드를 압축하고,
고치면 바로 화면에 반영되는 기능이 필요하다. 이걸 해 주는 도구가 **Vite** 다. 이 프로젝트도 Vite 를 쓴다.

```bash
npm create vite@latest my-vanilla -- --template vanilla   # Vue 없이 Vite 만
cd my-vanilla
npm install
npm run dev
```

할 일 앱을 이 Vite 프로젝트로 옮겨 보자. 저장하면 브라우저가 **새로고침 없이** 바로 바뀐다.
다음 단계(05)에서는 `--template vue` 로 같은 일을 한다.

---

## 자주 하는 실수

| 실수 | 증상 | 해결 |
| --- | --- | --- |
| `<script>` 를 `<head>` 에 둠 | `querySelector` 가 `null` | `body` 맨 끝에 두거나 `defer` 속성 |
| 선택자 오타 | `Cannot read properties of null` | 콘솔에서 `document.querySelector('...')` 직접 실행 |
| `preventDefault` 누락 | 폼 제출 시 새로고침 | `event.preventDefault()` |
| `await` 누락 | `Promise {<pending>}` 이 찍힘 | `await` 를 붙이고, 함수에 `async` |
| `response.ok` 확인 안 함 | 404 인데도 성공처럼 처리 | `if (!response.ok) throw ...` |
| `dataset.id` 가 문자열 | `===` 비교가 항상 false | `Number(...)` 또는 id 를 문자열로 통일 |
| 사용자 입력을 `innerHTML` 로 | 보안 구멍(XSS) | `textContent` |

## 체크리스트

- [ ] DOM 이 무엇인지 설명하고, `querySelector` 로 요소를 찾아 바꿀 수 있다
- [ ] `addEventListener` 로 click, input, submit 에 반응한다
- [ ] 이벤트 위임을 쓸 수 있다
- [ ] `JSON.stringify` / `JSON.parse` 로 localStorage 에 배열을 저장한다
- [ ] 비동기가 왜 필요한지, `await` 를 빼면 무슨 일이 생기는지 안다
- [ ] `fetch` 로 GET/POST 를 보내고 Network 탭에서 확인한다
- [ ] 로딩 / 성공 / 빈 결과 / 실패 네 가지 상태를 화면에 표현한다
- [ ] 할 일 앱과 사용자 목록 페이지를 완성했다
- [ ] Vue 가 해결해 주는 불편함 네 가지를 말할 수 있다

다음: [05 Vue — 이 프로젝트의 프론트엔드 만들기](05-vue.md)
