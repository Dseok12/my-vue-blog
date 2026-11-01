# 백엔드 교과서 — Node.js + Express + MySQL 로 API 서버 만들기

이 문서 하나만 보고 **입문자 수준에서 시작해 이 프로젝트(`backend/`) 수준, 그리고 그 이상까지** 도달하는 것을 목표로 한다.
읽기만 하는 문서가 아니라 **여러 번 반복해서 만들어 보는 훈련 교재**다.

---

## 0. 이 문서 사용법

### 0-1. 3회독 반복 학습법

| 회독 | 방식 | 목표 | 걸리는 시간 |
| --- | --- | --- | --- |
| **1회독 — 따라 만들기** | 코드를 보면서 그대로 입력하고 실제로 동작시킨다 | 전체 지도를 그린다 | 레벨당 1~3일 |
| **2회독 — 백지 재현** | 문서를 덮고 각 레벨 끝의 `백지 재현 과제`를 혼자 만든다 | 이유를 이해한다 | 레벨당 1~2일 |
| **3회독 — 변형·확장** | `확장 과제`를 풀고 요구사항을 바꿔 다시 만든다 | 응용할 수 있게 된다 | 레벨당 1일 |

**백엔드는 프론트엔드와 결정적으로 다른 점이 하나 있다.**
화면은 눈으로 확인하지만, 서버는 **직접 호출해 봐야** 확인된다.
그래서 이 문서는 각 레벨마다 **"확인하는 방법"** 을 함께 적는다. 이것을 건너뛰면 배운 게 아니다.

### 0-2. 진도표

```
Level 1  Node 와 HTTP 기초     [ ]1회독  [ ]2회독  [ ]3회독
Level 2  Express 와 미들웨어   [ ]1회독  [ ]2회독  [ ]3회독
Level 3  데이터베이스와 SQL    [ ]1회독  [ ]2회독  [ ]3회독
Level 4  구조·인증·권한        [ ]1회독  [ ]2회독  [ ]3회독
Level 5  보안·성능·운영        [ ]1회독  [ ]2회독  [ ]3회독
최종 관문  백지에서 API 서버 전체 만들기        [ ]
────────────────────────  여기까지 = 이 프로젝트 수준  ────────────────────────
Level 6  대형 백엔드 아키텍처   [ ]1회독  [ ]2회독  [ ]3회독
Level 7  배포·운영·확장         [ ]1회독  [ ]2회독  [ ]3회독
최종 관문 II  프로덕션 API 서버 구축              [ ]
```

> Level 6~7 은 이 프로젝트 코드에 없는 내용이다. 실무 대형 서비스의 계층 설계·인증 심화·
> 데이터 일관성·비동기·관측·배포·확장을 다룬다. 최종 관문(Level 1~5) 통과 후 시작한다.

### 0-3. 시작 전 필요한 것

- Node.js 18 이상
- MySQL 8 (또는 MariaDB) — 설치 후 root 비밀번호를 기억해 둘 것
- API 테스트 도구 — **하나는 반드시 익힌다**
  - `curl` (터미널)
  - VS Code 확장 `REST Client` (`.http` 파일로 요청을 저장해 두고 재사용 — 추천)
  - Postman / Insomnia
- 선행 지식: JavaScript 기초, 터미널 기본 명령(`cd`, `ls`, `mkdir`)

---

## Level 0 — 출발선 점검 (입문 이전)

### 0-1. 비동기를 이해하는가?

백엔드는 거의 모든 코드가 비동기다. 아래를 설명할 수 있으면 넘어간다.

```js
// DB 조회는 시간이 걸린다. 기다리지 않으면 결과가 없는 상태로 다음 줄이 실행된다.
const user = await findUser(1)   // 여기서 멈추고 결과를 기다린다
console.log(user.nickname)       // 결과가 온 뒤에 실행

// await 를 빼먹으면?
const user = findUser(1)         // Promise 객체가 담긴다
console.log(user.nickname)       // undefined ← 가장 흔한 초보 실수

// 여러 개를 동시에 기다리기 — 순차보다 빠르다
const [a, b] = await Promise.all([findUser(1), findUser(2)])

// async 함수는 항상 Promise 를 반환한다
async function f() { return 1 }
f()          // Promise
await f()    // 1
```

### 0-2. HTTP 를 이해하는가?

```
요청(Request)                        응답(Response)
┌────────────────────────┐          ┌────────────────────────┐
│ POST /api/auth/login   │  ──────► │ 200 OK                 │
│ Content-Type: json     │          │ Content-Type: json     │
│ Authorization: Bearer… │          │                        │
│                        │          │ { "user": {...},       │
│ { "email": "...",      │          │   "token": "..." }     │
│   "password": "..." }  │  ◄────── │                        │
└────────────────────────┘          └────────────────────────┘
   메서드  주소  헤더  본문             상태코드  헤더  본문
```

**메서드 — 무엇을 하려는지**

| 메서드 | 의미 | 이 프로젝트의 예 |
| --- | --- | --- |
| `GET` | 읽기 (아무것도 바꾸지 않는다) | `GET /api/diaries` |
| `POST` | 새로 만들기 | `POST /api/diaries` |
| `PUT` | 통째로 바꾸기 | `PUT /api/diaries/3` |
| `PATCH` | 일부만 바꾸기 | (이 프로젝트는 미사용) |
| `DELETE` | 지우기 | `DELETE /api/diaries/3` |

**상태 코드 — 결과가 어땠는지**

| 코드 | 뜻 | 언제 쓰나 |
| --- | --- | --- |
| `200 OK` | 성공 | 조회, 수정, 삭제 성공 |
| `201 Created` | 만들어짐 | 회원가입, 글 작성, 댓글 작성 |
| `400 Bad Request` | 요청이 잘못됨 | 제목이 비었음, 비공개 글에 좋아요 시도 |
| `401 Unauthorized` | **누구인지 모름** | 토큰 없음, 토큰 만료, 비밀번호 틀림 |
| `403 Forbidden` | **누구인지는 아는데 권한 없음** | 남의 글 수정 시도 |
| `404 Not Found` | 없음 | 없는 글 조회 |
| `409 Conflict` | 충돌 | 이미 가입된 이메일 |
| `500 Internal Server Error` | 서버가 터짐 | 예상 못 한 오류 |
| `503 Service Unavailable` | 일시적으로 불가 | DB 연결 실패 |

> **401 과 403 의 차이를 반드시 구분한다.**
> 401 = "너 누구야?" (로그인해라) → 프론트는 로그인 화면으로 보낸다
> 403 = "너인 건 알겠는데 안 돼" (권한 없음) → 프론트는 오류 메시지만 보여 준다

**Level 0 체크리스트**

- [ ] `await` 를 빼먹으면 무슨 일이 생기는지 안다
- [ ] `Promise.all` 이 왜 더 빠른지 안다
- [ ] GET 과 POST 의 차이를 설명할 수 있다
- [ ] 401 과 403 의 차이를 설명할 수 있다
- [ ] `curl` 이나 REST Client 로 요청을 보내 본 적이 있다

---

## Level 1 — Node 와 HTTP 기초 (입문)

### 목표

프레임워크 없이 서버가 무엇인지 이해한다. Express 가 무엇을 대신해 주는지 알게 된다.

### 1-1. 프로젝트 시작

```bash
mkdir my-api && cd my-api
npm init -y
```

`package.json` 이 만들어진다. 이 프로젝트([backend/package.json](backend/package.json))의 구조:

```json
{
  "name": "my-diary-backend",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js",
    "db:migrate": "node src/db/migrate.js",
    "db:seed": "node src/db/seed.js",
    "db:reset": "node src/db/migrate.js --drop && node src/db/seed.js"
  },
  "dependencies": { "express": "...", "mysql2": "...", ... }
}
```

**`scripts` 에 명령을 모아 둔다.** 그래야 다른 사람이 `npm run dev` 만 치면 된다.
`node --watch` 는 파일이 바뀌면 자동 재시작한다 (예전에는 `nodemon` 을 썼다).

### 1-2. 모듈 시스템

Node 에는 두 가지가 있다. **이 프로젝트는 ES Module(ESM) 을 쓴다.**

```js
// ES Module (이 프로젝트) — package.json 에 "type": "module" 이 있어야 한다
import express from 'express'
export { signup, login }
export default errorHandler          // 하나만 내보낼 때

// CommonJS (예전 방식) — 오래된 예제와 라이브러리 문서에서 자주 보인다
const express = require('express')
module.exports = { signup, login }
```

> **왜 ESM 인가?** 프론트엔드(Vue)가 이미 ESM 이라 **앞뒤가 같은 문법**이 된다.
> 배울 것이 하나 줄고, 코드를 오갈 때 머리를 바꾸지 않아도 된다.
>
> **주의 두 가지**
> 1. ESM 은 **확장자를 꼭 붙인다.** `import { toIso } from './utils/date.js'` — `.js` 를 빼면 오류다.
> 2. `__dirname` 이 없다. 대신 `import.meta.url` 을 쓴다.
>    ([backend/src/middlewares/upload.js](backend/src/middlewares/upload.js) 참고)
>
> ```js
> import { fileURLToPath } from 'node:url'
> const backendRoot = fileURLToPath(new URL('../../', import.meta.url))
> ```
>
> 인터넷 예제가 `require` 로 되어 있으면 위 표를 보고 바꿔 읽으면 된다.

### 1-3. 프레임워크 없이 서버 만들기

Express 가 무엇을 해 주는지 알려면 **한 번은 직접 만들어 봐야 한다.**

```js
import http from 'node:http'

const server = http.createServer((req, res) => {
  // 1) 주소와 메서드를 직접 분기해야 한다
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok' }))
    return
  }

  // 2) 요청 본문(body)을 조각조각 직접 모아야 한다
  if (req.method === 'POST' && req.url === '/echo') {
    let body = ''
    req.on('data', (chunk) => { body += chunk })
    req.on('end', () => {
      const data = JSON.parse(body)          // 잘못된 JSON 이면 여기서 터진다
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(data))
    })
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ message: '없는 주소입니다.' }))
})

server.listen(4000, () => console.log('http://localhost:4000'))
```

**확인하는 방법**

```bash
curl http://localhost:4000/health
curl -X POST http://localhost:4000/echo -H "Content-Type: application/json" -d '{"a":1}'
```

**여기서 불편한 점을 직접 느껴 본다.**
① `if` 분기가 끝없이 늘어난다 ② 본문 파싱을 매번 직접 한다 ③ 주소의 `:id` 를 못 꺼낸다
④ 오류 처리가 흩어진다 ⑤ 파일 서빙, CORS 를 다 직접 짜야 한다.

**이 다섯 가지를 해결해 주는 것이 Express 다.**

### 백지 재현 과제 (2회독)

1. `http` 모듈만으로 `GET /items`, `POST /items`, `GET /items/:id` 를 만든다 (데이터는 배열 변수에 담는다)
2. 없는 주소는 404 JSON 으로 응답한다
3. 잘못된 JSON 이 오면 500 이 아니라 400 을 응답하게 한다

### Level 1 체크리스트

- [ ] `import` / `export` 를 쓸 수 있고, 확장자(`.js`)를 붙여야 한다는 것을 안다
- [ ] `npm run` 스크립트를 정의할 수 있다
- [ ] 프레임워크 없이 HTTP 서버를 띄워 본 적이 있다
- [ ] `curl` 로 GET/POST 요청을 보낼 수 있다

---

## Level 2 — Express 와 미들웨어 (초급)

### 목표

미들웨어라는 개념 하나로 Express 의 90% 를 이해한다.

### 2-1. 미들웨어 = 요청이 지나가는 파이프

```
요청 → [CORS] → [로그] → [JSON파싱] → [인증] → [라우터] → 응답
                                          ↓ 오류
                                    [오류 처리기] → 응답
```

**미들웨어는 함수 3개짜리 규칙일 뿐이다.**

```js
function 미들웨어(req, res, next) {
  // req 를 읽거나 바꾼다
  next()      // 다음으로 넘긴다
  // next() 를 안 부르면 요청이 여기서 멈춘다 (응답을 보냈다면 정상)
  // next(오류) 를 부르면 오류 처리기로 점프한다
}
```

**오류 처리기만 인자가 4개다.** 이걸로 Express 가 구분한다.

```js
function errorHandler(error, req, res, next) {   // ← 인자 4개
  res.status(500).json({ message: '...' })
}
```

### 2-2. 앱 구성 — 순서가 전부다

[backend/src/app.js](backend/src/app.js)

```js
export function createApp() {
  const app = express()

  app.disable('x-powered-by')   // "Express 로 만들었다"를 숨긴다 (사소한 보안)

  // 1) CORS — 다른 주소의 프론트엔드가 부를 수 있게
  app.use(cors({ origin: config.corsOrigins, credentials: true }))

  // 2) 본문 파싱 — 이게 있어야 req.body 를 쓸 수 있다
  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: true }))

  // 3) 로그 — 어떤 요청이 왔는지 터미널에 찍는다 (개발할 때만)
  if (!config.isProduction) app.use(morgan('dev'))

  // 4) 정적 파일 — 업로드된 이미지
  //    <img> 태그는 인증 헤더를 보낼 수 없으므로 로그인 검사 "앞"에 둔다
  app.use('/uploads', express.static(uploadDirectory, { maxAge: '7d', fallthrough: true }))

  // 5) API 라우터
  app.use('/api', apiRouter)

  // 6) 어디에도 안 걸린 요청 → 404
  app.use(notFoundHandler)

  // 7) 오류 처리기 — 반드시 맨 마지막
  app.use(errorHandler)

  return app
}
```

> **순서를 틀리면 생기는 일**
> - `express.json()` 을 라우터 뒤에 두면 → `req.body` 가 `undefined`
> - `errorHandler` 를 라우터 앞에 두면 → 오류가 잡히지 않고 서버가 기본 HTML 오류를 뱉음
> - 정적 파일을 인증 뒤에 두면 → `<img>` 가 401 을 받아 이미지가 안 보임

**`app.js` 와 `server.js` 를 나누는 이유**

```js
// app.js  — 앱을 "구성"만 한다 (listen 하지 않는다)  → 테스트에서 그대로 재사용 가능
// server.js — 앱을 "실행"한다 (DB 확인 + listen + 종료 처리)
```

[backend/src/server.js](backend/src/server.js)

```js
async function start() {
  try {
    const connection = await pool.getConnection()   // 시작할 때 DB 연결을 한 번 확인
    connection.release()
    console.log('[DB] ' + config.db.database + ' 연결 확인 완료')
  } catch (error) {
    console.error('[DB] 연결에 실패했습니다. .env 설정을 확인해 주세요.')
    process.exit(1)     // 연결이 안 되면 아예 뜨지 않는다 (조용히 고장난 서버보다 낫다)
  }

  const server = createApp().listen(config.port, () => { ... })

  // 종료 신호를 받으면 정리하고 끈다 (graceful shutdown)
  const shutdown = async (signal) => {
    server.close(async () => { await pool.end(); process.exit(0) })
  }
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}
```

### 2-3. 라우터 — 주소를 파일로 나눈다

[backend/src/routes/index.js](backend/src/routes/index.js)

```js
const router = express.Router()

router.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

router.use('/auth', authRoutes)

// 로그인한 회원만 다이어리와 업로드를 사용할 수 있다
router.use('/diaries', requireAuth, diaryRoutes)
router.use('/uploads', requireAuth, uploadRoutes)
```

