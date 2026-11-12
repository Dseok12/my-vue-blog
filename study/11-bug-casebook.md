# 부록 — 버그 사례집: 이 프로젝트에서 실제로 났던 문제들

> 전체 로드맵: [README](README.md) · 관련: [10 오류 사전](10-error-dictionary.md), [08 디버깅 공정](08-build-any-project.md)

교재의 예제 코드는 처음부터 잘 돌아간다. 하지만 실제 개발 시간의 절반은 **안 되는 것을 고치는 일**이다.
이 문서는 이 저장소에서 **실제로 발생했고 실제로 고친** 버그를 모았다.
지어낸 예제가 아니라서, 각 사례의 "수정" 은 저장소의 코드와 테스트로 확인할 수 있다.

## 읽는 법

사례마다 같은 순서로 적었다. **"원인 찾기" 부분을 가리고 스스로 추리해 본 뒤** 읽으면 디버깅 훈련이 된다.

```
증상       사용자가 본 것 (오류 메시지, 이상한 동작)
원인 찾기   어디를 어떤 순서로 봤는가
원인       왜 그랬는가
수정       무엇을 어떻게 바꿨는가
교훈       다음 프로젝트에 가져갈 한 줄
재발 방지   이 버그가 다시 생기면 잡아 줄 테스트
```

| # | 한 줄 요약 | 종류 | 처음 배우기 좋은 시점 |
| --- | --- | --- | --- |
| 1 | 모든 화면에서 "서버에서 문제가 발생했습니다" | DB 구조 불일치 | 06 Level 3 |
| 2 | `Port 3000 is already in use` | 남은 프로세스 | 00 |
| 3 | 휴대폰에서 마이페이지로 갈 방법이 없다 | 반응형 CSS | 02 |
| 4 | 닉네임을 눌렀는데 글 상세로 간다 | CSS 겹침(z-index) | 02, 05 Level 5 |
| 5 | 좋아요를 눌러도 숫자가 안 바뀐다 (마이페이지만) | 상태 동기화 | 05 Level 3 |
| 6 | 비회원인데 401 요청이 나가고 화면이 깜빡인다 | 초기화 순서 | 05 Level 3 |
| 7 | 콘솔에 `Uncaught (in promise)` | 처리 안 된 비동기 오류 | 04, 05 Level 4 |
| 8 | 긴 글을 저장하면 500 | 검증 누락 | 06 Level 4 |
| 9 | 이메일을 붙여넣으면 "형식이 올바르지 않습니다" | 입력 정리 | 03 |
| 10 | 답글의 답글이 화면에서 사라진다 | 데이터 모양과 화면의 불일치 | 06 Level 4 |
| 11 | 검색어를 빨리 바꾸면 엉뚱한 결과 | 경쟁 상태 | 05 Level 3 |
| 12 | 글을 쓰면 캘린더의 점이 사라진다 | 잘못된 가정 | 05 Level 3 |
| 13 | 카드의 좋아요를 누르면 상세로 이동한다 | 잘못된 HTML 구조 | 01 |
| 14 | 테스트에서 루트 태그가 `DIV` 로 나온다 | Vue 템플릿 루트 | 05 Level 2 |
| 15 | 숫자로 보낸 `parentId` 가 거절된다 | 타입 가정 | 03 |
| 16 | Nginx 뒤에서 한 명이 틀리면 모두가 로그인 제한 | 배포 환경 차이 | 09 |
| 17 | `npm ci` 가 `EPERM` 으로 실패 | 파일 잠금 | 00 |
| 18 | PR 을 만들었는데 merge 할 수 없다 | 브랜치 분기 | 00 |

---

## 사례 1 — 모든 화면에서 "서버에서 문제가 발생했습니다"

**증상** 백엔드를 켜고 로그인하면 목록·캘린더·피드가 전부 같은 문구만 보여 준다. 서버는 정상적으로 켜졌다고 나온다.

**원인 찾기**

1. 화면 문구는 "서버 잘못(500)" 이라는 뜻이다 → 프론트가 아니라 **백엔드 터미널**을 본다
2. 터미널의 `[error]` 줄: `Unknown column 'd.author_id' in 'field list'`
3. "그런 컬럼이 없다" → 코드가 틀렸거나, **DB 가 코드와 다른 구조**다
4. `SHOW TABLES` 로 확인: `diary_reports` 테이블이 없고 `diaries` 에 `user_id` 가 있다 → 예전 버전이 만든 DB

