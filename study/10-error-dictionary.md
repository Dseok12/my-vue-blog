# 부록 — 오류 사전: 메시지로 찾는 원인과 해결

> 전체 로드맵: [README](README.md) · 관련: [11 버그 사례집](11-bug-casebook.md)

오류가 나면 **이 문서에서 메시지의 일부를 검색한다** (`Ctrl + F`).
메시지는 실제로 나오는 영어 문장 그대로 적었다. 못 찾으면 맨 아래 "사전에 없는 오류를 만났을 때" 를 따른다.

## 0. 오류를 만났을 때 맨 먼저 할 일

```
① 멈춘다.            아무거나 고쳐 보지 않는다. 무엇을 바꿨는지 모르게 되면 더 어려워진다.
② 끝까지 읽는다.      첫 줄이 "무슨 일", 그 아래 파일 이름과 줄 번호가 "어디서".
③ 어디서 났는지 정한다.
      터미널 (npm, git, node)          → 1~3장
      브라우저 Console 탭               → 4~5장
      브라우저 Network 탭 (빨간 줄)       → 6장
      백엔드 터미널의 [error]            → 7~8장
④ 마지막으로 바꾼 것을 떠올린다.  방금 전까지 됐다면, 원인은 방금 바꾼 것 안에 있다.
```

**오류 메시지의 생김새**

```
TypeError: Cannot read properties of undefined (reading 'nickname')
    at formatAuthor (DiaryMeta.vue:12:23)
    at render (DiaryCard.vue:30:9)
└─┬──┘  └──────────────┬───────────────┘   └──────┬───────┘
 종류          무슨 일이 있었나                  어디서 (파일:줄:칸) — 맨 위 줄이 실제 위치,
                                            아래로 갈수록 "그 함수를 부른 곳"
```

---

## 1. 터미널 · 설치

| 메시지 | 원인 | 해결 |
| --- | --- | --- |
| `'node' 은(는) 내부 또는 외부 명령, 실행할 수 있는 프로그램, 또는 배치 파일이 아닙니다` / `command not found: node` | Node.js 가 없거나, 설치 후 터미널을 다시 열지 않았다 | 터미널(VS Code)을 완전히 껐다 켠다 → 안 되면 재부팅 → 안 되면 재설치 |
| `'vite' 은(는) 내부 또는 외부 명령...` | `npm install` 을 안 했다 (`node_modules` 가 없다) | 그 폴더에서 `npm install` |
| `npm error enoent Could not read package.json` | `package.json` 이 없는 폴더에서 실행했다 | `pwd` 로 위치 확인 → `cd frontend` 또는 `cd backend` |
| `이 시스템에서 스크립트를 실행할 수 없으므로 ... npm.ps1 파일을 로드할 수 없습니다` | Windows PowerShell 의 실행 정책 | VS Code 터미널 종류를 **Git Bash** 나 **Command Prompt** 로 바꾸거나, PowerShell 에서 `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| `Missing script: "dev"` | 그 `package.json` 에 `dev` 스크립트가 없다 | 폴더가 맞는지 확인 (저장소 루트가 아니라 `frontend/` 에서 실행) |
| `Unsupported engine` / `requires Node.js version ...` | Node 버전이 낮다 | `node -v` 확인 → LTS(22 이상) 설치 |
| 명령을 쳤는데 아무 반응 없이 멈춰 있다 | 서버가 **실행 중**인 것이다 (정상) | 그 터미널은 그대로 두고 새 터미널을 연다. 끄려면 `Ctrl + C` |

---

## 2. npm

| 메시지 | 원인 | 해결 |
| --- | --- | --- |
| `Error: Port 3000 is already in use` / `EADDRINUSE: address already in use :::4000` | 그 포트를 쓰는 서버가 이미 켜져 있다 | 다른 터미널의 서버를 `Ctrl + C`. 못 찾겠으면 아래 "포트를 쓰는 프로세스 찾기" |
| `EPERM: operation not permitted, unlink '...node_modules...'` | 실행 중인 프로그램이 그 파일을 잡고 있다 (Windows) | 개발 서버와 VS Code 의 관련 터미널을 모두 끄고 다시 |
| `ERESOLVE unable to resolve dependency tree` | 라이브러리끼리 요구하는 버전이 안 맞는다 | 메시지에 나온 두 패키지의 버전을 맞춘다. 급하면 `--legacy-peer-deps` (원인은 남는다) |
| `Cannot find module 'xxx'` / `Failed to resolve import "xxx"` | 설치 안 함 / 이름·경로 오타 / 대소문자 | 라이브러리면 `npm install xxx`, 내 파일이면 경로와 **대소문자** 확인 |
| `npm warn deprecated ...` | 곧 지원이 끝나는 패키지 (경고) | 당장은 동작한다. 여유 있을 때 최신으로 |
| `found N vulnerabilities` | 알려진 보안 문제가 있는 버전 | `npm audit` 로 내용 확인 → `npm audit fix`. `--force` 는 무엇이 바뀌는지 읽고 나서 |
| `npm ci` 가 `package-lock.json` 과 안 맞는다며 실패 | `package.json` 만 고치고 lock 파일을 안 맞췄다 | `npm install` 로 lock 파일을 갱신하고 함께 커밋 |

**포트를 쓰는 프로세스 찾기 (Windows PowerShell)**

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen | Select-Object OwningProcess
Get-CimInstance Win32_Process -Filter "ProcessId=12345" | Select-Object CommandLine   # 무엇인지 확인
Stop-Process -Id 12345 -Force                                                          # 내 개발 서버가 맞으면 종료
```

