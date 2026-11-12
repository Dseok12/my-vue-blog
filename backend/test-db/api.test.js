/**
 * 통합 테스트 - 실제 MySQL 로 API 전체 흐름을 확인한다.  `npm run test:db`
 *
 * - .env 의 DB 계정으로 "<DB_NAME>_test" 데이터베이스를 새로 만들어 쓰고, 끝나면 지운다.
 *   (개발용 데이터는 건드리지 않는다)
 * - MySQL 이 꺼져 있으면 실패한다. DB 없이 도는 테스트는 `npm test` (test/ 폴더).
 */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

import 'dotenv/config'

const TEST_DB = (process.env.DB_NAME || 'my_vue_blog') + '_test'
const ADMIN_EMAIL = 'admin@test.local'

process.env.NODE_ENV = 'test'
process.env.DB_NAME = TEST_DB
process.env.ADMIN_EMAILS = ADMIN_EMAIL
process.env.AUTH_RATE_MAX = '1000'
process.env.SMTP_HOST = '' // 신고 메일은 실제로 보내지 않는다

// 테스트용 데이터베이스를 처음부터 새로 만든다.
execFileSync(process.execPath, ['src/db/migrate.js', '--fresh'], {
  env: process.env,
  stdio: 'ignore',
})

const { createApp } = await import('../src/app.js')
const { pool } = await import('../src/db/pool.js')

let server
let baseUrl

/** JSON 요청을 보내고 { status, body } 를 돌려준다. */
async function api(method, path, { token, body } = {}) {
  const response = await fetch(baseUrl + path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: response.status, body: await response.json() }
}

async function signup(email, nickname) {
  const { status, body } = await api('POST', '/auth/signup', {
    body: { email, nickname, password: 'test1234' },
  })
  assert.equal(status, 201, JSON.stringify(body))
  return { token: body.token, id: body.user.id }
}

const diaryBody = (patch = {}) => ({
  title: '제목',
  content: '내용',
  category: 'diary',
  mood: 'calm',
  dateKey: '2026-08-30',
  visibility: 'private',
  images: [],
  ...patch,
})

// 테스트 전체가 함께 쓰는 회원
let alice
let bob
let admin

test.before(async () => {
  server = createApp().listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = 'http://127.0.0.1:' + server.address().port + '/api'

  alice = await signup('alice@test.local', '앨리스')
  bob = await signup('bob@test.local', '바비')
  admin = await signup(ADMIN_EMAIL, '관리자')
})

test.after(async () => {
  await new Promise((resolve) => server.close(resolve))
  await pool.query('DROP DATABASE IF EXISTS `' + TEST_DB + '`')
  await pool.end()
})

test('회원가입 - 중복 이메일 / 닉네임은 409, 응답에 비밀번호가 없다', async () => {
  const dupEmail = await api('POST', '/auth/signup', {
    body: { email: 'ALICE@test.local', nickname: '다른이름', password: 'test1234' },
  })
  assert.equal(dupEmail.status, 409)

  const dupNickname = await api('POST', '/auth/signup', {
    body: { email: 'new@test.local', nickname: '앨리스', password: 'test1234' },
  })
  assert.equal(dupNickname.status, 409)

  const me = await api('GET', '/auth/me', { token: alice.token })
  assert.equal(me.status, 200)
  assert.equal(me.body.user.nickname, '앨리스')
  assert.equal(JSON.stringify(me.body).includes('password'), false)
})

test('로그인 - 틀린 비밀번호와 없는 계정은 같은 401 메시지', async () => {
  const wrong = await api('POST', '/auth/login', {
    body: { email: 'alice@test.local', password: 'wrong-password' },
  })
  const nobody = await api('POST', '/auth/login', {
    body: { email: 'nobody@test.local', password: 'test1234' },
  })
  assert.equal(wrong.status, 401)
  assert.equal(nobody.status, 401)
  assert.equal(wrong.body.message, nobody.body.message)

  const ok = await api('POST', '/auth/login', {
    body: { email: 'alice@test.local', password: 'test1234' },
  })
  assert.equal(ok.status, 200)
  assert.equal(ok.body.user.isAdmin, false)
})

