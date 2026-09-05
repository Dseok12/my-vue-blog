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

## 프로젝트 구성

| 폴더 | 설명 | 주소 |
| --- | --- | --- |
| `frontend/` | Vue 3 + Vite 화면 | http://localhost:3000 |
| `backend/` | Node.js(Express) + MySQL API | http://localhost:4000 |

자세한 내용은 각 폴더의 README 를 참고하세요.
([frontend/README.md](frontend/README.md), [backend/README.md](backend/README.md))

---

## 실행 방법

MySQL 이 실행 중이어야 합니다.

```bash
# 1) 백엔드 - 터미널 1
cd backend
npm install
cp .env.example .env      # 윈도우: copy .env.example .env
# .env 에서 DB_USER / DB_PASSWORD 를 본인 환경에 맞게 수정
npm run db:migrate        # 테이블 생성
npm run db:seed           # 예시 데이터 (선택)
npm run dev               # http://localhost:4000

# 2) 프론트엔드 - 터미널 2
cd frontend
npm install
npm run dev               # http://localhost:3000
```

브라우저에서 http://localhost:3000 을 엽니다.
예시 데이터를 넣었다면 아래 계정으로 바로 로그인할 수 있습니다.

| 이메일 | 비밀번호 | 닉네임 |
| --- | --- | --- |
| demo@diary.test | demo1234 | 데모 |
| haru@diary.test | haru1234 | 하루 |

> 백엔드 없이 화면만 보고 싶다면 `frontend/.env` 의 `VITE_USE_MOCK` 을 `true` 로 바꾸면
> 브라우저 저장소를 사용하는 임시 데이터로 동작합니다.

---

## 권한 규칙

- 내 다이어리 목록에는 **내가 쓴 글만** 보입니다.
- 비공개 글은 작성자 본인만 볼 수 있습니다.
- **다른 회원이 쓴 글은 읽기만 가능합니다.** 수정 / 삭제는 작성자 본인만 할 수 있으며,
  주소를 직접 입력해 수정 화면에 들어가도 막습니다. (화면과 서버 양쪽에서 확인)
- 댓글 / 대댓글 / 좋아요는 공개 글에만 달 수 있고, 댓글 삭제는 작성자 본인만 가능합니다.

---