```bash
# macOS / Linux
lsof -i :3000
kill <PID>
```

---

## 3. Git

| 메시지 | 원인 | 해결 |
| --- | --- | --- |
| `fatal: not a git repository` | Git 으로 관리하는 폴더가 아니다 | 저장소 폴더로 `cd`, 새 프로젝트면 `git init` |
| `Author identity unknown` / `Please tell me who you are` | 이름·이메일 미등록 | `git config --global user.name "이름"` / `user.email "메일"` |
| `nothing to commit, working tree clean` | 바뀐 것이 없다 | 파일을 **저장**했는지 확인 (`Ctrl + S`) |
| `Changes not staged for commit` | `git add` 를 안 했다 | `git add 파일` 후 다시 커밋 |
| `LF will be replaced by CRLF the next time Git touches it` | 줄바꿈 문자 변환 안내 (Windows) | **무시해도 된다.** 오류가 아니다 |
| `error: failed to push some refs` + `Updates were rejected because the remote contains work that you do not have` | 원격에 내가 없는 커밋이 있다 | `git pull` (필요하면 충돌 해결) 후 `git push` |
| `CONFLICT (content): Merge conflict in 파일` | 같은 줄을 양쪽에서 다르게 고쳤다 | 아래 "충돌 해결" |
| `error: Your local changes to the following files would be overwritten by checkout` | 커밋 안 한 변경이 있어서 브랜치를 못 바꾼다 | 커밋하거나, 잠시 치워 둔다: `git stash` → 브랜치 이동 → `git stash pop` |
| `fatal: refusing to merge unrelated histories` | 서로 다른 저장소를 합치려 한다 | 주소가 맞는지 확인. 정말 합칠 거면 `--allow-unrelated-histories` |
| GitHub 에서 `This branch has conflicts that must be resolved` | 내 브랜치가 오래된 `main` 에서 갈라졌다 | [사례집 18](11-bug-casebook.md). 최신 `main` 을 내 브랜치에 합치고 충돌 해결 |
| `remote: Permission to ... denied` / `Authentication failed` | 로그인 정보가 없거나 권한이 없다 | GitHub 로그인 다시 (Git Credential Manager 창), 저장소 주소 확인 |

**충돌 해결**

```
<<<<<<< HEAD
const PAGE_SIZE = 10        ← 내 브랜치의 내용
=======
const PAGE_SIZE = 20        ← 가져온(상대) 브랜치의 내용
>>>>>>> main
```

1. 두 내용을 **둘 다 읽고** 최종 모습을 정한다 (하나를 고르거나, 둘을 합친다)
2. `<<<<<<<`, `=======`, `>>>>>>>` 줄을 모두 지운다
3. `npm test`, `npm run lint` 로 확인한다
4. `git add 파일` → `git commit`

> VS Code 는 충돌 위에 "Accept Current / Incoming / Both" 버튼을 보여 준다. 편하지만 **읽지 않고 누르지 않는다.**

