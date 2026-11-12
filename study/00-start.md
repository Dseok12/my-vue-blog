# Stage 0 — 시작하기: 컴퓨터, 웹의 원리, 개발 도구

> 전체 로드맵: [README](README.md) · 다음: [01 HTML](01-html.md)

## 목표

- 프로그램과 웹사이트가 무엇으로 만들어지는지 안다
- 개발 도구(VS Code, Node.js, Git)를 설치하고 쓴다
- 터미널에서 폴더를 만들고, 이동하고, 명령을 실행한다
- 내가 만든 첫 웹 페이지를 브라우저로 연다
- Git 으로 작업을 저장하고 GitHub 에 올린다

---

## 0-1. 프로그래밍이란

**프로그램은 컴퓨터에게 시킬 일을 순서대로 적은 글이다.** 요리 레시피와 같다.

```
레시피                          프로그램
1. 물을 끓인다                   1. 사용자가 입력한 이메일을 읽는다
2. 면을 넣는다                   2. 이메일에 @ 가 없으면 "형식이 틀렸습니다" 를 보여 준다
3. 3분 뒤 불을 끈다               3. 있으면 서버에 로그인을 요청한다
```

차이는 하나다. **컴퓨터는 눈치가 없다.** 사람은 "적당히" 를 알아듣지만,
컴퓨터는 적힌 그대로만 한다. 그래서 프로그래밍의 대부분은 **정확하게 쓰는 연습**이다.

> 오류(에러)는 실패가 아니다. 컴퓨터가 "이 줄이 이해가 안 돼" 라고 알려 주는 것이다.
> 개발자는 하루 종일 오류를 보고 고치는 사람이다. 오류 메시지를 친구로 생각한다.

---

## 0-2. 웹은 어떻게 동작하나

브라우저 주소창에 주소를 넣고 엔터를 치면 이런 일이 일어난다.

```
 [ 내 컴퓨터: 브라우저 ]                         [ 다른 컴퓨터: 서버 ]
        │  ① "이 주소의 페이지 주세요" (요청)            │
        │ ─────────────────────────────────────────► │
        │                                             │ ② 파일을 찾거나 DB 에서 읽는다
        │  ③ HTML, CSS, JS 파일 (응답)                  │
        │ ◄───────────────────────────────────────── │
        │                                             │
   ④ 화면에 그린다                                     │
```

브라우저가 받는 파일은 세 종류다. **이 세 가지가 프론트엔드의 전부다.**

| 언어 | 역할 | 집에 비유하면 | 배우는 곳 |
| --- | --- | --- | --- |
| **HTML** | 무엇이 있는가 (제목, 입력창, 버튼) | 뼈대, 벽, 문 | 01 |
| **CSS** | 어떻게 보이는가 (색, 크기, 배치) | 페인트, 가구 배치 | 02 |
| **JavaScript** | 어떻게 움직이는가 (클릭하면 저장) | 전기, 수도 | 03, 04 |

**Vue** 는 JavaScript 로 화면을 쉽게 만들게 도와주는 도구(프레임워크)다 (05).
**서버(백엔드)** 는 데이터를 저장하고 규칙을 지키게 하는 쪽이다. 이 프로젝트는 Node.js 로 만든다 (06).

```
 이 프로젝트의 구조

 frontend/  (Vue)        →  브라우저에서 실행. 화면을 그린다.
     │  "내 다이어리 목록 줘" (HTTP 요청)
     ▼
 backend/   (Node.js)    →  서버에서 실행. 로그인 확인, 권한 확인.
     │  SQL
     ▼
 MySQL (데이터베이스)      →  회원, 다이어리, 댓글을 표(테이블)로 저장한다.
```

### 주소(URL) 읽는 법

```
 http://localhost:3000/diaries/12?tab=comments
 └─┬─┘  └───┬───┘└─┬┘└────┬────┘└─────┬────┘
 프로토콜   컴퓨터  포트    경로       쿼리(추가 정보)
```

- `localhost` 는 "바로 이 컴퓨터" 라는 뜻이다. 개발할 때는 내 컴퓨터가 서버 역할을 한다.
- **포트**는 한 컴퓨터 안의 "방 번호" 다. 이 프로젝트는 화면이 3000번, API 서버가 4000번 방을 쓴다.

