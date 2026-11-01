# Stage 1 — HTML: 화면의 뼈대

> 전체 로드맵: [README](README.md) · 이전: [00 시작하기](00-start.md) · 다음: [02 CSS](02-css.md)

## 목표

- 태그, 요소, 속성이 무엇인지 안다
- 의미에 맞는 태그(시맨틱 태그)를 고른다
- 로그인 폼과 글 목록을 HTML 만으로 짠다
- 이 프로젝트의 Vue 템플릿(`<template>`)을 읽을 수 있다 — Vue 템플릿의 90% 는 그냥 HTML 이다

---

## 1-1. 태그, 요소, 속성

```html
<a href="/feed" class="header__link">공개 다이어리</a>
│ └─┬─┘ └──┬──┘ └────────┬────────┘ └────┬─────┘ └┬┘
│  속성이름  속성값      속성(이름="값")     내용      닫는 태그
여는 태그
└──────────────────────── 요소(element) 전체 ────────────────────┘
```

- **태그**는 `<이름>` 으로 시작해서 `</이름>` 으로 닫는다.
- **속성**은 여는 태그 안에 `이름="값"` 으로 추가 정보를 준다.
- 내용이 없는 태그는 닫지 않는다: `<img />`, `<input />`, `<br />`, `<meta />`
- 태그 안에 태그를 넣을 수 있다(중첩). **연 순서의 반대로 닫는다.**

```html
<p>오늘은 <strong>정말</strong> 좋았다.</p>     ✓
<p>오늘은 <strong>정말</p></strong> 좋았다.     ✗ (엉켜 있다)
```

---

## 1-2. HTML 문서의 기본 구조

모든 HTML 파일의 출발점이다. VS Code 에서 빈 `.html` 파일에 `!` 를 치고 `Tab` 을 누르면 자동으로 나온다.

```html
<!doctype html>                       <!-- "이 문서는 최신 HTML 입니다" -->
<html lang="ko">                      <!-- 한국어 문서 (스크린리더가 한국어로 읽는다) -->
  <head>                              <!-- 화면에 안 보이는 정보 -->
    <meta charset="UTF-8" />          <!-- 한글이 깨지지 않게 -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />  <!-- 휴대폰에서 제대로 보이게 -->
    <title>나만의 다양한 diary</title>   <!-- 브라우저 탭 제목 -->
    <link rel="stylesheet" href="style.css" />   <!-- CSS 연결 (02 에서) -->
  </head>
  <body>                              <!-- 화면에 보이는 모든 것 -->
    <h1>내 다이어리</h1>
    <script src="app.js"></script>    <!-- JavaScript 연결 (04 에서) -->
  </body>
</html>
```

이 프로젝트의 [frontend/index.html](../frontend/index.html) 도 똑같이 생겼다.
다만 `<body>` 에 `<div id="app"></div>` 하나만 있다. **Vue 가 나머지를 그 안에 그려 넣는다.**

> `viewport` 메타 태그를 빼먹으면 휴대폰이 화면을 PC 크기로 그린 뒤 축소해서 글씨가 깨알만 해진다.
> 반응형 웹의 첫 번째 조건이다.

---

## 1-3. 글자를 다루는 태그

```html
<h1>가장 큰 제목 — 한 페이지에 하나</h1>
<h2>큰 구역의 제목</h2>
<h3>그 안의 작은 제목</h3>      <!-- h6 까지 있다. 크기가 아니라 "단계"로 고른다 -->

<p>문단. 엔터를 여러 번 쳐도 화면에서는 한 칸 띄어쓰기로 보인다.</p>
<p>줄을 바꾸려면<br />이렇게 한다.</p>

<strong>중요한 내용 (굵게)</strong>
<em>강조 (기울임)</em>
<span>의미 없이 일부만 감싸고 싶을 때 (CSS 를 입히려고)</span>

<!-- 주석: 화면에 안 보인다. 메모용. -->
```

> **제목 태그는 크기로 고르지 않는다.** "글씨를 크게" 는 CSS 의 일이다.
> `h1 → h2 → h3` 는 책의 "장 → 절 → 항" 처럼 **구조**를 나타낸다.
> 검색 엔진과 스크린리더가 이 구조로 페이지를 이해한다.

---

## 1-4. 링크와 이미지

```html
<!-- 링크 -->
<a href="https://vuejs.org">Vue 공식 사이트</a>
<a href="/feed">공개 다이어리</a>                       <!-- 같은 사이트의 다른 페이지 -->
<a href="https://vuejs.org" target="_blank" rel="noopener">새 탭에서 열기</a>

<!-- 이미지 — alt 는 필수다 -->
<img src="photo.jpg" alt="한강에서 찍은 노을" />
<img src="divider.png" alt="" />                       <!-- 장식용이면 alt 를 비운다 -->
<img src="big.jpg" alt="..." loading="lazy" />          <!-- 화면에 보일 때 불러온다 -->
```