**미들웨어를 라우터 단위로 건다.** `requireAuth` 를 여기 한 번 걸면
그 아래 모든 주소가 보호된다. 라우트마다 붙이면 하나 빠뜨렸을 때 구멍이 생긴다.

[backend/src/modules/diaries/diary.routes.js](backend/src/modules/diaries/diary.routes.js)

```js
// 고정 주소를 먼저 두어야 '/:diaryId' 에 잡히지 않는다
router.get('/feed', diaryController.listFeed)
router.get('/monthly-counts', diaryController.monthlyCounts)

router.get('/', diaryController.listMine)
router.post('/', diaryController.create)

router.get('/:diaryId', diaryController.get)
router.put('/:diaryId', diaryController.update)
router.delete('/:diaryId', diaryController.remove)
router.post('/:diaryId/like', diaryController.toggleLike)

router.use('/:diaryId/comments', commentRoutes)
```

> **순서 함정:** `/:diaryId` 를 위에 두면 `/feed` 요청이 `diaryId = 'feed'` 로 잡힌다.
> **고정 문자열 라우트를 항상 동적 라우트보다 먼저 쓴다.**

**중첩 라우터 — `mergeParams`**

```js
// commentRoutes.js
// 부모 라우터의 :diaryId 를 그대로 쓰기 위해 mergeParams 를 켠다
const router = express.Router({ mergeParams: true })

router.get('/', commentController.list)
router.post('/', commentController.create)
router.delete('/:commentId', commentController.remove)
```

`mergeParams: true` 가 없으면 `req.params.diaryId` 가 `undefined` 다.

### 2-4. 비동기 오류를 잡는 법

이 프로젝트는 **Express 5** 를 쓴다. Express 5 는 async 핸들러가 던진 오류를
**자동으로 오류 처리기에 넘겨 준다.** 그래서 컨트롤러가 이렇게 깔끔하다.

[backend/src/modules/diaries/diary.controller.js](backend/src/modules/diaries/diary.controller.js)

```js
// Express 5 — try/catch 가 없어도 오류가 errorHandler 로 간다
export async function listMine(req, res) {
  res.json(await diaryService.listMine(req.user.id, req.query))
}
```

**하지만 왜 이게 중요한지는 알아야 한다.** Express 4 는 자동으로 잡지 못했다.

```js
// Express 4 에서 위험 — 오류가 나면 요청이 응답 없이 매달린다
router.get('/', async (req, res) => {
  const rows = await db.query('...')   // 여기서 오류가 나면 아무도 못 잡는다
  res.json(rows)
})
```

그래서 예전에는 한 줄짜리 래퍼로 **모든 핸들러를 감쌌다.**

```js
// Express 4 시절의 관용구 — 인터넷 예제에 아직 많이 보인다
function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next)   // 오류를 next 로 넘긴다
  }
}

router.get('/', asyncHandler(async (req, res) => { ... }))
```

> **정리**
> - Express 5 (이 프로젝트) → 그냥 `async` 로 쓴다. 래퍼가 필요 없다.
> - Express 4 프로젝트를 만나면 → `asyncHandler` 로 감싸야 한다.
>
> 어느 쪽이든 **오류를 `next` 로 흘려보내 한곳에서 처리한다**는 원리는 같다.

### 2-5. 오류를 한 곳에서 처리한다

**① 사용자에게 보여 줄 오류를 클래스로 정의한다**
[backend/src/utils/ApiError.js](backend/src/utils/ApiError.js)

```js
class ApiError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }

  static badRequest(message)   { return new ApiError(message, 400) }
  static unauthorized(message = '로그인이 필요합니다.') { return new ApiError(message, 401) }
  static forbidden(message = '권한이 없습니다.')        { return new ApiError(message, 403) }
  static notFound(message = '요청한 정보를 찾을 수 없습니다.') { return new ApiError(message, 404) }
  static conflict(message)     { return new ApiError(message, 409) }
}
```

이제 어디서든 이렇게 던지면 된다.

```js
throw ApiError.forbidden('수정 권한이 없습니다.')
throw ApiError.conflict('이미 가입된 이메일입니다.')
```

**② 오류 처리기에서 형태를 통일한다**
[backend/src/middlewares/error.js](backend/src/middlewares/error.js)

```js
function toApiError(error) {
  if (error instanceof ApiError) return error
  if (error instanceof multer.MulterError) return fromMulterError(error)
  if (error.code === 'ENOENT') return ApiError.notFound('이미지를 찾을 수 없습니다.')
  if (error.type === 'entity.parse.failed') return ApiError.badRequest('요청 형식이 올바르지 않습니다.')
  return fromDatabaseError(error)     // 아는 DB 오류면 변환, 모르면 null
}

function errorHandler(error, req, res, next) {
  const apiError = toApiError(error)

  if (!apiError) {
    // 예상 못 한 오류 — 자세한 내용은 로그에만 남기고, 사용자에게는 일반적인 문구만
    console.error('[처리하지 못한 오류]', error)
    res.status(500).json({ message: '요청을 처리하지 못했습니다.' })
    return
  }

  if (apiError.status >= 500) console.error('[서버 오류]', error)
  res.status(apiError.status).json({ message: apiError.message })
}
```

> **보안 원칙: 오류의 내부 사정을 밖으로 흘리지 않는다.**
> SQL 문, 파일 경로, 스택 트레이스가 응답에 담기면 공격자에게 지도를 주는 셈이다.
> **자세한 것은 로그로, 사용자에게는 짧은 안내 문구만.**

**응답 형태를 하나로 고정한다.** 이 프로젝트는 실패하면 항상 `{ message }` 다.
그래서 프론트엔드의 인터셉터가 `error.response.data.message` 한 줄로 끝난다.

### 2-6. 환경 변수 — 설정을 코드에서 분리한다

```bash
# .env  (절대 git 에 올리지 않는다)
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=실제비밀번호
JWT_SECRET=긴랜덤문자열
```

```bash
# .env.example  (git 에 올린다 — 어떤 값이 필요한지 알려 주는 템플릿)
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
JWT_SECRET=change-this-secret-in-production
```

```
# .gitignore
node_modules/
.env
uploads/*
!uploads/.gitkeep
```

**환경 변수는 한 곳에서만 읽는다.** [backend/src/config/index.js](backend/src/config/index.js)

```js
import 'dotenv/config'          // .env 를 읽어 process.env 에 넣어 준다

function toNumber(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

// 운영에서는 반드시 .env 에 값이 있어야 하는 항목
function requireInProduction(key, fallback) {
  const value = process.env[key]
  if (value) return value
  if (isProduction) throw new Error('.env 에 ' + key + ' 값을 설정해 주세요.')
  return fallback
}

export const config = {
  env,
  isProduction,
  port: toNumber(process.env.PORT, 4000),
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',').map((o) => o.trim()).filter(Boolean),
  db: { host: ..., port: ..., user: ..., password: ..., database: ... },
  jwt: { secret: requireInProduction('JWT_SECRET', 'local-dev-secret-change-me'), expiresIn: ... },
  upload: { directory: 'uploads', maxBytes: 10 * 1024 * 1024, allowedExtensions: [...], ... },
}
```

> 위험한 기본값으로 운영에 올라가는 사고를 막는 방법은 두 가지다.
> **① 경고만 찍기**(개발이 편함) **② 아예 실행을 막기**(안전함).
> 이 프로젝트는 `JWT_SECRET` 에 대해 ②를 골랐다. 로그인 토큰을 위조당하면
> 남의 계정으로 들어올 수 있어서, 조용히 넘어가면 안 되는 값이기 때문이다.

> **`process.env` 를 코드 곳곳에서 직접 읽지 않는다.** 한 곳에 모으면
> ① 기본값과 타입 변환을 한 번만 하고 ② 어떤 설정이 있는지 파일 하나로 파악되고
> ③ 오타(`DB_PASSWORT`)를 빨리 발견한다.

### 확인하는 방법

```bash
curl http://localhost:4000/api/health
curl -i http://localhost:4000/api/nope            # 404 와 { message } 확인
curl -i -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" -d '{"bad json'   # 400 확인
```

### 백지 재현 과제 (2회독)

1. Express 앱을 만들고 `app.js` / `server.js` 를 분리한다
2. `ApiError`, `errorHandler`, `notFoundHandler` 3개를 직접 만든다
3. `/api/items` CRUD 를 만든다 (데이터는 배열). 없는 id 는 404, 이름이 빈 값이면 400
4. `.env` 로 포트를 바꿀 수 있게 하고 `.env.example` 과 `.gitignore` 를 만든다
5. 일부러 오류를 던져서 `{ message }` 형태로 나오는지 `curl` 로 확인한다

### 확장 과제 (3회독)

1. 요청마다 고유 ID 를 붙이고 로그에 함께 남기는 미들웨어를 만든다
2. 응답 시간을 재서 느린 요청(200ms 초과)만 경고 로그를 남기게 한다
3. `NODE_ENV=development` 일 때만 오류 응답에 스택을 포함시킨다

### Level 2 체크리스트

- [ ] 미들웨어의 `(req, res, next)` 규칙을 설명할 수 있다
- [ ] 미들웨어 등록 순서가 왜 중요한지 예를 들 수 있다
- [ ] 오류 처리기의 인자가 4개인 이유를 안다
- [ ] Express 4 에서 `asyncHandler` 가 없으면 무슨 일이 생기는지 안다
- [ ] 고정 라우트를 동적 라우트보다 먼저 써야 하는 이유를 안다
- [ ] `.env` 를 git 에 올리면 안 되는 이유를 안다

---

## Level 3 — 데이터베이스와 SQL (중급)

### 목표

데이터를 어떻게 나눠 담을지 스스로 설계한다. 백엔드 실력의 절반이 여기서 갈린다.

### 3-1. 관계형 설계의 3단계

**① 명사를 찾는다 → 테이블 후보**

> "**회원**이 **다이어리**를 쓴다. 다이어리에는 **이미지**를 붙일 수 있다.
> 공개된 다이어리에는 **댓글**과 **좋아요**를 남길 수 있다."

→ `users`, `diaries`, `diary_images`, `comments`, `diary_likes`

**② 관계를 정한다**

```
users 1 ──── N diaries          한 회원이 여러 글을 쓴다
diaries 1 ── N diary_images     한 글에 여러 이미지
diaries 1 ── N comments         한 글에 여러 댓글
comments 1 ─ N comments         댓글이 댓글을 가진다 (자기 참조 = 대댓글)
users N ──── N diaries          좋아요는 다대다 → 중간 테이블 diary_likes
```

**③ 관계를 표현하는 방법은 3가지뿐이다**

| 관계 | 표현 방법 |
| --- | --- |
| 1 : N | N 쪽에 **외래 키(FK)** 를 둔다 (`diaries.user_id`) |
| N : M | **중간 테이블**을 만든다 (`diary_likes(diary_id, user_id)`) |
| 1 : 1 | 한쪽에 FK + UNIQUE, 또는 그냥 한 테이블에 합친다 |

> **중요: 배열이나 콤마 문자열로 관계를 저장하지 않는다.**
> `diaries.image_urls = "a.png,b.png"` 같은 설계는 검색·정렬·삭제가 전부 불가능해진다.
> 반드시 별도 테이블(`diary_images`)로 뺀다.

### 3-2. 실제 스키마

[backend/src/db/schema.sql](backend/src/db/schema.sql)

```sql
CREATE TABLE IF NOT EXISTS users (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email         VARCHAR(255)    NOT NULL,
  password_hash VARCHAR(255)    NOT NULL,   -- 평문 비밀번호는 절대 저장하지 않는다
  nickname      VARCHAR(12)     NOT NULL,
  created_at    DATETIME(3)     NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email),        -- 중복 가입을 DB 가 막아 준다
  UNIQUE KEY uk_users_nickname (nickname)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS diaries (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  title      VARCHAR(60)     NOT NULL,
  content    TEXT            NOT NULL,
  category   ENUM('diary', 'book', 'emotion')  NOT NULL DEFAULT 'diary',
  mood       VARCHAR(20)     NOT NULL DEFAULT '',
  date_key   CHAR(10)        NOT NULL,      -- 한국 시간 기준 'YYYY-MM-DD'
  visibility ENUM('public', 'private')      NOT NULL DEFAULT 'private',
  created_at DATETIME(3)     NOT NULL,
  updated_at DATETIME(3)     NOT NULL,
  PRIMARY KEY (id),
  KEY idx_diaries_user_date (user_id, date_key),      -- 내 목록 조회용
  KEY idx_diaries_public_date (visibility, date_key), -- 공개 피드 조회용
  CONSTRAINT fk_diaries_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comments (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  diary_id   BIGINT UNSIGNED NOT NULL,
  parent_id  BIGINT UNSIGNED NULL DEFAULT NULL,   -- NULL 이면 원댓글, 값이 있으면 대댓글
  user_id    BIGINT UNSIGNED NOT NULL,
  content    VARCHAR(1000)   NOT NULL,
  created_at DATETIME(3)     NOT NULL,
  PRIMARY KEY (id),
  KEY idx_comments_diary (diary_id, created_at),
  CONSTRAINT fk_comments_diary  FOREIGN KEY (diary_id)  REFERENCES diaries (id)  ON DELETE CASCADE,
  CONSTRAINT fk_comments_parent FOREIGN KEY (parent_id) REFERENCES comments (id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_user   FOREIGN KEY (user_id)   REFERENCES users (id)    ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS diary_likes (
  diary_id   BIGINT UNSIGNED NOT NULL,
  user_id    BIGINT UNSIGNED NOT NULL,
  created_at DATETIME(3)     NOT NULL,
  PRIMARY KEY (diary_id, user_id),   -- 복합 기본키 = 한 사람이 한 글에 한 번만
  CONSTRAINT fk_diary_likes_diary FOREIGN KEY (diary_id) REFERENCES diaries (id) ON DELETE CASCADE,
  CONSTRAINT fk_diary_likes_user  FOREIGN KEY (user_id)  REFERENCES users (id)   ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
```

**설계 결정 하나하나에 이유가 있다**

| 결정 | 이유 |
| --- | --- |
| `utf8mb4` | 한글과 이모지(😊)를 저장하려면 필수. `utf8` 은 이모지를 못 담는다 |
| `InnoDB` | 외래 키와 트랜잭션을 지원하는 엔진 |
| `UNIQUE KEY` on email | 애플리케이션 검사만으로는 동시 요청 시 중복이 생긴다. **DB 가 최종 방어선** |
| `ON DELETE CASCADE` | 글을 지우면 댓글·좋아요·이미지가 자동으로 함께 사라진다 |
| `PRIMARY KEY (diary_id, user_id)` | 좋아요 중복을 구조적으로 불가능하게 만든다 |
| `ENUM` | 정해진 값만 들어가게 DB 가 보장한다 |
| `DATETIME(3)` | 밀리초까지 저장. 같은 초에 만든 글의 순서를 구분할 수 있다 |
| `date_key CHAR(10)` | 표시용 날짜를 문자열로 따로 저장 (이유는 4-6절) |
| `KEY idx_...` | 자주 쓰는 조회 조건에 인덱스를 건다 |

**인덱스는 무엇인가?** 책의 색인과 같다. 없으면 DB 가 모든 행을 처음부터 끝까지 읽는다(풀 스캔).

```
인덱스 없이 WHERE user_id = 5    → 10만 행을 전부 확인
인덱스 있으면                     → 색인에서 바로 찾음
```