**되돌리기 — 상황별**

| 하고 싶은 것 | 명령 | 주의 |
| --- | --- | --- |
| 저장 안 한 수정을 버리고 마지막 커밋 상태로 | `git restore 파일` | 수정이 **사라진다** |
| `git add` 한 것을 취소 | `git restore --staged 파일` | 수정은 남는다 |
| 방금 한 커밋의 메시지만 고치기 | `git commit --amend -m "새 메시지"` | push 하기 **전**에만 |
| 방금 한 커밋을 취소 (수정은 남김) | `git reset --soft HEAD~1` | push 하기 **전**에만 |
| 이미 push 한 커밋을 되돌리기 | `git revert <커밋>` | "되돌리는 새 커밋" 을 만든다. 안전하다 |
| 예전 상태를 구경만 하기 | `git switch --detach <커밋>` → 돌아올 때 `git switch -` | |

`git reset --hard`, `git push --force` 는 **기록을 지운다.** 무엇이 사라지는지 정확히 알 때만 쓴다.

---

## 4. 브라우저 Console — JavaScript

| 메시지 | 뜻 | 흔한 원인 → 해결 |
| --- | --- | --- |
| `Uncaught ReferenceError: x is not defined` | 그런 이름이 없다 | 오타 / `import` 누락 / 선언보다 먼저 사용 |
| `Uncaught TypeError: Cannot read properties of undefined (reading 'title')` | `undefined.title` 을 했다 | 데이터가 아직 안 왔다 → `v-if="diary"` 로 감싸거나 `diary?.title`. 또는 속성 이름 오타 |
| `Cannot read properties of null (reading 'addEventListener')` | `querySelector` 가 못 찾았다 | 선택자 오타 / `<script>` 가 HTML 보다 먼저 실행됨 |
| `Uncaught TypeError: x is not a function` | 함수가 아닌 것에 `()` | 이름 오타 / `import { x }` 와 `import x` 혼동 / `.value` 누락 |
| `Uncaught TypeError: Assignment to constant variable.` | `const` 에 다시 대입 | 바꿔야 하는 값이면 `let`. 객체 내용만 바꾸는 것은 괜찮다 |
| `Uncaught SyntaxError: Unexpected token '}'` | 문법 오류 | 괄호·중괄호·따옴표 짝. 그 줄보다 **위**가 원인일 때가 많다 |
| `Uncaught SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON` | JSON 을 기대했는데 HTML 이 왔다 | API 주소가 틀려서 `index.html` 이 응답됐다 → Network 탭에서 요청 주소 확인 |
| `Uncaught (in promise) ...` | 실패한 Promise 를 아무도 안 잡았다 | `await` 하는 곳에 `try/catch`. [사례집 7](11-bug-casebook.md) |
| `Uncaught RangeError: Maximum call stack size exceeded` | 함수가 끝없이 자기를 부른다 | 재귀의 종료 조건 / `watch` 안에서 감시 대상을 바꿈 |
| 결과가 `NaN` | 숫자가 아닌 것으로 계산했다 | `Number('abc')`, `undefined + 1`. 계산 전에 `console.log(typeof x)` |
| 결과가 `[object Object]` | 객체를 문자열에 붙였다 | `obj.name` 처럼 속성을 꺼내거나 `JSON.stringify(obj)` |
| `'51'` 이 나온다 (`5 + 1` 을 기대) | 한쪽이 문자열 | `Number(value) + 1` |

---

## 5. 브라우저 Console — Vue