test('다이어리 - 작성 / 조회 / 수정 / 삭제와 권한', async () => {
  const created = await api('POST', '/diaries', { token: alice.token, body: diaryBody() })
  assert.equal(created.status, 201)
  const id = created.body.diary.id
  assert.equal(created.body.diary.dateKey, '2026-08-30')

  // 비공개 글은 작성자만
  assert.equal((await api('GET', '/diaries/' + id, { token: alice.token })).status, 200)
  assert.equal((await api('GET', '/diaries/' + id, { token: bob.token })).status, 403)

  // 남의 글은 수정 / 삭제할 수 없다
  const bobEdit = await api('PUT', '/diaries/' + id, { token: bob.token, body: diaryBody() })
  assert.equal(bobEdit.status, 403)
  assert.equal((await api('DELETE', '/diaries/' + id, { token: bob.token })).status, 403)

  const edited = await api('PUT', '/diaries/' + id, {
    token: alice.token,
    body: diaryBody({ title: '고친 제목', visibility: 'public' }),
  })
  assert.equal(edited.status, 200)
  assert.equal(edited.body.diary.title, '고친 제목')

  assert.equal((await api('DELETE', '/diaries/' + id, { token: alice.token })).status, 200)
  assert.equal((await api('GET', '/diaries/' + id, { token: alice.token })).status, 404)
})

test('다이어리 - 너무 긴 값은 500 이 아니라 400', async () => {
  const longContent = await api('POST', '/diaries', {
    token: alice.token,
    body: diaryBody({ content: '가'.repeat(20001) }),
  })
  assert.equal(longContent.status, 400)

  const longTitle = await api('POST', '/diaries', {
    token: alice.token,
    body: diaryBody({ title: '가'.repeat(61) }),
  })
  assert.equal(longTitle.status, 400)

  // 한도까지는 저장된다 (한글 20,000자 = 60,000바이트 < TEXT 65,535바이트)
  const maxContent = await api('POST', '/diaries', {
    token: alice.token,
    body: diaryBody({ content: '가'.repeat(20000) }),
  })
  assert.equal(maxContent.status, 201)
  await api('DELETE', '/diaries/' + maxContent.body.diary.id, { token: alice.token })
})

test('목록 - 같은 날짜 글이 여러 개여도 "더 보기" 에 중복과 누락이 없다', async () => {
  const carol = await signup('carol@test.local', '캐롤')
  const titles = []
  for (let i = 1; i <= 7; i += 1) {
    // 날짜는 두 가지만 써서 같은 날짜에 여러 글이 생기게 한다.
    const dateKey = i <= 4 ? '2026-08-30' : '2026-08-29'
    const title = '글 ' + i
    titles.push(title)
    await api('POST', '/diaries', { token: carol.token, body: diaryBody({ title, dateKey }) })
  }

  const seen = []
  let cursor = ''
  let pages = 0
  do {
    const query = '/diaries?limit=3' + (cursor ? '&cursor=' + encodeURIComponent(cursor) : '')
    const page = await api('GET', query, { token: carol.token })
    assert.equal(page.status, 200)
    assert.equal(page.body.total, 7)
    seen.push(...page.body.items.map((item) => item.title))
    cursor = page.body.nextCursor
    pages += 1
  } while (cursor)

  assert.equal(pages, 3) // 3 + 3 + 1
  assert.equal(seen.length, 7)
  assert.deepEqual([...seen].sort(), [...titles].sort())
  // 최신 날짜가 먼저, 같은 날짜 안에서는 나중에 쓴 글이 먼저
  assert.deepEqual(seen, ['글 4', '글 3', '글 2', '글 1', '글 7', '글 6', '글 5'])

  // 필터와 함께 쓸 때 total 은 필터 기준
  const filtered = await api('GET', '/diaries?dateKey=2026-08-29&limit=2', { token: carol.token })
  assert.equal(filtered.body.total, 3)
  assert.equal(filtered.body.items.length, 2)

  assert.equal((await api('GET', '/diaries?cursor=broken', { token: carol.token })).status, 400)
})