`alt` 는 이미지를 못 보는 사람(시각장애인, 이미지 로딩 실패)에게 대신 읽어 주는 글이다.
이 프로젝트의 [DiaryCard.vue](../frontend/src/components/diary/DiaryCard.vue) 에서 `:alt="image.name"`, `loading="lazy"` 를 찾아보자.

---

## 1-5. 목록

```html
<ul>                         <!-- 순서 없는 목록 (unordered list) -->
  <li>일기</li>
  <li>독서기록</li>
  <li>감정기록</li>
</ul>

<ol>                         <!-- 순서 있는 목록 -->
  <li>로그인한다</li>
  <li>글을 쓴다</li>
</ol>
```

**메뉴, 카드 목록, 댓글 목록**처럼 "같은 종류가 여러 개" 면 `ul > li` 를 쓴다.
이 프로젝트의 글 목록도 `<ul class="list__items"><li>...</li></ul>` 이다.

---

## 1-6. 시맨틱 태그 — 의미를 가진 상자

`<div>` 는 의미 없는 상자다. 모든 걸 `div` 로 만들 수 있지만, **의미가 있는 상자를 쓰면**
검색 엔진, 스크린리더, 그리고 6개월 뒤의 내가 구조를 바로 이해한다.

```html
<header>  사이트 맨 위 (로고, 메뉴)           </header>
<nav>     이동 메뉴                         </nav>
<main>    이 페이지의 핵심 내용 (페이지당 하나) </main>
<aside>   곁가지 내용 (사이드바, 캘린더)        </aside>
<article> 그 자체로 완결된 글 (다이어리 한 편)   </article>
<section> 제목이 있는 구역 (댓글 구역)          </section>
<footer>  맨 아래 (저작권, 연락처)             </footer>
```

이 프로젝트의 화면 구조 그대로다.

```
┌──────────────── <header> (AppHeader.vue) ─────────────────┐
│  📔 로고    <nav> 내 다이어리 | 공개 다이어리 </nav>    글쓰기  │
├───────────────────┬───────────────────────────────────────┤
│ <aside>           │ <main>                                │
│ (AppSidebar.vue)  │   <article> 다이어리 카드 </article>     │
│   캘린더           │   <article> 다이어리 카드 </article>     │
│                   │   <section> 댓글 </section>            │
└───────────────────┴───────────────────────────────────────┘
```

---

## 1-7. 폼 — 사용자에게 입력받기

웹 앱의 핵심이다. 로그인, 회원가입, 글쓰기, 댓글이 모두 폼이다.

```html
<form action="/login" method="post">
  <label for="email">이메일</label>
  <input id="email" name="email" type="email" placeholder="you@example.com" required />

  <label for="password">비밀번호</label>
  <input id="password" name="password" type="password" minlength="8" required />

  <button type="submit">로그인</button>
</form>
```

**`label` 의 `for` 와 `input` 의 `id` 를 같게 하면 둘이 연결된다.**
라벨을 눌러도 입력창에 커서가 가고, 스크린리더가 "이메일, 입력창" 이라고 읽어 준다.
이 프로젝트의 [BaseInput.vue](../frontend/src/components/common/BaseInput.vue) 는 이 연결을 `useId()` 로 자동으로 한다.

### 자주 쓰는 입력 종류

```html
<input type="text" />                  <!-- 한 줄 글자 -->
<input type="email" />                 <!-- 이메일 (휴대폰에서 @ 키보드) -->
<input type="password" />              <!-- 가려진 글자 -->
<input type="number" min="0" />        <!-- 숫자 -->
<input type="date" />                  <!-- 날짜 선택기 (이 프로젝트의 글 날짜) -->
<input type="search" />                <!-- 검색창 -->
<input type="file" accept="image/*" multiple />   <!-- 파일 선택 (이미지 업로드) -->
<input type="checkbox" id="agree" /> <label for="agree">동의합니다</label>

<!-- 여럿 중 하나 고르기 — name 이 같으면 한 묶음 -->
<label><input type="radio" name="visibility" value="private" checked /> 비공개</label>
<label><input type="radio" name="visibility" value="public" /> 공개</label>

<textarea rows="10" placeholder="오늘의 기록"></textarea>   <!-- 여러 줄 -->

<select>
  <option value="diary">일기</option>
  <option value="book">독서기록</option>
</select>
```

### 버튼의 `type` — 초보가 가장 많이 겪는 버그

```html
<form>
  <button>저장</button>               <!-- type 을 안 쓰면 "submit" → 폼이 제출되고 페이지가 새로고침된다 -->
  <button type="button">취소</button>  <!-- 그냥 버튼. 폼을 제출하지 않는다 -->
  <button type="submit">저장</button>  <!-- 명시적으로 제출 -->
</form>
```

이 프로젝트의 [BaseButton.vue](../frontend/src/components/common/BaseButton.vue) 는 기본값이 `type="button"` 이다. 그래서 실수로 폼이 제출되지 않는다.

---

## 1-8. 접근성 — 모든 사람이 쓸 수 있게

