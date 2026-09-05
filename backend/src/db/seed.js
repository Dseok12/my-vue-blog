/**
 * 화면을 바로 확인할 수 있도록 예시 데이터를 넣는다.
 *
 *   npm run db:seed            이미 회원이 있으면 아무것도 하지 않는다.
 *   npm run db:seed -- --force 예시 계정(데모 / 하루)을 지우고 다시 넣는다.
 *
 * 예시 계정
 *   demo@diary.test / demo1234  (데모)
 *   haru@diary.test / haru1234  (하루)
 */
import bcrypt from 'bcryptjs'

import { execute, pool, queryOne } from './pool.js'
import { kstMoment, shiftDateKey, todayKey } from '../utils/date.js'
import { newId } from '../utils/id.js'

const isForced = process.argv.includes('--force')
const SALT_ROUNDS = 10

const today = todayKey()

/** 오늘로부터 days 만큼 이동한 날짜 (KST) */
function day(days) {
  return shiftDateKey(today, days)
}

/** 오늘로부터 days 만큼 이동한 날짜의 hour 시 (KST) */
function moment(days, hour = 9) {
  return kstMoment(day(days), hour)
}

const demoUsers = [
  { key: 'demo', email: 'demo@diary.test', nickname: '데모', password: 'demo1234', joinedDaysAgo: 30 },
  { key: 'haru', email: 'haru@diary.test', nickname: '하루', password: 'haru1234', joinedDaysAgo: 20 },
]

const demoDiaries = [
  {
    key: 'd1',
    owner: 'demo',
    title: '오늘의 기록',
    content:
      '아침에 창문을 열었더니 바람이 선선했다.\n오랜만에 산책을 하며 머리를 비웠다. 별일 없는 하루가 제일 고마운 날이었다.',
    category: 'diary',
    mood: 'calm',
    days: 0,
    hour: 21,
    visibility: 'private',
  },
  {
    key: 'd2',
    owner: 'demo',
    title: '「미드나잇 라이브러리」를 읽고',
    content:
      '후회하는 삶과 선택하지 않은 삶에 대한 이야기.\n\n인상 깊은 문장: "가능성은 사라지지 않는다, 다만 형태를 바꿀 뿐이다."\n다 읽고 나니 오늘의 선택을 조금 더 아껴야겠다는 생각이 들었다.',
    category: 'book',
    mood: 'happy',
    days: -1,
    hour: 22,
    visibility: 'public',
  },
  {
    key: 'd3',
    owner: 'demo',
    title: '조금 지친 하루',
    content: '할 일이 많았고 마음이 바빴다. 그래도 저녁에 마신 따뜻한 차 한 잔이 위로가 되었다.',
    category: 'emotion',
    mood: 'tired',
    days: -3,
    hour: 23,
    visibility: 'private',
  },
  {
    key: 'd4',
    owner: 'haru',
    title: '첫 등산 기록',
    content:
      '새벽 다섯 시에 일어나 산에 올랐다. 정상에서 본 일출은 사진으로 다 담기지 않았다.\n다음엔 더 높은 곳에 가보고 싶다.',
    category: 'diary',
    mood: 'excited',
    days: -2,
    hour: 8,
    visibility: 'public',
  },
]

const demoComments = [
  {
    key: 'c1',
    diary: 'd2',
    owner: 'haru',
    parent: null,
    content: '이 책 저도 읽었어요. 그 문장 정말 좋죠!',
    days: -1,
    hour: 23,
  },
  {
    key: 'c2',
    diary: 'd2',
    owner: 'demo',
    parent: 'c1',
    content: '그쵸, 다시 읽어도 좋더라고요 :)',
    days: 0,
    hour: 9,
  },
]

const demoLikes = [{ diary: 'd2', owner: 'haru', days: -1, hour: 23 }]

async function removeDemoAccounts() {
  // 회원을 지우면 글 / 댓글 / 좋아요도 외래키 설정에 따라 함께 지워진다.
  for (const user of demoUsers) {
    await execute('DELETE FROM users WHERE email = ?', [user.email])
  }
}

async function main() {
  const existing = await queryOne('SELECT COUNT(*) AS count FROM users')

  if (Number(existing.count) > 0) {
    if (!isForced) {
      console.log('[seed] 이미 회원 데이터가 있어 건너뜁니다. 다시 넣으려면 --force 를 붙여 주세요.')
      return
    }
    console.log('[seed] --force : 예시 계정(데모 / 하루)을 지우고 다시 넣습니다.')
    await removeDemoAccounts()
  }

  const userIds = {}
  for (const user of demoUsers) {
    userIds[user.key] = newId()
    await execute(
      'INSERT INTO users (id, email, nickname, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
      [
        userIds[user.key],
        user.email,
        user.nickname,
        await bcrypt.hash(user.password, SALT_ROUNDS),
        moment(-user.joinedDaysAgo),
      ],
    )
  }

  const diaryIds = {}
  for (const diary of demoDiaries) {
    diaryIds[diary.key] = newId()
    const writtenAt = moment(diary.days, diary.hour)
    await execute(
      'INSERT INTO diaries' +
        ' (id, author_id, title, content, category, mood, date_key, visibility, created_at, updated_at)' +
        ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        diaryIds[diary.key],
        userIds[diary.owner],
        diary.title,
        diary.content,
        diary.category,
        diary.mood,
        day(diary.days),
        diary.visibility,
        writtenAt,
        writtenAt,
      ],
    )
  }

  const commentIds = {}
  for (const comment of demoComments) {
    commentIds[comment.key] = newId()
    await execute(
      'INSERT INTO comments (id, diary_id, parent_id, author_id, content, created_at)' +
        ' VALUES (?, ?, ?, ?, ?, ?)',
      [
        commentIds[comment.key],
        diaryIds[comment.diary],
        comment.parent ? commentIds[comment.parent] : null,
        userIds[comment.owner],
        comment.content,
        moment(comment.days, comment.hour),
      ],
    )
  }

  for (const like of demoLikes) {
    await execute('INSERT INTO diary_likes (diary_id, user_id, created_at) VALUES (?, ?, ?)', [
      diaryIds[like.diary],
      userIds[like.owner],
      moment(like.days, like.hour),
    ])
  }

  console.log('[seed] 예시 데이터를 넣었습니다.')
  console.log('       회원 ' + demoUsers.length + '명 / 글 ' + demoDiaries.length + '건 / 댓글 ' + demoComments.length + '건')
  console.log('       로그인: demo@diary.test / demo1234, haru@diary.test / haru1234')
}

main()
  .catch((error) => {
    console.error('[seed] 실패:', error.message)
    process.exitCode = 1
  })
  .finally(() => pool.end())
