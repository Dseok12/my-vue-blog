# backend - 나만의 다양한 diary API 서버

Node.js(Express 5) + MySQL 로 만든 다이어리 API 서버입니다.
프론트엔드(`../frontend`)가 기대하는 응답 형태에 맞춰져 있습니다.

---

## 1. 준비

MySQL 이 실행 중이어야 합니다. (기본 3306 포트)

```bash
cd backend
npm install
cp .env.example .env   # 윈도우: copy .env.example .env
```

`.env` 에서 DB 접속 정보를 본인 환경에 맞게 고칩니다.

| 항목 | 설명 |
| --- | --- |
| `PORT` | API 서버 포트 (기본 4000) |
| `DB_HOST` / `DB_PORT` | MySQL 주소와 포트 |
| `DB_USER` / `DB_PASSWORD` | MySQL 계정 |
| `DB_NAME` | 사용할 데이터베이스 이름 (없으면 자동으로 만듭니다) |
| `JWT_SECRET` | 로그인 토큰 서명 키. **운영에서는 반드시 바꿉니다.** |
| `CORS_ORIGIN` | 허용할 프론트엔드 주소 (기본 `http://localhost:3000`) |
| `PUBLIC_BASE_URL` | 이미지 주소를 절대 경로로 주고 싶을 때만 사용 |

---

## 2. 실행

```bash
npm run db:migrate   # 데이터베이스와 테이블 생성
npm run db:seed      # 예시 데이터 넣기 (선택)
npm run dev          # 개발 실행 (파일 저장 시 자동 재시작)
```

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발용 실행 |
| `npm start` | 그냥 실행 |
| `npm run db:migrate` | 테이블이 없으면 만듭니다. (기존 데이터 유지) |
| `npm run db:migrate -- --fresh` | **데이터베이스를 통째로 지우고** 다시 만듭니다. |
| `npm run db:seed` | 예시 데이터를 넣습니다. 회원이 있으면 건너뜁니다. |
| `npm run db:seed -- --force` | 예시 계정(데모 / 하루)을 지우고 다시 넣습니다. |
| `npm run db:reset` | `--fresh` 후 예시 데이터까지 한 번에 |

### 예시 계정

| 이메일 | 비밀번호 | 닉네임 |
| --- | --- | --- |
| demo@diary.test | demo1234 | 데모 |
| haru@diary.test | haru1234 | 하루 |

### 프론트엔드와 함께 쓰기

프론트엔드 개발 서버(3000)가 `/api` 와 `/uploads` 요청을 이 서버(4000)로 넘겨 줍니다.

```bash
# 터미널 1
cd backend && npm run dev

# 터미널 2
cd frontend && npm run dev   # http://localhost:3000
```

`frontend/.env` 의 `VITE_USE_MOCK` 이 `false` 면 실제 서버를, `true` 면 백엔드 없이
브라우저 저장소로 동작합니다.

---

## 3. 폴더 구조

```
backend/
├─ src/
│  ├─ server.js              실행 진입점 (DB 확인 후 포트 열기)
│  ├─ app.js                 Express 앱 구성
│  ├─ config/index.js        .env 값을 한곳에서 읽는다
│  ├─ db/
│  │  ├─ pool.js             MySQL 연결 풀 + 질의 헬퍼
│  │  ├─ schema.sql          테이블 정의
│  │  ├─ migrate.js          테이블 생성 스크립트
│  │  └─ seed.js             예시 데이터 스크립트
│  ├─ middlewares/
│  │  ├─ auth.js             토큰 확인 (requireAuth)
│  │  ├─ error.js            오류를 { message } JSON 으로 변환
│  │  └─ upload.js           이미지 업로드 (multer)
│  ├─ modules/               기능별 폴더 (routes → controller → service)
│  │  ├─ auth/               회원가입 / 로그인
│  │  ├─ diaries/            다이어리 CRUD / 좋아요
│  │  ├─ comments/           댓글 / 대댓글
│  │  └─ uploads/            이미지 업로드
│  ├─ routes/index.js        /api 아래 라우터 모음
│  └─ utils/                 공통 도구 (검증 / 날짜 / 오류 / id)
└─ uploads/                  업로드된 이미지 저장 폴더
```

기능을 추가할 때는 `modules/` 아래에 폴더를 하나 만들고
`routes` → `controller` → `service` 순서로 나누어 작성한 뒤
`routes/index.js` 에 연결하면 됩니다.

- **routes** : 주소와 미들웨어 연결
- **controller** : 요청/응답 처리 (얇게)
- **service** : 실제 로직과 SQL

Express 5 는 `async` 함수에서 발생한 오류를 자동으로 에러 핸들러로 넘겨 주기 때문에
컨트롤러마다 `try / catch` 를 쓰지 않습니다.

---

## 4. API 목록

