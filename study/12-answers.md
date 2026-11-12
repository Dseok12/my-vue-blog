# 부록 — 연습문제 정답과 해설 (01 ~ 04)

> 전체 로드맵: [README](README.md)

**먼저 혼자 풀고 나서 본다.** 20분을 고민해도 안 풀릴 때만 연다.
정답을 본 뒤에는 **창을 닫고 처음부터 다시 쓴다.** 보고 이해한 것과 쓸 수 있는 것은 다르다.

여기 있는 코드는 모두 실제로 실행해서 결과를 확인한 것이다. 내 답이 정답과 달라도
**결과가 같고 읽기 쉬우면 정답이다.** 다른 풀이도 함께 적었다.

---

## 03 JavaScript — 배열 메서드 연습 문제 (3-9)

```js
const scores = [72, 95, 48, 88, 100, 61]
```

### 1. 60점 이상만 고른 배열

```js
scores.filter((s) => s >= 60)
// [72, 95, 88, 100, 61]
```

**해설** "고른다" = `filter`. 화살표 함수가 `true` 를 돌려준 요소만 남는다. 원본 `scores` 는 그대로다.

### 2. 모든 점수에 5점을 더한 배열

```js
scores.map((s) => s + 5)
// [77, 100, 53, 93, 105, 66]
```

**해설** "모두 바꾼다" = `map`. 결과 배열의 길이는 항상 원본과 같다.
`filter` 는 길이가 줄 수 있고, `map` 은 길이가 그대로라는 점으로 구분한다.

### 3. 100점이 있는가?

```js
scores.includes(100)             // true  — 값 그 자체를 찾을 때
scores.some((s) => s === 100)    // true  — 조건으로 찾을 때 (예: s >= 100)
```

### 4. 평균 점수

```js
scores.reduce((sum, s) => sum + s, 0) / scores.length
// 77.33333333333333
```

**해설** `reduce` 가 도는 과정을 표로 그리면 이해된다. (`sum` 의 시작값은 맨 끝의 `0`)

| 차례 | sum (지금까지) | s (이번 요소) | 돌려주는 값 |
| --- | --- | --- | --- |
| 1 | 0 | 72 | 72 |
| 2 | 72 | 95 | 167 |
| 3 | 167 | 48 | 215 |
| 4 | 215 | 88 | 303 |
| 5 | 303 | 100 | 403 |
| 6 | 403 | 61 | **464** |

`464 / 6 = 77.33…`. 소수점 한 자리로 보이려면 `.toFixed(1)` → `'77.3'` (문자열이 된다는 점에 주의).

### 5. 처음으로 90점을 넘는 점수

```js
scores.find((s) => s > 90)
// 95
```

**해설** `find` 는 **첫 번째 하나**만 돌려준다. `filter(...)[0]` 과 결과는 같지만, `find` 는 찾는 즉시 멈추므로 더 빠르고 뜻도 분명하다.

```js
const users = [
  { name: '데모', age: 28, active: true },
  { name: '하루', age: 34, active: false },
  { name: '밤', age: 19, active: true },
]
```

### 6. 활성 사용자의 이름 배열

```js
users.filter((u) => u.active).map((u) => u.name)
// ['데모', '밤']
```

**해설** "고르고(filter) → 바꾼다(map)". 순서를 바꿔 `map` 을 먼저 하면 이름만 남아서 `active` 를 볼 수 없다.
`u.active === true` 라고 쓰지 않아도 된다. 이미 불리언이다.

### 7. 나이 합계

```js
users.reduce((sum, u) => sum + u.age, 0)
// 81
```

**흔한 실수** 초기값 `0` 을 빼먹으면 첫 요소(객체)가 `sum` 이 되어 `'[object Object]3419'` 같은 문자열이 나온다.

### 8. 이름이 '하루' 인 사용자 객체

```js
users.find((u) => u.name === '하루')
// { name: '하루', age: 34, active: false }
```

### 9. 나이 많은 순으로 정렬한 새 배열 (원본은 그대로)