**원인** `.env` 의 `DB_NAME` 이 예전 브랜치의 백엔드가 만든 데이터베이스를 가리키고 있었다.
서버는 "연결되는지" 만 확인하고 켜졌기 때문에, 구조가 달라도 켜진 뒤 요청마다 실패했다.

**수정**

- `.env` 의 `DB_NAME` 을 새 이름으로 바꾸고 `npm run db:migrate`
- **같은 일이 다시 생기면 바로 알 수 있게** 서버가 켜질 때 필요한 컬럼이 있는지 확인한다 — [server.js](../backend/src/server.js) 의 `findMissingColumns`

```
[db] my_diary 의 테이블 구조가 현재 코드와 맞지 않습니다.
     없는 항목: diaries.author_id, diaries.is_hidden, comments.author_id, diary_reports.reporter_id
     · 예전 버전의 DB 라면 : .env 의 DB_NAME 을 새 이름으로 바꾸고 npm run db:migrate
```

**교훈** **문제는 가능한 한 일찍, 가능한 한 구체적으로 알린다.** "요청마다 원인 모를 500" 보다 "시작할 때 이유와 해결법을 알려 주고 종료" 가 낫다. (fail fast)

**재발 방지** 서버 시작 시 검사 자체가 방지책이다. 실제 DB 를 쓰는 [통합 테스트](../backend/test-db/api.test.js)가 스키마와 코드가 맞는지 매번 확인한다.

---

## 사례 2 — `Error: Port 3000 is already in use`

**증상** `npm run dev` 를 하면 바로 위 오류로 끝난다.

**원인 찾기**

1. 메시지를 그대로 읽는다: "3000번 포트를 이미 누가 쓰고 있다"
2. 누가? — PowerShell 에서 확인

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen | Select-Object OwningProcess
Get-CimInstance Win32_Process -Filter "ProcessId=12328" | Select-Object CommandLine
# → node ... vite.js --port 3000
```

**원인** 이전에 띄운 개발 서버가 꺼지지 않고 남아 있었다. (터미널 창만 닫았거나, 서버를 띄운 도구가 자식 프로세스를 정리하지 못한 경우)
이 프로젝트는 [vite.config.js](../frontend/vite.config.js) 에서 `strictPort: true` 로 포트를 고정했기 때문에, 다른 포트로 피하지 않고 오류를 낸다.

**수정** 남은 프로세스를 끈다.

```powershell
Stop-Process -Id 12328 -Force
```

**교훈** 개발 서버는 **`Ctrl + C` 로 끈다.** 창을 그냥 닫지 않는다. "이미 사용 중" 오류는 대부분 과거의 내가 범인이다.

> **왜 포트를 고정했나?** 포트가 바뀌면 백엔드의 CORS 허용 주소(`CORS_ORIGIN=http://localhost:3000`)와 어긋나
> 훨씬 찾기 어려운 오류가 난다. "조용히 다른 포트로 뜨는 것" 보다 "바로 실패하는 것" 이 낫다. 이것도 fail fast 다.

---

## 사례 3 — 휴대폰에서는 마이페이지로 갈 방법이 없다

**증상** 오류는 없다. 휴대폰 크기 화면에서 닉네임 변경을 하려는데 **들어가는 길이 없다.**

**원인 찾기** 브라우저 자동 테스트가 375px 화면에서 `.header__user` 를 누르려다 "보이지 않는 요소" 라며 실패했다.
개발자 도구에서 그 요소의 CSS 를 보니:

```css
@media (max-width: 720px) {
  .header__user,
  .header__logo-text {
    display: none;          /* ← 자리가 좁아서 숨겼다 */
  }
}
```

**원인** 좁은 화면에서 헤더가 넘치지 않게 닉네임을 숨겼는데, 그 닉네임이 **마이페이지로 가는 유일한 링크**였다.
"글자를 숨긴다" 와 "기능을 없앤다" 를 구분하지 않았다.

**수정** 이름은 숨기되 링크는 아이콘으로 남긴다. — [AppHeader.vue](../frontend/src/components/layout/AppHeader.vue), [AppHeader.css](../frontend/src/css/layouts/AppHeader.css)