| 메시지 (`[Vue warn]: ...`) | 원인 | 해결 |
| --- | --- | --- |
| `Property "xxx" was accessed during render but is not defined on instance` | 템플릿에서 쓴 이름이 `<script setup>` 에 없다 | 오타 / 선언 누락 / `import` 누락 |
| `Failed to resolve component: BaseButton` | 컴포넌트를 `import` 하지 않았다 | `import BaseButton from '@/components/common/BaseButton.vue'` |
| `Missing required prop: "diary"` | 필수 prop 을 안 넘겼다 | 부모에서 `:diary="..."` |
| `Invalid prop: type check failed for prop "count". Expected Number, got String` | 타입이 다르다 | `count="3"` 은 문자열이다. `:count="3"` 처럼 `:` 를 붙인다 |
| `Extraneous non-props attributes (class) were passed to component but could not be automatically inherited` | 컴포넌트 루트가 여러 개라 속성을 붙일 곳을 모른다 | 루트를 하나로. 템플릿 맨 위의 주석도 루트로 센다 — [사례집 14](11-bug-casebook.md) |
| `Maximum recursive updates exceeded` | 바꾸면 → 다시 실행 → 또 바꿈 의 무한 반복 | `watch` 안에서 감시 대상을 바꾸지 않는다. 값을 만드는 일은 `computed` 로 |
| `Avoid app logic that relies on enumerating keys on a component instance` | 컴포넌트 자체를 반복하거나 펼쳤다 | 대개 ref 에 `.value` 를 빠뜨렸다 |
| `[Vue Router warn]: No match found for location with path "/xxx"` | 그런 경로가 없다 | 경로 오타. `name` 으로 이동하면 이런 오타가 줄어든다 |
| `Hydration ... mismatch` | (Nuxt/SSR) 서버가 그린 것과 브라우저가 그린 것이 다르다 | 날짜·난수·`window` 처럼 양쪽에서 값이 달라지는 것을 `onMounted` 안으로 |
| 경고는 없는데 **화면이 안 바뀐다** | 반응성이 끊겼다 | ① `script` 에서 `.value` 누락 ② 스토어를 `storeToRefs` 없이 구조 분해 ③ `reactive` 를 통째로 교체 ④ props 를 구조 분해 |
| 목록을 고쳤는데 엉뚱한 줄이 바뀐다 | `:key` 가 없거나 인덱스다 | `:key="item.id"` |
| 폼을 제출하면 페이지가 새로고침된다 | `.prevent` 누락 | `@submit.prevent="onSubmit"` |

---

## 6. Network 탭 — 상태 코드로 찾기

요청이 빨갛게 나오면 클릭해서 **Status** 와 **Response** 를 본다. 이 프로젝트의 오류 응답은 항상 `{ "message": "..." }` 이다.

| 상태 | 뜻 | 이 프로젝트에서 나오는 경우 | 볼 곳 |
| --- | --- | --- | --- |
| `(failed) net::ERR_CONNECTION_REFUSED` | 서버가 꺼져 있다 | 백엔드를 안 켰다 | 백엔드 터미널에서 `npm run dev` |
| `400` | 요청 내용이 잘못됐다 | 검증 실패 (빈 제목, 너무 긴 내용, 비공개 글에 좋아요) | Response 의 `message`, Payload 탭의 보낸 값 |
| `401` | 누구인지 모른다 | 토큰 없음 / 만료 / 비밀번호 틀림 | Request Headers 에 `Authorization: Bearer ...` 가 있는가 |
| `403` | 누구인지는 알지만 권한이 없다 | 남의 글 수정, 비공개 글 조회, 관리자 화면 | 로그인한 계정이 맞는가 |
| `404` | 그런 주소·자료가 없다 | 주소 오타, 지워진 글 | 요청 URL 을 글자 하나씩 확인 |
| `409` | 이미 있다 | 가입된 이메일, 사용 중인 닉네임, 이미 신고한 글 | `message` |
| `413` | 요청이 너무 크다 | 2MB 를 넘는 JSON | 큰 파일은 업로드 API 로 |
| `429` | 너무 많이 요청했다 | 로그인 시도 15분에 20번 초과 | `Retry-After` 헤더(초). 개발 중이면 서버 재시작 |
| `500` | **서버 코드의 오류** | 예상 못 한 오류 | **백엔드 터미널**의 `[error]` 줄. 프론트를 고쳐서는 해결되지 않는다 |
| `504` / 한참 뒤 `timeout` | 응답이 없다 | DB 가 멈췄거나 서버가 죽었다 | 백엔드 터미널 |
| CORS 오류 (`blocked by CORS policy`) | 다른 출처의 서버가 허용하지 않았다 | 프록시를 거치지 않고 `localhost:4000` 을 직접 불렀다 / `CORS_ORIGIN` 불일치 | `VITE_API_BASE_URL=/api` 인지, 백엔드 `.env` 의 `CORS_ORIGIN` |
| 요청이 **아예 안 보인다** | 요청을 보내는 코드가 실행되지 않았다 | 버튼 이벤트 미연결, 검증에서 걸림, mock 모드 | Console 탭, `VITE_USE_MOCK` 값 |

