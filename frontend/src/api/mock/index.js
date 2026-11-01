/**
 * mock API 구현 - api/server.js 와 동일한 인터페이스를 제공한다.
 * 백엔드가 준비되면 .env 의 VITE_USE_MOCK 을 false 로 바꾸면 된다.
 */
import { ApiError } from '../client'
import { nextId, readDb, writeDb } from './db'
import { STORAGE_KEYS } from '@/config'
import { toStorableDataUrl, validateImageFile } from '@/utils/image'
import { displayNickname } from '@/utils/user'

/** 관리자 이메일 (백엔드 ADMIN_EMAILS 와 같은 역할) */
const ADMIN_EMAILS = ['admin@diary.test', 'dnjstjr1031@gmail.com']

const REPORT_REASONS = [
  'obscene',
  'defamation',
  'political',
  'violent',
  'scam',
  'threat',
  'illegal',
  'etc',
]

const REPORT_REASON_LABELS = {
  obscene: '음란성',
  defamation: '비방',
  political: '정치적 게시물',
  violent: '잔인한 게시물',
  scam: '사기',
  threat: '협박',
  illegal: '불법거래',
  etc: '기타',
}

/** 실제 네트워크처럼 보이도록 약간의 지연을 준다. */
function delay(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isAdminUser(user) {
  return Boolean(user) && ADMIN_EMAILS.includes(String(user.email).toLowerCase())
}

function toPublicUser(user) {
  if (!user) return null
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    createdAt: user.createdAt,
    isAdmin: isAdminUser(user),
  }
}

/** 오래된 저장소에 새 항목이 없을 수 있으므로 채워 준다. */
function ensureShape(db) {
  if (!Array.isArray(db.reports)) db.reports = []
  return db
}

/** 토큰은 'mock.' + userId 형태로 단순하게 만든다. */
function createToken(userId) {
  return 'mock.' + userId
}

function currentUser(db) {
  const token = localStorage.getItem(STORAGE_KEYS.token)
  if (!token || !token.startsWith('mock.')) return null
  return db.users.find((user) => user.id === token.slice(5)) || null
}

function requireUser(db) {
  const user = currentUser(db)
  if (!user) throw new ApiError('로그인이 필요합니다.', 401)
  return user
}

function requireAdmin(db) {
  const user = requireUser(db)
  if (!isAdminUser(user)) throw new ApiError('관리자만 접근할 수 있습니다.', 403)
  return user
}

function findUser(db, userId) {
  return db.users.find((user) => user.id === userId) || null
}

function authorInfo(db, authorId, viewer, { masked = false } = {}) {
  const user = findUser(db, authorId)
  const raw = user ? user.nickname : '알 수 없음'
  const nickname = masked
    ? displayNickname(raw, {
        isSelf: viewer?.id === authorId,
        isAdmin: isAdminUser(viewer),
      })
    : raw
  return { id: authorId, nickname }
}

function serializeDiary(db, diary, viewer) {
  const likes = db.likes.filter((like) => like.diaryId === diary.id)
  return {
    id: diary.id,
    authorId: diary.authorId,
    author: authorInfo(db, diary.authorId, viewer, { masked: diary.visibility === 'public' }),
    title: diary.title,
    content: diary.content,
    category: diary.category,
    mood: diary.mood,
    dateKey: diary.dateKey,
    visibility: diary.visibility,
    isHidden: Boolean(diary.isHidden),
    images: diary.images || [],
    likeCount: likes.length,
    likedByMe: likes.some((like) => like.userId === viewer.id),
    commentCount: db.comments.filter((comment) => comment.diaryId === diary.id).length,
    createdAt: diary.createdAt,
    updatedAt: diary.updatedAt,
  }
}

function serializeComment(db, comment, viewer) {
  return {
    id: comment.id,
    diaryId: comment.diaryId,
    parentId: comment.parentId,
    author: authorInfo(db, comment.authorId, viewer, { masked: true }),
    authorId: comment.authorId,
    content: comment.content,
    createdAt: comment.createdAt,
  }
}

