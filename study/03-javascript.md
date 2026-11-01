# Stage 3 — JavaScript 기초: 프로그래밍 그 자체

> 전체 로드맵: [README](README.md) · 이전: [02 CSS](02-css.md) · 다음: [04 브라우저 JavaScript](04-javascript-browser.md)

## 목표

- 값, 변수, 조건, 반복, 함수로 문제를 푼다
- 배열과 객체로 데이터를 표현하고 다룬다 — **웹 앱의 데이터는 전부 배열과 객체다**
- `map`, `filter`, `find` 같은 배열 메서드를 자유롭게 쓴다
- 이 프로젝트의 `utils/` 폴더 코드를 읽고 설명할 수 있다

이 단계가 가장 길고 가장 중요하다. Vue 는 JavaScript 위에 얹힌 도구라서,
**Vue 가 어렵게 느껴지는 원인의 대부분은 사실 JavaScript** 다. 여기서 시간을 아끼지 않는다.

---

## 3-0. 코드를 실행하는 방법

**방법 ① Node.js** (추천 — 이 문서의 예제는 모두 이렇게 실행한다)

```bash
mkdir js-practice
cd js-practice
code .
# practice.js 파일을 만들고 코드를 쓴 뒤
node practice.js
```

**방법 ② 브라우저 콘솔** — `F12` → Console 에 바로 친다. 한두 줄 실험할 때.

```js
console.log('안녕하세요')      // 괄호 안의 값을 화면(터미널/콘솔)에 출력한다
console.log(1 + 2, '같이', '여러 개')
```

**`console.log` 는 개발자의 눈이다.** 값이 궁금하면 언제든 찍어 본다.

---

## 3-1. 값과 타입

```js
// 숫자 (number)
42
3.14
-7

// 문자열 (string) — 따옴표로 감싼다. ' 와 " 는 같다. 이 프로젝트는 ' 를 쓴다.
'안녕하세요'
"오늘의 기록"
`템플릿 문자열: ${1 + 2}`       // 백틱(`) 안의 ${} 에 계산 결과가 들어간다 → '템플릿 문자열: 3'

// 불리언 (boolean) — 참/거짓 두 가지뿐
true
false

// 비어 있음
null          // "일부러 비워 둠" (예: 로그인 안 한 사용자 → user = null)
undefined     // "아직 정해지지 않음" (예: 값을 넣지 않은 변수)

// 타입 확인
typeof 42          // 'number'
typeof '42'        // 'string'   ← 숫자처럼 보여도 따옴표가 있으면 문자열!
typeof true        // 'boolean'
```

> **`42` 와 `'42'` 는 다르다.** 주소창의 값(`/diaries/42` 의 `42`)과 입력창의 값은 **항상 문자열**로 온다.
> 이 프로젝트의 서버가 id 를 문자열로 주는 이유다. ([05 Vue 3-1](05-vue.md))

---

## 3-2. 변수 — 값에 이름 붙이기

```js
const title = '오늘의 기록'    // const: 다시 바꿀 수 없다 ← 기본으로 이걸 쓴다
let count = 0                  // let: 나중에 바꿀 수 있다
count = count + 1              // 1
count += 1                     // 2 (줄임말)

title = '다른 제목'            // ✗ TypeError: Assignment to constant variable.

// var 는 옛날 방식이다. 쓰지 않는다.
```

**이름 짓기 규칙**

```js
const userName = '데모'        // 낙타 표기법(camelCase) — JavaScript 의 관례
const isLoggedIn = true        // 불리언은 is/has/can 으로 시작하면 읽기 쉽다
const IMAGE_MAX_COUNT = 5      // 절대 안 바뀌는 설정값은 대문자 + 밑줄 (이 프로젝트의 config.js)