```vue
<router-link class="header__user" :to="..." :aria-label="'마이페이지 (' + authStore.nickname + ')'">
  <span class="header__user-icon" aria-hidden="true">👤</span>
  <span class="header__user-name">{{ authStore.nickname }} 님</span>
</router-link>
```

```css
.header__user-icon { display: none; }                 /* 넓은 화면: 이름만 */

@media (max-width: 720px) {
  .header__user-name { display: none; }               /* 좁은 화면: 아이콘만 */
  .header__user-icon { display: inline; }
}
```

**교훈** 반응형에서 `display: none` 을 쓸 때마다 묻는다 — **"이것을 숨기면 못 하게 되는 일이 있는가?"**
장식은 숨겨도 되지만 기능은 모양을 바꿔서라도 남긴다.

**재발 방지** 휴대폰 크기에서 주요 화면을 직접 눌러 보는 것. 05 최종 관문의 "375px 에서 모든 기능" 항목이 이것이다.

---

## 사례 4 — 닉네임을 눌렀는데 글 상세로 간다

**증상** 공개 피드의 카드에서 작성자 닉네임을 누르면 마이페이지가 아니라 그 글의 상세 화면이 열린다.

**원인 찾기**

1. 닉네임은 분명히 `<a href="/users/...">` 다 (Elements 탭에서 확인)
2. 그런데 누르면 다른 곳으로 간다 → **내가 누른 것이 그 링크가 아니다**
3. Elements 탭에서 닉네임 위에 마우스를 올리면 강조되는 것은 닉네임이 아니라 카드 전체를 덮은 영역

**원인** 사례 13 을 고치면서 "제목 링크가 카드 전체를 덮게" 만들었다.

```css
.card__link::after { content: ''; position: absolute; inset: 0; }   /* 카드 전체를 덮는 투명한 막 */
```

이 막이 닉네임 링크 **위에** 있어서, 닉네임을 눌러도 막(= 제목 링크)이 눌렸다. 좋아요 버튼만 막 위로 올려 두고 닉네임은 잊었다.

**수정** 닉네임도 막 위로 올린다. — [DiaryCard.css](../frontend/src/css/components/DiaryCard.css)

```css
.card__like,
.card .nickname-link {
  position: relative;
  z-index: 1;
}
```

**교훈** **하나를 고치면 그 주변을 다시 확인한다.** "카드 전체를 덮는 링크" 를 만들었다면, 카드 안에서 따로 눌려야 하는 것을 **전부** 세어 봐야 한다.

**재발 방지** 브라우저 테스트에 "카드의 닉네임을 누르면 `/users/...` 로 간다" 단계가 있다. CSS 겹침 문제는 화면을 실제로 눌러 보는 테스트만 잡을 수 있다. ([07 6-6](07-vue-advanced.md))

---

## 사례 5 — 마이페이지에서만 좋아요 숫자가 안 바뀐다

**증상** 피드에서는 좋아요를 누르면 숫자가 바로 바뀐다. 마이페이지의 같은 카드에서는 눌러도 그대로고, 새로고침하면 바뀌어 있다.

**원인 찾기**

1. 새로고침하면 맞다 → **서버 저장은 된다. 화면 갱신만 안 된다**
2. 좋아요 뒤에 화면을 갱신하는 코드: `diaryStore.syncDiary(id, { likedByMe, likeCount })`
3. `syncDiary` 가 갱신하는 곳을 읽는다 → 내 목록, 피드, 상세 **세 곳뿐**
4. 마이페이지의 글 목록은? → 다른 스토어(`stores/user.js`)의 `diaries` 다

**원인** 같은 글이 화면의 네 곳(내 목록, 피드, 상세, 마이페이지)에 뜰 수 있는데, 동기화 함수는 세 곳만 알고 있었다.
마이페이지는 나중에 추가된 기능이라 빠졌다.

**수정** — [stores/diary.js](../frontend/src/stores/diary.js)

```js
function syncDiary(id, patch) {
  const update = (list) => {
    const target = list.find((item) => item.id === id)
    if (target) Object.assign(target, patch)
  }
  update(mine.items.value)
  update(feed.items.value)
  update(useUserStore().diaries)          // ← 추가
  if (current.value?.id === id) Object.assign(current.value, patch)
}
```