function matchKeyword(diary, keyword) {
  if (!keyword) return true
  const target = (diary.title + ' ' + diary.content).toLowerCase()
  return target.includes(String(keyword).toLowerCase())
}

function sortByDateDesc(a, b) {
  if (a.dateKey === b.dateKey) return b.createdAt.localeCompare(a.createdAt)
  return b.dateKey.localeCompare(a.dateKey)
}

/**
 * 정렬된 목록을 한 페이지로 자른다. 응답 형태는 실제 백엔드와 같다.
 * mock 에서는 "이번 페이지 마지막 글의 id" 를 커서로 쓴다.
 * (백엔드는 '날짜_작성시각_id' 를 쓰지만, 화면은 커서를 그대로 돌려줄 뿐이라 상관없다.)
 */
function paginate(list, { cursor, limit = 10 } = {}) {
  const start = cursor ? list.findIndex((item) => item.id === cursor) + 1 : 0
  const items = list.slice(start, start + limit)
  const hasMore = start + limit < list.length
  return {
    items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
    total: list.length,
  }
}

/** 가림 처리된 글을 볼 수 있는 사람인지 */
function canSeeHidden(diary, viewer) {
  return diary.authorId === viewer.id || isAdminUser(viewer)
}

/* -------------------------------------------------------------------------- */
/* auth                                                                       */
/* -------------------------------------------------------------------------- */
export const auth = {
  async signup({ email, nickname, password }) {
    await delay()
    const db = readDb()
    const normalizedEmail = String(email).trim().toLowerCase()

    if (db.users.some((user) => user.email === normalizedEmail)) {
      throw new ApiError('이미 가입된 이메일입니다.', 409)
    }
    if (db.users.some((user) => user.nickname === nickname.trim())) {
      throw new ApiError('이미 사용 중인 닉네임입니다.', 409)
    }

    const user = {
      id: nextId('u'),
      email: normalizedEmail,
      // mock 전용 저장이므로 평문으로 둔다. 실제 백엔드는 반드시 해시로 저장해야 한다.
      password,
      nickname: nickname.trim(),
      createdAt: new Date().toISOString(),
    }
    db.users.push(user)
    writeDb(db)
    return { user: toPublicUser(user), token: createToken(user.id) }
  },

  async login({ email, password }) {
    await delay()
    const db = readDb()
    const normalizedEmail = String(email).trim().toLowerCase()
    const user = db.users.find(
      (item) => item.email === normalizedEmail && item.password === password,
    )
    if (!user) throw new ApiError('이메일 또는 비밀번호가 올바르지 않습니다.', 401)
    return { user: toPublicUser(user), token: createToken(user.id) }
  },

  async me() {
    await delay(80)
    const db = readDb()
    const user = requireUser(db)
    return { user: toPublicUser(user) }
  },

  async logout() {
    await delay(60)
    return {}
  },
}