const a = 5                    // ✗ 무슨 값인지 모른다
const diaryCount = 5           // ✓
```

---

## 3-3. 연산자

```js
// 산술
10 + 3   // 13
10 - 3   // 7
10 * 3   // 30
10 / 3   // 3.333...
10 % 3   // 1  (나머지 — 짝수 판별: n % 2 === 0)
2 ** 3   // 8  (거듭제곱)

'오늘' + '의 기록'   // '오늘의 기록' (문자열 + 는 이어 붙이기)
'5' + 1             // '51'  ← 문자열이 섞이면 이어 붙인다!
Number('5') + 1     // 6     ← 숫자로 바꾼 뒤 계산

// 비교 — 결과는 true / false
5 > 3          // true
5 >= 5         // true
5 === 5        // true   같은가 (타입까지 비교) ← 항상 이걸 쓴다
5 === '5'      // false  타입이 다르다
5 !== 3        // true   다른가
5 == '5'       // true   ← 타입을 멋대로 바꿔서 비교한다. 쓰지 않는다.

// 논리
true && false  // false  그리고 — 둘 다 참이어야 참
true || false  // true   또는 — 하나만 참이어도 참
!true          // false  아니다
```

### 참 같은 값, 거짓 같은 값

조건에서 `false` 로 취급되는 값은 **6개뿐**이다. 나머지는 전부 참이다.

```js
false, 0, '', null, undefined, NaN    // 거짓 같은 값 (falsy)
'0', 'false', [], {}                  // 전부 참 같은 값 (truthy)!
```

```js
if (keyword) { /* 검색어가 빈 문자열이 아니면 */ }
if (!user) { /* 로그인 안 했으면 */ }
```

### 기본값 연산자

```js
const nickname = user.nickname || '이름 없음'   // 앞이 falsy 면 뒤를 쓴다
const count = savedCount ?? 10                  // 앞이 null/undefined 일 때만 뒤를 쓴다

0 || 10   // 10  ← 0 도 falsy 라서 10 이 된다 (원하던 게 아닐 수 있다)
0 ?? 10   // 0   ← 0 은 null 이 아니라서 그대로
```

---

## 3-4. 조건문 — 상황에 따라 다르게

```js
const password = 'abc'

if (password.length === 0) {
  console.log('비밀번호를 입력해 주세요.')
} else if (password.length < 8) {
  console.log('비밀번호는 8자 이상이어야 합니다.')
} else {
  console.log('좋습니다.')
}
```

```js
// 삼항 연산자 — 값을 둘 중 하나로 고를 때 (if 의 한 줄 버전)
const label = isEdit ? '수정 완료' : '저장하기'

// 이른 반환(early return) — 이 프로젝트가 가장 많이 쓰는 형태
function validatePassword(value) {
  if (!value) return '비밀번호를 입력해 주세요.'
  if (value.length < 8) return '비밀번호는 8자 이상이어야 합니다.'
  return ''
}
```

이 함수는 이 프로젝트의 [validators.js](../frontend/src/utils/validators.js) 에 그대로 있다.
**문제가 있으면 바로 돌아가고, 끝까지 오면 통과.** if 를 깊이 중첩하지 않아서 읽기 쉽다.

---

## 3-5. 반복문 — 여러 번 하기

```js
// 정해진 횟수만큼
for (let i = 0; i < 5; i += 1) {
  console.log(i)          // 0 1 2 3 4
}

// 배열의 모든 요소에 대해 ← 가장 자주 쓴다
const categories = ['일기', '독서기록', '감정기록']
for (const category of categories) {
  console.log(category)
}

// 조건이 참인 동안
let day = 1
while (day <= 3) {
  console.log(day + '일')
  day += 1
}