**인덱스를 거는 기준: `WHERE`, `JOIN`, `ORDER BY` 에 자주 등장하는 컬럼.**
단, 인덱스는 공짜가 아니다. 저장 공간을 쓰고 INSERT/UPDATE 를 느리게 한다. **필요한 곳에만.**

### 3-3. SQL 기본

```sql
-- 조회
SELECT id, title FROM diaries WHERE user_id = 1 ORDER BY date_key DESC LIMIT 10;

-- 여러 조건
SELECT * FROM diaries
WHERE user_id = 1 AND category = 'book' AND date_key LIKE '2026-08%';

-- JOIN — 두 테이블을 이어 붙인다
SELECT d.title, u.nickname
FROM diaries d
INNER JOIN users u ON u.id = d.user_id;    -- 짝이 있는 것만
-- LEFT JOIN 이면 짝이 없어도 왼쪽은 남고 오른쪽은 NULL

-- 집계
SELECT date_key, COUNT(*) AS total
FROM diaries
WHERE user_id = 1 AND date_key LIKE '2026-08%'
GROUP BY date_key;

-- 서브쿼리 — 값 하나를 계산해서 컬럼처럼 붙인다
SELECT d.*,
  (SELECT COUNT(*) FROM diary_likes l WHERE l.diary_id = d.id) AS like_count
FROM diaries d;

-- 존재 여부
SELECT EXISTS (SELECT 1 FROM diary_likes WHERE diary_id = 3 AND user_id = 1) AS liked;

-- 입력 / 수정 / 삭제
INSERT INTO diaries (user_id, title, ...) VALUES (1, '제목', ...);
UPDATE diaries SET title = '수정' WHERE id = 3;
DELETE FROM diaries WHERE id = 3;
```

> **`WHERE` 없는 `UPDATE` / `DELETE` 는 재앙이다.** 전체 행이 바뀌거나 지워진다.
> 습관: `DELETE` 를 쓰기 전에 같은 조건으로 `SELECT` 를 먼저 돌려 본다.

### 3-4. mysql2 — Node 에서 MySQL 쓰기

[backend/src/db/pool.js](backend/src/db/pool.js)

```js
const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,        // 연결을 10개까지 만들어 재사용
  charset: 'utf8mb4_unicode_ci',
  timezone: 'Z',              // DATETIME 을 항상 UTC 로 읽고 쓴다
  supportBigNumbers: true,
  bigNumberStrings: true,     // BIGINT 를 문자열로 받는다 (자릿수 손실 방지)
})
```

> **커넥션 풀을 쓰는 이유:** 요청마다 새로 연결하면 매번 TCP 연결 + 인증이 일어나 느리다.
> 풀은 미리 만들어 둔 연결을 빌려주고 돌려받는다.

**얇은 헬퍼를 만들어 반복을 줄인다**

```js
async function query(sql, params = []) {         // 여러 행
  const [rows] = await pool.query(sql, params)
  return rows
}

async function queryOne(sql, params = []) {      // 한 행 (없으면 null)
  const rows = await query(sql, params)
  return rows.length ? rows[0] : null
}

async function execute(sql, params = []) {       // INSERT/UPDATE/DELETE
  const [result] = await pool.query(sql, params)
  return result                                   // result.insertId, result.affectedRows
}
```

### 3-5. SQL 인젝션 — 반드시 이해해야 할 보안

**절대 하면 안 되는 것: 문자열 이어 붙이기**

```js
// 치명적으로 위험
const email = req.body.email
db.query("SELECT * FROM users WHERE email = '" + email + "'")
```

공격자가 이메일 칸에 이렇게 입력하면:

```
' OR '1'='1
```

실행되는 SQL 은 이렇게 된다.

```sql
SELECT * FROM users WHERE email = '' OR '1'='1'   -- 모든 회원이 조회된다
```

**반드시 이렇게 한다: 플레이스홀더(`?`)**

```js
db.query('SELECT * FROM users WHERE email = ?', [email])
```

`?` 를 쓰면 드라이버가 값을 **데이터로만** 취급한다. 값 안에 어떤 SQL 문자가 있어도 실행되지 않는다.

**동적 조건도 배열로 안전하게 만든다** — [backend/src/modules/diaries/diary.service.js](backend/src/modules/diaries/diary.service.js)

```js
export async function listMine(viewerId, { dateKey, category, visibility, keyword } = {}) {
  const conditions = ['d.author_id = ?']
  const params = [viewerId, viewerId]     // SELECT 안의 ? + WHERE 의 ? 순서가 중요하다

  if (dateKey)    { conditions.push('d.date_key = ?');   params.push(dateKey) }
  if (category)   { conditions.push('d.category = ?');   params.push(category) }
  if (visibility) { conditions.push('d.visibility = ?'); params.push(visibility) }
  if (keyword) {
    conditions.push('(d.title LIKE ? OR d.content LIKE ?)')
    params.push(toLikePattern(keyword), toLikePattern(keyword))
  }

  const rows = await db.query(
    SELECT_DIARY + ' WHERE ' + conditions.join(' AND ') + ORDER_BY_LATEST,
    params,
  )
  return attachImages(rows)
}
```

**SQL 구조는 코드가 만들고, 값은 전부 `?` 로 넘긴다.** 이것이 원칙이다.

**LIKE 검색의 함정**

`LIKE` 에서 `%` 와 `_` 는 와일드카드다. 사용자가 `%` 를 검색하면 전체가 걸린다.

```js
// 역슬래시, %, _ 를 글자 그대로 찾도록 이스케이프한다
const LIKE_ESCAPE = String.fromCharCode(92)   // 역슬래시
const LIKE_SPECIAL_PATTERN = new RegExp('[' + LIKE_ESCAPE + '%_]', 'g')

function toLikePattern(keyword) {
  const escaped = String(keyword).replace(LIKE_SPECIAL_PATTERN, (char) => LIKE_ESCAPE + char)
  return '%' + escaped + '%'
}
```

### 3-6. 트랜잭션 — 전부 성공하거나 전부 취소하거나

다이어리를 저장할 때 **글과 이미지는 함께 저장되거나, 함께 실패해야 한다.**
글만 저장되고 이미지가 실패하면 데이터가 깨진다.

```js
async function transaction(handler) {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const result = await handler(connection)
    await connection.commit()      // 전부 확정
    return result
  } catch (error) {
    await connection.rollback()    // 전부 취소
    throw error
  } finally {
    connection.release()           // 반드시 반납한다
  }
}
```

```js
async function create(authorId, payload) {
  const now = new Date()
  return db.transaction(async (connection) => {
    const [result] = await connection.query(
      `INSERT INTO diaries (user_id, title, content, category, mood, date_key,
                            visibility, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [authorId, payload.title, payload.content, payload.category, payload.mood,
       payload.dateKey, payload.visibility, now, now],
    )
    await replaceImages(connection, result.insertId, payload.images)
    return String(result.insertId)
  })
}
```

> **주의:** 트랜잭션 안에서는 **반드시 `connection.query`** 를 쓴다.
> `pool.query` 를 쓰면 다른 연결로 나가서 트랜잭션 밖에서 실행된다. 매우 찾기 어려운 버그다.

### 3-7. N+1 문제

**목록 20개를 조회하고, 각각의 이미지를 따로 조회하면 쿼리가 21번 나간다.**

```js
// 나쁨 — N+1
const diaries = await db.query('SELECT * FROM diaries WHERE user_id = ?', [userId])
for (const diary of diaries) {
  diary.images = await db.query('SELECT * FROM diary_images WHERE diary_id = ?', [diary.id])
}
```

**해결: 한 번에 가져와서 코드에서 묶는다.**
[backend/src/modules/diaries/diary.service.js](backend/src/modules/diaries/diary.service.js)

```js
async function attachImages(rows) {
  if (!rows.length) return rows

  const ids = rows.map((row) => row.id)
  const images = await db.query(
    `SELECT diary_id, url, name FROM diary_images
     WHERE diary_id IN (?)
     ORDER BY diary_id ASC, sort_order ASC, id ASC`,
    [ids],           // mysql2 가 IN (?) 에 배열을 펼쳐 준다
  )

  const grouped = new Map()
  images.forEach((image) => {
    const key = String(image.diary_id)
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key).push({ url: image.url, name: image.name })
  })

  rows.forEach((row) => { row.images = grouped.get(String(row.id)) || [] })
  return rows
}
```

**쿼리 2번으로 끝난다.** 목록 조회에서 가장 흔한 성능 문제이므로 반드시 익힌다.

### 3-8. 스키마를 코드로 관리한다

DB 를 손으로 만들면 다른 컴퓨터에서 재현할 수 없다. **스크립트로 만든다.**

[backend/src/db/migrate.js](backend/src/db/migrate.js)

```js
async function migrate() {
  const drop = process.argv.includes('--drop')
  const connection = await mysql.createConnection({ ...접속정보, multipleStatements: true })

  if (drop) {
    await connection.query('DROP DATABASE IF EXISTS `' + config.db.database + '`')
  }
  await connection.query(
    'CREATE DATABASE IF NOT EXISTS `' + config.db.database +
    '` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
  )
  await connection.query('USE `' + config.db.database + '`')
  await connection.query(fs.readFileSync(SCHEMA_PATH, 'utf8'))
}
```

`seed.js` 는 개발용 예시 데이터를 넣는다. 이 둘이 있으면 어느 컴퓨터에서든
`npm run db:reset` 한 번으로 똑같은 환경이 만들어진다.

### 확인하는 방법

```sql
-- MySQL 접속 후
SHOW TABLES;
DESC diaries;
SHOW INDEX FROM diaries;
EXPLAIN SELECT * FROM diaries WHERE user_id = 1;   -- 인덱스를 타는지 확인
SELECT COUNT(*) FROM diaries;
```

### 백지 재현 과제 (2회독)

1. 요구사항만 보고 5개 테이블 스키마를 직접 설계한다 (FK, UNIQUE, 인덱스 포함)
2. `migrate.js` 를 만들어 스크립트로 DB 를 만든다
3. 목록 조회 SQL 을 작성한다 — 작성자 닉네임 JOIN, 좋아요 수, 댓글 수, 내가 눌렀는지
4. 트랜잭션으로 "글 + 이미지" 를 함께 저장한다
5. `attachImages` 로 N+1 을 없앤다

### 확장 과제 (3회독)

1. `EXPLAIN` 으로 인덱스 사용 여부를 확인하고, 인덱스를 지웠다 다시 만들며 차이를 관찰한다
2. 커서 기반 페이지네이션을 구현한다 (`WHERE (date_key, id) < (?, ?) LIMIT 20`)
3. 글을 실제로 지우지 않고 `deleted_at` 을 채우는 소프트 삭제로 바꾼다
4. 조회수 컬럼을 추가하고 동시 요청에서도 정확하도록 `UPDATE ... SET views = views + 1` 로 처리한다

### Level 3 체크리스트

- [ ] 요구사항에서 테이블과 관계를 스스로 도출할 수 있다
- [ ] 1:N 과 N:M 을 어떻게 표현하는지 안다
- [ ] `ON DELETE CASCADE` 가 무엇을 해 주는지 안다
- [ ] SQL 인젝션이 왜 생기고 어떻게 막는지 설명할 수 있다
- [ ] 트랜잭션이 필요한 상황을 예로 들 수 있다
- [ ] N+1 문제를 발견하고 고칠 수 있다
- [ ] 인덱스를 어디에 걸어야 하는지 판단할 수 있다

---

## Level 4 — 구조·인증·권한 (중상급)

### 목표

파일이 40개가 넘어도 길을 잃지 않는 구조를 만든다. 그리고 안전하게 사용자를 식별한다.

### 4-1. 계층 구조 — 각 층이 한 가지만 한다

```
요청
 ↓
routes/        주소와 함수를 연결만 한다
 ↓
routes       주소와 미들웨어를 연결한다. 로직이 없다.
 ↓
controller   요청에서 값을 꺼내 서비스에 넘기고, 결과를 응답한다. 얇게 유지한다.
 ↓
service      권한 검사 + 업무 규칙 + SQL + 응답 형태 변환
```

그리고 **기능별로 폴더를 묶는다.** 다이어리를 고치려면 그 폴더만 열면 된다.

```
backend/src/modules/
├─ auth/       auth.routes.js  auth.controller.js  auth.service.js
├─ diaries/    diary.routes.js diary.controller.js diary.service.js
├─ comments/   comment.routes.js ...
└─ uploads/    upload.routes.js
```

**왜 나누나?** 한 파일에 다 넣으면 200줄이 넘는 순간 아무도 못 고친다.
층을 나누면 **"어디를 고쳐야 하지?" 의 답이 항상 하나**다.

| 바꾸고 싶은 것 | 고칠 곳 |
| --- | --- |
| 주소를 `/posts` 로 바꾸고 싶다 | `modules/diaries/diary.routes.js` |
| 제목 길이 제한을 100자로 | `utils/validate.js` |
| 비공개 글도 관리자는 볼 수 있게 | `diary.service.js` 의 권한 검사 부분 |
| 목록 정렬 순서를 바꾸고 싶다 | `diary.service.js` 의 `ORDER_BY_LATEST` |
| 응답에 필드를 추가하고 싶다 | `diary.service.js` 의 `serializeDiary()` |

> **층을 더 잘게 쪼개는 방식도 있다.** SQL 만 담는 `models/`, 형태 변환만 담는
> `serializers/` 를 따로 두는 구성이다. 규모가 커지면 그쪽이 낫다.
> 이 프로젝트는 파일이 이미 25개라 **3층까지만** 나눴다.
> 층이 늘면 이해는 쉬워지지만 **파일을 오가는 비용**도 같이 늘기 때문이다.
> "지금 몇 층이 맞나"는 정답이 없고, 코드가 커질 때 다시 판단하면 된다.

**실제 코드로 보는 한 흐름 — `PUT /api/diaries/:id`**

```js
// ① diary.routes.js — 연결만
diaryRouter.use(requireAuth)          // 이 아래는 전부 로그인 필요
diaryRouter.put('/:id', controller.update)
```

```js
// ② diary.controller.js — 값 꺼내서 넘기기 (Express 5 라 try/catch 불필요)
export async function update(req, res) {
  res.json(await diaryService.update(req.user.id, req.params.id, req.body))
}
```

```js
// ③ diary.service.js — 권한 검사 → 입력 검증 → SQL → 형태 변환
export async function update(viewerId, id, body) {
  const current = await findDiaryOrFail(viewerId, id)      // 없으면 404

  // 다른 회원이 쓴 글은 수정할 수 없다.
  if (current.author_id !== viewerId) throw ApiError.forbidden('수정 권한이 없습니다.')

  const payload = requireDiaryPayload(body)                // 잘못된 값이면 400

  await withTransaction(async (connection) => {            // 글과 이미지를 한 묶음으로
    await connection.execute('UPDATE diaries SET title = ?, ... WHERE id = ?', [...])
    await replaceImages(connection, id, payload.images)
  })

  return get(viewerId, id)                                 // 저장된 결과를 다시 읽어 응답
}
```

```js
// ④ 같은 파일 안의 형태 변환 — DB 행(snake_case) → 응답(camelCase)
function serializeDiary(row, images = []) {
  return {
    id: row.id,
    authorId: row.author_id,                             // snake_case → camelCase
    author: { id: row.author_id, nickname: row.author_nickname },
    title: row.title,
    dateKey: row.date_key,
    images,
    likeCount: Number(row.like_count),
    likedByMe: Boolean(Number(row.liked_by_me)),         // 0/1 → true/false
    createdAt: toIso(row.created_at),                    // Date → ISO 문자열
    // password_hash 같은 건 절대 여기 넣지 않는다
  }
}
```

> **시리얼라이저가 중요한 이유 2가지**
> ① **내부 구조를 감춘다.** 컬럼 이름을 바꿔도 API 응답은 그대로 유지할 수 있다.
> ② **실수로 비밀을 흘리지 않는다.** `SELECT *` 결과를 그대로 `res.json()` 하면
> `password_hash` 가 그대로 나간다. 시리얼라이저를 거치면 **넣기로 한 것만** 나간다.

### 4-2. 비밀번호 — 절대 평문으로 저장하지 않는다

```js
import bcrypt from 'bcryptjs'
const SALT_ROUNDS = 10