---

## 0-3. 파일과 폴더 — 의외로 많이 막히는 곳

**확장자 보이게 하기 (Windows)**: 파일 탐색기 → 보기 → 표시 → **파일 확장명** 체크.
`index.html.txt` 같은 실수를 막는다.

| 용어 | 뜻 | 예 |
| --- | --- | --- |
| 확장자 | 파일 종류를 나타내는 끝부분 | `.html`, `.css`, `.js`, `.vue`, `.md` |
| 경로 | 파일이 있는 위치 | `D:\projects\my-vue-blog\README.md` |
| 절대 경로 | 맨 위(드라이브)부터 적은 경로 | `D:\projects\a.txt` |
| 상대 경로 | 지금 위치에서부터 적은 경로 | `./css/style.css`, `../README.md` |
| `.` / `..` | 지금 폴더 / 한 단계 위 폴더 | |

> **폴더 이름 규칙** — 개발용 폴더 이름에는 **영어 소문자, 숫자, 하이픈(-)** 만 쓴다.
> 한글과 공백은 일부 도구에서 오류를 낸다. (`내 프로젝트` ✗ → `my-project` ✓)

---

## 0-4. 개발 도구 설치

### ① 코드 편집기 — VS Code

1. <https://code.visualstudio.com> 에서 설치
2. 왼쪽 확장(Extensions, 네모 4개 아이콘)에서 설치:
   - **Korean Language Pack** — 메뉴를 한국어로
   - **Vue - Official** — `.vue` 파일 지원 (05 에서 필요)
   - **ESLint**, **Prettier** — 코드 검사와 자동 정렬 (07 에서 설명)
3. 설정(`Ctrl + ,`)에서 `Format On Save` 를 켠다

**꼭 외울 단축키**

| 단축키 | 기능 |
| --- | --- |
| `Ctrl + S` | 저장 (가장 많이 쓴다. 저장 안 해서 "안 바뀌어요" 가 초보의 1위 실수) |
| `Ctrl + P` | 파일 이름으로 열기 |
| `Ctrl + Shift + F` | 모든 파일에서 검색 |
| `Ctrl + /` | 주석 처리 / 해제 |
| `Ctrl + `` ` `` | 터미널 열기 |
| `Alt + ↑ / ↓` | 줄 이동 |
| `F2` | 이름 한 번에 바꾸기 |

### ② Node.js — JavaScript 실행기

원래 JavaScript 는 브라우저 안에서만 돌았다. **Node.js** 는 브라우저 밖(내 컴퓨터, 서버)에서도
JavaScript 를 실행하게 해 준다. Vue 개발 도구도, 이 프로젝트의 백엔드도 Node.js 위에서 돈다.

1. <https://nodejs.org> 에서 **LTS** 버전 설치 (22 이상)
2. 설치되면 **npm**(패키지 관리자 — 남이 만든 코드를 내려받는 도구)도 같이 설치된다

### ③ Git — 작업 저장 도구

1. <https://git-scm.com> 에서 설치 (옵션은 기본값 그대로)
2. 설치하면 **Git Bash** 라는 터미널도 생긴다

### ④ 브라우저 — Chrome 또는 Edge

개발자 도구(`F12`)가 좋은 브라우저를 쓴다.

---

## 0-5. 터미널 — 글자로 컴퓨터에 명령하기