시각장애인은 스크린리더로, 손이 불편한 사람은 키보드로만 웹을 쓴다. 기본 세 가지만 지켜도 대부분 해결된다.

1. **이미지에 `alt`**
2. **입력창에 `label`**
3. **클릭할 수 있는 것은 `<button>` 또는 `<a>`** — `<div onclick>` 은 키보드로 누를 수 없다

```html
<div onclick="save()">저장</div>      ✗ Tab 으로 갈 수 없고, 엔터로 누를 수 없다
<button type="button" onclick="save()">저장</button>   ✓

<button>✕</button>                    ✗ 스크린리더: "버튼" (무슨 버튼?)
<button aria-label="이미지 삭제">✕</button>   ✓ "이미지 삭제, 버튼"
```

**버튼 vs 링크**: 다른 주소로 **이동**하면 `<a>`, 그 자리에서 무언가를 **실행**하면 `<button>`.

> **링크 안에 버튼을 넣지 않는다.** `<a><button>좋아요</button></a>` 는 잘못된 HTML 이다.
> 이 프로젝트도 예전에 이 실수가 있었고 고쳤다. ([05 Vue 5-2](05-vue.md) 의 DiaryCard 사례)

---

## 1-9. 실습 — 다이어리 화면을 HTML 로만 짜기

CSS 없이 뼈대만 만든다. 못생겨도 된다. **구조가 맞는지**가 중요하다.

### 실습 ① `login.html`

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>로그인 · 나만의 다양한 diary</title>
  </head>
  <body>
    <main>
      <section>
        <p>📔 나만의 다양한 diary</p>
        <h1>로그인</h1>
        <p>오늘의 기록을 이어서 남겨 보세요.</p>

        <form>
          <label for="email">이메일</label>
          <input id="email" type="email" placeholder="you@example.com" autocomplete="email" required />

          <label for="password">비밀번호</label>
          <input id="password" type="password" placeholder="8자 이상" autocomplete="current-password" required />

          <button type="submit">로그인</button>
        </form>

        <p>아직 회원이 아니신가요? <a href="signup.html">회원가입</a></p>
      </section>
    </main>
  </body>
</html>
```

### 실습 ② `list.html` — 직접 만들기

아래 요구사항만 보고 직접 짠다.

- `<header>`: 로고 링크, `<nav>` 에 "내 다이어리", "공개 다이어리" 링크, "글쓰기" 버튼
- `<aside>`: "캘린더" 제목 (내용은 비워 둔다)
- `<main>`:
  - `<h1>내 다이어리</h1>`
  - 검색 폼 (검색창 + 검색 버튼)
  - 다이어리 카드 3개를 `ul > li > article` 로. 각 카드에 날짜, 종류, 제목(`h3` 안의 링크), 요약, 댓글 수
- `<footer>`: 저작권 문구

### 실습 ③ `write.html` — 직접 만들기

이 프로젝트의 글쓰기 화면(`/diaries/new`)을 보고 따라 짠다: 날짜(`date`), 종류(라디오 3개),
감정(라디오 6개), 제목, 내용(`textarea`), 이미지(`file`), 공개 여부(라디오 2개), 취소/저장 버튼.

> **검사 도구**: <https://validator.w3.org/#validate_by_input> 에 HTML 을 붙여 넣으면 문법 오류를 알려 준다.

---

## 자주 하는 실수

| 실수 | 증상 | 해결 |
| --- | --- | --- |
| 저장을 안 함 | 고쳤는데 그대로 | `Ctrl + S` 후 브라우저 새로고침 `F5` |
| 닫는 태그 누락 | 아래쪽 전체가 이상하게 굵거나 링크가 됨 | VS Code 는 태그를 누르면 짝을 강조해 준다 |
| `<meta charset>` 누락 | 한글이 깨짐 (`ë‚˜ë§Œ`) | `<head>` 맨 위에 넣는다 |
| 폼 안의 버튼에 `type` 없음 | 누르면 새로고침 | `type="button"` |
| `id` 중복 | 라벨이 엉뚱한 입력창과 연결 | `id` 는 페이지 안에서 하나뿐이어야 한다 |
| 제목 크기로 `h` 태그 선택 | 구조가 엉망 | 크기는 CSS 로 |

## 체크리스트

- [ ] 태그 / 요소 / 속성을 구분해서 설명할 수 있다
- [ ] `<head>` 에 들어가는 것과 `<body>` 에 들어가는 것을 안다
- [ ] `header`, `nav`, `main`, `aside`, `article`, `section` 을 알맞게 쓴다
- [ ] `label` 과 `input` 을 `for` / `id` 로 연결한다
- [ ] `button` 의 `type` 세 가지(`submit`, `button`, `reset`) 차이를 안다
- [ ] 이동은 `<a>`, 실행은 `<button>` 으로 고른다
- [ ] 실습 ①②③ 을 완성했다

다음: [02 CSS — 화면의 모양](02-css.md)