/* -------------------------------------------------------------------------- */
/* users - 마이페이지 / 프로필                                                 */
/* -------------------------------------------------------------------------- */
export const users = {
  async profile(id) {
    await delay(100)
    const db = readDb()
    const viewer = requireUser(db)
    const target = findUser(db, id)
    if (!target) throw new ApiError('회원을 찾을 수 없습니다.', 404)

    const isMe = target.id === viewer.id
    const seesAll = isMe || isAdminUser(viewer)
    const diaryCount = db.diaries.filter((diary) => {
      if (diary.authorId !== target.id) return false
      if (seesAll) return true
      return diary.visibility === 'public' && !diary.isHidden
    }).length

    return {
      user: {
        id: target.id,
        nickname: displayNickname(target.nickname, {
          isSelf: isMe,
          isAdmin: isAdminUser(viewer),
        }),
        joinedAt: target.createdAt,
        diaryCount,
      },
      isMe,
    }
  },

  async diaries(id, { category, keyword } = {}) {
    await delay()
    const db = readDb()
    const viewer = requireUser(db)
    const target = findUser(db, id)
    if (!target) throw new ApiError('회원을 찾을 수 없습니다.', 404)

    const isSelf = target.id === viewer.id
    const seesAll = isSelf || isAdminUser(viewer)

    const items = db.diaries
      .filter((diary) => diary.authorId === target.id)
      .filter((diary) => (seesAll ? true : diary.visibility === 'public' && !diary.isHidden))
      .filter((diary) => (category ? diary.category === category : true))
      .filter((diary) => matchKeyword(diary, keyword))
      .sort(sortByDateDesc)
      .map((diary) => serializeDiary(db, diary, viewer))

    return { items }
  },

  async updateMe({ nickname, currentPassword, newPassword } = {}) {
    await delay()
    const db = readDb()
    const user = requireUser(db)

    const wantsPassword = newPassword !== undefined || currentPassword !== undefined
    if (nickname === undefined && !wantsPassword) {
      throw new ApiError('변경할 내용이 없습니다.', 400)
    }

    if (nickname !== undefined) {
      const trimmed = String(nickname).trim()
      if (trimmed.length < 2 || trimmed.length > 12) {
        throw new ApiError('닉네임은 2~12자여야 합니다.', 400)
      }
      if (db.users.some((item) => item.nickname === trimmed && item.id !== user.id)) {
        throw new ApiError('이미 사용 중인 닉네임입니다.', 409)
      }
      user.nickname = trimmed
    }

    if (wantsPassword) {
      if (!currentPassword) throw new ApiError('현재 비밀번호를 입력해 주세요.', 400)
      if (user.password !== currentPassword) {
        throw new ApiError('현재 비밀번호가 올바르지 않습니다.', 400)
      }
      if (!newPassword || String(newPassword).length < 8) {
        throw new ApiError('비밀번호는 8자 이상이어야 합니다.', 400)
      }
      if (newPassword === currentPassword) {
        throw new ApiError('새 비밀번호가 기존 비밀번호와 같습니다.', 400)
      }
      user.password = newPassword
    }

    writeDb(db)
    return { user: toPublicUser(user) }
  },
}