// 반복 중 빠져나가기 / 건너뛰기
for (const n of [1, 2, 3, 4, 5]) {
  if (n === 2) continue    // 이번 것만 건너뛰기
  if (n === 4) break       // 반복 끝내기
  console.log(n)           // 1 3
}
```

> **무한 반복 주의**: `while` 의 조건이 영원히 참이면 프로그램이 멈춘다. 터미널에서 `Ctrl + C` 로 끈다.

---

## 3-6. 함수 — 일을 묶어 이름 붙이기

```js
// 선언
function add(a, b) {       // a, b 는 매개변수(받는 값)
  return a + b             // return: 결과를 돌려주고 함수를 끝낸다
}

add(2, 3)                  // 5  — 2, 3 은 인수(넘기는 값)
const result = add(10, 20) // 30

// 화살표 함수 — 같은 것의 짧은 표기. 이 프로젝트에서 아주 많이 쓴다
const add2 = (a, b) => a + b          // 한 줄이면 return 생략 가능
const square = (n) => n * n
const greet = (name) => {
  const message = name + ' 님, 반갑습니다.'
  return message
}

// 기본값
function summarize(content, length = 120) {   // length 를 안 넘기면 120
  return content.slice(0, length)
}
```

**좋은 함수의 조건**

1. **한 가지 일만 한다** — `validateEmail` 은 이메일 검사만
2. **이름이 동사로 시작한다** — `get`, `create`, `validate`, `format`, `is`, `has`
3. **짧다** — 화면 한 번에 다 보이는 정도 (20줄 안팎)

이 프로젝트의 [utils/date.js](../frontend/src/utils/date.js) 를 열어 보자. `toDateKey`, `formatDate`, `addMonths`
처럼 짧고 이름이 분명한 함수들의 모음이다.

---

## 3-7. 배열 — 순서 있는 목록

```js
const moods = ['행복', '평온', '지침']

moods[0]            // '행복'  ← 번호(인덱스)는 0 부터 시작한다
moods[2]            // '지침'
moods[5]            // undefined
moods.length        // 3
moods.at(-1)        // '지침' (뒤에서 첫 번째)

// 바꾸기 (원본이 바뀐다)
moods.push('설렘')          // 맨 뒤에 추가
moods.pop()                 // 맨 뒤 제거
moods.unshift('화남')       // 맨 앞에 추가
moods.splice(1, 1)          // 1번 위치에서 1개 제거

// 찾기
moods.includes('평온')      // true
moods.indexOf('평온')       // 1 (없으면 -1)

// 조각 / 합치기 (원본은 그대로)
[1, 2, 3, 4].slice(0, 2)    // [1, 2]
[1, 2].concat([3])          // [1, 2, 3]
['a', 'b'].join(', ')       // 'a, b'
'a,b,c'.split(',')          // ['a', 'b', 'c']
```

---

## 3-8. 객체 — 이름표 붙은 묶음

```js
const diary = {
  id: '12',
  title: '오늘의 기록',
  visibility: 'private',
  likeCount: 3,
  author: { id: 'u1', nickname: '데모' },   // 객체 안에 객체
  images: [],                              // 객체 안에 배열
}

diary.title                // '오늘의 기록'
diary.author.nickname      // '데모'
diary['title']             // 같은 것 (이름이 변수에 있을 때 쓴다)
const key = 'likeCount'
diary[key]                 // 3

diary.likeCount = 4        // 바꾸기
diary.mood = 'calm'        // 없던 속성 추가
delete diary.mood          // 제거

Object.keys(diary)         // ['id', 'title', ...]
Object.values({ a: 1, b: 2 })    // [1, 2]
Object.entries({ a: 1, b: 2 })   // [['a', 1], ['b', 2]]
```

### 웹 앱의 데이터는 "객체의 배열" 이다

서버에서 받는 다이어리 목록은 이렇게 생겼다. **이 모양에 익숙해지는 것이 이 단계의 핵심이다.**

```js
const items = [
  { id: '1', title: '오늘의 기록', category: 'diary', visibility: 'private', likeCount: 0 },
  { id: '2', title: '미드나잇 라이브러리', category: 'book', visibility: 'public', likeCount: 5 },
  { id: '3', title: '조금 지친 하루', category: 'emotion', visibility: 'public', likeCount: 2 },
]

