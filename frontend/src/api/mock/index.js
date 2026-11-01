/**
 * mock API 구현 - api/server.js 와 동일한 인터페이스를 제공한다.
 * 백엔드가 준비되면 .env 의 VITE_USE_MOCK 을 false 로 바꾸면 된다.
 */
import { ApiError } from '../client'
import { nextId, readDb, writeDb } from './db'
import { STORAGE_KEYS } from '@/config'
import { toStorableDataUrl, validateImageFile } from '@/utils/image'

/** 실제 네트워크처럼 보이도록 약간의 지연을 준다. */
function delay(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function toPublicUser(user) {
  if (!user) return null
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    createdAt: user.createdAt,
  }
}

function toAuthor(db, authorId) {
  const user = db.users.find((item) => item.id === authorId)
  return { id: authorId, nickname: user ? user.nickname : '알 수 없음' }
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

function serializeDiary(db, diary, viewerId) {
  const likes = db.likes.filter((like) => like.diaryId === diary.id)
  return {
    id: diary.id,
    authorId: diary.authorId,
    author: toAuthor(db, diary.authorId),
    title: diary.title,
    content: diary.content,
    category: diary.category,
    mood: diary.mood,
    dateKey: diary.dateKey,
    visibility: diary.visibility,
    images: diary.images || [],
    likeCount: likes.length,
    likedByMe: likes.some((like) => like.userId === viewerId),
    commentCount: db.comments.filter((comment) => comment.diaryId === diary.id).length,
    createdAt: diary.createdAt,
    updatedAt: diary.updatedAt,
  }
}

function serializeComment(db, comment) {
  return {
    id: comment.id,
    diaryId: comment.diaryId,
    parentId: comment.parentId,
    author: toAuthor(db, comment.authorId),
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
 * (백엔드는 'YYYY-MM-DD_id' 를 쓰지만, 화면은 커서를 그대로 돌려줄 뿐이라 상관없다.)
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
    return { ...page, items: page.items.map((diary) => serializeDiary(db, diary, user.id)) }
  },

  async listFeed({ keyword, category, cursor, limit } = {}) {
    await delay()
    const db = readDb()
    const user = requireUser(db)

    const list = db.diaries
      .filter((diary) => diary.visibility === 'public')
      .filter((diary) => (category ? diary.category === category : true))
      .filter((diary) => matchKeyword(diary, keyword))
      .sort(sortByDateDesc)

    const page = paginate(list, { cursor, limit })
    return { ...page, items: page.items.map((diary) => serializeDiary(db, diary, user.id)) }
  },

  async monthlyCounts({ year, month, scope = 'mine' } = {}) {
    await delay(80)
    const db = readDb()
    const user = requireUser(db)
    const prefix = year + '-' + String(month).padStart(2, '0')

    const counts = {}
    db.diaries
      .filter((diary) => (scope === 'mine' ? diary.authorId === user.id : true))
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
    return { diary: serializeDiary(db, diary, user.id) }
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
      images: payload.images || [],
      createdAt: now,
      updatedAt: now,
    }
    db.diaries.push(diary)
    writeDb(db)
    return { diary: serializeDiary(db, diary, user.id) }
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
    return { diary: serializeDiary(db, diary, user.id) }
  },

  async remove(id) {
    await delay()
    const db = readDb()
    const user = requireUser(db)
    const diary = db.diaries.find((item) => item.id === id)

    if (!diary) throw new ApiError('다이어리를 찾을 수 없습니다.', 404)
    if (diary.authorId !== user.id) throw new ApiError('삭제 권한이 없습니다.', 403)

    db.diaries = db.diaries.filter((item) => item.id !== id)
    db.comments = db.comments.filter((item) => item.diaryId !== id)
    db.likes = db.likes.filter((item) => item.diaryId !== id)
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
    requireUser(db)

    const items = db.comments
      .filter((comment) => comment.diaryId === diaryId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((comment) => serializeComment(db, comment))

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
    return { comment: serializeComment(db, comment) }
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
