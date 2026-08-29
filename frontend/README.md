# 나만의 다양한 diary — frontend

Vue 3 + Vite + Pinia + Vue Router 로 만든 다이어리 프론트엔드입니다.

## 실행

```bash
npm install
npm run dev      # http://localhost:3000 (포트 고정)
npm run build    # 배포용 빌드
npm run preview  # 빌드 결과 미리보기 (3000 포트)
```

체험용 계정: `demo@diary.test` / `demo1234`

## 백엔드 연결

`.env` 파일에서 동작 방식을 정합니다.

| 변수 | 설명 |
| --- | --- |
| `VITE_USE_MOCK` | `true` 면 브라우저 저장소를 쓰는 mock 으로 동작(백엔드 불필요), `false` 면 실제 API 호출 |
| `VITE_API_BASE_URL` | API 기본 경로 (기본값 `/api`) |

개발 서버는 `/api` 요청을 `http://localhost:4000` 으로 프록시합니다.
백엔드 포트가 다르면 `vite.config.js` 의 `server.proxy` 만 바꾸면 됩니다.

필요한 API 명세는 `src/api/index.js` 상단 주석에 정리해 두었습니다.
백엔드가 준비되면 `VITE_USE_MOCK=false` 로 바꾸고 `src/api/mock/` 폴더는 삭제해도 됩니다.

## 폴더 구조

```
src/
├─ api/          API 호출 (server.js = 실제 / mock/ = 백엔드 없이 동작)
├─ components/   기능별 컴포넌트 (common, layout, calendar, diary, comment)
├─ css/          모든 스타일 (base, components, layouts, views)
├─ layouts/      화면 레이아웃 (DefaultLayout, AuthLayout)
├─ router/       라우팅 및 로그인 가드
├─ stores/       Pinia 상태 (auth, diary, comment, ui)
├─ utils/        날짜(KST), 이미지, 폼 검증 헬퍼
└─ views/        페이지 단위 화면
```

### 스타일 규칙

- 모든 CSS 는 `src/css/` 아래 별도 `.css` 파일로 두고 컴포넌트에서 `import` 합니다.
- CSS 파일 이름은 컴포넌트 이름과 같습니다. (`BaseButton.vue` → `css/components/BaseButton.css`)
- 클래스는 BEM (`block__element--modifier`) 을 따릅니다.
- 색상, 간격, 글꼴 등 값은 `css/base/variables.css` 의 CSS 변수만 사용합니다.

## 화면

| 경로 | 화면 | 접근 |
| --- | --- | --- |
| `/login`, `/signup` | 로그인 / 회원가입 | 비회원 전용 |
| `/` | 내 다이어리 목록 (로그인 후 첫 화면) | 회원 |
| `/diaries/new`, `/diaries/:id/edit` | 작성 / 수정 | 회원 |
| `/diaries/:id` | 상세 · 좋아요 · 댓글/대댓글 | 회원 |
| `/feed` | 공개 다이어리 모아보기 | 회원 |

## 구현된 규칙

- 날짜는 모두 한국 시간(KST) 기준이며, 캘린더는 일요일부터 시작합니다.
- 캘린더는 왼쪽 하단 토글 버튼으로 접고 펼 수 있고, 마지막 상태를 기억합니다.
- 글은 공개 / 비공개로 나뉘며, 공개 글에만 댓글·대댓글·좋아요가 붙습니다.
- 다른 회원이 쓴 글은 읽기만 가능합니다. 수정·삭제는 작성자 본인만 할 수 있고,
  주소를 직접 입력해 수정 화면에 들어가도 상세 화면으로 되돌립니다. (댓글 삭제도 동일)
- 이미지는 jpg, jpeg, png, gif, webp / 10MB 이하 / 최대 5장까지 첨부합니다.