items[1].title      // '미드나잇 라이브러리'
items.length        // 3
```

---

## 3-9. 배열 메서드 — 가장 중요한 7개

**외울 때까지 반복한다. Vue 코드의 절반이 이것이다.** 모두 원본을 바꾸지 않고 **새 값**을 만든다.

```js
// filter — 조건에 맞는 것만 모은 새 배열
const publicItems = items.filter((item) => item.visibility === 'public')
// [{ id: '2', ...}, { id: '3', ...}]

// map — 모든 요소를 변환한 새 배열
const titles = items.map((item) => item.title)
// ['오늘의 기록', '미드나잇 라이브러리', '조금 지친 하루']

// find — 조건에 맞는 첫 번째 요소 (없으면 undefined)
const target = items.find((item) => item.id === '2')

// findIndex — 그 위치 (없으면 -1)
items.findIndex((item) => item.id === '2')   // 1

// some / every — 하나라도 / 모두
items.some((item) => item.likeCount > 3)     // true
items.every((item) => item.likeCount > 0)    // false

// reduce — 하나의 값으로 접기
const totalLikes = items.reduce((sum, item) => sum + item.likeCount, 0)   // 7
//                               ↑누적값 ↑현재 요소                    ↑시작값

// sort — 정렬 (주의: 원본을 바꾼다)
const sorted = [...items].sort((a, b) => b.likeCount - a.likeCount)   // 좋아요 많은 순
```

**이어서 쓰기 (체이닝)** — 이 프로젝트의 mock API 가 실제로 이렇게 생겼다.

```js
const result = items
  .filter((diary) => diary.visibility === 'public')     // 공개 글만
  .filter((diary) => diary.title.includes('하루'))       // 검색어 포함
  .map((diary) => diary.title)                          // 제목만
```

[api/mock/index.js](../frontend/src/api/mock/index.js) 의 `listMine` 을 열어서 이 패턴을 찾아보자.

### 연습 문제 (답은 직접 실행해서 확인)

```js
const scores = [72, 95, 48, 88, 100, 61]

// 1. 60점 이상만 고른 배열
// 2. 모든 점수에 5점을 더한 배열
// 3. 100점이 있는가?
// 4. 평균 점수 (reduce + length)
// 5. 처음으로 90점을 넘는 점수

const users = [
  { name: '데모', age: 28, active: true },
  { name: '하루', age: 34, active: false },
  { name: '밤', age: 19, active: true },
]

// 6. 활성(active) 사용자의 이름 배열 → ['데모', '밤']
// 7. 나이 합계
// 8. 이름이 '하루' 인 사용자 객체
// 9. 나이 많은 순으로 정렬한 새 배열 (원본은 그대로)
// 10. { 데모: 28, 하루: 34, 밤: 19 } 형태의 객체 (reduce)
```

---

## 3-10. 문자열 다루기

```js
const text = '  오늘의 기록  '

text.trim()                 // '오늘의 기록' (앞뒤 공백 제거 — 입력값 검증 전에 항상)
text.length                 // 10
'Hello'.toLowerCase()       // 'hello' (이메일 비교 전에)
'abc'.toUpperCase()         // 'ABC'
'오늘의 기록'.includes('기록')     // true (검색)
'photo.PNG'.split('.').pop()    // 'PNG' (확장자)
'2026-08-30'.startsWith('2026-08')  // true
'5'.padStart(2, '0')        // '05' (날짜 두 자리 맞추기)
'a b  c'.replace(/\s+/g, ' ')   // 'a b c' (정규식: 연속 공백을 하나로)
```

이 프로젝트의 [utils/diary.js](../frontend/src/utils/diary.js) 의 `summarize` 와
[utils/image.js](../frontend/src/utils/image.js) 의 `getExtension` 을 읽어 보자. 여기서 배운 것만으로 되어 있다.

---

## 3-11. 구조 분해와 펼침 — 짧게 꺼내고 복사하기

```js
// 객체에서 꺼내기
const diary = { title: '기록', likeCount: 3, author: { nickname: '데모' } }
const { title, likeCount } = diary              // const title = diary.title; ... 와 같다
const { author: { nickname } } = diary          // 안쪽까지
const { mood = 'calm' } = diary                 // 없으면 기본값