**교훈** **같은 데이터를 여러 곳에 복사해 두면, 복사본의 수만큼 갱신할 곳이 생긴다.** 기능을 추가할 때 "이 데이터의 복사본이 또 어디 있지?" 를 찾아야 한다.
이것이 귀찮아지는 시점이 서버 상태 라이브러리(TanStack Query — 글을 id 로 한 곳에만 저장)를 도입할 때다. ([05 Level 6-3](05-vue.md))

**재발 방지** [diary.test.js](../frontend/src/stores/diary.test.js) — "좋아요를 누르면 내 목록 / 피드 / 마이페이지의 같은 글이 함께 바뀐다"

---

## 사례 6 — 비회원인데 401 요청이 나가고 화면이 깜빡인다

**증상** 로그인하지 않은 채 사이트에 처음 들어가면, 콘솔에 `401 (Unauthorized)` 가 한 줄 찍힌다. 화면은 정상적으로 로그인 화면이 나온다.

**원인 찾기**

1. Network 탭: 실패한 요청은 `GET /api/diaries/monthly-counts` — **캘린더**의 요청이다
2. 로그인 화면에는 캘린더가 없는데? → 캘린더가 있는 것은 `DefaultLayout`
3. [App.vue](../frontend/src/App.vue): `layouts[route.meta.layout] || DefaultLayout`
4. 라우터가 첫 주소를 확인하기 **전**에는 `route.meta` 가 비어 있다 → `DefaultLayout` 이 먼저 그려진다 → 캘린더가 요청을 보낸다 → 그 뒤 라우터가 로그인 화면으로 바꾼다

**원인** `app.mount()` 가 라우터의 첫 이동(로그인 검사 포함)이 끝나기 전에 실행됐다. 아주 잠깐 "기본 레이아웃" 이 존재했다.

**수정** — [main.js](../frontend/src/main.js)

```js
// 전
app.mount('#app')

// 후 — 라우터가 첫 주소를 확인한 뒤에 그린다
router.isReady().then(() => app.mount('#app'))
```

**교훈** **"잠깐 존재하는 상태" 도 코드를 실행한다.** 화면에 안 보일 만큼 짧아도 요청은 나간다. 초기화에는 순서가 있다: 스토어 → 라우터 준비 → 화면.

**재발 방지** 브라우저 테스트가 모든 페이지의 콘솔 오류와 4xx/5xx 응답을 모은다. 비회원 첫 접속에서 401 이 다시 나오면 바로 드러난다.

---

## 사례 7 — 콘솔에 `Uncaught (in promise)`

**증상** 로그인이 만료된 상태에서 목록 화면에 가면 콘솔에 빨간 줄: `Uncaught (in promise) ApiError: 로그인이 필요합니다.`
화면은 로그인 화면으로 잘 넘어간다.

**원인 찾기** 메시지의 뜻: **"Promise 가 실패했는데 아무도 `catch` 하지 않았다."** 실패한 Promise 를 만든 곳을 찾는다.

```js
// stores/diary.js
async function run(task) {
  try { return await task() }
  catch (err) { error.value = err.message; throw err }   // ← 화면에서도 잡을 수 있게 다시 던진다
  finally { loading.value = false }
}
function fetchMine() { return run(mine.reload) }
```

```js
// DiaryListView.vue
watch(selectedDate, (value) => {
  diaryStore.applyFilter({ dateKey: value })
  diaryStore.fetchMine()               // ← await 도 catch 도 없다
}, { immediate: true })
```

**원인** `run` 은 "저장/수정처럼 화면이 결과를 기다리는 작업" 을 위해 오류를 다시 던진다.
그런데 **목록 불러오기는 화면이 기다리지 않고 부르기만 한다.** 던져진 오류를 받을 사람이 없었다.

**수정** 목록 불러오기는 던지지 않는다. 오류는 이미 `error` 에 담겨 화면에 표시된다.

```js
async function runList(reload) {
  try { return await run(reload) }
  catch { return [] }
}
function fetchMine() { return runList(mine.reload) }
```

**교훈** `async` 함수를 **`await` 없이 부르는 모든 곳**은 "여기서 실패하면 누가 처리하나?" 를 따져야 한다.
원칙: **오류는 한 번만, 책임질 수 있는 곳에서 처리한다.** 다시 던지려면 받을 곳이 있어야 한다.