마우스로 폴더를 더블클릭하는 대신 **글자로 명령**하는 창이다. 개발 도구 대부분이 터미널에서 실행된다.
VS Code 에서 `` Ctrl + ` `` 로 연다.

```bash
pwd                  # 지금 어느 폴더에 있는지 (print working directory)
ls                   # 지금 폴더에 무엇이 있는지 (list)
cd 폴더이름           # 폴더로 들어가기 (change directory)
cd ..                # 한 단계 위로
mkdir my-first-web   # 폴더 만들기 (make directory)
code .               # 지금 폴더를 VS Code 로 열기
cls  또는  clear      # 화면 지우기
```

**설치 확인** — 아래가 모두 버전 번호를 출력하면 성공이다.

```bash
node -v      # v22.x.x 같은 결과
npm -v       # 10.x.x
git --version
```

> **`'node' 은(는) 내부 또는 외부 명령 ... 이 아닙니다`** 가 나오면
> 설치 후 터미널(또는 VS Code)을 **완전히 껐다가 다시** 켠다. 그래도 안 되면 컴퓨터를 재시작한다.

**터미널 꿀팁**

- `Tab` 키 — 폴더/파일 이름 자동 완성. 오타가 사라진다
- `↑` 키 — 이전 명령 다시 불러오기
- `Ctrl + C` — 실행 중인 프로그램 멈추기 (개발 서버 끌 때)

### 터미널에서 꼭 알아야 할 세 가지 상황

**① 명령을 쳤는데 프롬프트가 돌아오지 않는다 — 고장이 아니다**

```bash
npm run dev
#   VITE v8  ready in 300 ms
#   ➜  Local:   http://localhost:3000/
#   (여기서 커서만 깜빡인다)
```

개발 서버는 **켜져 있는 동안 계속 실행 중**이다. 이 터미널은 서버가 쓰고 있으니 그대로 두고,
다른 명령은 **새 터미널**(VS Code 터미널 창의 `+`)에서 친다. 서버를 끄려면 그 터미널에서 `Ctrl + C`.

**② 터미널 창을 그냥 닫으면 서버가 남을 수 있다**

창만 닫으면 서버가 뒤에서 계속 돌 때가 있다. 다음에 켤 때 `Port 3000 is already in use` 가 나온다.
**항상 `Ctrl + C` 로 끈다.** 이미 남았다면 → [10 오류 사전 2장](10-error-dictionary.md) "포트를 쓰는 프로세스 찾기".

**③ 지금 어느 폴더에 있는지가 전부다**

같은 `npm run dev` 라도 `frontend/` 에서 치면 화면 서버가, `backend/` 에서 치면 API 서버가 켜진다.
엉뚱한 폴더에서 치면 `Missing script: "dev"` 나 `Could not read package.json` 이 나온다.
명령이 안 될 때 **가장 먼저 `pwd`** 를 친다.

```
my-vue-blog/          ← 저장소 루트. 여기서는 npm 명령을 치지 않는다 (package.json 이 없다)
├─ frontend/          ← cd frontend 후  npm install, npm run dev, npm test
├─ backend/           ← cd backend  후  npm install, npm run dev, npm test
└─ study/             ← 지금 읽고 있는 교재
```

---

## 0-6. 첫 웹 페이지

```bash
mkdir my-first-web
cd my-first-web
code .
```

VS Code 에서 `index.html` 파일을 만들고 아래를 **직접 타이핑**한다.

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>나의 첫 페이지</title>
  </head>
  <body>
    <h1>안녕하세요!</h1>
    <p>오늘부터 개발 공부를 시작합니다.</p>
    <button onclick="alert('반가워요!')">눌러 보세요</button>
  </body>
</html>
```

저장(`Ctrl + S`)하고, 파일 탐색기에서 `index.html` 을 더블클릭하면 브라우저에 열린다.
**축하한다. HTML(뼈대)과 JavaScript(`alert`)를 이미 써 봤다.**

### 개발자 도구 — 개발자의 현미경

브라우저에서 `F12` 를 누른다.

| 탭 | 무엇을 보나 | 언제 쓰나 |
| --- | --- | --- |
| **Elements** | 화면의 HTML 구조와 CSS | "왜 이 버튼이 여기 있지?" |
| **Console** | JavaScript 오류, `console.log` 출력 | "왜 안 되지?" — **가장 먼저 여기를 본다** |
| **Network** | 서버와 주고받은 요청 | "서버가 뭐라고 답했지?" |
| **Application** | localStorage, 쿠키 | "토큰이 저장됐나?" |

Console 탭에 `1 + 2` 를 치고 엔터를 쳐 보자. `3` 이 나온다. 브라우저는 이미 JavaScript 실행기다.

📱 **휴대폰 화면 보기**: 개발자 도구 왼쪽 위의 휴대폰 아이콘(`Ctrl + Shift + M`). 반응형 확인에 쓴다.

---

## 0-7. Git — 게임의 세이브 포인트

코드를 고치다 망가지면 **어제 잘 되던 상태로 돌아가고** 싶다. Git 은 작업에 세이브 포인트를 찍어 준다.