function hashPassword(plain)          { return bcrypt.hash(plain, SALT_ROUNDS) }
function verifyPassword(plain, hashed) { return bcrypt.compare(plain, hashed) }
```

**왜 bcrypt 인가?**

| 방식 | 문제 |
| --- | --- |
| 평문 저장 | DB 가 유출되면 모든 회원의 비밀번호가 그대로 노출 |
| MD5 / SHA-256 | 너무 빨라서 초당 수십억 번 대입 가능. 레인보우 테이블로 즉시 역산 |
| **bcrypt** | **일부러 느리게** 설계됨. 자동으로 salt 를 붙여 같은 비밀번호도 다른 해시가 됨 |

해시는 **단방향**이다. 되돌릴 수 없고, 비교만 할 수 있다.
그래서 "비밀번호 찾기"가 아니라 "비밀번호 재설정"만 가능하다.

### 4-3. JWT — 로그인 상태를 유지하는 방법

```js
import jwt from 'jsonwebtoken'

function createToken(userId) {
  return jwt.sign({ sub: String(userId) }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,     // '7d'
  })
}

/** 토큰이 유효하면 사용자 id 를, 아니면 null 을 반환한다. */
function readUserId(token) {
  try {
    const payload = jwt.verify(token, config.jwt.secret)
    return payload.sub ? String(payload.sub) : null
  } catch {
    return null      // 만료됐거나 위조됐거나 형식이 틀림
  }
}
```

**JWT 는 세 부분이다:** `헤더.페이로드.서명`

```
eyJhbGciOiJIUzI1NiJ9 . eyJzdWIiOiIxIiwiZXhwIjoxNzY... . dBjftJeZ4CVP-mB92K27uh...
     알고리즘              데이터 (누구인지, 언제까지)        비밀키로 만든 서명
```

> **매우 중요: 페이로드는 암호화가 아니라 인코딩일 뿐이다.**
> 누구나 디코딩해서 읽을 수 있다. **비밀번호나 민감 정보를 절대 넣지 않는다.**
> 서명은 "내용이 위조되지 않았음"만 보장한다.

**인증 미들웨어** — [backend/src/middlewares/auth.js](backend/src/middlewares/auth.js)

```js
function readBearerToken(req) {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) return ''
  return header.slice(7).trim()
}

export async function requireAuth(req, res, next) {
  const token = readBearerToken(req)
  if (!token) throw ApiError.unauthorized()

  const userId = readUserId(token)
  if (!userId) throw ApiError.unauthorized('로그인 정보가 만료되었습니다. 다시 로그인해 주세요.')

  const user = await userModel.findById(userId)     // 탈퇴한 회원의 토큰을 막는다
  if (!user) throw ApiError.unauthorized()

  req.user = user      // { id, email, nickname, created_at }
  next()
}
```

**`req.user` 에 담아 두면 이후 모든 컨트롤러에서 `req.user.id` 로 쓸 수 있다.**

> **왜 매번 DB 를 조회하나?** 토큰만 믿으면 탈퇴하거나 차단된 회원도 토큰 만료 전까지
> 계속 사용할 수 있다. 성능이 문제가 되면 캐시를 얹는다.

**로그인 서비스** — 보안 관점의 디테일이 들어 있다.

```js
async function login({ email, password }) {
  const user = await userModel.findByEmail(email)
  const matched = user ? await verifyPassword(password, user.password_hash) : false

  // 가입 여부가 드러나지 않도록 오류 메시지를 하나로 통일한다
  if (!user || !matched) {
    throw ApiError.unauthorized('이메일 또는 비밀번호가 올바르지 않습니다.')
  }

  return { user: toPublicUser(user), token: createToken(user.id) }
}
```

> **"없는 이메일입니다" 와 "비밀번호가 틀렸습니다" 를 구분하면 안 된다.**
> 공격자가 어떤 이메일이 가입되어 있는지 알아낼 수 있다(계정 열거 공격).

### 4-4. 권한 설계 — 인증과 인가는 다르다

```
인증(Authentication) = 너 누구야?      → requireAuth 미들웨어, 실패하면 401
인가(Authorization)  = 너 이거 해도 돼? → 서비스 계층, 실패하면 403
```

**권한 규칙은 서비스 계층에 모은다.** [backend/src/modules/diaries/diary.service.js](backend/src/modules/diaries/diary.service.js)

```js
/** 다이어리를 찾고, 없으면 404 를 던진다. */
async function findOrFail(id) {
  const diary = await diaryModel.findOwnership(id)
  if (!diary) throw ApiError.notFound(NOT_FOUND)
  return diary
}

/** 읽기 권한 - 비공개 글은 작성자 본인만 볼 수 있다. */
function assertReadable(diary, viewerId) {
  if (diary.visibility === 'private' && String(diary.user_id) !== String(viewerId)) {
    throw ApiError.forbidden('비공개 글입니다.')
  }
}

/** 수정 / 삭제 권한 - 작성자 본인만 가능하다. */
function assertOwner(diary, viewerId, message) {
  if (String(diary.user_id) !== String(viewerId)) throw ApiError.forbidden(message)
}

/** 좋아요 / 댓글은 공개 글에서만 가능하다. */
function assertPublic(diary, message) {
  if (diary.visibility !== 'public') throw ApiError.badRequest(message)
}
```

이 작은 함수 4개를 각 서비스에서 조합해 쓴다.

```js
async function toggleLike(id, viewerId) {
  const diary = await findOrFail(id)
  assertPublic(diary, '공개된 글에만 좋아요를 누를 수 있습니다.')
  // ...
}
```

> **가장 중요한 원칙: 화면에서 막았다고 안심하지 않는다.**
> 프론트엔드에서 수정 버튼을 숨겨도, 누구나 `curl` 로 `PUT /api/diaries/3` 을 보낼 수 있다.
> **모든 권한은 서버에서 반드시 다시 검사한다.** 이것을 안 하면 앱이 아니라 구멍이다.
>
> 확인 방법: 다른 계정의 토큰으로 남의 글 수정을 시도해서 403 이 나오는지 직접 테스트한다.

### 4-5. 입력 검증 — 신뢰할 수 있는 입력은 없다

[backend/src/utils/validate.js](backend/src/utils/validate.js)

```js
// 문제가 있으면 400 ApiError 를 던지고, 통과하면 "정리된 값"을 돌려준다
function parseEmail(value) {
  const email = asText(value).toLowerCase()          // 공백 제거 + 소문자 통일
  if (!email) throw ApiError.badRequest('이메일을 입력해 주세요.')
  if (!EMAIL_PATTERN.test(email)) throw ApiError.badRequest('이메일 형식이 올바르지 않습니다.')
  if (email.length > 255) throw ApiError.badRequest('이메일이 너무 깁니다.')
  return email
}

function parseDiaryPayload(body = {}) {
  const title = asText(body.title)
  const content = asText(body.content)

  if (!title) throw ApiError.badRequest('제목을 입력해 주세요.')
  if (title.length > 60) throw ApiError.badRequest('제목은 60자 이하여야 합니다.')
  if (!content) throw ApiError.badRequest('내용을 입력해 주세요.')
  if (content.length > 20000) throw ApiError.badRequest('내용이 너무 깁니다.')

  return {
    title, content,
    category:   parseEnum(body.category, CATEGORIES, { field: '종류', fallback: 'diary' }),
    mood:       parseEnum(body.mood, MOODS, { field: '감정', fallback: '', required: false }),
    dateKey:    parseDateKey(body.dateKey, { fallbackToday: true }),
    visibility: parseEnum(body.visibility, VISIBILITIES, { field: '공개 여부', fallback: 'private' }),
    images:     parseImages(body.images),
  }
}
```

**검증 함수의 3가지 원칙**

1. **던지거나 돌려준다** — 통과하면 정리된 값, 실패하면 `ApiError`
2. **정리(normalize)까지 한다** — `trim()`, 소문자 변환, 기본값 채우기
3. **화이트리스트로 검사한다** — "나쁜 값을 막는다"가 아니라 "허용된 값만 통과시킨다"

```js
// 나쁨 — 금지어 목록은 언제나 뚫린다
if (category === 'hack') throw ...

// 좋음 — 허용 목록에 없으면 전부 거부
const CATEGORIES = ['diary', 'book', 'emotion']
if (!CATEGORIES.includes(category)) throw ApiError.badRequest('종류 값이 올바르지 않습니다.')
```

**URL 파라미터도 검증한다.** 검증 안 하면 `/api/diaries/abc` 가 이상한 SQL 오류를 낸다.

```js
function parseId(value, message = '잘못된 요청입니다.') {
  const id = asText(value)
  if (!/^\d+$/.test(id)) throw ApiError.notFound(message)   // 숫자가 아니면 404
  return id
}
```

### 4-6. 시간대 — 한국 시간 다루기

**이 프로젝트의 요구사항: "한국 시간 기준으로 날짜를 정한다."**

무엇이 문제인가?

```
한국 시간 2026-08-30 오전 2시  =  UTC 2026-08-29 오후 5시
                 ↑ 날짜가 다르다
```

서버가 UTC 로 돌아가면, 한국의 새벽에 쓴 글이 **전날 글로 분류된다.**

**이 프로젝트의 해법: 두 가지를 분리해서 저장한다.**

| 값 | 저장 방식 | 이유 |
| --- | --- | --- |
| `created_at`, `updated_at` | **UTC** `DATETIME(3)` | 정확한 시점. 나중에 어느 시간대로든 변환 가능 |
| `date_key` | **KST 기준** `'YYYY-MM-DD'` 문자열 | "며칠의 기록인가"라는 사용자 개념. 계산 없이 바로 비교·그룹핑 |

```js
const TIME_ZONE = 'Asia/Seoul'

const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', {   // en-CA 는 YYYY-MM-DD 형식
  timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
})

function toDateKey(value = new Date()) {
  return dateKeyFormatter.format(value instanceof Date ? value : new Date(value))
}

function todayKey() { return toDateKey(new Date()) }

/** DB 의 DATETIME 값을 프론트엔드가 쓰는 ISO 문자열로 바꾼다. */
function toIso(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}
```

**`date_key` 를 문자열로 둔 덕분에 월별 집계가 아주 단순해진다.**

```sql
SELECT date_key, COUNT(*) AS total
FROM diaries
WHERE date_key LIKE '2026-08%' AND user_id = ?
GROUP BY date_key;
```

시간대 변환 함수 없이 문자열 비교만으로 끝난다.

> **원칙: 시각은 UTC 로 저장하고, 표시할 때 변환한다.**
> 단, "사용자가 인식하는 날짜"가 업무 규칙에 들어가면(하루 단위 집계, 캘린더)
> 그 날짜를 **따로 저장**하는 편이 훨씬 단순하고 버그가 없다.

### 4-7. 파일 업로드

[backend/src/middlewares/upload.js](backend/src/middlewares/upload.js)

```js
const storage = multer.diskStorage({
  destination: (req, file, done) => done(null, config.upload.directory),
  filename: (req, file, done) => {
    // 원본 이름을 그대로 쓰지 않는다 — 중복, 한글 깨짐, 경로 조작(../../) 위험
    const extension = getExtension(file.originalname)
    const unique = Date.now() + '-' + crypto.randomBytes(8).toString('hex')
    done(null, unique + '.' + extension)
  },
})

function fileFilter(req, file, done) {
  const extension = getExtension(file.originalname)
  const allowedExtension = config.upload.allowedExtensions.includes(extension)
  const allowedMime = config.upload.allowedMimeTypes.includes(file.mimetype)

  if (!allowedExtension || !allowedMime) {
    done(ApiError.badRequest(
      config.upload.allowedExtensions.join(', ') + ' 형식만 업로드할 수 있습니다.',
    ))
    return
  }
  done(null, true)
}

const uploader = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxBytes, files: 1 },   // 10MB, 1개
})
```

**업로드 보안 체크리스트**

- [ ] 파일 이름을 서버가 새로 만든다 (경로 조작 방지)
- [ ] 확장자와 MIME 타입을 **둘 다** 검사한다
- [ ] 용량 제한을 multer 레벨에서 건다 (앱에 도달하기 전에 차단)
- [ ] 업로드 폴더에서 스크립트가 실행되지 않게 한다 (정적 서빙만)
- [ ] 업로드는 로그인한 사용자만 가능하게 한다

**응답으로는 접근 가능한 URL 을 준다.**

```js
res.status(201).json({
  url: config.upload.publicBaseUrl + '/uploads/' + req.file.filename,   // '/uploads/xxx.png'
  name: req.file.originalname,
  size: req.file.size,
})
```

### 확인하는 방법

```bash
# 회원가입
curl -i -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"a@b.com","nickname":"테스터","password":"test1234"}'

# 토큰을 변수에 담아 재사용
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"a@b.com","password":"test1234"}' | node -pe "JSON.parse(require('fs').readFileSync(0)).token")

# 인증이 필요한 요청
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/diaries

# 권한 테스트 — 다른 계정 토큰으로 남의 글 수정 → 403 이 나와야 한다
curl -i -X PUT http://localhost:4000/api/diaries/1 \
  -H "Authorization: Bearer $OTHER_TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"해킹","content":"x","category":"diary","dateKey":"2026-08-30","visibility":"public"}'
