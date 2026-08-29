/**
 * mock 저장소 - 브라우저 localStorage 를 DB 처럼 사용한다.
 * 백엔드가 준비되면 이 폴더는 통째로 삭제해도 된다.
 */
import { ApiError } from '../client'
import { toDateKey, todayKey } from '@/utils/date'

const STORAGE_KEY = 'diary.mock.db.v1'

/** 오늘(KST)로부터 days 만큼 이동한 날짜 키 */
function shiftDateKey(days) {
  const base = new Date(todayKey() + 'T00:00:00+09:00')
  base.setTime(base.getTime() + days * 24 * 60 * 60 * 1000)
  return toDateKey(base)
}

function shiftIso(days, hours = 9) {
  return new Date(shiftDateKey(days) + 'T' + String(hours).padStart(2, '0') + ':00:00+09:00').toISOString()
}

/** 첫 실행 시 넣어 두는 예시 데이터 */
function createSeed() {
  return {
    sequence: 100,
    users: [
      {
        id: 'u1',
        email: 'demo@diary.test',
        password: 'demo1234',
        nickname: '데모',
        createdAt: shiftIso(-30),
      },
      {
        id: 'u2',
        email: 'haru@diary.test',
        password: 'haru1234',
        nickname: '하루',
        createdAt: shiftIso(-20),
      },
    ],
    diaries: [
      {
        id: 'd1',
        authorId: 'u1',
        title: '오늘의 기록',
        content:
          '아침에 창문을 열었더니 바람이 선선했다.\n오랜만에 산책을 하며 머리를 비웠다. 별일 없는 하루가 제일 고마운 날이었다.',
        category: 'diary',
        mood: 'calm',
        dateKey: shiftDateKey(0),
        visibility: 'private',
        images: [],
        createdAt: shiftIso(0, 21),
        updatedAt: shiftIso(0, 21),
      },
      {
        id: 'd2',
        authorId: 'u1',
        title: '「미드나잇 라이브러리」를 읽고',
        content:
          '후회하는 삶과 선택하지 않은 삶에 대한 이야기.\n\n인상 깊은 문장: "가능성은 사라지지 않는다, 다만 형태를 바꿀 뿐이다."\n다 읽고 나니 오늘의 선택을 조금 더 아껴야겠다는 생각이 들었다.',
        category: 'book',
        mood: 'happy',
        dateKey: shiftDateKey(-1),
        visibility: 'public',
        images: [],
        createdAt: shiftIso(-1, 22),
        updatedAt: shiftIso(-1, 22),
      },
      {
        id: 'd3',
        authorId: 'u1',
        title: '조금 지친 하루',
        content: '할 일이 많았고 마음이 바빴다. 그래도 저녁에 마신 따뜻한 차 한 잔이 위로가 되었다.',
        category: 'emotion',
        mood: 'tired',
        dateKey: shiftDateKey(-3),
        visibility: 'private',
        images: [],
        createdAt: shiftIso(-3, 23),
        updatedAt: shiftIso(-3, 23),
      },
      {
        id: 'd4',
        authorId: 'u2',
        title: '첫 등산 기록',
        content:
          '새벽 다섯 시에 일어나 산에 올랐다. 정상에서 본 일출은 사진으로 다 담기지 않았다.\n다음엔 더 높은 곳에 가보고 싶다.',
        category: 'diary',
        mood: 'excited',
        dateKey: shiftDateKey(-2),
        visibility: 'public',
        images: [],
        createdAt: shiftIso(-2, 8),
        updatedAt: shiftIso(-2, 8),
      },
    ],
    comments: [
      {
        id: 'c1',
        diaryId: 'd2',
        parentId: null,
        authorId: 'u2',
        content: '이 책 저도 읽었어요. 그 문장 정말 좋죠!',
        createdAt: shiftIso(-1, 23),
      },
      {
        id: 'c2',
        diaryId: 'd2',
        parentId: 'c1',
        authorId: 'u1',
        content: '그쵸, 다시 읽어도 좋더라고요 :)',
        createdAt: shiftIso(0, 9),
      },
    ],
    likes: [{ diaryId: 'd2', userId: 'u2' }],
    sessions: {},
  }
}

let cache = null

/** 저장소를 읽는다. 없으면 예시 데이터로 초기화한다. */
export function readDb() {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    cache = raw ? JSON.parse(raw) : createSeed()
  } catch {
    cache = createSeed()
  }
  if (!localStorage.getItem(STORAGE_KEY)) writeDb(cache)
  return cache
}

/** 저장소에 기록한다. */
export function writeDb(db) {
  cache = db
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    throw new ApiError('브라우저 저장 공간이 부족합니다. 이미지 수를 줄여 주세요.', 507)
  }
}

/** 저장소를 초기 상태로 되돌린다. (개발용) */
export function resetDb() {
  cache = null
  localStorage.removeItem(STORAGE_KEY)
  return readDb()
}

/** 중복되지 않는 id 를 만든다. */
export function nextId(prefix) {
  const db = readDb()
  db.sequence += 1
  return prefix + db.sequence
}