**재발 방지** [diary.test.js](../frontend/src/stores/diary.test.js) — "목록 불러오기에 실패하면 오류를 던지지 않고 error 에 메시지를 담는다"

---

## 사례 8 — 긴 글을 저장하면 500

**증상** 아주 긴 내용을 붙여넣고 저장하면 "서버에서 문제가 발생했습니다". 짧은 글은 잘 된다.

**원인 찾기** 백엔드 터미널: `ER_DATA_TOO_LONG: Data too long for column 'content' at row 1`

**원인** `content` 컬럼은 `TEXT`(최대 65,535 **바이트**)인데 길이 검증이 없었다. 한글은 한 글자가 3바이트라 약 21,800자를 넘으면 DB 가 거절한다.
DB 오류는 "예상 못 한 오류" 로 분류되어 500 이 됐다. 하지만 이것은 **서버 잘못이 아니라 사용자의 입력 문제**다.

**수정** — [validate.js](../backend/src/utils/validate.js)

```js
export const LIMITS = {
  email: 191,     // users.email VARCHAR(191)
  password: 72,   // bcrypt 는 72바이트까지만 비교에 쓴다
  title: 60,
  content: 20000, // TEXT 65,535 바이트. 한글 3바이트 × 20,000 = 60,000 → 안전
  comment: 1000,
}
```

- 서버 검증에서 400 과 구체적인 문구("내용은 20,000자 이하여야 합니다.")로 알린다
- 화면 검증에도 같은 한도를 넣는다 ([validators.js](../frontend/src/utils/validators.js), 댓글 입력창의 `maxlength`)
- 그래도 놓친 경우를 위해 오류 처리기가 `ER_DATA_TOO_LONG` 을 400 으로 바꾼다 ([error.js](../backend/src/middlewares/error.js))

**교훈** **DB 컬럼의 한계는 곧 입력 검증의 규칙이다.** 테이블을 만들 때 정한 크기를 검증 코드에 반드시 옮겨 적는다.
그리고 **500 은 "내 잘못", 400 은 "당신의 요청이 잘못됨"** 이다. 사용자가 고칠 수 있는 문제는 400 과 고치는 방법으로 알려야 한다.

**재발 방지** 통합 테스트 "너무 긴 값은 500 이 아니라 400" — 한도 +1 글자는 400, 한도까지는 실제 MySQL 에 저장되는지 확인한다.

---

## 사례 9 — 이메일을 붙여넣으면 "형식이 올바르지 않습니다"

**증상** 메모장에서 이메일을 복사해 붙이고 로그인하면 형식 오류. 직접 타이핑하면 된다.

**원인 찾기** 붙여넣은 값을 콘솔에 찍어 본다. `console.log(JSON.stringify(form.email))` → `"demo@diary.test "` — **끝에 공백**이 있다.
(`JSON.stringify` 로 찍으면 따옴표가 붙어서 앞뒤 공백이 눈에 보인다. 디버깅에 유용한 요령이다.)

**원인** 검증 정규식은 공백을 허용하지 않는다. 서버는 `trim()` 으로 공백을 지우고 검사했지만 화면 검증은 지우지 않아서, **화면이 서버보다 엄격했다.**

**수정**

```js
export function validateEmail(value) {
  const email = String(value || '').trim()     // ← 추가
  if (!email) return '이메일을 입력해 주세요.'
  if (!EMAIL_PATTERN.test(email)) return '이메일 형식이 올바르지 않습니다.'
  return ''
}
```

**교훈** 사용자 입력은 **검사하기 전에 정리한다**(앞뒤 공백, 대소문자). 그리고 화면 검증과 서버 검증은 **같은 규칙**이어야 한다. 한쪽만 엄격하면 "왜 안 되지?" 가 생긴다.

**재발 방지** [validators.test.js](../frontend/src/utils/validators.test.js) — "이메일 앞뒤 공백은 오류로 보지 않는다"

---

## 사례 10 — 답글의 답글이 화면에서 사라진다

**증상** 화면에서는 일어나지 않는다. API 를 직접 호출해서 "답글에 답글" 을 달면, 저장은 되고 댓글 수도 늘지만 **화면에 그 댓글이 없다.**

**원인 찾기** 화면이 댓글 트리를 만드는 코드를 읽는다.

