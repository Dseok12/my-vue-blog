# 나만의 다양한 diary - 백엔드

Express + MySQL 로 만든 API 서버입니다. 프론트엔드(`../frontend`)의
`src/api/index.js` 에 적힌 규격을 그대로 구현했습니다.

## 1. 준비

```bash
cd backend
npm install
cp .env.example .env   # 이미 있으면 생략
```

`.env` 에서 MySQL 접속 정보와 `JWT_SECRET` 을 채웁니다.

| 항목 | 설명 |
| --- | --- |
| `PORT` | 서버 포트 (기본 4000, 프론트엔드 프록시 대상) |
| `CLIENT_ORIGIN` | CORS 허용 주소 (쉼표로 여러 개) |
| `DB_*` | MySQL 접속 정보 |
| `JWT_SECRET` | 토큰 서명 키 (운영에서는 반드시 변경) |

## 2. 데이터베이스 만들기

```bash
npm run db:migrate   # 데이터베이스 + 테이블 생성
npm run db:seed      # 예시 데이터 (선택)
npm run db:reset     # 지우고 다시 만들기 + 예시 데이터
```

예시 계정

- `demo@diary.test` / `demo1234`
- `haru@diary.test` / `haru1234`

## 3. 실행

```bash
npm run dev   # 파일이 바뀌면 자동 재시작
npm start     # 그냥 실행
```

`http://localhost:4000/api/health` 로 동작을 확인할 수 있습니다.

## 4. 프론트엔드와 연결

`frontend/.env` 에서 한 줄만 바꾸면 실제 API 를 사용합니다.

```
VITE_USE_MOCK=false
```

프론트엔드 개발 서버(`http://localhost:3000`)는 `/api` 요청을
`http://localhost:4000` 으로 넘겨 주도록 이미 설정되어 있습니다.

## 5. API 목록

모든 주소 앞에 `/api` 가 붙습니다. 응답은 성공하면 아래 형태,
실패하면 `{ message }` 입니다.

| 메서드 | 주소 | 설명 | 응답 |
| --- | --- | --- | --- |
| POST | `/auth/signup` | 회원가입 | `{ user, token }` |
| POST | `/auth/login` | 로그인 | `{ user, token }` |
| GET | `/auth/me` | 내 정보 | `{ user }` |
| POST | `/auth/logout` | 로그아웃 | `{}` |
| GET | `/diaries` | 내 다이어리 목록 (`dateKey`, `category`, `visibility`, `keyword`, `cursor`, `limit`) | `{ items, nextCursor, total }` |
| GET | `/diaries/feed` | 공개 글 목록 (`category`, `keyword`, `cursor`, `limit`) | `{ items, nextCursor, total }` |
| GET | `/diaries/monthly-counts` | 월별 작성 개수 (`year`, `month`, `scope`) | `{ counts }` |
| GET | `/diaries/:id` | 다이어리 상세 | `{ diary }` |
| POST | `/diaries` | 작성 | `{ diary }` |
| PUT | `/diaries/:id` | 수정 | `{ diary }` |
| DELETE | `/diaries/:id` | 삭제 | `{}` |
| POST | `/diaries/:id/like` | 좋아요 토글 | `{ liked, likeCount }` |
| GET | `/diaries/:id/comments` | 댓글 목록 | `{ items }` |
| POST | `/diaries/:id/comments` | 댓글 / 대댓글 작성 | `{ comment }` |
| DELETE | `/diaries/:id/comments/:cid` | 댓글 삭제 | `{}` |
| POST | `/uploads/image` | 이미지 업로드 (`multipart/form-data`, 필드명 `image`) | `{ url, name, size }` |

### 목록 페이지네이션 ("더 보기")

- `limit` : 한 번에 가져올 개수 (기본 10, 최대 30)
- `cursor` : 앞 응답의 `nextCursor` 를 그대로 넘기면 다음 페이지를 준다. 없으면 첫 페이지.
- `nextCursor` 가 `null` 이면 마지막 페이지, `total` 은 필터에 맞는 전체 개수.

### 요청 제한

`/auth/signup`, `/auth/login` 은 같은 IP 에서 15분에 20번까지만 받는다. 넘으면 `429`
(`.env` 의 `AUTH_RATE_WINDOW_MINUTES`, `AUTH_RATE_MAX` 로 조절).

인증은 `Authorization: Bearer <token>` 헤더로 합니다.
`/auth/signup`, `/auth/login`, 업로드된 이미지 파일(`/api/uploads/files/...`)
외에는 모두 로그인이 필요합니다.

### 권한 규칙

- 수정 / 삭제: 작성자 본인만 (아니면 403)
- 비공개 글 읽기: 작성자 본인만 (아니면 403)
- 좋아요 / 댓글: 공개 글에만 (아니면 400)
- 댓글 삭제: 댓글 작성자 본인만 (아니면 403), 대댓글도 함께 삭제

## 6. 폴더 구조

```
backend/
├─ uploads/              업로드된 이미지가 저장되는 곳
└─ src/
   ├─ app.js             express 앱 구성
   ├─ server.js          실행 진입점
   ├─ config/            환경 변수, DB 커넥션 풀
   ├─ db/                schema.sql, 마이그레이션, 예시 데이터
   ├─ routes/            주소와 컨트롤러 연결
   ├─ controllers/       요청 값 정리 -> 서비스 호출 -> 응답
   ├─ services/          권한 검사와 업무 규칙
   ├─ models/            SQL 쿼리
   ├─ serializers/       DB 행 -> 프론트엔드 응답 형태
   ├─ middlewares/       인증, 업로드, 요청 제한, 보안 헤더, 오류 처리
   └─ utils/             날짜, 검증, 페이지네이션, 토큰, 비밀번호 등
test/                    자동 테스트 (npm test) - DB 없이 실행된다
```

## 6-1. 코드 검사와 테스트

```bash
npm run lint   # ESLint - 실수하기 쉬운 코드 찾기
npm test       # node --test - test/*.test.js 실행
```

## 7. 알아 두면 좋은 점

- 날짜(`dateKey`)는 **한국 시간 기준** `YYYY-MM-DD` 로 저장하고,
  `createdAt` / `updatedAt` 같은 시각은 UTC 로 저장한 뒤 ISO 문자열로 내려줍니다.
- id 는 DB 에서 숫자로 관리하지만, 응답에서는 **문자열**로 내려줍니다.
  (프론트엔드가 주소창의 id 와 `===` 로 비교하기 때문입니다.)
- 비밀번호는 bcrypt 해시로만 저장합니다.
- 이미지 업로드는 10MB, `jpg / jpeg / png / gif / webp` 만 허용합니다.
- 글을 수정하며 뺀 이미지, 삭제한 글의 이미지는 더 이상 쓰는 곳이 없으면 파일도 지웁니다.