```js
const sorted = [...users].sort((a, b) => b.age - a.age)
sorted.map((u) => u.name)   // ['하루', '데모', '밤']
users[0].name               // '데모'  ← 원본 순서는 그대로
```

**해설** `sort` 는 **원본을 바꾼다.** 그래서 `[...users]` 로 복사한 뒤 정렬한다.
`(a, b) => b.age - a.age` 는 "결과가 음수면 a 가 앞, 양수면 b 가 앞" 이라는 약속이다.
큰 것이 앞에 오게 하려면 `b - a`, 작은 것이 앞이면 `a - b`.

### 10. `{ 데모: 28, 하루: 34, 밤: 19 }` 형태의 객체

```js
users.reduce((result, u) => ({ ...result, [u.name]: u.age }), {})
// { 데모: 28, 하루: 34, 밤: 19 }
```

**해설** 초기값이 빈 객체 `{}` 다. `[u.name]` 처럼 대괄호를 쓰면 **변수의 값**이 키 이름이 된다.
같은 일을 하는 더 읽기 쉬운 방법도 있다.

```js
const result = {}
for (const u of users) {
  result[u.name] = u.age
}

// 또는
Object.fromEntries(users.map((u) => [u.name, u.age]))
```

---

## 03 JavaScript — 종합 실습 (3-17)

### 실습 ① 성적 처리기

```js
const students = [
  { name: '가람', scores: [90, 85, 77] },
  { name: '나래', scores: [60, 72, 58] },
  { name: '다온', scores: [100, 95, 98] },
]

// 반복해서 쓰는 계산은 함수로 뺀다
const average = (list) => list.reduce((sum, n) => sum + n, 0) / list.length

const report = students
  .map((s) => ({ name: s.name, average: average(s.scores) }))
  .map((s) => ({ ...s, result: s.average >= 70 ? '통과' : '재시험' }))
  .sort((a, b) => b.average - a.average)

report.forEach((s, i) => {
  console.log(i + 1 + '등 ' + s.name + ' ' + s.average.toFixed(1) + '점 ' + s.result)
})
```

```
1등 다온 97.7점 통과
2등 가람 84.0점 통과
3등 나래 63.3점 재시험
```

**확인할 점**

- `(s) => ({ ... })` — 화살표 함수가 **객체를 바로 돌려줄 때**는 소괄호로 감싼다. `{ }` 만 쓰면 함수 몸통으로 읽힌다
- `.map()` 이 새 배열을 만들었으므로 그 뒤의 `.sort()` 는 원본 `students` 를 바꾸지 않는다
- `i + 1 + '등 '` — 왼쪽부터 계산하므로 `i + 1` 이 먼저 숫자로 더해진 뒤 문자열이 붙는다

### 실습 ② 다이어리 검색기

```js
function search(list, { keyword = '', category = '', visibility = '' } = {}) {
  const word = keyword.trim().toLowerCase()
  return list
    .filter((d) => (category ? d.category === category : true))
    .filter((d) => (visibility ? d.visibility === visibility : true))
    .filter((d) => (word ? (d.title + ' ' + d.content).toLowerCase().includes(word) : true))
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
}

function countByDate(list) {
  return list.reduce((counts, d) => {
    counts[d.dateKey] = (counts[d.dateKey] || 0) + 1
    return counts
  }, {})
}

function summarize(content, length = 20) {
  const text = String(content || '').replace(/\s+/g, ' ').trim()
  return text.length > length ? text.slice(0, length) + '…' : text
}
```

```js
search(diaries, { visibility: 'public' }).map((d) => d.title)  // ['조금 지친 하루', '미드나잇 라이브러리']
search(diaries, { keyword: '하루' }).map((d) => d.title)       // ['조금 지친 하루']
countByDate(diaries)                                           // { '2026-08-30': 2, '2026-08-29': 1 }
summarize('아침에   창문을 열었더니\n바람이 선선했다.', 12)        // '아침에 창문을 열었더니…'
```

**해설**