```
 작업 폴더 ──(git add)──► 준비 영역 ──(git commit)──► 저장소(기록)  ──(git push)──► GitHub
 "고치는 중"              "이번에 저장할 것"            "세이브 포인트"                "인터넷 백업"
```

### 처음 한 번만 — 내 이름 등록

```bash
git config --global user.name "내이름"
git config --global user.email "내이메일@example.com"
```

### 매일 쓰는 명령

```bash
git init                    # 이 폴더를 Git 으로 관리 시작 (프로젝트당 한 번)
git status                  # 무엇이 바뀌었나 — 가장 많이 친다
git add index.html          # 이 파일을 저장 목록에 올린다
git add .                   # 바뀐 파일 전부
git commit -m "첫 페이지 만들기"   # 세이브 포인트 찍기 (메시지는 "무엇을 했는지")
git log --oneline           # 세이브 포인트 목록
git diff                    # 아직 저장 안 한 변경 내용 보기
```

### 좋은 커밋 메시지

```
✗ 수정, ㅇㅇ, asdf, 최종, 최종2
✓ 로그인 폼 추가
✓ 비밀번호 8자 미만이면 오류 표시
✓ 모바일에서 사이드바가 본문을 가리던 문제 수정
```

**한 커밋 = 한 가지 일.** 나중에 "언제 이게 망가졌지?" 를 찾을 때 이 규칙이 나를 구한다.

### GitHub 에 올리기

1. <https://github.com> 가입 → 오른쪽 위 `+` → **New repository** → 이름 입력 → Create
2. 화면에 나오는 명령을 그대로 친다

```bash
git remote add origin https://github.com/내아이디/my-first-web.git
git branch -M main
git push -u origin main     # 처음 한 번. 이후로는 git push 만
```

### 절대 올리면 안 되는 것 — `.gitignore`

```gitignore
node_modules/   # 내려받은 남의 코드 (수백 MB, npm install 로 언제든 다시 받는다)
.env            # 비밀번호, 비밀 키
dist/           # 빌드 결과물
```

> **비밀번호를 한 번이라도 커밋해서 push 했다면** 지워도 기록에 남는다. 그 비밀번호는 즉시 바꾼다.

### 브랜치 — 평행 세계

```bash
git switch -c feat/login     # 새 브랜치를 만들고 이동 (main 은 안전하게 둔 채 실험)
# ... 작업 & 커밋 ...
git switch main              # main 으로 돌아오기
git merge feat/login         # 실험이 성공했으면 합치기
```

이 저장소도 기능마다 브랜치를 만들어 작업한다 (`feat/backend-api` 같은 이름).

### 협업 흐름 — 브랜치에서 작업하고 PR 로 합치기

혼자 하는 프로젝트라도 이 흐름으로 연습해 둔다. 회사에서는 전부 이렇게 한다.

```
 main ──●──────────────●────────────────●──►   항상 "동작하는 상태"
         \                              ↑
          ●──●──●  feat/login ──► PR ──┘        작업은 브랜치에서, 합칠 때는 PR 로
```

```bash
# ① 시작하기 전에 항상 최신 main 을 받는다  ← 가장 많이 빼먹고, 가장 비싼 대가를 치르는 단계
git switch main
git pull

# ② 새 브랜치를 만든다 (이름: 종류/내용)
git switch -c feat/dark-mode

# ③ 작업하고 커밋한다 (여러 번)
git add .
git commit -m "다크 모드 색상 토큰 추가"

# ④ GitHub 에 올린다 (처음 한 번은 -u)
git push -u origin feat/dark-mode

# ⑤ GitHub 에서 "Compare & pull request" → 설명을 쓰고 Create pull request
# ⑥ 내용을 확인하고 "Merge pull request" → "Delete branch"

# ⑦ 내 컴퓨터도 정리한다
git switch main
git pull
git branch -d feat/dark-mode
```

**브랜치 이름의 관례**

| 접두사 | 뜻 | 예 |
| --- | --- | --- |
| `feat/` | 새 기능 | `feat/dark-mode` |
| `fix/` | 버그 수정 | `fix/login-redirect` |
| `docs/` | 문서만 | `docs/readme` |
| `refactor/` | 동작은 그대로, 구조만 | `refactor/api-layer` |