test('좋아요 / 댓글 - 공개 글에만, 닉네임은 가려서 보인다', async () => {
  const priv = await api('POST', '/diaries', { token: alice.token, body: diaryBody() })
  const pub = await api('POST', '/diaries', {
    token: alice.token,
    body: diaryBody({ title: '공개 글', visibility: 'public' }),
  })
  const privId = priv.body.diary.id
  const pubId = pub.body.diary.id

  assert.equal((await api('POST', '/diaries/' + privId + '/like', { token: alice.token })).status, 400)

  const liked = await api('POST', '/diaries/' + pubId + '/like', { token: bob.token })
  assert.deepEqual(liked.body, { liked: true, likeCount: 1 })
  const unliked = await api('POST', '/diaries/' + pubId + '/like', { token: bob.token })
  assert.deepEqual(unliked.body, { liked: false, likeCount: 0 })

  // 피드에서 남이 보면 작성자 닉네임은 첫 글자만
  const feed = await api('GET', '/diaries/feed', { token: bob.token })
  const inFeed = feed.body.items.find((item) => item.id === pubId)
  assert.equal(inFeed.author.nickname, '앨**')
  assert.equal(feed.body.items.some((item) => item.id === privId), false)

  // 댓글과 대댓글
  const denied = await api('POST', '/diaries/' + privId + '/comments', {
    token: alice.token,
    body: { content: '비공개 글 댓글' },
  })
  assert.equal(denied.status, 400)

  const root = await api('POST', '/diaries/' + pubId + '/comments', {
    token: bob.token,
    body: { content: '잘 읽었어요' },
  })
  assert.equal(root.status, 201)
  const reply = await api('POST', '/diaries/' + pubId + '/comments', {
    token: alice.token,
    body: { content: '고마워요', parentId: root.body.comment.id },
  })
  // 대댓글에 단 답글은 같은 단계로 묶인다 (3단계가 생기지 않는다)
  const nested = await api('POST', '/diaries/' + pubId + '/comments', {
    token: bob.token,
    body: { content: '답글의 답글', parentId: reply.body.comment.id },
  })
  assert.equal(nested.body.comment.parentId, root.body.comment.id)

  const tooLong = await api('POST', '/diaries/' + pubId + '/comments', {
    token: bob.token,
    body: { content: '가'.repeat(1001) },
  })
  assert.equal(tooLong.status, 400)

  // 남의 댓글은 지울 수 없고, 댓글을 지우면 대댓글도 함께 사라진다
  const rootPath = '/diaries/' + pubId + '/comments/' + root.body.comment.id
  assert.equal((await api('DELETE', rootPath, { token: alice.token })).status, 403)
  assert.equal((await api('DELETE', rootPath, { token: bob.token })).status, 200)
  const after = await api('GET', '/diaries/' + pubId + '/comments', { token: alice.token })
  assert.equal(after.body.items.length, 0)
})

test('신고 - 자동 가림, 관리자만 검토하고 해제할 수 있다', async () => {
  const pub = await api('POST', '/diaries', {
    token: alice.token,
    body: diaryBody({ title: '신고될 글', visibility: 'public' }),
  })
  const id = pub.body.diary.id
  const reportPath = '/diaries/' + id + '/reports'

  assert.equal((await api('POST', reportPath, { token: alice.token, body: { reason: 'scam' } })).status, 400)
  assert.equal((await api('POST', reportPath, { token: bob.token, body: { reason: 'nope' } })).status, 400)

  const reported = await api('POST', reportPath, {
    token: bob.token,
    body: { reason: 'scam', detail: '사기 같아요' },
  })
  assert.equal(reported.status, 201)
  assert.equal((await api('POST', reportPath, { token: bob.token, body: { reason: 'scam' } })).status, 409)

  // 가려진 글: 남은 못 보고, 작성자와 관리자는 본다. 피드에서도 빠진다.
  assert.equal((await api('GET', '/diaries/' + id, { token: bob.token })).status, 403)
  assert.equal((await api('GET', '/diaries/' + id, { token: alice.token })).body.diary.isHidden, true)
  assert.equal((await api('GET', '/diaries/' + id, { token: admin.token })).status, 200)
  const feed = await api('GET', '/diaries/feed', { token: bob.token })
  assert.equal(feed.body.items.some((item) => item.id === id), false)

  // 관리자 화면
  assert.equal((await api('GET', '/admin/reports', { token: bob.token })).status, 403)
  const reports = await api('GET', '/admin/reports?status=pending', { token: admin.token })
  const mine = reports.body.items.find((item) => item.diaryId === id)
  assert.equal(mine.reasonLabel, '사기')
  assert.equal(mine.reporterNickname, '바비')

  const unhidden = await api('POST', '/admin/diaries/' + id + '/unhide', { token: admin.token })
  assert.deepEqual(unhidden.body, { isHidden: false })
  assert.equal((await api('GET', '/diaries/' + id, { token: bob.token })).status, 200)
})