- `category ? d.category === category : true` — "조건이 비어 있으면 통과(true)". 빈 필터를 무시하는 관용구다
- `'2026-08-30'.localeCompare('2026-08-29')` — 날짜를 `YYYY-MM-DD` 문자열로 통일하면 **글자 순서 = 날짜 순서** 가 되어 문자열 비교만으로 정렬된다. 이 프로젝트가 `dateKey` 를 이 형식으로 고정한 이유다
- `(counts[d.dateKey] || 0) + 1` — 처음 보는 날짜면 `undefined` 이므로 `0` 으로 바꾼 뒤 1 을 더한다
- `/\s+/g` — 공백·줄바꿈·탭이 **연달아** 나오는 부분을 **모두**(`g`) 찾는다

실제 프로젝트 코드와 비교: [api/mock/index.js](../frontend/src/api/mock/index.js) 의 `listMine` / `monthlyCounts`,
[utils/diary.js](../frontend/src/utils/diary.js) 의 `summarize`. 거의 같을 것이다.

### 실습 ③ 검증 함수

```js
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validateEmail(value) {
  const email = String(value || '').trim()
  if (!email) return '이메일을 입력해 주세요.'
  if (!EMAIL_PATTERN.test(email)) return '이메일 형식이 올바르지 않습니다.'
  return ''
}

function validateNickname(value) {
  const nickname = String(value || '').trim()
  if (!nickname) return '닉네임을 입력해 주세요.'
  if (nickname.length < 2) return '닉네임은 2자 이상이어야 합니다.'
  if (nickname.length > 12) return '닉네임은 12자 이하여야 합니다.'
  return ''
}

function validatePasswordConfirm(value, password) {
  if (!value) return '비밀번호를 한 번 더 입력해 주세요.'
  if (value !== password) return '비밀번호가 일치하지 않습니다.'
  return ''
}

const isValid = (errors) => Object.values(errors).every((message) => !message)
```

```js
validateEmail('a@b')                  // '이메일 형식이 올바르지 않습니다.'
validateEmail(' demo@diary.test ')    // ''   ← 앞뒤 공백은 봐준다
validateNickname(' 한 ')              // '닉네임은 2자 이상이어야 합니다.'
isValid({ email: '', password: '' })  // true
isValid({ email: '', password: 'x' }) // false
```

**정규식 `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$` 읽는 법**

```
^            처음부터
[^\s@]+      공백(\s)과 @ 가 "아닌" 글자가 1개 이상      → demo
@            골뱅이
[^\s@]+      또 1개 이상                              → diary
\.           진짜 점 (그냥 . 은 "아무 글자" 라는 뜻이라 \ 로 막는다)
[^\s@]{2,}   2개 이상                                 → test
$            끝까지
```

> **왜 `String(value || '').trim()` 을 먼저 하나?** 사용자가 주소를 복사해 붙이면 끝에 공백이 딸려 오는 일이 흔하다.
> 이 프로젝트도 처음에는 공백을 "형식 오류" 로 처리하다가 고쳤다. ([11 버그 사례집](11-bug-casebook.md) 사례 9)

---

## 01 HTML — 실습 ② `list.html` 예시 답안

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>내 다이어리 · 나만의 다양한 diary</title>
  </head>
  <body>
    <header>
      <a href="list.html">📔 나만의 다양한 diary</a>
      <nav>
        <a href="list.html">내 다이어리</a>
        <a href="feed.html">공개 다이어리</a>
      </nav>
      <a href="write.html">글쓰기</a>
    </header>

    <aside aria-label="캘린더">
      <h2>캘린더</h2>
    </aside>

    <main>
      <h1>내 다이어리</h1>

      <form role="search">
        <label for="keyword">검색어</label>
        <input id="keyword" type="search" placeholder="제목, 내용 검색" />
        <button type="submit">검색</button>
      </form>

      <ul>
        <li>
          <article>
            <p><time datetime="2026-08-30">2026년 8월 30일 (일)</time> · 일기</p>
            <h3><a href="detail.html">오늘의 기록</a></h3>
            <p>아침에 창문을 열었더니 바람이 선선했다.</p>
            <p>댓글 0</p>
          </article>
        </li>
        <!-- 같은 모양의 li 를 두 개 더 -->
      </ul>
    </main>

    <footer>
      <p>&copy; 2026 나만의 다양한 diary</p>
    </footer>
  </body>