// 배열에서 꺼내기
const [year, month, day] = '2026-08-30'.split('-')   // '2026', '08', '30'

// 함수 매개변수에서 바로
function formatDate(value, { withWeekday = true } = {}) { /* ... */ }
formatDate('2026-08-30', { withWeekday: false })

// 펼치기 (spread) — 복사하면서 일부만 바꾸기
const copy = { ...diary, title: '새 제목' }     // diary 는 그대로, copy 만 제목이 다르다
const more = [...items, newItem]               // 배열 끝에 추가한 새 배열
const merged = { ...defaults, ...options }      // 뒤에 오는 것이 이긴다
```

---

## 3-12. 값 복사 vs 참조 — 초보가 가장 오래 헤매는 곳

```js
// 숫자, 문자열, 불리언 → 값이 복사된다
let a = 1
let b = a
b = 2
console.log(a)   // 1 — a 는 그대로

// 객체, 배열 → "주소(참조)"가 복사된다. 같은 상자를 가리킨다!
const original = { title: '원본' }
const same = original
same.title = '바뀜'
console.log(original.title)   // '바뀜' ← 원본도 바뀌었다!

// 진짜 복사가 필요하면
const copy = { ...original }          // 얕은 복사 (한 겹)
const deep = structuredClone(original) // 깊은 복사 (안쪽 객체까지)
```

```
 original ──┐
            ├──► { title: '바뀜' }     ← 상자는 하나뿐
 same ──────┘

 copy ─────────► { title: '원본' }     ← 새 상자
```

> **Vue 에서 이게 왜 중요한가?** 자식 컴포넌트가 부모에게 받은 배열을 `push` 로 직접 바꾸면
> 부모의 데이터가 몰래 바뀐다. 그래서 이 프로젝트의 [ImageUploader.vue](../frontend/src/components/diary/ImageUploader.vue) 는
> `const next = [...props.modelValue]` 로 **복사한 뒤** 바꾸고, 부모에게 새 배열을 알린다.

---

## 3-13. 스코프와 클로저

```js
const appName = 'diary'           // 바깥: 어디서든 보인다

function outer() {
  const secret = '안쪽'           // outer 안에서만 보인다
  if (true) {
    const inner = '더 안쪽'       // 이 { } 안에서만 보인다
  }
  // console.log(inner)          // ✗ ReferenceError: inner is not defined
}
// console.log(secret)           // ✗
```

**클로저**: 함수는 자기가 **만들어진 곳의 변수를 기억**한다.

```js
function createCounter() {
  let count = 0                   // 밖에서는 직접 건드릴 수 없다
  return {
    increase: () => { count += 1; return count },
    reset: () => { count = 0 },
  }
}

const counter = createCounter()
counter.increase()   // 1
counter.increase()   // 2
```

이 모양이 낯익어지면 Vue 의 **컴포저블**과 **Pinia 스토어**가 쉬워진다. 구조가 똑같다.
([usePagedList.js](../frontend/src/composables/usePagedList.js) 의 `let version = 0` 이 정확히 이 클로저다.)

---

## 3-14. 오류 다루기

```js
// 직접 오류 던지기
function parsePassword(value) {
  if (value.length < 8) {
    throw new Error('비밀번호는 8자 이상이어야 합니다.')
  }
  return value
}