```js
// stores/comment.js
const tree = computed(() => {
  const roots = items.value.filter((comment) => !comment.parentId)          // 부모가 없는 댓글
  return roots.map((root) => ({
    ...root,
    replies: items.value.filter((comment) => comment.parentId === root.id), // 그 댓글의 답글
  }))
})
```

화면은 **2단계**(댓글 → 답글)만 그린다. 답글의 답글은 `parentId` 가 "답글의 id" 라서 어느 `root` 에도 붙지 않는다.

**원인** 화면은 "답글" 버튼을 최상위 댓글에만 보여 주어 3단계가 생기지 않게 막았지만, **서버는 막지 않았다.**
화면의 제한은 편의일 뿐이고, 규칙은 서버가 지켜야 한다.

**수정** 서버가 3단계를 2단계로 접는다. — [comment.service.js](../backend/src/modules/comments/comment.service.js)

```js
const parent = await queryOne('SELECT id, parent_id FROM comments WHERE id = ? AND diary_id = ?', [parentId, diaryId])
if (!parent) throw ApiError.notFound('원본 댓글을 찾을 수 없습니다.')

// 대댓글에 다시 답글을 달면 같은 단계로 묶는다.
if (parent.parent_id) parentId = parent.parent_id
```

**교훈** **화면에서 못 하게 막은 것은 서버에서도 막는다.** 화면은 개발자 도구로 얼마든지 우회된다.
"화면이 그릴 수 있는 데이터 모양" 과 "서버가 저장을 허락하는 데이터 모양" 은 같아야 한다.

**재발 방지** 통합 테스트 — "대댓글에 단 답글은 같은 단계로 묶인다"

---

## 사례 11 — 검색어를 빨리 바꾸면 엉뚱한 결과가 보인다

**증상** 검색어를 `a` → `ab` 로 빠르게 바꾸면, 가끔 `ab` 를 검색했는데 `a` 의 결과가 화면에 남는다. 다시 해 보면 안 그럴 때가 많다.

**원인 찾기** "가끔" 일어나는 버그는 대부분 **순서** 문제다. 요청 두 개의 시간을 그려 본다.

```
요청 a   ──────────────────────────────►  (느림) 응답 a 도착 → 화면 = a 결과   ← 마지막에 덮어씀!
요청 ab     ─────────►  응답 ab 도착 → 화면 = ab 결과
```

**원인** 나중에 보낸 요청이 먼저 도착하면, 늦게 도착한 **옛 요청의 응답**이 화면을 덮어쓴다. (경쟁 상태, race condition)

**수정** 요청마다 번호표를 붙이고, 가장 최신 번호의 응답만 반영한다. — [usePagedList.js](../frontend/src/composables/usePagedList.js)

```js
let version = 0

async function reload() {
  version += 1
  const requestVersion = version
  const page = await loadPage(null)
  if (requestVersion !== version) return items.value   // 그사이 새 요청이 있었다 → 이 응답은 버린다
  items.value = page.items
}
```

**교훈** 비동기 응답을 화면에 넣기 전에 묻는다 — **"이 응답은 아직 유효한가?"** 요청을 보낸 뒤 세상이 바뀌었을 수 있다.

**재발 방지** [usePagedList.test.js](../frontend/src/composables/usePagedList.test.js) — 테스트에서 응답 도착 순서를 일부러 뒤집어서 확인한다. "가끔" 나는 버그도 테스트에서는 "항상" 재현할 수 있다.

---

## 사례 12 — 글을 쓰면 캘린더의 점이 사라진다

**증상** 캘린더로 10월을 보고 있다가 날짜가 8월인 글을 쓰면, 10월의 점들이 전부 사라진다. 달을 옮겼다 돌아오면 다시 나온다.

**원인 찾기** 글 저장 뒤의 코드: `diaryStore.fetchMonthlyCounts(diary.dateKey)` — **"방금 쓴 글의 달"** 을 불러온다.
`monthlyCounts` 는 한 달 치만 담는다 → 8월 데이터로 바뀌었는데 캘린더는 여전히 10월을 그리고 있다 → 10월 날짜에 해당하는 값이 없다 → 점이 없다.

**원인** "사용자는 캘린더에서 보고 있는 달에 글을 쓸 것" 이라는 **잘못된 가정.**