</html>
```

**채점 기준**

| 확인 | 이유 |
| --- | --- |
| "글쓰기" 가 `<a>` 인가 | 다른 페이지로 **이동**하므로 링크다. (그 자리에서 실행하는 것만 `<button>`) |
| 카드가 `ul > li > article` 인가 | "같은 종류가 여러 개" + "그 자체로 완결된 글" |
| 제목이 `h1 → h2/h3` 순서인가 | 크기가 아니라 구조 |
| 검색창에 `label` 이 있는가 | 보이지 않게 하고 싶으면 CSS 로 숨긴다 (지우지 않는다) |
| 날짜에 `<time datetime>` | 기계가 읽을 수 있는 날짜 (선택 사항이지만 좋은 습관) |

---

## 02 CSS — 실습 ② 로그인 카드 예시 답안

```css
/* css/components/AuthCard.css */
.auth-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--space-4);
  background-color: var(--color-bg);
}

.auth-card {
  width: 100%;
  max-width: 400px;                       /* 고정 width 대신 max-width → 휴대폰에서 넘치지 않는다 */
  padding: var(--space-8) var(--space-6);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.auth-card__title {
  font-size: var(--font-size-xl);
  font-weight: 700;
}

.auth-card__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-top: var(--space-6);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field__control {
  width: 100%;
  height: 44px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
}

.field__control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-soft);   /* 포커스가 눈에 보여야 한다 */
}