```

### 백지 재현 과제 (2회독)

1. `routes / controllers / services / models / serializers` 5층 구조로 다이어리 CRUD 를 만든다
2. bcrypt + JWT 로 회원가입·로그인·`/auth/me` 를 만든다
3. `requireAuth` 미들웨어를 만들어 `req.user` 를 채운다
4. 권한 함수 4개(`findOrFail`, `assertOwner`, `assertReadable`, `assertPublic`)를 만들어 적용한다
5. 검증 유틸을 만들어 모든 입력을 검증한다
6. multer 로 이미지 업로드를 만든다
7. **다른 계정으로 남의 글 수정을 시도해 403 이 나오는지 직접 확인한다**

### 확장 과제 (3회독)

1. 대댓글의 대댓글이 생기지 않도록 2단계로 제한한다 (이 프로젝트가 쓰는 방법을 찾아본다)
2. 리프레시 토큰을 도입한다 — 액세스 토큰 15분 + 리프레시 토큰 14일
3. 역할(role) 컬럼을 추가해 관리자는 모든 글을 볼 수 있게 한다
4. 글 삭제 시 업로드된 이미지 파일도 디스크에서 지운다

### Level 4 체크리스트

- [ ] 5개 계층이 각각 무엇을 하는지 설명할 수 있다
- [ ] 시리얼라이저가 왜 보안에도 중요한지 안다
- [ ] bcrypt 를 쓰는 이유와 SHA-256 을 쓰면 안 되는 이유를 안다
- [ ] JWT 페이로드에 민감 정보를 넣으면 안 되는 이유를 안다
- [ ] 인증(401)과 인가(403)를 구분해 구현할 수 있다
- [ ] "화면에서 막았으니 됐다"가 왜 틀린지 설명할 수 있다
- [ ] 화이트리스트 검증을 할 수 있다
- [ ] UTC 저장과 KST 날짜 키를 분리하는 이유를 안다

---

## Level 5 — 보안·성능·운영 (고급)

### 목표

"동작하는 서버"에서 "밖에 내놔도 되는 서버"로 넘어간다.

### 5-1. 지금 이 프로젝트에 없는 것 (배포 전 필수)

이 프로젝트는 학습용으로 완성도가 높지만, **공개 서버에 올리기 전에 다음이 필요하다.**

**① 보안 헤더 — helmet**

```bash
npm install helmet
```

```js
import helmet from 'helmet'
app.use(helmet())    // cors 앞에 둔다
```

XSS, 클릭재킹, MIME 스니핑 등을 막는 HTTP 헤더를 한 번에 붙여 준다.

**② 로그인 시도 제한 — rate limit**

```bash
npm install express-rate-limit
```

```js
import rateLimit from 'express-rate-limit'

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,   // 10분 동안
  max: 10,                     // 10번까지
  message: { message: '너무 많이 시도했습니다. 잠시 후 다시 시도해 주세요.' },
  standardHeaders: true,
})

router.post('/login', loginLimiter, authController.login)
router.post('/signup', loginLimiter, authController.signup)
```

**없으면 어떻게 되나?** 공격자가 초당 수백 번 비밀번호를 시도할 수 있다.
8자리 비밀번호는 제한이 없으면 뚫린다.

**③ 프록시 뒤에서 실제 IP 알기**

```js
app.set('trust proxy', 1)   // Nginx/로드밸런서 뒤에 있을 때
```

이게 없으면 rate limit 이 모든 사용자를 같은 IP 로 인식한다.

**④ 프론트엔드 정적 파일 서빙 (한 서버로 배포할 때)**

```js
const clientDir = path.join(__dirname, '..', '..', 'frontend', 'dist')
app.use(express.static(clientDir))

// SPA 는 모든 경로를 index.html 로 보낸다 (Vue Router 가 처리하게)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next()   // API 는 제외
  res.sendFile(path.join(clientDir, 'index.html'))
})
```

**⑤ 비밀 관리**

- `JWT_SECRET` 은 최소 32자 이상의 랜덤 문자열
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- DB 계정은 root 가 아니라 **이 앱 전용 계정**을 만들고 필요한 권한만 준다
  ```sql
  CREATE USER 'diary_app'@'localhost' IDENTIFIED BY '긴비밀번호';
  GRANT SELECT, INSERT, UPDATE, DELETE ON my_diary.* TO 'diary_app'@'localhost';
  ```
- 운영 환경에서는 `.env` 파일 대신 호스팅 서비스의 환경 변수 기능을 쓴다

### 5-2. 성능

**① 페이지네이션 — 목록이 커지면 필수**

지금은 전체를 다 준다. 글이 1만 개가 되면 응답이 수 MB 가 된다.

```sql
-- 오프셋 방식 (간단하지만 뒤로 갈수록 느려짐)
SELECT * FROM diaries WHERE user_id = ? ORDER BY date_key DESC LIMIT 20 OFFSET 40;

-- 커서 방식 (권장 — 항상 빠름)
SELECT * FROM diaries
WHERE user_id = ? AND (date_key, id) < (?, ?)
ORDER BY date_key DESC, id DESC LIMIT 20;
```

**② 인덱스 확인**

```sql
EXPLAIN SELECT * FROM diaries WHERE user_id = 1 AND date_key = '2026-08-30';
```

`type` 이 `ALL` 이면 풀 스캔이다. `ref` 나 `range` 가 나와야 인덱스를 탄 것이다.

**③ N+1 제거** — Level 3 에서 다뤘다. 목록 API 를 만들 때마다 확인한다.

**④ 캐시** — 자주 읽고 잘 안 바뀌는 데이터(월별 개수 등)는 Redis 에 담는다.
단, **캐시는 마지막 수단이다.** 인덱스와 쿼리를 먼저 고친다.

### 5-3. 로깅

```js
// 개발 — 사람이 읽기 좋게
app.use(morgan('dev'))

// 운영 — 표준 접근 로그 형식 (IP, 시각, 요청, 상태, 리퍼러, 브라우저)
app.use(morgan('combined'))
```

**로그에 절대 남기면 안 되는 것:** 비밀번호, 토큰 전문, 주민번호, 카드번호.

**남겨야 하는 것:** 시각, 요청 ID, 메서드, 경로, 상태 코드, 응답 시간, 사용자 ID(있으면).

운영 단계로 가면 `pino` 나 `winston` 으로 구조화된 로그를 남기고,
로그 수집 서비스에 보낸다.

### 5-4. 테스트

**테스트 없이 고치면 무엇이 깨졌는지 알 수 없다.**

```bash
npm install -D vitest supertest
```

```js
// tests/auth.test.js
import request from 'supertest'
import { createApp } from '../src/app.js'   // app 을 분리해 둔 덕분에 그대로 쓸 수 있다

const app = createApp()

describe('POST /api/auth/signup', () => {
  it('이메일 형식이 틀리면 400', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'bad', nickname: '테스터', password: 'test1234' })

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('이메일 형식이 올바르지 않습니다.')
  })
})

describe('PUT /api/diaries/:id', () => {
  it('남의 글을 수정하면 403', async () => {
    const res = await request(app)
      .put('/api/diaries/1')
      .set('Authorization', 'Bearer ' + otherUserToken)
      .send(validPayload)

    expect(res.status).toBe(403)
  })
})
```

**테스트 우선순위**

1. **권한 규칙** — 뚫리면 사고다. 가장 먼저 테스트한다
2. **검증 규칙** — 경계값(0자, 최대+1자)
3. **핵심 흐름** — 가입 → 로그인 → 작성 → 조회
4. 유틸 함수 (날짜 변환 등) — 가장 쉽고 빠르다

### 5-5. 배포

**배포 전 점검표**

- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` 을 랜덤 값으로 교체
- [ ] DB 전용 계정 사용 (root 아님)
- [ ] helmet + rate limit 적용
- [ ] `.env` 가 저장소에 없는지 확인
- [ ] 오류 응답에 스택이 포함되지 않는지 확인
- [ ] HTTPS 적용 (Let's Encrypt 무료)
- [ ] DB 백업 계획 (`mysqldump` 를 매일 자동 실행)
- [ ] **업로드 파일 보관 위치** — 아래 참고

> **가장 흔한 배포 사고: 업로드한 이미지가 사라진다.**
> Railway, Render 같은 PaaS 는 재배포할 때마다 디스크가 초기화된다.
> 해결책 ① 영구 볼륨을 붙인다 ② S3 / Cloudflare R2 같은 오브젝트 스토리지를 쓴다
> ③ 직접 관리하는 VPS 를 쓴다.

**배포 방식 비교**

| 방식 | 장점 | 단점 |
| --- | --- | --- |
| PaaS (Railway, Render) | git push 로 배포, MySQL 애드온, HTTPS 자동 | 비용, 업로드 파일에 볼륨 필요 |
| VPS (Oracle 무료, Lightsail) | 저렴/무료, 자유도 높음, 로컬 디스크 그대로 사용 | Nginx·PM2·MySQL 직접 설치·관리 |
| Docker Compose | 어디서든 동일하게 실행 | Docker 학습 필요 |

**프로세스 관리 (VPS 인 경우)**

```bash
npm install -g pm2
pm2 start src/server.js --name diary-api
pm2 startup && pm2 save     # 서버 재부팅 시 자동 실행
pm2 logs diary-api
```

**Nginx 리버스 프록시**

```nginx
server {
  listen 80;
  server_name example.com;

  location / {
    proxy_pass http://localhost:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### 5-6. 다음 단계 — 여기서 더 높은 수준으로

| 주제 | 무엇을 얻나 | 시작점 |
| --- | --- | --- |
| **TypeScript 전환** | 컴파일 시점에 오타·타입 오류를 잡는다 | `tsconfig.json`, 타입부터 정의 |
| **자동 테스트 + CI** | push 할 때마다 자동 검증 | Vitest + supertest → GitHub Actions |
| **API 문서 자동화** | 프론트와의 소통 비용 감소 | OpenAPI(Swagger) 스펙 작성 |
| **마이그레이션 도구** | 스키마 변경 이력 관리 | `db-migrate`, Knex, Prisma Migrate |
| **ORM 도입** | SQL 반복 감소, 타입 안전 | Prisma (단, SQL 을 먼저 익힌 뒤에) |
| **Redis 캐시 / 세션** | 응답 속도, 확장성 | 월별 개수 캐싱부터 |
| **작업 큐** | 느린 작업을 비동기로 (이미지 리사이즈, 메일) | BullMQ |
| **실시간** | 댓글·알림 즉시 반영 | Socket.IO 또는 SSE |
| **관측성(Observability)** | 문제를 빨리 찾는다 | 구조화 로그 + 메트릭 + 에러 추적(Sentry) |
| **부하 테스트** | 한계를 미리 안다 | k6, autocannon |
| **읽기 전용 복제본** | 조회 부하 분산 | MySQL replication |

### Level 5 체크리스트

- [ ] helmet 과 rate limit 이 왜 필요한지 설명할 수 있다
- [ ] `EXPLAIN` 으로 인덱스 사용 여부를 확인할 수 있다
- [ ] 커서 페이지네이션을 구현할 수 있다
- [ ] 로그에 남기면 안 되는 것을 안다
- [ ] supertest 로 권한 테스트를 작성할 수 있다
- [ ] 배포 시 업로드 파일이 사라지는 문제와 해결책을 안다

---

## 최종 관문 — 백지에서 API 서버 전체 만들기

**문서를 완전히 덮고**, 아래 명세만 보고 처음부터 만든다.

### API 명세

```
POST   /api/auth/signup                  -> 201 { user, token }
POST   /api/auth/login                   -> 200 { user, token }
GET    /api/auth/me                      -> 200 { user }
POST   /api/auth/logout                  -> 200 {}

GET    /api/diaries?dateKey&category&visibility&keyword  -> { items }
GET    /api/diaries/feed?keyword&category                -> { items }
GET    /api/diaries/monthly-counts?year&month&scope      -> { counts }
GET    /api/diaries/:id                  -> { diary }
POST   /api/diaries                      -> 201 { diary }
PUT    /api/diaries/:id                  -> { diary }
DELETE /api/diaries/:id                  -> {}
POST   /api/diaries/:id/like             -> { liked, likeCount }

GET    /api/diaries/:id/comments         -> { items }
POST   /api/diaries/:id/comments         -> 201 { comment }
DELETE /api/diaries/:id/comments/:cid    -> {}

POST   /api/uploads/image                -> 201 { url, name, size }

실패 시 항상: { message: "사람이 읽을 수 있는 한국어 안내" }

응답 형태
User    { id, email, nickname, createdAt }
Diary   { id, authorId, author: { id, nickname }, title, content,
          category, mood, dateKey, visibility, images: [{ url, name }],
          likeCount, likedByMe, commentCount, createdAt, updatedAt }
Comment { id, diaryId, parentId, authorId, author: { id, nickname }, content, createdAt }

권한 규칙
- PUT/DELETE /diaries/:id            작성자 본인만, 아니면 403
- GET  /diaries/:id                  비공개 글은 작성자 본인만, 아니면 403
- POST /diaries/:id/like, /comments  공개 글에만, 아니면 400
- DELETE /comments/:cid              댓글 작성자 본인만, 아니면 403 (대댓글도 함께 삭제)
- 로그인 필요: /auth/signup, /auth/login, 업로드된 이미지 파일을 제외한 전부

기타
- 날짜(dateKey)는 한국 시간 기준 'YYYY-MM-DD'
- id 는 응답에서 문자열로 내려준다
- 이미지: 10MB, jpg/jpeg/png/gif/webp
- 비밀번호는 8자 이상, 해시로만 저장
```

### 완성 기준 — 직접 호출해서 확인한다

- [ ] 같은 이메일로 두 번 가입하면 409
- [ ] 비밀번호를 틀리면 401 이고, "없는 이메일"과 메시지가 같다
- [ ] 토큰 없이 `/api/diaries` 를 부르면 401
- [ ] 위조한 토큰으로 부르면 401
- [ ] 다른 계정으로 남의 글을 수정하면 403
- [ ] 남의 비공개 글을 조회하면 403
- [ ] 비공개 글에 좋아요를 누르면 400
- [ ] 좋아요를 두 번 누르면 켜졌다 꺼진다
- [ ] 댓글을 지우면 그 대댓글도 함께 사라진다
- [ ] 글을 지우면 댓글·좋아요·이미지가 함께 사라진다
- [ ] `/api/diaries/abc` 는 500 이 아니라 404
- [ ] 잘못된 JSON 을 보내면 500 이 아니라 400
- [ ] 11MB 이미지를 올리면 400 과 안내 메시지
- [ ] `.txt` 파일을 이미지로 올리면 400
- [ ] 검색어에 `%` 를 넣어도 전체가 조회되지 않는다
- [ ] DB 를 끄고 서버를 켜면 조용히 뜨지 않고 오류를 내며 종료된다
- [ ] 응답 어디에도 `password_hash` 가 없다

### 그다음 — 더 높은 수준

1. **TypeScript 로 다시 만들기**
2. **테스트를 먼저 쓰고 만들기** (권한 테스트부터)
3. **다른 도메인으로 바꿔 만들기** — 가계부, 예약 시스템 등
4. **실제로 배포하고 도메인을 붙이기**

---

## Level 6 — 대형 백엔드 아키텍처 (실무 고급)

### 목표

API 가 100개, 테이블이 50개, 개발자가 5명이 되어도 **한 곳만 고치면 되는** 서버를 만든다.
그리고 데이터 정합성·일관성을 구조로 보장한다.

> **백엔드 대형화의 진짜 위험은 "데이터가 조용히 깨지는 것"이다.**
> 화면 버그는 눈에 보이지만, 잘못 저장된 데이터는 몇 달 뒤 발견된다.
> 이 레벨의 모든 기법은 "잘못된 상태가 애초에 저장되지 못하게" 하는 것이 목적이다.

### 6-1. 계층 구조 심화 — 3층에서 5층으로

이 프로젝트는 `routes → controller → service` 3층이다. 규모가 커지면 `service` 가 비대해진다.
`service` 안에 있던 SQL 과 형태 변환을 분리한다.

```
routes/         주소 + 미들웨어 연결                     (로직 없음)
 ↓
controller/     HTTP 를 다룬다 — req 에서 값 꺼내기, 상태코드, res.json   (얇게)
 ↓
service/        유스케이스 = 업무 규칙 + 권한 + 트랜잭션 경계   (HTTP 를 모른다)
 ↓
repository/     DB 접근만 — SQL 문 하나당 함수 하나         (업무 규칙을 모른다)
 ↓
(db/pool)       커넥션 풀
```

그리고 형태 변환은 `serializer` 로, 입력 검증은 `dto`(또는 `schema`)로 뺀다.

```
modules/diaries/
├─ diary.routes.js
├─ diary.controller.js
├─ diary.service.js
├─ diary.repository.js      ← SELECT/INSERT/UPDATE/DELETE 만
├─ diary.serializer.js      ← DB 행 → API 응답
├─ diary.schema.js          ← 입력 검증 (zod)
└─ diary.test.js
```

**각 층이 "모르는 것"이 곧 규칙이다**

| 층 | 아는 것 | 절대 모르는 것 |
| --- | --- | --- |
| controller | `req`, `res`, 상태 코드 | SQL, 업무 규칙 |
| service | 업무 규칙, 권한, 트랜잭션 | `req`/`res`, SQL 문법 |
| repository | SQL, 테이블 구조 | 왜 부르는지, HTTP |
| serializer | 응답 형태 | DB, 요청 |

```js
// diary.repository.js — HTTP 도 업무 규칙도 모른다. 그냥 데이터.
export function findById(id, conn = pool) {
  return queryOne(conn, `${SELECT_DIARY} WHERE d.id = ?`, [id])
}
export function insert(conn, data) {
  return execute(conn, `INSERT INTO diaries (...) VALUES (...)`, [...])
}
```

```js
// diary.service.js — 규칙만. SQL 은 repository 에 위임.
export async function updateDiary(viewerId, id, body) {
  const current = await diaryRepo.findById(id)
  if (!current) throw ApiError.notFound()
  assertOwner(current, viewerId, '수정 권한이 없습니다.')
  const data = diarySchema.parseUpdate(body)

  await withTransaction(async (conn) => {
    await diaryRepo.update(conn, id, data)
    await imageRepo.replaceForDiary(conn, id, data.images)
  })
  return serializeDiary(await diaryRepo.findById(id))
}
```

> **층을 몇 개로 나눌지에 정답은 없다.** 파일 25개면 3층, 100개면 5층 정도가 보통이다.
> 판단 기준: **"이 파일이 두 가지 이유로 바뀌는가?"** SQL 이 바뀌어도, 업무 규칙이 바뀌어도
> 같은 파일을 열어야 한다면 나눌 때다. (단일 책임 원칙)

### 6-2. 모듈러 모놀리스 — 마이크로서비스로 쪼개기 전에

> **결론부터: 대부분의 팀에게 마이크로서비스는 이르다.** 네트워크 호출, 분산 트랜잭션,
> 배포 오케스트레이션이라는 큰 비용을 진다. **먼저 "잘 나뉜 모놀리스"를 만든다.**

핵심은 **모듈 간 경계를 코드로 강제**하는 것이다.

```
src/modules/
├─ auth/
│  ├─ index.js        ← 이 모듈의 공개 API. 다른 모듈은 이것만 import.
│  └─ internal/       ← 밖에서 import 금지
├─ diaries/
├─ comments/
└─ notifications/
```

```js
// comments 모듈이 auth 모듈의 사용자 정보가 필요할 때
import { getUserById } from '../auth/index.js'   // ✅ 공개 API
import { userRepository } from '../auth/internal/user.repository.js'  // ❌ 금지
```

```js
// eslint — 모듈 내부 직접 접근 차단
'no-restricted-imports': ['error', {
  patterns: ['*/internal/*', '!./internal/*'],
}]
```

이렇게 해두면 나중에 `notifications` 를 진짜 별도 서비스로 뗄 때,
바꿀 곳이 `index.js` 하나뿐이다 (함수 호출 → HTTP 호출 or 메시지 발행).

### 6-3. API 설계 규약

대형 프로젝트에서 API 는 **계약**이다. 여러 팀·앱이 의존하므로 규칙을 문서로 고정한다.

**① 버저닝**

```
/api/v1/diaries      ← 버전을 URL 에 박는다 (가장 단순, 권장)
```

파괴적 변경(필드 삭제, 타입 변경)이 필요하면 `/v2` 를 새로 열고 `/v1` 을 한동안 유지한다.
필드 **추가**는 파괴적이지 않다 (클라이언트가 모르는 필드는 무시).

**② 목록 응답 규약 — 페이지네이션·정렬·필터를 통일**

```
GET /api/v1/diaries?cursor=xxx&limit=20&sort=-createdAt&category=book

응답:
{
  "items": [ ... ],
  "page": { "nextCursor": "eyJ...", "hasNext": true }
}
```

- 모든 목록 API 가 **같은 모양**이면 프론트가 재사용 컴포넌트를 만들 수 있다
- 오프셋(`?page=3`)보다 커서(`?cursor=`)를 권장 — 데이터가 많아도 일정하게 빠르고, 중간 삽입에도 흔들리지 않는다

**③ 오류 응답 표준 — RFC 7807 (Problem Details) 참고**

```json
{
  "type": "https://api.example.com/errors/forbidden",
  "title": "권한이 없습니다.",
  "status": 403,
  "detail": "이 다이어리의 작성자만 수정할 수 있습니다.",
  "instance": "/api/v1/diaries/42",
  "code": "DIARY_NOT_OWNER"        // 프론트가 분기할 수 있는 기계용 코드
}
```

이 프로젝트의 `{ message }` 는 소규모엔 충분하지만, `code` 를 하나 추가하면
프론트가 "메시지 문자열 비교" 대신 "코드 비교" 로 분기할 수 있다 (번역·문구 변경에 안 깨진다).

**④ 멱등성(idempotency)**

`POST` 를 사용자가 두 번 눌러 다이어리가 2개 생기는 것을 막는다.

```
POST /api/v1/diaries
Idempotency-Key: 9b2c...    ← 클라이언트가 생성한 UUID

서버: 이 키를 24시간 저장. 같은 키로 다시 오면 저장된 첫 응답을 그대로 반환.
```

**⑤ OpenAPI 우선 (스펙 먼저, 코드 나중)**

```yaml
# openapi.yaml — 프론트와 백이 합의하는 단 하나의 문서
paths:
  /diaries/{id}:
    get:
      parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
      responses:
        '200': { content: { application/json: { schema: { $ref: '#/components/schemas/Diary' } } } }
        '403': { $ref: '#/components/responses/Problem' }
```

→ 이 파일로 **프론트 타입**, **API 문서 페이지**, **요청 검증 미들웨어**, **목(mock) 서버**를 자동 생성한다.

### 6-4. 입력 검증·직렬화를 스키마로 통일

이 프로젝트의 `validate.js` 는 훌륭하지만 손으로 쓴 함수다. 규모가 커지면 스키마 라이브러리로 바꾼다.

```bash
npm install zod
```

```js
// diary.schema.js
import { z } from 'zod'

export const createDiarySchema = z.object({
  title: z.string().trim().min(1, '제목을 입력해 주세요.').max(60, '제목은 60자 이하'),
  content: z.string().trim().min(1).max(20000),
  category: z.enum(['diary', 'book', 'emotion']).default('diary'),
  mood: z.string().max(20).default(''),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  visibility: z.enum(['public', 'private']).default('private'),
  images: z.array(z.object({ url: z.string(), name: z.string() })).max(5).default([]),
})
```

```js
// 검증 미들웨어 — 라우트에 선언적으로 붙인다
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body)
  if (!result.success) {
    const first = result.error.issues[0]
    throw ApiError.badRequest(first.message)
  }
  req.body = result.data      // 정리된(파싱된) 값으로 교체
  next()
}