---

## 7. 백엔드 — Node · Express

| 메시지 | 원인 | 해결 |
| --- | --- | --- |
| `SyntaxError: Cannot use import statement outside a module` | ES 모듈 설정이 없다 | `package.json` 에 `"type": "module"` |
| `ReferenceError: require is not defined in ES module scope` | ES 모듈에서 `require` 를 썼다 | `import x from 'x'` 로 바꾼다 |
| `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../utils/date'` | ES 모듈은 **확장자**까지 써야 한다 | `'./utils/date.js'` |
| `SyntaxError: The requested module './x.js' does not provide an export named 'y'` | 그 이름으로 내보낸 것이 없다 | `export` 이름 확인. `export default` 와 `export { y }` 혼동 |
| `TypeError: Cannot destructure property 'email' of 'req.body' as it is undefined` | 본문 해석 미들웨어가 없거나 순서가 뒤다 | `app.use(express.json())` 을 라우터보다 **앞**에 |
| `Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client` | 한 요청에 응답을 두 번 보냈다 | `res.json(...)` 뒤에 `return`. 조건문마다 응답이 한 번인지 확인 |
| 요청이 끝나지 않고 계속 돈다 | 응답을 안 보냈거나 `next()` 를 안 불렀다 | 미들웨어의 모든 갈래가 `next()` 또는 응답으로 끝나는지 |
| `JsonWebTokenError: jwt malformed` / `TokenExpiredError: jwt expired` | 토큰이 깨졌거나 만료 | 정상적인 상황이다. 401 로 응답하면 된다 (이 프로젝트는 그렇게 한다) |
| `.env 에 JWT_SECRET 값을 설정해 주세요.` | 운영 모드인데 비밀 키가 없다 | `.env` 에 `JWT_SECRET` 추가 |
| `PayloadTooLargeError: request entity too large` | 본문이 한도(2MB)를 넘었다 | 이미지는 JSON 에 넣지 말고 업로드 API 로 |
| `MulterError: File too large` | 업로드 파일이 10MB 초과 | 정상 동작 (400 으로 응답) |
| 코드를 고쳤는데 그대로다 | 서버가 다시 시작되지 않았다 | `npm run dev` (`--watch`) 로 켰는지. `.env` 는 고치면 **직접 재시작** |

---

## 8. 백엔드 — MySQL

| 메시지 | 원인 | 해결 |
| --- | --- | --- |
| `connect ECONNREFUSED 127.0.0.1:3306` | MySQL 이 꺼져 있다 | MySQL 서비스 시작 (Windows: 서비스 앱에서 `MySQL80`) |
| `ER_ACCESS_DENIED_ERROR: Access denied for user 'root'@'localhost'` | 계정·비밀번호가 틀리다 | `.env` 의 `DB_USER` / `DB_PASSWORD` |
| `ER_BAD_DB_ERROR: Unknown database 'my_vue_blog'` | 데이터베이스가 없다 | `npm run db:migrate` |
| `ER_NO_SUCH_TABLE: Table '...diaries' doesn't exist` | 테이블이 없다 | `npm run db:migrate` |
| `ER_BAD_FIELD_ERROR: Unknown column 'd.author_id' in 'field list'` | 코드와 DB 구조가 다르다 | [사례집 1](11-bug-casebook.md). 예전 DB 다 → `DB_NAME` 을 바꾸고 migrate |
| `ER_PARSE_ERROR: You have an error in your SQL syntax; ... near '...'` | SQL 문법 오류 | `near` 뒤의 글자 **바로 앞**이 틀렸다. 쉼표, 띄어쓰기(문자열을 이을 때 공백 누락)를 본다 |
| `ER_DUP_ENTRY: Duplicate entry 'a@b.c' for key 'uk_users_email'` | UNIQUE 제약 위반 | 정상적인 상황 → 409 로 응답 |
| `ER_DATA_TOO_LONG: Data too long for column 'content'` | 컬럼 크기를 넘었다 | 검증에 길이 제한 추가 — [사례집 8](11-bug-casebook.md) |
| `ER_NO_REFERENCED_ROW_2: Cannot add or update a child row: a foreign key constraint fails` | 없는 부모를 가리킨다 | 없는 글·회원 id 로 저장하려 했다. 먼저 존재를 확인 |
| `ER_ROW_IS_REFERENCED_2: Cannot delete or update a parent row` | 자식이 남아 있어 부모를 못 지운다 | `ON DELETE CASCADE` 를 걸거나 자식을 먼저 지운다 |
| `ER_WRONG_ARGUMENTS: Incorrect arguments to mysqld_stmt_execute` | `execute` 의 `?` 에 맞지 않는 값 (특히 `LIMIT ?`) | 값의 개수·타입 확인. `LIMIT` 은 검증한 정수를 직접 붙인다 ([06 5-2](06-backend.md)) |
| `Column count doesn't match value count` | `INSERT` 의 컬럼 수와 값 수가 다르다 | 컬럼 목록과 `?` 개수를 센다 |
| `ER_LOCK_DEADLOCK` | 두 트랜잭션이 서로를 기다린다 | 여러 테이블을 **항상 같은 순서**로 잠근다. 다시 시도 |
| 한글이 `???` 로 저장된다 | 문자 집합이 utf8mb4 가 아니다 | 테이블과 연결 모두 `utf8mb4` |
| 날짜가 하루 어긋난다 | 시간대 변환 | 날짜는 `DATE` + 문자열(`dateStrings`)로, 시각은 UTC 로 ([06 4-6](06-backend.md)) |

