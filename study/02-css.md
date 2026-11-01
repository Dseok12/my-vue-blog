# Stage 2 — CSS: 화면의 모양

> 전체 로드맵: [README](README.md) · 이전: [01 HTML](01-html.md) · 다음: [03 JavaScript 기초](03-javascript.md)

## 목표

- 선택자로 원하는 요소를 골라 꾸민다
- 박스 모델(margin, border, padding)을 이해한다
- flex 와 grid 로 원하는 배치를 만든다
- 휴대폰과 PC 에서 모두 보기 좋은 반응형 화면을 만든다
- 이 프로젝트의 CSS 규칙(디자인 토큰, BEM, 파일 분리)을 이해하고 따른다

---

## 2-1. CSS 연결하기와 기본 문법

```html
<!-- index.html 의 <head> 안 -->
<link rel="stylesheet" href="style.css" />
```

```css
/* style.css */
선택자 {
  속성: 값;
  속성: 값;
}

h1 {
  color: #3f6f5f;      /* 글자 색 */
  font-size: 28px;     /* 글자 크기 */
}
```

> CSS 를 HTML 에 직접 쓰는 방법(`style="..."`)도 있지만 **쓰지 않는다.**
> 이 프로젝트 규칙도 "CSS 는 `src/css/` 아래 별도 파일" 이다. 모양과 구조를 분리해야 고치기 쉽다.

---

## 2-2. 선택자 — 누구를 꾸밀까

```css
p { }                    /* 태그: 모든 <p> */
.card { }                /* 클래스: class="card" 인 모든 요소 — 가장 많이 쓴다 */
#app { }                 /* 아이디: id="app" 하나 — CSS 에서는 거의 안 쓴다 */

.card .title { }         /* 자손: .card 안 어딘가의 .title */
.card > .title { }       /* 자식: .card 바로 아래의 .title */
.btn.btn--primary { }    /* 둘 다 가진 요소 */
h1, h2 { }               /* 여러 개 한 번에 */

.btn:hover { }           /* 마우스를 올렸을 때 */
.btn:focus-visible { }   /* 키보드로 포커스됐을 때 */
.btn:disabled { }        /* 비활성 상태 */
.item:first-child { }    /* 첫 번째 */
.item:nth-child(2n) { }  /* 짝수 번째 */
.card:has(img) { }       /* img 를 가진 .card */
```

### 충돌하면 누가 이기나 (우선순위)

```
1. !important        (쓰지 않는다 — 나중에 아무도 못 이긴다)
2. style="..."       (쓰지 않는다)
3. #아이디            100점
4. .클래스, :hover    10점
5. 태그               1점
점수가 같으면 → 나중에 쓴 것이 이긴다
```

**그래서 이 프로젝트는 클래스 하나로만 꾸민다.** 점수가 모두 10점이라 예측하기 쉽다.

---

## 2-3. 박스 모델 — 모든 요소는 상자다

```
┌──────────────── margin (바깥 여백, 다른 상자와의 거리) ─────────────┐
│  ┌───────────── border (테두리) ──────────────────────────────┐  │
│  │  ┌────────── padding (안쪽 여백, 테두리와 내용 사이) ───────┐  │  │
│  │  │                                                     │  │  │
│  │  │                content (내용: 글자, 이미지)            │  │  │
│  │  │                                                     │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

```css
.card {
  width: 300px;
  padding: 20px;                 /* 네 방향 모두 */
  padding: 12px 20px;            /* 위아래 12, 좌우 20 */
  border: 1px solid #e4e1db;     /* 두께 모양 색 */
  border-radius: 16px;           /* 모서리 둥글게 */
  margin: 0 auto;                /* 위아래 0, 좌우 자동 → 가운데 정렬 */
}
```

> **반드시 넣는 한 줄** — 기본값으로는 `width: 300px` 에 padding, border 가 **더해져서** 342px 이 된다.
> ```css
> *, *::before, *::after { box-sizing: border-box; }   /* width 안에 padding, border 포함 */
> ```
> 이 프로젝트의 [reset.css](../frontend/src/css/base/reset.css) 맨 위에 있다.

**개발자 도구로 확인**: `F12` → Elements → 요소 선택 → 오른쪽 Styles 아래의 박스 그림.
"왜 여기 공간이 있지?" 의 답이 항상 여기 있다.

---

## 2-4. 단위, 색, 글꼴

```css
/* 크기 단위 */
px      /* 고정 픽셀 — 테두리, 작은 간격 */
%       /* 부모 대비 비율 — width: 100% */
rem     /* 기본 글꼴 크기(보통 16px)의 배수 — 사용자가 글꼴을 키우면 같이 커진다 */
vh, vw  /* 화면 높이/너비의 1% — height: 100vh = 화면 꽉 차게 */

