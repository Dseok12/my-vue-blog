# 나만의 다양한 diary

1. 일기장이 될 수도 있다.
2. 독서기록장이 될 수도 있다.
3. 하루의 감정 일기가 될 수도 있다.
4. 세상의 모든 사람들이 회원가입을 하면 해당 회원의 일기만 볼 수 있다.
5. 하루에 제한 없이 글을 작성 할 수 있다.
6. 한국 시간 기준으로 날짜를 정한다.
7. 왼쪽 하단에 캘린더를 접었다 폈다 할 수 있는 토글 버튼이 있다.
8. 캘린더의 첫번째 시작 요일은 일요일이다.
9. 비회원의 첫 랜딩 페이지는 로그인 화면이다.
10. 로그인 후 랜딩 페이지는 내가 작성한 다이어리들의 리스트이다.
11. 이 다이어리는 읽기, 쓰기, 수정, 삭제가 가능하다.
12. UI는 간결하고 깔끔하게 만든다.
13. 글의 공개 여부는 공개, 비공개가 있다.
14. 공개를 하게 되면 다른 회원들에게 글이 공유가 되고 이 글에는 댓글 및 대댓글, 좋아요 기능이 있다.
15. 이미지를 업로드 할 수 있다. 이미지의 용량은 10MB이며, 확장자는 jpg, jpeg, png, gif, webp이다.

---

## 기술 스킬

- frontend : Vue.js
- Backend : node.js
- DB : MySQL

---

## 학습 교재 — 프로그래밍을 처음 하는 사람부터

이 프로젝트를 교재 삼아 **컴퓨터 기초 → HTML/CSS/JS → Vue → 백엔드 → 실무 도구 → 어떤 프로젝트든 설계하고 만들기** 까지
단계별로 배우는 커리큘럼이 [study/](study/README.md) 에 있다. **[study/README.md](study/README.md) 에서 시작한다.**

| 단계 | 문서 |
| --- | --- |
| 00 | [시작하기 — 컴퓨터, 웹의 원리, 설치, 터미널, Git](study/00-start.md) |
| 01 | [HTML](study/01-html.md) |
| 02 | [CSS](study/02-css.md) |
| 03 | [JavaScript 기초](study/03-javascript.md) |
| 04 | [브라우저 JavaScript — DOM, 이벤트, fetch, 순수 JS 할 일 앱](study/04-javascript-browser.md) |
| 05 | [Vue — 이 프로젝트의 frontend](study/05-vue.md) |
| 06 | [백엔드 — 이 프로젝트의 backend](study/06-backend.md) |
| 07 | [Vue 심화 — 컴포저블, 테스트, TypeScript, 보안, 배포](study/07-vue-advanced.md) |
| 08 | [어떤 프로젝트든 만드는 법 — 설계 공정, 프로젝트 사다리](study/08-build-any-project.md) |

---

## 실행 방법

```bash
# 1) 백엔드 (http://localhost:4000)
cd backend
npm install
cp .env.example .env        # MySQL 접속 정보와 JWT_SECRET 을 채운다
npm run db:migrate          # 데이터베이스 + 테이블 생성
npm run db:seed             # 예시 데이터 (선택)
npm run dev

# 2) 프론트엔드 (http://localhost:3000)
cd frontend
npm install
npm run dev
```

실제 백엔드를 사용하려면 `frontend/.env` 에서 `VITE_USE_MOCK=false` 로 바꾼다.
(`true` 로 두면 백엔드 없이 브라우저 저장소만으로 동작한다. 체험 계정 `demo@diary.test` / `demo1234`)

자세한 API 규격은 [backend/README.md](backend/README.md) 를 참고한다.

필요 환경: Node.js 22 LTS 이상 (최소 20.19), MySQL 8

## 코드 검사와 테스트

"warn, 에러 없이" 규칙을 사람 눈 대신 도구로 확인한다. 커밋 전에 실행한다.

```bash
# frontend
npm run lint          # ESLint (Vue 규칙 포함)
npm run format:check  # Prettier 코드 모양 검사 (npm run format 으로 자동 정리)
npm test              # Vitest - src/**/*.test.js
npm run build         # 빌드 경고 없음 확인

# backend
npm run lint          # ESLint
npm test              # node --test - DB 없이 실행되는 테스트
```

## 주요 기능

- 회원가입 / 로그인, 새로고침 후 로그인 유지, 사용 중 로그인 만료 시 로그인 화면으로 이동 후 복귀
- 다이어리 작성 / 읽기 / 수정 / 삭제, 작성 중 화면 이탈 경고
- 일기 / 독서기록 / 감정기록, 감정 선택, 공개 / 비공개
- 공개 글의 좋아요, 댓글과 대댓글
- 이미지 업로드 (10MB, jpg / jpeg / png / gif / webp, 5장), 쓰지 않게 된 파일 자동 정리
- 왼쪽 하단 토글 캘린더 (일요일 시작, 글 있는 날 점 표시, 날짜 선택은 주소에 저장)
- 목록 필터(종류·공개 여부·검색어)와 "더 보기" (커서 기반 페이지네이션)
- 로그인 시도 횟수 제한, 기본 보안 헤더
- 모바일 반응형, 키보드 / 스크린리더 접근성