test('마이페이지 - 남에게는 공개 글만, 닉네임 / 비밀번호 변경', async () => {
  const dave = await signup('dave@test.local', '데이브')
  await api('POST', '/diaries', { token: dave.token, body: diaryBody({ title: '비공개' }) })
  await api('POST', '/diaries', {
    token: dave.token,
    body: diaryBody({ title: '공개', visibility: 'public' }),
  })

  const own = await api('GET', '/users/' + dave.id + '/diaries', { token: dave.token })
  assert.equal(own.body.items.length, 2)
  const other = await api('GET', '/users/' + dave.id + '/diaries', { token: bob.token })
  assert.deepEqual(other.body.items.map((item) => item.title), ['공개'])

  const profile = await api('GET', '/users/' + dave.id, { token: bob.token })
  assert.equal(profile.body.user.nickname, '데**')
  assert.equal(profile.body.user.diaryCount, 1)
  assert.equal(profile.body.isMe, false)

  // 닉네임: 이미 있는 이름은 409
  const taken = await api('PATCH', '/users/me', { token: dave.token, body: { nickname: '바비' } })
  assert.equal(taken.status, 409)
  const renamed = await api('PATCH', '/users/me', { token: dave.token, body: { nickname: '새이름' } })
  assert.equal(renamed.body.user.nickname, '새이름')

  // 비밀번호: 현재 비밀번호가 맞아야 하고, 바꾼 뒤에는 새 비밀번호로만 로그인된다
  const wrongCurrent = await api('PATCH', '/users/me', {
    token: dave.token,
    body: { currentPassword: 'wrong-one', newPassword: 'newpass123' },
  })
  assert.equal(wrongCurrent.status, 400)
  const changed = await api('PATCH', '/users/me', {
    token: dave.token,
    body: { currentPassword: 'test1234', newPassword: 'newpass123' },
  })
  assert.equal(changed.status, 200)

  const oldLogin = await api('POST', '/auth/login', {
    body: { email: 'dave@test.local', password: 'test1234' },
  })
  assert.equal(oldLogin.status, 401)
  const newLogin = await api('POST', '/auth/login', {
    body: { email: 'dave@test.local', password: 'newpass123' },
  })
  assert.equal(newLogin.status, 200)
})

test('캘린더 - 날짜별 개수는 내 글만 센다', async () => {
  const erin = await signup('erin@test.local', '에린')
  await api('POST', '/diaries', { token: erin.token, body: diaryBody({ dateKey: '2026-03-01' }) })
  await api('POST', '/diaries', { token: erin.token, body: diaryBody({ dateKey: '2026-03-01' }) })
  await api('POST', '/diaries', { token: erin.token, body: diaryBody({ dateKey: '2026-03-31' }) })

  const counts = await api('GET', '/diaries/monthly-counts?year=2026&month=3', { token: erin.token })
  assert.deepEqual(counts.body.counts, { '2026-03-01': 2, '2026-03-31': 1 })

  const others = await api('GET', '/diaries/monthly-counts?year=2026&month=3', { token: bob.token })
  assert.deepEqual(others.body.counts, {})

  const bad = await api('GET', '/diaries/monthly-counts?year=2026&month=13', { token: erin.token })
  assert.equal(bad.status, 400)
})