/* 색 */
color: #23211e;                  /* 16진수 (가장 흔함) */
color: rgb(35, 33, 30);
background-color: rgba(28, 26, 23, 0.45);   /* 마지막 값 = 투명도 (모달 배경) */

/* 글꼴 */
font-family: 'Pretendard', system-ui, sans-serif;   /* 앞에서부터 있는 글꼴을 쓴다 */
font-size: 15px;
font-weight: 700;          /* 400 보통, 700 굵게 */
line-height: 1.6;          /* 줄 간격 — 한글은 1.5~1.7 이 읽기 좋다 */
text-align: center;
```

**색 대비** — 본문 글자와 배경의 대비는 4.5:1 이상이어야 읽힌다.
개발자 도구에서 색상 견본을 누르면 대비 비율이 나온다.

---

## 2-5. display — 상자가 줄을 서는 방식

```css
display: block;         /* 한 줄을 통째로 차지 (div, p, h1, section) */
display: inline;        /* 글자처럼 옆으로 흐름, width/height 무시 (span, a, strong) */
display: inline-block;  /* 옆으로 흐르지만 크기 지정 가능 */
display: none;          /* 사라짐 (공간도 차지 안 함) */
display: flex;          /* 자식들을 한 방향으로 배치 ← 가장 많이 씀 */
display: grid;          /* 자식들을 격자로 배치 */
```

---

## 2-6. Flexbox — 한 줄로 늘어놓기

부모에게 `display: flex` 를 주면 **자식들**이 가로로 늘어선다.

```css
.header__inner {
  display: flex;
  align-items: center;             /* 세로(교차축) 가운데 정렬 */
  justify-content: space-between;  /* 가로(주축) 양 끝으로 벌리기 */
  gap: 16px;                       /* 자식 사이 간격 */
}
```

```
justify-content (가로 방향)
flex-start     [A][B][C]                 
center                 [A][B][C]
flex-end                         [A][B][C]
space-between  [A]       [B]       [C]

align-items (세로 방향)
flex-start  위로 붙음   center  가운데   stretch  꽉 채움(기본값)
```

```css
.list { display: flex; flex-direction: column; gap: 12px; }  /* 세로로 쌓기 */
.chips { display: flex; flex-wrap: wrap; gap: 8px; }          /* 넘치면 다음 줄로 */
.spacer { flex: 1 1 auto; }   /* 남는 공간을 다 차지 → 뒤 요소를 오른쪽 끝으로 민다 */
```

이 프로젝트의 카드 하단(`💬 3   ♡ 5   ··········   3분 전`) 이 정확히 이 `spacer` 기법이다.
[DiaryCard.css](../frontend/src/css/components/DiaryCard.css) 의 `.card__spacer` 를 찾아보자.

**연습 게임**: <https://flexboxfroggy.com/#ko> — 개구리를 연잎으로 옮기며 flex 를 익힌다. 24단계 전부 깬다.

---

## 2-7. Grid — 격자로 배치하기

```css
.calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);   /* 같은 너비의 칸 7개 (일~토) */
  gap: 4px;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));  /* 화면 폭에 맞춰 칸 수가 자동 */
  gap: 12px;
}
```

**flex vs grid**: 한 방향(가로 줄, 세로 목록)이면 flex, 가로세로 둘 다(달력, 갤러리)면 grid.

**연습 게임**: <https://cssgridgarden.com/#ko>

---

## 2-8. position — 겹쳐 놓기

```css
position: static;    /* 기본값 */
position: relative;  /* 원래 자리 기준. 자식 absolute 의 "기준점" 역할을 주로 한다 */
position: absolute;  /* 가장 가까운 relative 조상 기준으로 띄운다 */
position: fixed;     /* 화면 기준으로 고정 (스크롤해도 그 자리 — 모달, 토스트) */
position: sticky;    /* 스크롤하다 닿으면 붙는다 (헤더) */
```

```css
/* 이미지 오른쪽 위에 삭제 버튼 붙이기 */
.uploader__item { position: relative; }
.uploader__remove { position: absolute; top: 4px; right: 4px; }