router.post('/', validate(createDiarySchema), diaryController.create)
```

> **이점:** 검증 규칙이 **선언**이 되어 한눈에 보이고, OpenAPI 로 내보낼 수 있고,
> 프론트엔드와 **같은 스키마 파일을 공유**할 수 있다 (모노레포일 때).

### 6-5. 인증 심화

**① 액세스 토큰 + 리프레시 토큰**

이 프로젝트는 7일짜리 토큰 하나다. 문제: 탈취당하면 7일간 못 막고, 강제 로그아웃이 불가능하다.

```
액세스 토큰   15분   — 모든 API 요청에 사용. 짧아서 탈취돼도 피해가 작다.
리프레시 토큰  14일   — HttpOnly 쿠키에만 저장. /auth/refresh 로 새 액세스 토큰을 받는다.
```

```js
async function refresh(req, res) {
  const token = req.cookies.refreshToken
  const stored = await tokenRepo.findValid(token)          // DB 에 저장 → 서버가 무효화 가능
  if (!stored) throw ApiError.unauthorized()

  await tokenRepo.revoke(stored.id)                        // 회전(rotation): 쓴 건 즉시 폐기
  const newRefresh = await tokenRepo.issue(stored.userId)
  res.cookie('refreshToken', newRefresh, { httpOnly: true, secure: true, sameSite: 'strict' })
  res.json({ accessToken: createAccessToken(stored.userId) })
}
```

- **회전(rotation):** 리프레시 토큰은 한 번 쓰면 폐기하고 새로 발급. 도난된 토큰이 재사용되면 탐지 가능
- **로그아웃 / 강제 만료:** DB 에서 리프레시 토큰을 지우면 즉시 무효화된다 (순수 JWT 로는 불가능)

**② RBAC — 역할 기반 권한**

```sql
ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user';
```

```js
export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) throw ApiError.forbidden()
  next()
}

adminRouter.use(requireAuth, requireRole('admin'))
```

더 세분화가 필요하면 **권한(permission) 테이블**로: `role_permissions(role, permission)`,
`diary:read:any`, `diary:delete:own` 같은 문자열로 관리한다.

**③ 소셜 로그인 (OAuth 2.0) 흐름**

```
① 사용자가 "Google 로그인" 클릭
② 프론트가 Google 인증 화면으로 리다이렉트 (client_id, redirect_uri, scope)
③ 사용자 동의 → Google 이 code 를 붙여 redirect_uri 로 돌려보냄
④ 백엔드가 code + client_secret 을 Google 에 보내 access_token 교환
⑤ access_token 으로 Google 프로필(이메일) 조회
⑥ 그 이메일로 우리 DB 에서 사용자 찾기/생성 → 우리 토큰 발급
```

핵심: **외부 토큰은 프로필 조회에만 쓰고 버린다.** 이후엔 우리 서비스의 토큰을 쓴다.

**④ 이메일 인증 · 비밀번호 재설정**

```
비밀번호 재설정:
① POST /auth/forgot { email } → 항상 200 (이메일 존재 여부 노출 금지)
② 존재하면: 1회용 토큰(해시로 저장) + 만료 1시간 → 메일 발송
③ POST /auth/reset { token, newPassword } → 토큰 검증 → 비번 교체 → 토큰 폐기
                                          → 그 사용자의 모든 리프레시 토큰 무효화
```

### 6-6. 데이터 계층 심화

**① 마이그레이션 도구 — 스키마 변경 이력 관리**

이 프로젝트의 `migrate.js` 는 "전체를 다시 만들기"만 한다. 운영 DB 에는 못 쓴다 (데이터가 날아간다).
**변경분(diff)을 순서대로 쌓는** 도구를 쓴다.

```bash
# MySQL 에서 쓸 수 있는 도구: db-migrate, knex(migrations), umzug, Prisma Migrate
npm install -D db-migrate db-migrate-mysql
```

```
migrations/
├─ 1725600000_create_users.sql
├─ 1725700000_add_role_to_users.sql       ← 이미 배포된 건 절대 수정 안 함. 새 파일만 추가.
└─ 1725800000_create_refresh_tokens.sql
```

```sql
-- 1725700000_add_role_to_users.sql
-- Up
ALTER TABLE users ADD COLUMN role ENUM('user','admin') NOT NULL DEFAULT 'user';
-- Down (롤백용)
ALTER TABLE users DROP COLUMN role;
```

배포 시 `migrate up` 이 **아직 적용 안 된 것만** 순서대로 실행한다.
`schema_migrations` 테이블에 적용 이력이 남는다.

> **철칙: 이미 배포된 마이그레이션 파일은 절대 수정하지 않는다.** 되돌리려면 새 마이그레이션을 추가한다.
> 팀원마다 다른 시점에 DB 를 만들었기 때문에, 파일을 고치면 사람마다 스키마가 달라진다.

**② 안전한 스키마 변경 (무중단)**

컬럼 이름 변경 `content → body` 를 한 번에 하면, 배포 중 구버전 코드가 깨진다.

```
1단계: body 컬럼 추가 (nullable). 코드는 둘 다 씀 (읽기는 content, 쓰기는 둘 다)
2단계: 기존 데이터를 body 로 복사 (백필)
3단계: 코드를 body 만 쓰도록 변경 + 배포
4단계: content 컬럼 삭제
```

느리지만 이것이 무중단 배포의 대가다.

**③ 소프트 삭제 · 감사 로그**

```sql
ALTER TABLE diaries ADD COLUMN deleted_at DATETIME(3) NULL;
-- 모든 조회에 WHERE deleted_at IS NULL 추가 (repository 에서 강제)

CREATE TABLE audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  actor_id BIGINT UNSIGNED, action VARCHAR(50), entity VARCHAR(50),
  entity_id VARCHAR(50), before JSON, after JSON, created_at DATETIME(3)
);
```

"누가 이 글을 언제 지웠나?" 에 답할 수 있어야 한다. 규제 산업에서는 필수.

**④ 동시성 — 낙관적 락**

두 사람이 같은 글을 동시에 수정하면, 나중 저장이 먼저 저장을 덮어쓴다 (lost update).

```sql
UPDATE diaries SET title = ?, version = version + 1
WHERE id = ? AND version = ?     -- 내가 읽었을 때의 버전
-- affectedRows 가 0 이면 그 사이 누가 바꿨다는 뜻 → 409 Conflict
```

**⑤ ORM 을 쓸까?**

| 방식 | 언제 |
| --- | --- |
| Raw SQL (이 프로젝트) | SQL 을 확실히 배우는 단계. 복잡한 쿼리·튜닝 자유도 |
| Query Builder (Knex, Kysely) | SQL 에 가깝되 타입 안전·조합 편의 |
| ORM (Prisma, TypeORM, Drizzle) | CRUD 반복이 많고, 스키마-타입 동기화가 중요할 때 |

> **SQL 을 먼저 익힌 뒤에 ORM 을 쓴다.** ORM 만 배우면 N+1, 인덱스, 트랜잭션 격리 수준 같은
> 근본 문제를 못 본다. ORM 이 생성한 SQL 을 읽을 줄 알아야 한다.

### 6-7. 트랜잭션 경계와 일관성

**원칙: 하나의 유스케이스 = 하나의 트랜잭션.** service 함수가 트랜잭션 경계를 정한다.
controller 나 repository 는 트랜잭션을 열지 않는다.

```js
// service 가 커넥션을 만들어 repository 들에 "주입"한다
export async function createDiaryWithNotification(authorId, body) {
  return withTransaction(async (conn) => {
    const diary = await diaryRepo.insert(conn, ...)
    await imageRepo.insertMany(conn, diary.id, body.images)
    await outboxRepo.enqueue(conn, {                 // 아웃박스 패턴 (아래)
      topic: 'diary.created', payload: { diaryId: diary.id },
    })
    return diary
  })
}
```

**아웃박스 패턴 — "DB 저장 + 외부 알림" 을 안전하게**

"다이어리를 저장하고 팔로워에게 푸시 알림을 보낸다" 를 이렇게 짜면 위험하다.

```js
await diaryRepo.insert(...)     // 성공
await pushService.send(...)     // 여기서 실패 → 알림 유실, 되돌릴 수도 없음
```

해법: 알림 요청을 **같은 트랜잭션 안에서** `outbox` 테이블에 저장.
별도 워커가 `outbox` 를 읽어 실제 발송하고, 성공하면 행을 지운다.
DB 커밋이 됐으면 알림도 반드시 (언젠가) 나간다.

### 6-8. 비동기 작업 — 큐

느린 작업(이미지 리사이즈, 메일 발송, PDF 생성)을 요청-응답 사이클에서 뺀다.

```bash
npm install bullmq ioredis
```

```js
// 생산자 — 컨트롤러는 "일감만 등록"하고 즉시 응답
await imageQueue.add('resize', { fileId }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } })
res.status(202).json({ status: 'processing' })
```

```js
// 소비자 — 별도 프로세스로 실행
new Worker('image', async (job) => {
  await sharp(job.data.path).resize(1280).toFile(...)
}, { concurrency: 4 })
```

- **재시도 + 지수 백오프:** 일시적 실패(네트워크)를 자동 복구
- **DLQ(Dead Letter Queue):** 계속 실패하는 작업은 격리해 나중에 조사
- **스케줄 작업:** `queue.add('cleanup', {}, { repeat: { pattern: '0 3 * * *' } })` (매일 새벽 3시)

### 6-9. 캐싱

```
요청 → [앱 메모리 캐시] → [Redis 공유 캐시] → [DB]
        (초 단위, 프로세스별)   (분 단위, 서버 공유)   (원본)