/* -------------------------------------------------------------------------- */
/* diaries                                                                    */
/* -------------------------------------------------------------------------- */
export const diaries = {
  async listMine({ dateKey, category, visibility, keyword, cursor, limit } = {}) {
    await delay()
    const db = readDb()
    const user = requireUser(db)

    const list = db.diaries
      .filter((diary) => diary.authorId === user.id)
      .filter((diary) => (dateKey ? diary.dateKey === dateKey : true))
      .filter((diary) => (category ? diary.category === category : true))
      .filter((diary) => (visibility ? diary.visibility === visibility : true))
      .filter((diary) => matchKeyword(diary, keyword))
      .sort(sortByDateDesc)

    const page = paginate(list, { cursor, limit })
    return { ...page, items: page.items.map((diary) => serializeDiary(db, diary, user)) }
  },

  async listFeed({ keyword, category, cursor, limit } = {}) {
    await delay()
    const db = readDb()
    const user = requireUser(db)

    const list = db.diaries
      .filter((diary) => diary.visibility === 'public' && !diary.isHidden)
      .filter((diary) => (category ? diary.category === category : true))
      .filter((diary) => matchKeyword(diary, keyword))
      .sort(sortByDateDesc)

    const page = paginate(list, { cursor, limit })
    return { ...page, items: page.items.map((diary) => serializeDiary(db, diary, user)) }
  },

  async monthlyCounts({ year, month, scope = 'mine' } = {}) {
    await delay(80)
    const db = readDb()
    const user = requireUser(db)
    const prefix = year + '-' + String(month).padStart(2, '0')

    const counts = {}
    db.diaries
      .filter((diary) => {
        if (scope === 'mine') return diary.authorId === user.id
        return diary.visibility === 'public' && !diary.isHidden
      })
      .filter((diary) => diary.dateKey.startsWith(prefix))
      .forEach((diary) => {
        counts[diary.dateKey] = (counts[diary.dateKey] || 0) + 1
      })

    return { counts }
  },

  async get(id) {
    await delay()
    const db = readDb()
    const user = requireUser(db)
    const diary = db.diaries.find((item) => item.id === id)

    if (!diary) throw new ApiError('다이어리를 찾을 수 없습니다.', 404)
    if (diary.visibility === 'private' && diary.authorId !== user.id) {
      throw new ApiError('비공개 글입니다.', 403)
    }
    if (diary.isHidden && !canSeeHidden(diary, user)) {
      throw new ApiError('신고가 접수되어 가림 처리된 글입니다.', 403)
    }
    return { diary: serializeDiary(db, diary, user) }
  },

  async create(payload) {
    await delay()
    const db = readDb()
    const user = requireUser(db)
    const now = new Date().toISOString()

    const diary = {
      id: nextId('d'),
      authorId: user.id,
      title: payload.title.trim(),
      content: payload.content.trim(),
      category: payload.category,
      mood: payload.mood || '',
      dateKey: payload.dateKey,
      visibility: payload.visibility,
      isHidden: false,
      images: payload.images || [],
      createdAt: now,
      updatedAt: now,
    }
    db.diaries.push(diary)
    writeDb(db)
    return { diary: serializeDiary(db, diary, user) }
  },

  async update(id, payload) {
    await delay()
    const db = readDb()
    const user = requireUser(db)
    const diary = db.diaries.find((item) => item.id === id)

    if (!diary) throw new ApiError('다이어리를 찾을 수 없습니다.', 404)
    if (diary.authorId !== user.id) throw new ApiError('수정 권한이 없습니다.', 403)

    Object.assign(diary, {
      title: payload.title.trim(),
      content: payload.content.trim(),
      category: payload.category,
      mood: payload.mood || '',
      dateKey: payload.dateKey,
      visibility: payload.visibility,
      images: payload.images || [],
      updatedAt: new Date().toISOString(),
    })
    writeDb(db)
    return { diary: serializeDiary(db, diary, user) }
  },

  async remove(id) {
    await delay()
    const db = ensureShape(readDb())
    const user = requireUser(db)
    const diary = db.diaries.find((item) => item.id === id)

    if (!diary) throw new ApiError('다이어리를 찾을 수 없습니다.', 404)
    if (diary.authorId !== user.id) throw new ApiError('삭제 권한이 없습니다.', 403)

    db.diaries = db.diaries.filter((item) => item.id !== id)
    db.comments = db.comments.filter((item) => item.diaryId !== id)
    db.likes = db.likes.filter((item) => item.diaryId !== id)
    db.reports = db.reports.filter((item) => item.diaryId !== id)
    writeDb(db)
    return {}
  },

  async toggleLike(id) {
    await delay(120)
    const db = readDb()
    const user = requireUser(db)
    const diary = db.diaries.find((item) => item.id === id)

    if (!diary) throw new ApiError('다이어리를 찾을 수 없습니다.', 404)
    if (diary.visibility !== 'public') {
      throw new ApiError('공개된 글에만 좋아요를 누를 수 있습니다.', 400)
    }
    if (diary.isHidden) {
      throw new ApiError('가림 처리된 글에는 좋아요를 누를 수 없습니다.', 400)
    }

    const index = db.likes.findIndex((like) => like.diaryId === id && like.userId === user.id)
    if (index >= 0) {
      db.likes.splice(index, 1)
    } else {
      db.likes.push({ diaryId: id, userId: user.id })
    }
    writeDb(db)

    const likeCount = db.likes.filter((like) => like.diaryId === id).length
    return { liked: index < 0, likeCount }
  },
}