/* 화면 전체를 덮는 모달 배경 */
.modal { position: fixed; inset: 0; z-index: 50; }   /* inset: 0 = top/right/bottom/left 모두 0 */
```

`z-index` 는 겹쳤을 때 누가 위에 오는지다. 숫자가 클수록 위. 이 프로젝트는
[variables.css](../frontend/src/css/base/variables.css) 에 `--z-sidebar: 20`, `--z-modal: 50`, `--z-toast: 60` 으로 **한 곳에서** 정해 둔다.

---

## 2-9. 반응형 — 휴대폰에서도 보이게

**미디어 쿼리**: 화면 폭이 조건에 맞을 때만 적용되는 CSS.

```css
/* 모바일 퍼스트: 기본은 휴대폰, 넓어지면 덧붙인다 (새 프로젝트라면 이 방식을 권장) */
.list__items {
  display: grid;
  grid-template-columns: 1fr;          /* 휴대폰: 한 줄에 하나 */
  gap: 12px;
}

@media (min-width: 768px) {            /* 768px 이상 (태블릿, PC) */
  .list__items {
    grid-template-columns: 1fr 1fr;    /* 한 줄에 둘 */
  }
}
```

```css
/* 데스크톱 퍼스트: 기본은 PC, 좁아지면 줄인다 (이 프로젝트 방식) */
.card { padding: 20px; }

@media (max-width: 600px) {
  .card { padding: 16px; }
}
```

**반응형 체크 3가지**

1. `<meta name="viewport" ...>` 가 있는가
2. 375px(작은 휴대폰)에서 **가로 스크롤이 생기지 않는가** — 가장 흔한 문제는 고정 `width`
3. 손가락으로 누를 버튼이 너무 작지 않은가 (최소 44×44px 권장)

```css
img { max-width: 100%; height: auto; }   /* 이미지가 화면 밖으로 넘치지 않게 */
```

---

## 2-10. CSS 변수 — 디자인 토큰

같은 색을 50군데에 쓰면, 색을 바꿀 때 50군데를 고쳐야 한다. **변수**로 한 곳에 둔다.

```css
:root {                               /* 문서 전체에서 쓸 수 있는 변수 */
  --color-primary: #3f6f5f;
  --space-4: 16px;
  --radius-md: 10px;
}

.btn--primary {
  background-color: var(--color-primary);   /* 변수 쓰기 */
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
}
```

이 프로젝트의 모든 색·간격·글꼴은 [variables.css](../frontend/src/css/base/variables.css) 에 있다.
**규칙: CSS 안에 색 코드나 간격 숫자를 직접 쓰지 않는다.** 포인트 색을 바꾸고 싶으면 이 파일 한 줄만 고친다.

> **해 보기**: 이 프로젝트를 실행하고 `--color-primary` 를 `#3b5bdb` 로 바꿔 저장해 보자. 앱 전체가 파랗게 바뀐다.

---

## 2-11. BEM — 이름 짓는 규칙

CSS 는 전역이다. `.title` 이라는 이름은 언젠가 반드시 다른 곳의 `.title` 과 부딪힌다.
**BEM** 은 이름에 소속을 적어서 충돌을 막는다.

```
블록           .card               독립적인 덩어리 (컴포넌트 하나)
블록__요소      .card__title        블록 안의 부품
블록--변형      .card--wide         블록의 다른 모습
요소--변형      .card__tag--public  부품의 다른 모습
```