**수정** 스토어가 "캘린더가 지금 보고 있는 달" 을 기억하고, 그 달을 다시 센다. — [stores/diary.js](../frontend/src/stores/diary.js)

```js
const countsMonth = ref(todayKey())                 // 캘린더가 보고 있는 달

async function fetchMonthlyCounts(dateKey = countsMonth.value) {
  countsMonth.value = dateKey
  ...
}
function refreshMonthlyCounts() {                   // 글 작성 / 수정 / 삭제 뒤
  return fetchMonthlyCounts(countsMonth.value)
}
```

**교훈** 코드를 쓸 때 "보통은 이럴 것이다" 라는 생각이 들면 **그렇지 않은 경우**를 한 번 직접 해 본다. 버그는 가정이 깨지는 자리에 산다.

---

## 사례 13 — 카드의 좋아요를 누르면 상세로 이동한다

**증상** 예전 코드는 좋아요 버튼에 `@click.stop.prevent` 가 붙어 있었다. 이것을 빼면 좋아요를 누를 때 상세 화면으로 이동한다.

**원인** 카드 전체가 `<a>` 였고 그 안에 `<button>` 이 있었다. **링크 안에 버튼을 넣는 것은 잘못된 HTML** 이다.
`.stop.prevent` 는 원인을 고친 것이 아니라 증상을 막은 것이고, 키보드·스크린리더 사용자에게는 여전히 문제가 남는다.

**수정** 구조를 바꾼다. 카드는 `<article>`, 제목만 링크로 두고 CSS 로 클릭 영역을 넓힌다. ([05 5-2](05-vue.md) 사례 ①)

**교훈** `stopPropagation` / `preventDefault` 로 **억지로 막고 있다면 구조가 틀렸다는 신호**다.

**재발 방지** [DiaryCard.test.js](../frontend/src/components/diary/DiaryCard.test.js) — `a button` 이 존재하지 않는지 확인. (그리고 이 수정이 사례 4 를 만들었다. 수정에도 확인이 필요하다.)

---

## 사례 14 — 테스트에서 루트 태그가 `DIV` 로 나온다

**증상** 컴포넌트 테스트에서 `wrapper.element.tagName` 이 `ARTICLE` 이어야 하는데 `DIV` 가 나온다. 화면은 멀쩡해 보인다.

**원인** 템플릿 맨 위에 HTML 주석을 넣었다.

```vue
<template>
  <!-- 설명 주석 -->        ← 개발 모드에서는 주석도 노드 하나다
  <article class="card">
```

루트가 "주석 + article" 두 개가 되어(fragment), 부모가 넘긴 `class` 같은 속성이 `article` 에 붙지 않는다.
실제로 `<LikeButton class="card__like">` 같은 속성 전달이 조용히 깨질 수 있는 상태였다.

**수정** 주석을 루트 요소 **안**으로 옮긴다.

**교훈** Vue 컴포넌트의 **루트는 하나**로 유지한다. 주석도 예외가 아니다.

---

## 사례 15 — 숫자로 보낸 `parentId` 가 거절된다

**증상** 화면에서는 문제가 없다. 테스트에서 `{ parentId: 7 }` 을 보내니 400.

**원인** 검증 함수가 "문자열이 아니면 빈 값" 으로 취급했다. 화면은 항상 문자열을 보내서 아무도 몰랐다.

**교훈** JSON 에서 `7` 과 `"7"` 은 다른 값이다. 받는 쪽은 **어느 쪽이 와도 되게** 정리하거나, 하나만 받는다고 **문서에 적는다.** 테스트는 "내가 상상하지 못한 입력" 을 대신 넣어 준다.

---

## 사례 16 — Nginx 뒤에서 한 명이 틀리면 모두가 로그인 제한에 걸린다

**증상** 개발할 때는 괜찮은데, 배포하면 아무도 로그인을 못 하는 시간이 생긴다. 메시지는 "로그인 시도가 너무 많습니다."

**원인** 로그인 시도 제한은 IP 별로 센다. Nginx 뒤에서는 서버 입장에서 **모든 요청이 Nginx(127.0.0.1)에서 온 것**으로 보인다.
전 세계 사용자의 시도가 하나의 IP 로 합쳐져서 15분에 20번 한도를 순식간에 넘긴다.