---

## 9. 오류는 없는데 이상할 때

| 증상 | 먼저 확인할 것 |
| --- | --- |
| 코드를 고쳤는데 화면이 그대로 | ① 저장했나 ② 다른 파일을 고친 것은 아닌가 ③ 개발 서버가 켜져 있나 ④ 강력 새로고침 `Ctrl + Shift + R` |
| CSS 가 안 먹는다 | Elements 탭에서 그 요소를 골라 Styles 를 본다. 줄이 그어진 속성 = 다른 규칙에 졌다. 아예 없으면 = 선택자 오타 또는 CSS 파일을 `import` 하지 않았다 |
| 요소를 눌러도 반응이 없다 | 다른 요소가 위를 덮고 있다. Elements 탭에서 마우스를 올려 **실제로 눌리는 것**이 무엇인지 본다 — [사례집 4](11-bug-casebook.md) |
| 휴대폰에서만 가로 스크롤이 생긴다 | 고정 `width`, 긴 영문/주소, `flex` 자식의 `min-width`. Console 에서 넘치는 요소 찾기 ↓ |
| 새로고침하면 로그아웃된다 | 토큰 저장(`localStorage`)과 복구(`restore()`) |
| 새로고침하면 404 (배포 후) | SPA 설정: 모든 경로를 `index.html` 로 ([07 10-3](07-vue-advanced.md)) |
| 내 컴퓨터에서는 되는데 배포하면 안 된다 | 환경 변수, 주소(`localhost`), 대소문자(리눅스는 구분한다), 프록시 — [사례집 16](11-bug-casebook.md) |
| "가끔" 이상하다 | 순서 문제(경쟁 상태)다 — [사례집 11](11-bug-casebook.md) |

**화면 밖으로 넘치는 요소 찾기** — Console 에 붙여 넣는다.

```js
document.querySelectorAll('body *').forEach((el) => {
  if (el.getBoundingClientRect().right > window.innerWidth) console.log(el)
})
```

---

## 10. 디버깅 도구 사용법

### console 을 제대로 쓰기

```js
console.log('diary:', diary)                 // 이름표를 붙인다. 값만 찍으면 무엇인지 모른다
console.log({ id, title, loading })          // 객체로 감싸면 변수 이름이 같이 찍힌다
console.log(JSON.stringify(value))           // 앞뒤 공백, 숨은 글자가 보인다 → "demo@diary.test "
console.table(items)                         // 객체 배열을 표로
console.log(typeof value, Array.isArray(value))   // "문자열인 줄 알았는데 숫자" 를 잡는다
console.trace('여기까지 온 경로')             // 누가 이 함수를 불렀는지
```

> Vue 의 `ref` 나 `reactive` 를 그대로 찍으면 `Proxy` 로 보인다. `console.log(items.value)` 또는 `toRaw(items.value)` 로 찍는다.

### 중단점 — 코드를 멈춰 세우고 들여다보기