// 오류 잡기
try {
  parsePassword('short')
  console.log('여기는 실행 안 됨')
} catch (error) {
  console.log(error.message)    // '비밀번호는 8자 이상이어야 합니다.'
} finally {
  console.log('성공하든 실패하든 실행')
}
```

### 오류 메시지 읽는 법

```
TypeError: Cannot read properties of undefined (reading 'nickname')
    at formatAuthor (practice.js:12:23)
└──┬───┘ └────────────────────┬───────────────────────────┘
 종류     "undefined 에서 nickname 을 읽으려 했다"
                                  └── 어디서: practice.js 12번째 줄 23번째 글자
```

**번역: `무언가.nickname` 을 했는데 `무언가` 가 `undefined` 였다.** 12번째 줄로 가서 `.nickname` 앞의 값을 `console.log` 로 찍어 본다.

| 종류 | 뜻 | 흔한 원인 |
| --- | --- | --- |
| `ReferenceError: x is not defined` | 그런 이름이 없다 | 오타, 선언 전 사용, import 누락 |
| `TypeError: Cannot read properties of undefined` | `undefined.무엇` 을 했다 | 데이터가 아직 안 왔음, 속성 이름 오타 |
| `TypeError: x is not a function` | 함수가 아닌 것을 `()` 로 불렀다 | 이름 오타, import 잘못 |
| `SyntaxError: Unexpected token` | 문법이 틀렸다 | 괄호·따옴표 짝 안 맞음, 쉼표 빠짐 |

```js
// 안전하게 꺼내기 — 옵셔널 체이닝
user?.profile?.nickname        // 중간에 undefined 가 있으면 오류 대신 undefined
user?.profile?.nickname ?? '이름 없음'
```

---

## 3-15. 클래스 맛보기

이 프로젝트에서는 오류 객체를 만들 때만 쓴다. 지금은 "이런 게 있다" 정도면 된다.

```js
class ApiError extends Error {           // Error 를 물려받는다
  constructor(message, status = 400) {
    super(message)                       // 부모(Error)의 준비 작업
    this.name = 'ApiError'
    this.status = status                 // 이 오류만의 추가 정보
  }
}

const error = new ApiError('권한이 없습니다.', 403)
error.message   // '권한이 없습니다.'
error.status    // 403
error instanceof ApiError   // true
```

[backend/src/utils/ApiError.js](../backend/src/utils/ApiError.js) 에 실제 코드가 있다.

---

## 3-16. 모듈 — 파일 나누기

코드가 길어지면 파일을 나누고, 필요한 것만 불러온다.

```js
// math.js
export const PI = 3.14                      // 이름 있는 내보내기 (여러 개 가능)
export function add(a, b) { return a + b }
export default function multiply(a, b) {    // 기본 내보내기 (파일당 하나)
  return a * b
}
```

```js
// main.js
import multiply, { PI, add } from './math.js'   // 기본은 아무 이름으로, 이름 있는 것은 { } 로
console.log(add(1, 2), multiply(2, 3), PI)
```

Node 에서 `import` 를 쓰려면 `package.json` 에 `"type": "module"` 이 있어야 한다 (`npm init -y` 후 추가).

> **이 프로젝트의 두 가지 모듈 방식**
> 프론트엔드는 `import / export` (ES 모듈), 백엔드는 `require / module.exports` (CommonJS) 를 쓴다.
> 하는 일은 같고 문법만 다르다. 새 프로젝트라면 양쪽 모두 ES 모듈을 쓰는 추세다.

---

## 3-17. 종합 실습

### 실습 ① 성적 처리기 (`grades.js`)

```js
const students = [
  { name: '가람', scores: [90, 85, 77] },
  { name: '나래', scores: [60, 72, 58] },
  { name: '다온', scores: [100, 95, 98] },
]
```

1. 각 학생의 평균을 구해 `{ name, average }` 배열을 만든다 (`map` + `reduce`)
2. 평균 70 이상이면 `'통과'`, 아니면 `'재시험'` 을 붙인다
3. 평균 높은 순으로 정렬해 `1등 다온 97.7점` 형태로 출력한다 (`toFixed(1)`)

### 실습 ② 다이어리 검색기 (`search.js`)

이 프로젝트의 mock 데이터([api/mock/db.js](../frontend/src/api/mock/db.js) 의 `createSeed`)를 보고
비슷한 다이어리 배열을 직접 만든 뒤 다음 함수를 작성한다.

```js
function search(diaries, { keyword = '', category = '', visibility = '' } = {}) {
  // 빈 조건은 무시하고, 있는 조건만 모두 만족하는 글을 반환
  // 날짜(dateKey) 최신순으로 정렬
}