**수정** 프록시가 알려 주는 실제 IP(`X-Forwarded-For`)를 믿도록 설정한다. — [app.js](../backend/src/app.js), `.env` 의 `TRUST_PROXY=1`

**교훈** **개발 환경과 배포 환경은 다르다.** 내 컴퓨터에서 되는 것은 "내 컴퓨터에서 된다" 는 뜻일 뿐이다. IP, 주소, HTTPS, 파일 경로, 시간대는 배포하면 달라지는 대표 항목이다.

**재발 방지** [app.test.js](../backend/test/app.test.js) — "TRUST_PROXY=1 이면 프록시가 알려 준 실제 IP 별로 따로 센다"

---

## 사례 17 — `npm ci` 가 `EPERM: operation not permitted, unlink ...` 로 실패

**원인** 실행 중인 개발 서버(사례 2 의 그 프로세스)가 `node_modules` 안의 파일을 열어 두고 있었다. Windows 는 **열려 있는 파일을 지울 수 없다.**

**수정** 개발 서버를 끄고 다시 실행한다.

**교훈** 서로 다른 오류 두 개(포트 사용 중, 파일 삭제 실패)의 원인이 **하나**였다. 이상한 일이 연달아 생기면 공통 원인을 의심한다.

---

## 사례 18 — PR 을 만들었는데 merge 할 수 없다 ("This branch has conflicts")

**증상** 작업을 끝내고 PR 을 열었더니 충돌 파일이 19개.

**원인 찾기**

```bash
git log --oneline HEAD..origin/main     # 내 브랜치에 없는 main 의 커밋 — 9개나 있다
git merge-base HEAD origin/main         # 두 브랜치가 갈라진 지점 — 아주 오래된 커밋
```

**원인** 오래된 브랜치에서 새 브랜치를 만들어 작업했다. 그사이 `main` 에는 같은 파일을 다르게 만든 커밋이 쌓여 있었다.

**수정** 최신 `main` 에서 새 브랜치를 만들고, 변경 사항을 `main` 의 코드에 맞춰 다시 적용했다.
(충돌을 기계적으로 "내 것" 으로 고르면 `main` 에서 추가된 기능이 사라진다.)

**교훈** 작업을 시작하기 전에 항상:

```bash
git switch main
git pull                      # 최신으로
git switch -c feat/작업이름    # 여기서 새 브랜치
```

자세한 흐름은 [00 시작하기 0-7](00-start.md) 의 "협업 흐름".

---

## 사례들에서 뽑은 열 가지 원칙

1. **오류 메시지를 끝까지 읽는다.** 사례 1, 2, 8, 17 은 메시지에 답이 그대로 있었다
2. **어느 층의 문제인지 먼저 정한다.** 화면 / 요청 / 서버 / DB (사례 1, 5)
3. **일찍, 구체적으로 실패한다.** (사례 1, 2)
4. **화면에서 막은 것은 서버에서도 막는다.** (사례 8, 10)
5. **`await` 없이 부르는 비동기에는 실패를 받을 곳이 있는지 확인한다.** (사례 7)
6. **비동기 응답은 "아직 유효한가" 를 확인하고 반영한다.** (사례 11)
7. **복사본이 있으면 갱신할 곳도 그만큼이다.** (사례 5)
8. **숨기는 것과 없애는 것을 구분한다.** (사례 3)
9. **증상을 막지 말고 원인을 고친다. 고친 뒤에는 주변을 다시 본다.** (사례 13 → 4)
10. **고친 버그에는 테스트를 남긴다.** 같은 버그를 두 번 고치지 않는다

## 연습

1. 사례 5 의 수정을 되돌리고(`update(useUserStore().diaries)` 줄 삭제) `npm test` 를 실행한다. 어떤 테스트가 어떤 메시지로 실패하는가?
2. 사례 7 의 수정을 되돌리고, 백엔드를 끈 채 목록 화면을 연다. 콘솔에 무엇이 찍히는가?
3. 사례 4 의 CSS 를 지우고 피드에서 닉네임을 눌러 본다. Elements 탭에서 "누가 클릭을 가로채는지" 찾는다
4. 내가 최근에 겪은 버그 하나를 위와 같은 형식(증상 / 원인 찾기 / 원인 / 수정 / 교훈)으로 학습 일지에 적는다