`console.log` 를 열 번 넣는 것보다 한 번 멈추는 것이 빠르다.

1. `F12` → **Sources** 탭 → `Ctrl + P` 로 파일 열기 (예: `DiaryListView.vue`)
2. 멈추고 싶은 줄 번호를 클릭 (파란 표시)
3. 화면에서 그 코드를 실행시키면 **그 줄에서 멈춘다**
4. 오른쪽 **Scope** 에서 모든 변수의 지금 값을 본다. 변수 위에 마우스를 올려도 보인다

| 버튼 | 단축키 | 동작 |
| --- | --- | --- |
| ▶ Resume | `F8` | 다음 중단점까지 계속 |
| ↷ Step over | `F10` | 한 줄 실행 (함수 안으로는 안 들어간다) |
| ↓ Step into | `F11` | 함수 안으로 들어간다 |
| ↑ Step out | `Shift + F11` | 지금 함수를 끝내고 나온다 |

코드에 `debugger` 라고 한 줄 쓰면 그 자리가 중단점이 된다. (커밋 전에 반드시 지운다. ESLint 가 잡아 준다)

### Network 탭

- **Preserve log** 체크 — 페이지가 이동해도 기록이 남는다 (로그인처럼 이동이 따라오는 요청을 볼 때)
- **Fetch/XHR** 필터 — API 요청만 본다
- 요청 클릭 → **Headers**(주소, 상태, 토큰) / **Payload**(내가 보낸 값) / **Response**(서버가 준 값)
- **No throttling → Slow 4G** — 느린 네트워크를 흉내 낸다. 로딩 표시가 제대로 나오는지 볼 때
- 요청 우클릭 → **Copy → Copy as cURL** — 같은 요청을 터미널에서 다시 보낼 수 있다

### Vue Devtools (브라우저 확장)

- **Components** — 컴포넌트를 고르면 props, ref, computed 의 지금 값이 보이고 직접 고칠 수 있다
- **Pinia** — 스토어 상태와 바뀐 기록
- **Router** — 지금 경로, params, query, meta

"화면에 왜 이렇게 나오지?" → Components 에서 그 컴포넌트의 데이터를 본다. 데이터가 틀리면 스토어/API 쪽, 데이터는 맞는데 화면이 틀리면 템플릿 쪽 문제다.

### 백엔드를 직접 불러 보기

화면을 거치지 않고 서버만 확인한다. **화면 문제인지 서버 문제인지 가르는 가장 빠른 방법이다.**

```bash
# 서버가 살아 있나
curl http://localhost:4000/api/health

# 로그인해서 토큰 받기
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@diary.test","password":"demo1234"}'

# 토큰으로 목록 조회 (TOKEN 자리에 위에서 받은 값)
curl "http://localhost:4000/api/diaries?limit=2" -H "Authorization: Bearer TOKEN"
```

VS Code 확장 **REST Client** 를 쓰면 이런 요청을 `.http` 파일에 저장해 두고 클릭 한 번으로 보낼 수 있다.

---

## 11. 사전에 없는 오류를 만났을 때

1. **메시지에서 내 프로젝트만의 부분을 뺀다.** 파일 경로, 변수 이름을 지우고 남는 문장이 검색어다
   - `Cannot read properties of undefined (reading 'nickname')` → `Cannot read properties of undefined`
2. **따옴표로 감싸서 검색한다.** `"Cannot read properties of undefined" vue`
3. **검색 결과의 날짜를 본다.** 3년 넘은 글은 지금 버전과 다를 수 있다. 공식 문서가 기준이다
4. **가장 작은 재현을 만든다.** 새 파일에 문제의 코드만 옮겨서 같은 오류가 나는지 본다. 이 과정에서 절반은 원인이 보인다
5. **반으로 나눈다.** 코드의 절반을 주석 처리하고 오류가 사라지는지 본다. 사라지면 그 절반 안에 원인이 있다. 반복한다
6. **20분이 지나면 질문한다.** [README 의 질문 양식](README.md#3-4-막혔을-때--20분-규칙)대로 — 하려는 것 / 한 것 / 기대한 결과 / 실제 결과 / 오류 메시지 전문

해결했으면 **이 문서의 형식으로 학습 일지에 한 줄 추가한다.** 나만의 오류 사전이 가장 좋은 사전이다.