**PR(Pull Request)** 은 "내 브랜치를 main 에 합쳐 주세요" 라는 요청이다. 합치기 전에 바뀐 내용을 한 화면에서 훑어보고,
자동 검사(lint, test)를 돌리고, 다른 사람의 의견을 받는 자리다. 혼자여도 **합치기 전에 내 변경을 한 번 다시 읽는 습관**이 생긴다.

> **PR 에 "This branch has conflicts" 가 뜬다면** ① 을 건너뛴 것이다. 오래된 지점에서 브랜치를 만들어서,
> 그사이 main 에 쌓인 변경과 부딪혔다. 이 저장소도 실제로 겪었다 → [11 버그 사례집](11-bug-casebook.md) 사례 18.
> 충돌을 푸는 법과 되돌리는 법은 [10 오류 사전 3장](10-error-dictionary.md).

### 실수했을 때 — 가장 자주 쓰는 되돌리기 3가지

```bash
git restore index.html           # 저장한 수정을 버리고 마지막 커밋 상태로 (수정이 사라진다!)
git restore --staged index.html  # git add 한 것만 취소 (수정은 남는다)
git commit --amend -m "새 메시지" # 방금 한 커밋의 메시지 고치기 (push 하기 전에만)
```

Git 의 좋은 점은 **커밋한 것은 거의 항상 되찾을 수 있다**는 것이다. 그래서 자주 커밋한다. 커밋하지 않은 수정만 진짜로 사라진다.

---

## 0-8. npm — 남이 만든 코드 빌려 쓰기

```bash
npm init -y               # package.json (프로젝트 설명서) 만들기
npm install axios         # 라이브러리 설치 → node_modules/ 와 package.json 에 기록
npm install               # package.json 에 적힌 것 전부 설치 (남의 프로젝트를 받았을 때)
npm run dev               # package.json 의 "scripts" 에 적힌 명령 실행
```

이 프로젝트의 [frontend/package.json](../frontend/package.json) 을 열어 보자.
`"scripts"` 에 `dev`, `build`, `lint`, `test` 가 있다. `npm run 이름` 으로 실행한다.

---

## 0-9. 영어가 걱정된다면

- 프로그래밍 영어는 **단어 300개** 정도가 대부분이다. 모르는 단어는 학습 일지에 모은다.
- 자주 보는 단어: `error`(오류), `undefined`(정의되지 않음), `null`(비어 있음), `expected`(기대했다),
  `received`(받았다), `missing`(빠졌다), `invalid`(올바르지 않다), `deprecated`(곧 없어질 예정),
  `warning`(경고), `failed`(실패), `not found`(못 찾음), `permission denied`(권한 없음)
- 오류 메시지는 번역기에 통째로 넣어도 된다. **읽지 않고 넘기는 것만 안 된다.**

---

## 직접 해 보기

1. `study-log` 폴더를 만들고 `git init` → `README.md` 에 "학습을 시작합니다" 를 적고 커밋한다
2. GitHub 에 올린다
3. 매일 학습 일지([양식](README.md#3-3-학습-일지-양식))를 적고 커밋한다 — **오늘부터**
4. 이 저장소를 내려받아(`git clone`) `frontend` 를 실행해 본다 (이해 안 가도 된다. 완성품을 먼저 구경한다)

```bash
git clone <이 저장소 주소>
cd my-vue-blog/frontend
npm install
npm run dev      # 터미널에 나온 http://localhost:3000 을 브라우저로 연다
```

## 체크리스트

- [ ] HTML / CSS / JavaScript 의 역할을 한 문장씩 설명할 수 있다
- [ ] 프론트엔드, 백엔드, 데이터베이스가 각각 무엇을 하는지 안다
- [ ] `node -v`, `npm -v`, `git --version` 이 모두 동작한다
- [ ] 터미널에서 `cd`, `ls`, `mkdir` 로 폴더를 다룰 수 있다
- [ ] `F12` 를 눌러 Console 탭에서 오류를 볼 수 있다
- [ ] `git add` → `git commit` → `git push` 를 혼자 할 수 있다
- [ ] `.gitignore` 에 무엇을 넣어야 하는지 안다

다음: [01 HTML — 화면의 뼈대](01-html.md)
