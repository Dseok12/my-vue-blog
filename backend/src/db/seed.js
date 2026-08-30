/**
 * 예시 데이터를 넣는다. (개발용)
 *
 *   npm run db:seed
 *
 * 로그인 계정
 *   demo@diary.test / demo1234
 *   haru@diary.test / haru1234
 */
const db = require('../config/db')
const { hashPassword } = require('../utils/password')
const { toDateKey, todayKey } = require('../utils/date')

/** 오늘(KST)에서 days 만큼 이동한 날짜 키 */
function shiftDateKey(days) {
  const base = new Date(todayKey() + 'T00:00:00+09:00')
  base.setTime(base.getTime() + days * 24 * 60 * 60 * 1000)
  return toDateKey(base)
}

/** 오늘에서 days 만큼 이동한 날의 hour 시 (KST) */
function shiftDate(days, hour = 9) {
  return new Date(shiftDateKey(days) + 'T' + String(hour).padStart(2, '0') + ':00:00+09:00')
}

const USERS = [
  { email: 'demo@diary.test', password: 'demo1234', nickname: '데모', createdAt: shiftDate(-30) },
  { email: 'haru@diary.test', password: 'haru1234', nickname: '하루', createdAt: shiftDate(-20) },
]

const DIARIES = [
  {
    author: 'demo@diary.test',
    title: '오늘의 기록',
    content:
      '아침에 창문을 열었더니 바람이 선선했다.\n오랜만에 산책을 하며 머리를 비웠다. 별일 없는 하루가 제일 고마운 날이었다.',
    category: 'diary',
    mood: 'calm',
    dateKey: shiftDateKey(0),
    visibility: 'private',
    createdAt: shiftDate(0, 21),
  },
  {
    author: 'demo@diary.test',
    title: '「미드나잇 라이브러리」를 읽고',
    content:
      '후회하는 삶과 선택하지 않은 삶에 대한 이야기.\n\n인상 깊은 문장: "가능성은 사라지지 않는다, 다만 형태를 바꿀 뿐이다."\n다 읽고 나니 오늘의 선택을 조금 더 아껴야겠다는 생각이 들었다.',
    category: 'book',
    mood: 'happy',
    dateKey: shiftDateKey(-1),
    visibility: 'public',
    createdAt: shiftDate(-1, 22),
  },
  {
    author: 'demo@diary.test',
    title: '조금 지친 하루',
    content: '할 일이 많았고 마음이 바빴다. 그래도 저녁에 마신 따뜻한 차 한 잔이 위로가 되었다.',
    category: 'emotion',
    mood: 'tired',
    dateKey: shiftDateKey(-3),
    visibility: 'private',
    createdAt: shiftDate(-3, 23),
  },
  {
    author: 'haru@diary.test',
    title: '첫 등산 기록',
    content:
      '새벽 다섯 시에 일어나 산에 올랐다. 정상에서 본 일출은 사진으로 다 담기지 않았다.\n다음엔 더 높은 곳에 가보고 싶다.',
    category: 'diary',
    mood: 'excited',
    dateKey: shiftDateKey(-2),
    visibility: 'public',
    createdAt: shiftDate(-2, 8),
  },
]

async function insertUsers() {
  const idByEmail = new Map()

  for (const user of USERS) {
    const passwordHash = await hashPassword(user.password)
    const result = await db.execute(
      `INSERT INTO users (email, password_hash, nickname, created_at)
       VALUES (?, ?, ?, ?)`,
      [user.email, passwordHash, user.nickname, user.createdAt],
    )
    idByEmail.set(user.email, result.insertId)
  }
  return idByEmail
}

async function insertDiaries(idByEmail) {
  const idByTitle = new Map()

  for (const diary of DIARIES) {
    const result = await db.execute(
      `INSERT INTO diaries
        (user_id, title, content, category, mood, date_key, visibility, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idByEmail.get(diary.author),
        diary.title,
        diary.content,
        diary.category,
        diary.mood,
        diary.dateKey,
        diary.visibility,
        diary.createdAt,
        diary.createdAt,
      ],
    )
    idByTitle.set(diary.title, result.insertId)
  }
  return idByTitle
}

async function insertCommentsAndLikes(idByEmail, idByTitle) {
  const bookDiaryId = idByTitle.get('「미드나잇 라이브러리」를 읽고')

  const parent = await db.execute(
    `INSERT INTO comments (diary_id, parent_id, user_id, content, created_at)
     VALUES (?, NULL, ?, ?, ?)`,
    [
      bookDiaryId,
      idByEmail.get('haru@diary.test'),
      '이 책 저도 읽었어요. 그 문장 정말 좋죠!',
      shiftDate(-1, 23),
    ],
  )

  await db.execute(
    `INSERT INTO comments (diary_id, parent_id, user_id, content, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [
      bookDiaryId,
      parent.insertId,
      idByEmail.get('demo@diary.test'),
      '그쵸, 다시 읽어도 좋더라고요 :)',
      shiftDate(0, 9),
    ],
  )

  await db.execute(
    'INSERT INTO diary_likes (diary_id, user_id, created_at) VALUES (?, ?, ?)',
    [bookDiaryId, idByEmail.get('haru@diary.test'), shiftDate(0, 10)],
  )
}

/** 예시 데이터를 넣기 전에 기존 데이터를 모두 지운다. */
async function clear() {
  await db.execute('SET FOREIGN_KEY_CHECKS = 0')
  for (const table of ['diary_likes', 'comments', 'diary_images', 'diaries', 'users']) {
    await db.execute('TRUNCATE TABLE ' + table)
  }
  await db.execute('SET FOREIGN_KEY_CHECKS = 1')
}

async function seed() {
  await clear()
  const idByEmail = await insertUsers()
  const idByTitle = await insertDiaries(idByEmail)
  await insertCommentsAndLikes(idByEmail, idByTitle)

  console.log('[DB] 예시 데이터를 넣었습니다.')
  console.log('     demo@diary.test / demo1234')
  console.log('     haru@diary.test / haru1234')
}

seed()
  .catch((error) => {
    console.error('[DB] 예시 데이터를 넣지 못했습니다.')
    console.error('      ' + error.message)
    process.exitCode = 1
  })
  .finally(() => db.pool.end())