.btn--primary {
  height: 48px;
  border: 0;
  border-radius: var(--radius-md);
  background-color: var(--color-primary);
  color: var(--color-text-invert);
  font-weight: 700;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.btn--primary:hover {
  background-color: var(--color-primary-strong);
}
```

**스스로 채점**

- [ ] 색 코드(`#...`)와 간격 숫자를 직접 쓴 곳이 없다 (`44px` 같은 **크기**는 괜찮다. 간격과 색이 대상이다)
- [ ] 클래스 이름이 `블록__요소--변형` 규칙을 따른다
- [ ] 개발자 도구 휴대폰 모드 375px 에서 카드가 화면 안에 들어온다
- [ ] Tab 키로 이동할 때 지금 어디에 있는지 보인다

이 프로젝트의 실제 파일: [AuthCard.css](../frontend/src/css/components/AuthCard.css), [form.css](../frontend/src/css/base/form.css)

---

## 04 브라우저 JavaScript — 할 일 앱 확장 과제

### 1. "전체 / 진행 중 / 완료" 필터

**핵심 생각: 필터는 "데이터를 지우는 것" 이 아니라 "그릴 때 고르는 것" 이다.**

```html
<div class="todo__filters">
  <button type="button" class="todo__filter" data-filter="all">전체</button>
  <button type="button" class="todo__filter" data-filter="active">진행 중</button>
  <button type="button" class="todo__filter" data-filter="done">완료</button>
</div>
```

```js
let filter = 'all'                       // 상태가 하나 늘었다

function visibleTodos() {
  if (filter === 'active') return todos.filter((todo) => !todo.done)
  if (filter === 'done') return todos.filter((todo) => todo.done)
  return todos
}

function render() {
  list.innerHTML = ''
  for (const todo of visibleTodos()) {   // ← todos 대신 visibleTodos()
    // ... 기존과 같음
  }
  // 요약 문구는 필터와 상관없이 전체 기준으로 센다
  // 지금 고른 필터 버튼을 표시한다
  document.querySelectorAll('.todo__filter').forEach((button) => {
    button.classList.toggle('todo__filter--on', button.dataset.filter === filter)
  })
}

document.querySelector('.todo__filters').addEventListener('click', (event) => {
  const next = event.target.dataset.filter
  if (!next) return
  filter = next
  render()                               // 저장(save)은 필요 없다. todos 가 바뀌지 않았다
})
```

> Vue 에서는 `visibleTodos()` 가 `computed` 가 된다. `filter` 나 `todos` 가 바뀌면 **저절로** 다시 계산되고
> 화면도 저절로 바뀐다. `render()` 를 부를 필요가 없다.

### 2. 더블클릭하면 수정 모드

```js
let editingId = null                     // 지금 수정 중인 항목 (없으면 null)

// render() 안에서 항목을 만들 때
if (todo.id === editingId) {
  const edit = document.createElement('input')
  edit.className = 'todo__edit'
  edit.value = todo.text
  edit.dataset.id = todo.id
  item.append(checkbox, edit, remove)
} else {
  item.append(checkbox, text, remove)
}

// render() 맨 끝 — 다시 그리면 포커스가 사라지므로 직접 돌려준다
list.querySelector('.todo__edit')?.focus()

list.addEventListener('dblclick', (event) => {
  const item = event.target.closest('.todo__item')
  if (!item || event.target.matches('input, button')) return
  editingId = Number(item.querySelector('.todo__check').dataset.id)
  render()
})

function finishEdit(input, shouldSave) {
  const id = Number(input.dataset.id)
  const value = input.value.trim()
  if (shouldSave && value) {
    todos.find((todo) => todo.id === id).text = value
    save()
  }
  editingId = null
  render()
}

list.addEventListener('keydown', (event) => {
  if (!event.target.matches('.todo__edit')) return
  if (event.key === 'Enter') finishEdit(event.target, true)
  if (event.key === 'Escape') finishEdit(event.target, false)   // 취소
})
```

**여기서 느껴야 할 불편** — 수정 중에 다른 항목의 체크박스를 누르면 `render()` 가 목록을 통째로 다시 그려서
**입력하던 글자가 사라진다.** Vue 는 바뀐 부분만 고치기 때문에 이 문제가 없다. `:key` 가 그 "같은 항목" 을 알아보는 열쇠다.

### 3. 사용자 목록 페이지 (4-6 실습) 의 뼈대

```js
const status = document.querySelector('.users__status')
const list = document.querySelector('.users__list')
const search = document.querySelector('.users__search')
const retry = document.querySelector('.users__retry')

let users = []                           // 서버에서 받은 원본 (검색해도 바꾸지 않는다)

function render() {
  const word = search.value.trim().toLowerCase()
  const visible = users.filter((user) => user.name.toLowerCase().includes(word))

  list.innerHTML = ''
  for (const user of visible) {
    const item = document.createElement('li')
    item.textContent = user.name + ' · ' + user.email
    list.append(item)
  }
  // 빈 결과 — "불러왔는데 없다" 와 "검색했는데 없다" 를 구분해서 알려 준다
  status.textContent = visible.length ? '' : word ? '검색 결과가 없습니다.' : '사용자가 없습니다.'
}

async function load() {
  status.textContent = '불러오는 중…'    // ① 로딩
  retry.hidden = true
  list.innerHTML = ''
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users')
    if (!response.ok) throw new Error('불러오지 못했습니다. (' + response.status + ')')
    users = await response.json()
    render()                             // ② 성공 / ③ 빈 결과
  } catch (error) {
    status.textContent = error.message   // ④ 실패
    retry.hidden = false
  }
}

search.addEventListener('input', render) // 다시 요청하지 않는다. 이미 받은 배열을 거른다
retry.addEventListener('click', load)
load()
```

네 가지 상태(로딩 / 성공 / 빈 결과 / 실패)가 모두 화면에 나타나는지, 주소를 일부러 틀리게 바꿔서 ④ 를 직접 확인한다.

---

## 다 풀었다면

- 03 의 문제 10개를 **보지 않고 5분 안에** 다시 풀 수 있는가 → 된다면 05 Vue 로 간다
- 막힌 문제는 학습 일지에 "왜 막혔는지" 를 한 줄로 적는다. 그 한 줄이 가장 값진 기록이다