```

**Cache-Aside 패턴**

```js
async function getMonthlyCounts(userId, month) {
  const key = `counts:${userId}:${month}`
  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached)

  const data = await diaryRepo.countByDay(userId, month)
  await redis.set(key, JSON.stringify(data), 'EX', 300)   // 5분
  return data
}
```

**캐시 무효화 — 가장 어려운 문제**

```js
// 다이어리를 쓰거나 지우면 그 달 캐시를 삭제한다
async function invalidateCounts(userId, dateKey) {
  await redis.del(`counts:${userId}:${dateKey.slice(0, 7)}`)
}
```

> **캐시는 마지막 수단이다.** 순서: ① 인덱스 추가 ② 쿼리 개선 ③ N+1 제거 ④ 그래도 느리면 캐시.
> 캐시를 먼저 넣으면 "왜 낡은 데이터가 보이지?" 버그와 평생 싸운다.

### 6-10. 관측성 (Observability)

**① 구조화 로깅 + 상관 ID**

```bash
npm install pino pino-http
```

```js
import pinoHttp from 'pino-http'
app.use(pinoHttp({
  genReqId: (req) => req.headers['x-request-id'] || crypto.randomUUID(),
  redact: ['req.headers.authorization', 'req.body.password'],   // 민감정보 마스킹
}))

// 어디서든
req.log.info({ diaryId: id }, 'diary updated')
```

로그가 JSON 이면 검색·집계가 된다. `x-request-id` 로 **하나의 요청이 거친 모든 로그**를 묶어 본다.

**② 메트릭 (Prometheus 형식)**

```js
import client from 'prom-client'
const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  labelNames: ['method', 'route', 'status'],
})
app.get('/metrics', async (req, res) => res.send(await client.register.metrics()))
```

"p95 응답 시간", "초당 요청 수", "5xx 비율" 을 그래프로 본다.

**③ 헬스체크 두 종류**

```js
router.get('/health/live', (req, res) => res.json({ status: 'ok' }))   // 프로세스가 살아있나
router.get('/health/ready', async (req, res) => {                       // 트래픽 받을 준비됐나
  try { await pool.query('SELECT 1'); await redis.ping(); res.json({ status: 'ready' }) }
  catch { res.status(503).json({ status: 'not-ready' }) }
})
```

로드밸런서는 `ready` 를 보고 트래픽을 보낼지 정한다.

**④ 분산 추적 (OpenTelemetry)** — 요청이 여러 서비스를 거칠 때 어디서 느린지 본다.

**⑤ 에러 추적 (Sentry)** — 예외를 스택·요청 컨텍스트와 함께 수집.

### 6-11. 테스트 심화

```
                 E2E / 계약 테스트         적게
              통합 테스트 (실제 DB)         중간 — supertest + 테스트 DB
          단위 테스트 (service, util)      많이 — DB 목킹 또는 순수 함수
```

**통합 테스트 — 진짜 DB 를 띄운다 (testcontainers)**

```js
import { MySqlContainer } from '@testcontainers/mysql'

let container
beforeAll(async () => {
  container = await new MySqlContainer().start()
  process.env.DB_HOST = container.getHost()
  process.env.DB_PORT = String(container.getPort())
  await migrate()   // 스키마 적용
})
afterAll(() => container.stop())

it('남의 글 수정은 403', async () => {
  const { token: mine } = await signup('a@b.com')
  const { token: other } = await signup('c@d.com')
  const { body: diary } = await request(app).post('/api/diaries')
    .set('Authorization', `Bearer ${mine}`).send(validPayload)

  const res = await request(app).put(`/api/diaries/${diary.id}`)
    .set('Authorization', `Bearer ${other}`).send(validPayload)
  expect(res.status).toBe(403)
})
```

**시드 팩토리 — 테스트 데이터를 함수로**

```js
export const makeDiary = (overrides = {}) => ({
  title: '테스트', content: '내용', category: 'diary',
  visibility: 'private', dateKey: '2026-09-06', images: [], ...overrides,
})
```

**계약 테스트** — 프론트가 기대하는 응답 모양(zod 스키마)으로 실제 응답을 검증한다.
모노레포에서 `packages/types` 의 스키마를 백엔드 테스트가 import 한다.

### 6-12. 파일·미디어

**직접 서빙(이 프로젝트) → 오브젝트 스토리지 + presigned URL**

```
① 프론트: POST /api/uploads/sign { filename, contentType }
② 백엔드: S3/R2 에 올릴 수 있는 서명된 URL 을 만들어 응답 (10분 유효)
③ 프론트: 그 URL 로 파일을 S3 에 직접 PUT (백엔드를 거치지 않음 → 서버 부하 0)
④ 프론트: 업로드 완료 후 파일 키를 다이어리 저장 요청에 포함
⑤ 백엔드: 그 키가 실제로 존재하는지 확인 후 저장
```

- **장점:** 대용량 파일이 앱 서버 메모리·대역폭을 안 먹는다. 수평 확장에 유리.
- **이미지 변형:** 업로드 완료 이벤트 → 큐 → 리사이즈 워커, 또는 CDN 의 on-the-fly 리사이즈
- **검증:** presign 시 `contentType`·크기 제한, 업로드 후 실제 파일 헤더(magic number) 확인

### 백지 재현 과제 (2회독)

1. 다이어리 모듈을 `routes/controller/service/repository/serializer/schema` 로 나눈다
2. zod 스키마 + `validate` 미들웨어로 모든 입력 검증을 선언적으로 바꾼다
3. 리프레시 토큰(DB 저장 + 회전)을 도입하고, 로그아웃으로 즉시 무효화되는지 확인한다
4. `role` 컬럼과 `requireRole('admin')` 미들웨어로 관리자 전용 엔드포인트를 만든다
5. `node-pg-migrate`(또는 knex) 로 마이그레이션 3개를 순서대로 쌓아 본다
6. 이미지 리사이즈를 BullMQ 워커로 빼고, 202 응답 후 백그라운드 처리되게 한다
7. pino 구조화 로깅 + `x-request-id` 로 한 요청의 로그를 묶어 본다
8. testcontainers 로 실제 MySQL 을 띄운 통합 테스트 5개를 작성한다

### 확장 과제 (3회독)

1. OpenAPI 스펙을 먼저 쓰고, 그것으로 요청 검증 미들웨어와 문서 페이지를 생성한다
2. 아웃박스 패턴으로 "다이어리 공개 시 알림" 을 구현한다 (트랜잭션 + 워커)
3. 월별 개수 조회에 Redis cache-aside 를 넣고, 글 작성 시 정확히 무효화한다
4. 낙관적 락(`version` 컬럼)으로 동시 수정 시 409 를 반환한다
5. presigned URL 방식으로 업로드를 바꾸고 앱 서버가 파일을 거치지 않게 한다

### Level 6 체크리스트

- [ ] 각 계층이 "모르는 것"으로 책임을 정의할 수 있다
- [ ] 마이크로서비스 전에 모듈러 모놀리스를 하는 이유를 안다
- [ ] API 버저닝·커서 페이지네이션·표준 오류 포맷을 설계할 수 있다
- [ ] 액세스/리프레시 토큰 분리와 회전의 이유를 설명할 수 있다
- [ ] 배포된 마이그레이션을 수정하면 안 되는 이유를 안다
- [ ] 무중단 컬럼 변경의 4단계를 안다
- [ ] 아웃박스 패턴이 푸는 문제를 설명할 수 있다
- [ ] 캐시가 "마지막 수단"인 이유를 안다
- [ ] 구조화 로깅과 상관 ID 의 가치를 안다
- [ ] testcontainers 로 통합 테스트를 작성할 수 있다

---

## Level 7 — 배포·운영·확장 (프로덕션)

### 목표

로컬에서 도는 서버를 **여러 대로 확장 가능하고, 안전하게 배포되고, 새벽에 안 깨우는** 서비스로 만든다.

### 7-1. 12요소 앱 (Twelve-Factor)

프로덕션 서버가 지켜야 할 12가지 중 핵심 6가지:

| 원칙 | 뜻 | 이 프로젝트에서 |
| --- | --- | --- |
| 설정을 환경변수로 | 코드에 환경별 값이 없다 | `config/index.js` ✅ |
| 백엔드 서비스를 attached resource 로 | DB·Redis·S3 를 URL 하나로 교체 가능 | `DATABASE_URL` 형태로 |
| 상태를 프로세스 밖에 | 서버는 무상태. 재시작해도 잃을 게 없다 | 세션·업로드를 외부화 |
| 로그를 stdout 스트림으로 | 파일에 쓰지 않는다. 플랫폼이 수집 | pino → stdout |
| 빠른 시작·우아한 종료 | 몇 초 안에 뜨고, SIGTERM 에 정리 후 종료 | `server.js` 의 shutdown ✅ |
| dev/prod 동등성 | 로컬과 운영이 같은 DB·Node 버전 | Docker 로 |

### 7-2. Docker

```dockerfile
# 멀티스테이지 — 빌드 도구를 최종 이미지에 넣지 않는다
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
USER node                          # root 로 실행하지 않는다
EXPOSE 4000
CMD ["node", "src/server.js"]
```

```yaml
# docker-compose.yml — 로컬에서 DB·Redis·앱을 한 번에
services:
  api:
    build: ./backend
    environment:
      DB_HOST: db
      REDIS_URL: redis://redis:6379
    depends_on: { db: { condition: service_healthy } }
    ports: ['4000:4000']
  db:
    image: mysql:8
    environment: { MYSQL_ROOT_PASSWORD: local, MYSQL_DATABASE: my_diary }
    healthcheck:
      test: ['CMD', 'mysqladmin', 'ping', '-h', 'localhost']
      interval: 5s
  redis:
    image: redis:7
```

### 7-3. CI/CD 파이프라인

```yaml
# .github/workflows/deploy.yml
on:
  push: { branches: [main] }
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mysql: { image: mysql:8, env: { MYSQL_ROOT_PASSWORD: test }, ports: ['3306:3306'] }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run migrate            # 테스트 DB 에 스키마 적용
      - run: npm run test:integration

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t $IMAGE .
      - run: docker push $IMAGE
      - run: ssh deploy@server "cd /app && docker compose pull && npm run migrate && docker compose up -d"
```

**배포 순서가 중요하다**

```
1. 새 코드 빌드·테스트
2. 마이그레이션 실행 (이전 버전 코드와도 호환되는 것만 — 6-6 참고)
3. 새 컨테이너를 띄우고 /health/ready 통과 대기
4. 로드밸런서가 트래픽을 새 컨테이너로 전환 (blue-green 또는 rolling)
5. 옛 컨테이너 종료 (진행 중 요청은 끝까지 처리 — graceful)
6. 문제 시 즉시 이전 이미지로 롤백
```

### 7-4. 시크릿 관리

```
로컬:        .env (git 제외)
CI:          GitHub Actions Secrets
운영:        AWS SSM Parameter Store / Secrets Manager / Vault / 플랫폼 환경변수
```

- `JWT_SECRET` 등은 **32바이트 이상 랜덤**, 정기 교체(rotation) 가능하게 설계
- DB 계정은 앱 전용, 최소 권한 (`GRANT SELECT, INSERT, UPDATE, DELETE` — `DROP` 없음)
- 시크릿이 실수로 커밋되면 **즉시 무효화하고 새로 발급** (git 히스토리에서 지워도 이미 유출된 것으로 간주)
- `gitleaks` 를 pre-commit 훅과 CI 에 걸어 커밋 자체를 막는다

### 7-5. 수평 확장

```
                  ┌─ API 서버 #1 ─┐
사용자 → 로드밸런서 ├─ API 서버 #2 ─┤ → MySQL (기본, 쓰기)
                  └─ API 서버 #3 ─┘ → MySQL 복제본 (읽기)
                         │
                       Redis (세션·캐시·큐 — 서버들이 공유)
```

**무상태로 만들기 위해 옮겨야 하는 것**

| 지금 있는 곳 | 옮길 곳 |
| --- | --- |
| 메모리에 저장한 세션/캐시 | Redis |
| 로컬 디스크 `uploads/` | S3 / R2 |
| 프로세스 안의 rate-limit 카운터 | Redis (`rate-limit-redis`) |
| 크론/스케줄러를 모든 서버가 실행 | 큐 + 단일 스케줄러, 또는 리더 선출 |

**DB 커넥션 풀 사이징**

```
서버 3대 × connectionLimit 10 = 30 커넥션
MySQL max_connections (기본 151) 안에 들어야 한다.
서버를 늘릴 때마다 이 계산을 다시 한다. PgBouncer 같은 커넥션 풀러를 앞에 두기도 한다.
```

### 7-6. DB 확장 순서

```
1. 인덱스 — EXPLAIN 으로 풀스캔 찾아 제거 (가장 싸고 효과 큼)
2. 쿼리 개선 — N+1 제거, SELECT * 지양, 필요한 컬럼만
3. 읽기 복제본 — 조회를 복제본으로 분산 (읽기가 8, 쓰기가 2인 서비스에 효과적)
4. 캐싱 — 자주 읽고 안 바뀌는 것
5. 파티셔닝 — 큰 테이블을 날짜 등으로 물리적 분할
6. 샤딩 — 사용자 ID 로 DB 자체를 나눔 (최후의 수단, 조인·트랜잭션이 어려워짐)
```

> 대부분의 서비스는 **1~2번에서 끝난다.** 3번 이상이 필요한 규모는 흔치 않다.
> "샤딩부터 생각하는" 것은 조기 최적화다.

### 7-7. 방어

| 위협 | 방어 |
| --- | --- |
| 무차별 로그인 | rate limit (IP + 계정 단위), 실패 시 지연, CAPTCHA |
| 대량 요청 / DDoS | CDN/WAF (Cloudflare), 전역 rate limit, `trust proxy` 설정 |
| 거대 페이로드 | `express.json({ limit: '1mb' })`, 업로드 크기 제한 |
| SQL 인젝션 | 플레이스홀더 `?` (Level 3) |
| 대량 데이터 유출 | 목록 API 의 `limit` 상한 강제 (최대 100), 인증 필수 |
| 봇 가입 | 이메일 인증, 가입 rate limit |
| 의존성 취약점 | `npm audit`, dependabot/renovate |

**OWASP API Security Top 10 자가 점검 (핵심)**

- [ ] 모든 객체 접근에 소유권 검사가 있는가? (`/diaries/:id` 에 남의 id 를 넣으면 403)
- [ ] 대량 할당(mass assignment)을 막았는가? (`req.body` 를 통째로 저장하지 않는다 — 스키마로 필드 화이트리스트)
- [ ] 인증이 필요한 모든 경로에 미들웨어가 걸렸는가? (라우터 단위로 — Level 2)
- [ ] 오류·로그에 민감정보가 없는가?
- [ ] 목록·검색에 페이지 크기 상한이 있는가?

### 7-8. 백업과 장애 대응

```bash
# 매일 자동 백업 (cron)
0 3 * * *  mysqldump --single-transaction my_diary | gzip > /backup/$(date +\%F).sql.gz
```

- **복구를 실제로 연습한다.** 백업이 있어도 복구해 본 적이 없으면 없는 것과 같다
- **RPO**(얼마나 데이터를 잃어도 되나) / **RTO**(얼마나 빨리 복구해야 하나) 를 정한다
- 오프사이트 보관 (다른 리전/클라우드), 보관 주기 (일 7 / 주 4 / 월 12)

### 7-9. SLO 와 온콜

```
SLO 예: "월간 가용성 99.9%, p95 응답 < 300ms"
        → 에러 예산: 한 달에 약 43분 다운 허용