/* -------------------------------------------------------------------------- */
/* comments                                                                   */
/* -------------------------------------------------------------------------- */
export const comments = {
  async list(diaryId) {
    await delay(120)
    const db = readDb()
    const viewer = requireUser(db)
    const diary = db.diaries.find((item) => item.id === diaryId)
    if (!diary) throw new ApiError('다이어리를 찾을 수 없습니다.', 404)
    if (diary.visibility === 'private' && diary.authorId !== viewer.id) {
      throw new ApiError('비공개 글입니다.', 403)
    }
    if (diary.isHidden && !canSeeHidden(diary, viewer)) {
      throw new ApiError('신고가 접수되어 가림 처리된 글입니다.', 403)
    }

    const items = db.comments
      .filter((comment) => comment.diaryId === diaryId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((comment) => serializeComment(db, comment, viewer))

    return { items }
  },

  async create(diaryId, { content, parentId = null }) {
    await delay(120)
    const db = readDb()
    const user = requireUser(db)
    const diary = db.diaries.find((item) => item.id === diaryId)

    if (!diary) throw new ApiError('다이어리를 찾을 수 없습니다.', 404)
    if (diary.visibility !== 'public') {
      throw new ApiError('공개된 글에만 댓글을 쓸 수 있습니다.', 400)
    }
    if (diary.isHidden) {
      throw new ApiError('가림 처리된 글에는 댓글을 쓸 수 없습니다.', 400)
    }
    if (parentId && !db.comments.some((item) => item.id === parentId)) {
      throw new ApiError('원본 댓글을 찾을 수 없습니다.', 404)
    }

    const comment = {
      id: nextId('c'),
      diaryId,
      parentId,
      authorId: user.id,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    }
    db.comments.push(comment)
    writeDb(db)
    return { comment: serializeComment(db, comment, user) }
  },

  async remove(diaryId, commentId) {
    await delay(120)
    const db = readDb()
    const user = requireUser(db)
    const comment = db.comments.find((item) => item.id === commentId)

    if (!comment) throw new ApiError('댓글을 찾을 수 없습니다.', 404)
    if (comment.authorId !== user.id) throw new ApiError('삭제 권한이 없습니다.', 403)

    // 대댓글도 함께 삭제한다.
    db.comments = db.comments.filter((item) => item.id !== commentId && item.parentId !== commentId)
    writeDb(db)
    return {}
  },
}

/* -------------------------------------------------------------------------- */
/* reports - 신고                                                             */
/* -------------------------------------------------------------------------- */
export const reports = {
  async create(diaryId, { reason, detail = '' } = {}) {
    await delay()
    const db = ensureShape(readDb())
    const user = requireUser(db)

    if (!REPORT_REASONS.includes(reason)) {
      throw new ApiError('신고 사유를 선택해 주세요.', 400)
    }

    const diary = db.diaries.find((item) => item.id === diaryId)
    if (!diary) throw new ApiError('다이어리를 찾을 수 없습니다.', 404)
    if (diary.visibility !== 'public') {
      throw new ApiError('공개된 글만 신고할 수 있습니다.', 400)
    }
    if (diary.authorId === user.id) {
      throw new ApiError('자신이 쓴 글은 신고할 수 없습니다.', 400)
    }
    if (db.reports.some((r) => r.diaryId === diaryId && r.reporterId === user.id)) {
      throw new ApiError('이미 신고한 글입니다.', 409)
    }

    const report = {
      id: nextId('r'),
      diaryId,
      reporterId: user.id,
      reason,
      detail: String(detail || '').slice(0, 500),
      status: 'pending',
      createdAt: new Date().toISOString(),
      handledAt: null,
    }
    db.reports.push(report)

    // 신고가 들어오면 자동 가림 처리한다. (요구사항 21)
    diary.isHidden = true
    writeDb(db)

    // mock 에는 메일 서버가 없으므로 콘솔에만 남긴다.
    console.info(
      '[mock] 신고 접수 - ' +
        (REPORT_REASON_LABELS[reason] || reason) +
        ' / 글: ' +
        diary.title +
        ' -> dnjstjr1031@gmail.com 으로 전송(모의)',
    )

    return { report: { id: report.id, reason, detail: report.detail, status: 'pending' } }
  },
}

/* -------------------------------------------------------------------------- */
/* admin - 신고 검토 / 가림 해제                                              */
/* -------------------------------------------------------------------------- */
function serializeReport(db, report) {
  const diary = db.diaries.find((item) => item.id === report.diaryId)
  const author = diary ? findUser(db, diary.authorId) : null
  const reporter = findUser(db, report.reporterId)
  return {
    id: report.id,
    diaryId: report.diaryId,
    diaryTitle: diary ? diary.title : '(삭제된 글)',
    diaryHidden: diary ? Boolean(diary.isHidden) : false,
    diaryVisibility: diary ? diary.visibility : null,
    authorId: diary ? diary.authorId : null,
    authorNickname: author ? author.nickname : '알 수 없음',
    reporterNickname: reporter ? reporter.nickname : '알 수 없음',
    reason: report.reason,
    reasonLabel: REPORT_REASON_LABELS[report.reason] || report.reason,
    detail: report.detail,
    status: report.status,
    createdAt: report.createdAt,
    handledAt: report.handledAt,
  }
}

export const admin = {
  async listReports({ status } = {}) {
    await delay(120)
    const db = ensureShape(readDb())
    requireAdmin(db)

    const items = db.reports
      .filter((report) => (status ? report.status === status : true))
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((report) => serializeReport(db, report))

    return { items }
  },

  async unhideDiary(diaryId) {
    await delay(120)
    const db = ensureShape(readDb())
    requireAdmin(db)
    const diary = db.diaries.find((item) => item.id === diaryId)
    if (!diary) throw new ApiError('다이어리를 찾을 수 없습니다.', 404)

    diary.isHidden = false
    db.reports
      .filter((report) => report.diaryId === diaryId && report.status === 'pending')
      .forEach((report) => {
        report.status = 'reviewed'
        report.handledAt = new Date().toISOString()
      })
    writeDb(db)
    return { isHidden: false }
  },

  async hideDiary(diaryId) {
    await delay(120)
    const db = ensureShape(readDb())
    requireAdmin(db)
    const diary = db.diaries.find((item) => item.id === diaryId)
    if (!diary) throw new ApiError('다이어리를 찾을 수 없습니다.', 404)

    diary.isHidden = true
    writeDb(db)
    return { isHidden: true }
  },

  async dismissReport(reportId) {
    await delay(120)
    const db = ensureShape(readDb())
    requireAdmin(db)
    const report = db.reports.find((item) => item.id === reportId)
    if (!report) throw new ApiError('신고를 찾을 수 없습니다.', 404)

    report.status = 'dismissed'
    report.handledAt = new Date().toISOString()

    const stillPending = db.reports.some(
      (item) => item.diaryId === report.diaryId && item.status === 'pending',
    )
    if (!stillPending) {
      const diary = db.diaries.find((item) => item.id === report.diaryId)
      if (diary) diary.isHidden = false
    }
    writeDb(db)
    return {}
  },
}

/* -------------------------------------------------------------------------- */
/* uploads                                                                    */
/* -------------------------------------------------------------------------- */
export const uploads = {
  async image(file) {
    const message = validateImageFile(file)
    if (message) throw new ApiError(message, 400)

    // mock 모드에는 파일 서버가 없으므로 축소한 data URL 을 주소로 사용한다.
    const url = await toStorableDataUrl(file)
    return { url, name: file.name, size: file.size }
  },
}