모든 주소 앞에 `/api` 가 붙습니다. `/auth/signup`, `/auth/login` 을 뺀 나머지는
`Authorization: Bearer <토큰>` 헤더가 필요합니다.

| 메서드 | 주소 | 설명 |
| --- | --- | --- |
| GET | `/health` | 서버 상태 확인 |
| POST | `/auth/signup` | 회원가입 → `{ user, token }` |
| POST | `/auth/login` | 로그인 → `{ user, token }` |
| GET | `/auth/me` | 내 정보 → `{ user }` |
| POST | `/auth/logout` | 로그아웃 (토큰 방식이라 응답만) |
| GET | `/diaries` | 내 글 목록. `dateKey` `category` `visibility` `keyword` 로 거를 수 있음 |
| GET | `/diaries/feed` | 공개 글 목록. `category` `keyword` |
| GET | `/diaries/monthly-counts` | 달력용 날짜별 개수. `year` `month` `scope` |
| GET | `/diaries/:id` | 글 하나 |
| POST | `/diaries` | 글 작성 |
| PUT | `/diaries/:id` | 글 수정 |
| DELETE | `/diaries/:id` | 글 삭제 |
| POST | `/diaries/:id/like` | 좋아요 켜기 / 끄기 → `{ liked, likeCount }` |
| GET | `/diaries/:id/comments` | 댓글 목록 |
| POST | `/diaries/:id/comments` | 댓글 작성 (`parentId` 를 주면 대댓글) |
| DELETE | `/diaries/:id/comments/:commentId` | 댓글 삭제 |
| POST | `/uploads/image` | 이미지 업로드 (`multipart/form-data`, 필드명 `image`) |

오류는 항상 아래 형태로 내려갑니다.

```json
{ "message": "수정 권한이 없습니다." }
```

---

## 5. 권한 규칙

화면에서도 막지만, 주소를 직접 호출하는 경우를 대비해 **서버에서 다시 확인**합니다.

| 동작 | 규칙 | 어긋났을 때 |
| --- | --- | --- |
| 비공개 글 조회 | 작성자 본인만 | 403 `비공개 글입니다.` |
| 글 수정 | 작성자 본인만 | 403 `수정 권한이 없습니다.` |
| 글 삭제 | 작성자 본인만 | 403 `삭제 권한이 없습니다.` |
| 좋아요 | 공개 글에만 | 400 `공개된 글에만 좋아요를 누를 수 있습니다.` |
| 댓글 작성 | 공개 글에만 | 400 `공개된 글에만 댓글을 쓸 수 있습니다.` |
| 댓글 삭제 | 댓글 작성자 본인만 | 403 `삭제 권한이 없습니다.` |

- 내 글 목록에는 **내가 쓴 글만** 나옵니다.
- 피드에는 **공개 글만** 나옵니다.
- 비밀번호는 bcrypt 로 해시해서 저장하며, 응답에 절대 포함되지 않습니다.
- 로그인 실패 시 이메일이 없는 경우와 비밀번호가 틀린 경우의 응답을 같게 해서
  계정이 있는지 알 수 없게 했습니다.

---

## 6. 데이터베이스

| 테이블 | 설명 |
| --- | --- |
| `users` | 회원 (이메일 / 닉네임 중복 불가) |
| `diaries` | 다이어리 글 |
| `diary_images` | 글에 첨부한 이미지 (순서 유지) |
| `comments` | 댓글 / 대댓글 (`parent_id` 가 있으면 대댓글) |
| `diary_likes` | 좋아요 (한 사람이 한 글에 한 번) |

### 날짜 처리

- `date_key` : 사용자가 고른 **한국 시간 기준** 날짜 (`DATE`, `YYYY-MM-DD`)
- `created_at` / `updated_at` : 저장 시각. **UTC 로 저장**하고 응답은 ISO 문자열로 보냅니다.
  화면에서 한국 시간으로 바꿔서 보여 줍니다.

회원을 지우면 그 회원의 글 / 댓글 / 좋아요도 함께 지워집니다. (외래키 `ON DELETE CASCADE`)

---

## 7. 이미지 업로드

- 최대 **10MB**, 확장자 `jpg` `jpeg` `png` `gif` `webp` 만 허용합니다.
- 확장자와 MIME 타입을 **둘 다** 확인합니다.
- 저장 이름은 무작위 UUID 로 바꿔 원래 파일명이 노출되지 않도록 했습니다.
- 파일은 `backend/uploads` 에 저장되고 `/uploads/<파일명>` 주소로 제공됩니다.
- 이 폴더는 git 에 올라가지 않습니다.

> 참고: 글을 지우거나 이미지를 뺐을 때 서버에 있는 파일 자체는 지우지 않습니다.
> 쓰지 않는 파일을 정리하는 기능이 필요하면 별도로 추가해야 합니다.