알림 규칙:
- 5xx 비율 > 1% (5분) → 즉시 호출
- p95 > 1s (10분) → 경고
- /health/ready 실패 → 즉시 호출
- 디스크 > 85% → 경고
```

> **알림은 "행동이 필요한 것만" 울려야 한다.** 무시해도 되는 알림이 쌓이면
> 진짜 장애 알림도 무시하게 된다 (alert fatigue).

### 7-10. 마이크로서비스로 언제 쪼개나

거의 대부분: **쪼개지 않는다.** 모듈러 모놀리스(6-2)로 충분하다.

쪼갤 만한 신호:
- 특정 모듈만 트래픽·확장 요구가 압도적으로 다르다 (예: 이미지 처리)
- 팀이 10명을 넘어 하나의 배포 파이프라인이 병목이다
- 특정 부분만 다른 언어·런타임이 필요하다

쪼갤 때의 비용: 네트워크 지연·실패, 분산 트랜잭션(→ 사가 패턴), 통합 테스트 난이도,
운영 복잡도(서비스 디스커버리, 로그 수집, 추적). **이득이 이 비용을 넘을 때만.**

### 백지 재현 과제 (2회독)

1. 멀티스테이지 Dockerfile + docker-compose(앱·MySQL·Redis)로 로컬 전체 스택을 띄운다
2. GitHub Actions 로 test(실제 MySQL 서비스) → 마이그레이션 → 통합테스트 → 이미지 빌드 파이프라인을 만든다
3. 세션/캐시/rate-limit 카운터를 Redis 로 옮겨 서버를 무상태로 만든다
4. 업로드를 S3 호환 스토리지(MinIO 로컬)로 옮긴다
5. `mysqldump` 자동 백업 크론을 만들고, **백업에서 새 DB 로 복구를 실제로 해본다**
6. `/health/live` 와 `/health/ready` 를 나누고, DB 를 끈 상태에서 `ready` 가 503 인지 확인한다

### 확장 과제 (3회독)

1. blue-green 배포를 흉내낸다 — 새 컨테이너를 띄우고 헬스체크 후 트래픽 전환, 롤백 스크립트 작성
2. 읽기 복제본을 붙이고 (docker MySQL replication), 조회 쿼리를 복제본으로 라우팅한다
3. `prom-client` + Grafana 로 p95 응답 시간과 5xx 비율 대시보드를 만든다
4. OWASP API Top 10 체크리스트로 자기 API 를 감사하고, 발견한 구멍을 막는다
5. `gitleaks` 를 pre-commit 과 CI 에 걸고, 일부러 가짜 시크릿을 커밋해 막히는지 확인한다

### Level 7 체크리스트

- [ ] 12요소 앱의 "무상태" 원칙이 수평 확장과 어떻게 연결되는지 안다
- [ ] 멀티스테이지 Docker 빌드의 이유를 안다
- [ ] 배포 시 마이그레이션을 코드 배포보다 먼저/호환되게 하는 이유를 안다
- [ ] 무상태 서버를 만들기 위해 무엇을 외부화해야 하는지 안다
- [ ] DB 확장을 인덱스→쿼리→복제본→캐시 순으로 하는 이유를 안다
- [ ] 대량 할당(mass assignment) 취약점과 방어법을 안다
- [ ] 백업만으로 부족하고 복구 연습이 필요한 이유를 안다
- [ ] 알림은 "행동이 필요한 것만" 울려야 하는 이유를 안다
- [ ] 마이크로서비스의 비용을 구체적으로 나열할 수 있다

---

## 최종 관문 II — 프로덕션 API 서버 구축

Level 6~7 을 마친 뒤 도전한다.

```
[구조]
- routes/controller/service/repository/serializer/schema 계층
- 모듈러 모놀리스, 모듈 경계를 ESLint 로 강제
- zod 스키마로 모든 입력 검증, 필드 화이트리스트

[인증/권한]
- 액세스(15분) + 리프레시(14일, DB 저장, 회전) 토큰
- role 기반 권한, 관리자 엔드포인트
- 비밀번호 재설정 (1회용 토큰, 이메일 존재 여부 비노출)

[데이터]
- 순서가 쌓이는 마이그레이션 도구
- 소프트 삭제 + audit_logs
- 낙관적 락으로 동시 수정 충돌 감지
- N+1 없음 (모든 목록 API 검증)

[비동기/캐시]
- 이미지 리사이즈를 BullMQ 워커로
- 월별 개수 Redis cache-aside + 정확한 무효화
- 아웃박스 패턴으로 알림 발송

[관측]
- pino 구조화 로그 + x-request-id
- /metrics (prom-client), /health/live, /health/ready
- Sentry 에러 추적

[릴리스]
- 멀티스테이지 Docker, docker-compose 로컬 스택
- CI: lint → 단위 → 마이그레이션 → 통합(testcontainers) → 이미지 빌드
- 마이그레이션 자동 실행, 롤백 스크립트

[운영]
- 무상태 (세션·업로드·rate-limit 전부 외부화), 서버 3대 가정
- S3 호환 스토리지 + presigned URL
- 자동 백업 + 복구 연습 완료
- helmet, rate limit(IP+계정), 페이로드 크기 제한
```

**완성 기준 — 직접 확인한다**

- [ ] 서버를 3개 프로세스로 띄워도 로그인·업로드·좋아요가 정상 동작한다 (무상태)
- [ ] 한 프로세스를 죽여도 진행 중이던 요청이 끝까지 처리된다 (graceful)
- [ ] 리프레시 토큰을 한 번 쓰면 재사용이 거부된다 (회전)
- [ ] 로그아웃하면 리프레시 토큰이 즉시 무효화된다
- [ ] 같은 글을 두 탭에서 동시에 수정하면 나중 저장이 409
- [ ] `req.body` 에 `role: "admin"` 을 넣어 가입해도 무시된다 (대량 할당 방어)
- [ ] `/api/diaries?limit=99999` 를 보내도 최대 100개만 온다
- [ ] DB 를 끄면 `/health/ready` 가 503, 로드밸런서가 트래픽을 안 보낸다
- [ ] 백업 파일에서 완전히 새 DB 로 복구가 된다
- [ ] 이미지 업로드가 앱 서버 메모리를 거치지 않는다 (presigned URL)
- [ ] 하나의 요청 로그가 `x-request-id` 로 전부 묶여 조회된다
- [ ] `gitleaks` 가 가짜 시크릿 커밋을 막는다

### 그다음

1. **TypeScript 전환** — repository 반환 타입, DTO, service 시그니처
2. **OpenAPI 우선 개발** — 스펙 → 검증·문서·타입·목 생성
3. **실제 배포** — 도메인, HTTPS, 모니터링 대시보드, 알림까지
4. **부하 테스트** — k6 로 목표 RPS 를 넣고 병목을 찾아 개선

---

## 부록 A — SQL 치트시트

```sql
-- 조회
SELECT 컬럼 FROM 테이블 WHERE 조건 ORDER BY 컬럼 DESC LIMIT 10 OFFSET 20;
SELECT * FROM t WHERE c IN (1, 2, 3);
SELECT * FROM t WHERE c BETWEEN 1 AND 10;
SELECT * FROM t WHERE c LIKE '2026-08%';
SELECT * FROM t WHERE c IS NULL;

-- JOIN
SELECT a.*, b.name FROM a INNER JOIN b ON b.id = a.b_id;   -- 짝이 있는 것만
SELECT a.*, b.name FROM a LEFT  JOIN b ON b.id = a.b_id;   -- 왼쪽은 다 남김

-- 집계
SELECT c, COUNT(*), SUM(x), AVG(x), MAX(x) FROM t GROUP BY c HAVING COUNT(*) > 1;

-- 서브쿼리 / 존재 확인
SELECT t.*, (SELECT COUNT(*) FROM u WHERE u.t_id = t.id) AS cnt FROM t;
SELECT EXISTS (SELECT 1 FROM t WHERE id = 1) AS found;

-- 변경
INSERT INTO t (a, b) VALUES (1, 2);
INSERT INTO t (a, b) VALUES (1, 2), (3, 4);        -- 여러 행
INSERT IGNORE INTO t (a, b) VALUES (1, 2);         -- 중복이면 조용히 무시
UPDATE t SET a = 1 WHERE id = 3;
DELETE FROM t WHERE id = 3;

-- 구조 확인
SHOW TABLES;
DESC 테이블;
SHOW INDEX FROM 테이블;
SHOW CREATE TABLE 테이블;
EXPLAIN SELECT ...;

-- 백업 / 복원
mysqldump -u root -p my_diary > backup.sql
mysql -u root -p my_diary < backup.sql
```

## 부록 B — 오류와 원인

| 증상 / 메시지 | 원인 | 해결 |
| --- | --- | --- |
| `req.body` 가 `undefined` | `express.json()` 미등록 또는 순서 문제 | 라우터 **앞**에 등록 |
| `ER_ACCESS_DENIED_ERROR` | DB 계정/비밀번호 틀림 | `.env` 확인 |
| `ECONNREFUSED` | MySQL 이 안 켜져 있음 | MySQL 서비스 시작 |
| `ER_NO_SUCH_TABLE` | 마이그레이션 안 함 | `npm run db:migrate` |
| `ER_DUP_ENTRY` | UNIQUE 제약 위반 | 409 로 변환해 응답 |
| `ER_NO_REFERENCED_ROW_2` | FK 가 가리키는 행이 없음 | 부모 데이터 먼저 생성 |
| 한글이 `???` 로 저장됨 | charset 이 utf8mb4 아님 | 테이블·연결 모두 utf8mb4 |
| 응답이 안 오고 멈춤 | `next()` 나 `res` 호출 누락 (Express 4 라면 `asyncHandler` 미사용) | 핸들러 점검 |
| 오류가 HTML 로 나옴 | `errorHandler` 미등록 또는 위치가 앞 | 맨 마지막에 등록 |
| `/feed` 가 `:id` 로 잡힘 | 라우트 순서 | 고정 라우트를 먼저 |
| `req.params.diaryId` 가 undefined | 중첩 라우터에 `mergeParams` 없음 | `Router({ mergeParams: true })` |
| 트랜잭션이 롤백 안 됨 | 안에서 `pool.query` 사용 | `connection.query` 사용 |
| 이미지가 401 | 정적 서빙이 인증 뒤에 있음 | 인증 **앞**으로 이동 |
| 날짜가 하루씩 밀림 | 시간대 처리 | UTC 저장 + KST `date_key` 분리 |

## 부록 C — 용어 사전

| 용어 | 뜻 |
| --- | --- |
| 미들웨어 | 요청과 응답 사이에 끼어드는 함수 `(req, res, next)` |
| 라우터 | 주소와 처리 함수를 연결하는 것 |
| 컨트롤러 | 요청을 받아 서비스를 부르고 응답하는 층 |
| 서비스 | 업무 규칙과 권한 검사를 담당하는 층 |
| 모델 / 리포지토리 | DB 접근(SQL)만 담당하는 층 |
| 시리얼라이저 | DB 행을 응답 형태로 변환하는 함수 |
| 커넥션 풀 | 미리 만들어 재사용하는 DB 연결 묶음 |
| 트랜잭션 | 여러 작업을 전부 성공 또는 전부 취소로 묶는 것 |
| 인덱스 | 빠른 조회를 위한 색인 |
| 외래 키(FK) | 다른 테이블의 행을 가리키는 컬럼 |
| N+1 문제 | 목록 1번 + 각 항목마다 1번씩 쿼리가 나가는 비효율 |
| 해시 | 되돌릴 수 없는 단방향 변환 (비밀번호 저장용) |
| JWT | 서명된 토큰. 서버가 상태를 저장하지 않고 사용자를 식별 |
| 인증 / 인가 | 누구인가(401) / 해도 되는가(403) |
| 마이그레이션 | 스키마 변경을 코드로 관리하고 재현하는 것 |
| 시드(seed) | 개발·테스트용 초기 데이터 |
| CORS | 다른 출처의 브라우저 요청을 허용하는 규칙 |
| 리버스 프록시 | 앞단에서 요청을 받아 뒤의 앱으로 넘기는 서버(Nginx 등) |

---

## 학습 순서 요약

```
Level 0  비동기 / HTTP / 상태 코드
   ↓
Level 1  Node 모듈 / 프레임워크 없이 서버 만들기     ← Express 가 뭘 해주는지 안다
   ↓
Level 2  Express / 미들웨어 / 오류 처리 / .env       ← 서버의 뼈대를 익힌다
   ↓
Level 3  스키마 설계 / SQL / 트랜잭션 / N+1          ← 백엔드 실력의 절반
   ↓
Level 4  계층 구조 / 인증 / 권한 / 검증 / 업로드     ← 실무의 핵심
   ↓
Level 5  보안 / 성능 / 로깅 / 테스트 / 배포          ← 밖에 내놓을 수 있게
   ↓
최종 관문  백지에서 전체 만들기 → 조건 바꿔 다시 만들기
   ↓
═══ 이 프로젝트 수준 달성. 아래는 대형 서비스로 ═══
   ↓
Level 6  계층 심화 / API 규약 / 인증 심화 / 마이그레이션 / 큐 / 캐시 / 관측
   ↓
Level 7  12요소 / Docker / CI·CD / 무상태 확장 / DB 확장 / 방어 / 백업·SLO
   ↓
최종 관문 II  프로덕션 API 서버 구축 (무상태·관측·자동배포)
```

프론트엔드는 [Study_frontend.md](Study_frontend.md) 를 함께 본다.
이 문서의 Level 4(인증·권한)를 할 때 프론트엔드 Level 4(서버 통신·인증)를 같이 보면
**토큰이 만들어져 저장되고 다시 붙어 오는 전체 흐름**이 한 번에 이해된다.