```html
<article class="card">
  <h3 class="card__title">오늘의 기록</h3>
  <span class="card__tag card__tag--public">공개</span>
</article>
```

이 프로젝트 규칙: **4단어 이하**, **CSS 파일 이름 = 컴포넌트 이름** (`DiaryCard.vue` ↔ `DiaryCard.css`).

---

## 2-12. 전환 효과

```css
.card {
  transition: box-shadow 0.15s ease, transform 0.15s ease;   /* 무엇을, 얼마 동안, 어떻게 */
}
.card:hover {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);    /* 살짝 떠오르기 */
}

/* 움직임을 불편해하는 사용자 배려 */
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; }
}
```

---

## 2-13. 실습 — 01 에서 만든 화면 꾸미기

### 실습 ① 파일 구조부터 이 프로젝트처럼

```
my-diary-static/
├─ login.html
├─ list.html
└─ css/
   ├─ base/
   │  ├─ variables.css   ← 이 프로젝트의 variables.css 를 그대로 복사해 온다
   │  └─ reset.css       ← 이 프로젝트의 reset.css 를 복사해 온다
   └─ components/
      ├─ AuthCard.css
      └─ DiaryCard.css
```

### 실습 ② 로그인 카드

- 화면 정가운데에 너비 최대 400px 카드 (`display: flex; align-items: center; justify-content: center; min-height: 100vh`)
- 입력창은 너비 100%, 라벨과 입력창 사이 간격 `--space-2`
- 버튼은 `--color-primary` 배경, 흰 글씨, 마우스를 올리면 `--color-primary-strong`
- 모든 값은 `var(--...)` 로만

### 실습 ③ 다이어리 목록

- 헤더: 로고 왼쪽, 메뉴 가운데, 글쓰기 버튼 오른쪽 (flex + `justify-content: space-between`)
- PC: 왼쪽 280px 사이드바 + 오른쪽 본문 / 1023px 이하: 사이드바 숨김
- 카드: 테두리, 둥근 모서리, hover 시 그림자, 하단 정보는 spacer 로 양 끝 정렬
- 600px 이하에서 카드 padding 을 줄인다
- 개발자 도구 휴대폰 모드 375px 에서 가로 스크롤이 없어야 한다

### 실습 ④ 비교

완성하면 이 프로젝트의 [DiaryCard.css](../frontend/src/css/components/DiaryCard.css),
[AppHeader.css](../frontend/src/css/layouts/AppHeader.css) 와 내 코드를 비교한다. 다른 점을 학습 일지에 적는다.

---

## 자주 하는 실수

| 실수 | 증상 | 해결 |
| --- | --- | --- |
| `;` 빠뜨림 | 그 아래 속성이 무시됨 | VS Code 가 빨간 밑줄을 보여 준다 |
| 클래스 이름 오타 (`.crad`) | 아무 변화 없음 | 개발자 도구에서 요소의 class 확인 |
| 자식에게 `display: flex` | 원하는 정렬이 안 됨 | flex 는 **부모**에게 준다 |
| `absolute` 인데 이상한 곳에 붙음 | 화면 구석으로 날아감 | 기준이 될 부모에 `position: relative` |
| 고정 `width: 500px` | 휴대폰에서 가로 스크롤 | `max-width: 500px; width: 100%` |
| `box-sizing` 없음 | 계산한 것보다 큼 | `border-box` |

## 체크리스트

- [ ] 클래스 선택자, 자손 선택자, `:hover` 를 쓸 수 있다
- [ ] margin / border / padding 의 차이를 그림으로 그릴 수 있다
- [ ] flex 로 "왼쪽 로고, 오른쪽 버튼" 을 만들 수 있다
- [ ] grid 로 7칸 달력 격자를 만들 수 있다
- [ ] `relative` + `absolute` 로 요소를 겹칠 수 있다
- [ ] 미디어 쿼리로 휴대폰에서 다른 배치를 만들 수 있다
- [ ] CSS 변수와 BEM 을 쓰는 이유를 설명할 수 있다
- [ ] Flexbox Froggy, Grid Garden 을 끝까지 깼다

다음: [03 JavaScript 기초 — 프로그래밍 그 자체](03-javascript.md)