function countByDate(diaries) {
  // { '2026-08-30': 2, '2026-08-29': 1 } 형태로 날짜별 개수 (캘린더 점 표시에 쓰는 바로 그 데이터)
}

function summarize(content, length = 20) {
  // 연속 공백을 하나로 바꾸고, length 를 넘으면 잘라서 '…' 을 붙인다
}
```

완성하면 [api/mock/index.js](../frontend/src/api/mock/index.js) 의 `listMine`, `monthlyCounts` 와
[utils/diary.js](../frontend/src/utils/diary.js) 의 `summarize` 와 비교한다.

### 실습 ③ 검증 함수 (`validators.js`)

규칙: **문제가 있으면 오류 메시지 문자열, 없으면 빈 문자열** 을 반환한다.

- `validateEmail(value)` — 비었으면 / `@` 와 `.` 이 없으면
- `validateNickname(value)` — 앞뒤 공백 제거 후 2~12자
- `validatePasswordConfirm(value, password)`
- `isValid(errors)` — `{ email: '', password: '8자 이상...' }` 같은 객체에 메시지가 하나도 없으면 `true`

완성하면 [frontend/src/utils/validators.js](../frontend/src/utils/validators.js) 와 비교한다.

---

## 자주 하는 실수

| 실수 | 결과 | 해결 |
| --- | --- | --- |
| `=` 와 `===` 혼동 | `if (a = 5)` 는 항상 참 | 비교는 항상 `===` |
| `'5' + 1` | `'51'` | `Number()` 로 바꾼 뒤 계산 |
| `return` 없이 화살표 `{ }` | `undefined` | `(x) => x * 2` 또는 `{ return x * 2 }` |
| `map` 안에서 `return` 빠뜨림 | `[undefined, undefined]` | 위와 같음 |
| 객체를 `=` 로 복사 | 원본이 같이 바뀜 | `{ ...obj }` |
| `sort()` 를 숫자에 그냥 씀 | `[1, 10, 2]` | `sort((a, b) => a - b)` |
| `reduce` 초기값 누락 | 객체 배열에서 이상한 결과 | 두 번째 인자를 항상 넣는다 |

## 체크리스트

- [ ] 숫자, 문자열, 불리언, null, undefined 를 구분한다
- [ ] `const` 를 기본으로 쓰고, 바꿔야 할 때만 `let` 을 쓴다
- [ ] `===` 와 `==` 의 차이, `??` 와 `||` 의 차이를 안다
- [ ] 이른 반환(early return)으로 검증 함수를 쓴다
- [ ] `filter`, `map`, `find`, `some`, `reduce` 를 보지 않고 쓴다
- [ ] 구조 분해와 `...` 펼침을 쓸 수 있다
- [ ] 객체를 `=` 로 복사하면 왜 원본이 바뀌는지 그림으로 설명할 수 있다
- [ ] 오류 메시지에서 종류, 내용, 줄 번호를 읽는다
- [ ] `import` / `export` 로 파일을 나눈다
- [ ] 연습 문제 10개와 실습 ①②③ 을 완성했다

다음: [04 브라우저 JavaScript — 화면을 움직이고 서버와 대화하기](04-javascript-browser.md)
