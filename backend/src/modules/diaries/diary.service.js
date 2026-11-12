/**
 * 다이어리 조회 / 작성 / 수정 / 삭제 / 좋아요.
 *
 * 권한 규칙
 * - 목록(GET /diaries)      : 내가 쓴 글만 보인다.
 * - 피드(GET /diaries/feed) : 공개 글만 보인다. (가림 처리된 글 제외)
 * - 상세                    : 비공개 글은 작성자 본인만 / 가림 처리된 글은 작성자·관리자만
 * - 수정 / 삭제             : 작성자 본인만
 * - 좋아요                  : 공개 글에만
 *
 * viewer = { id, isAdmin } (로그인한 회원)
 */
import { execute, query, queryOne, withTransaction } from '../../db/pool.js'
import { ApiError } from '../../utils/ApiError.js'
import { monthRange, toIso } from '../../utils/date.js'
import { displayNickname } from '../../utils/nickname.js'
import { newId } from '../../utils/id.js'
import { cursorCondition, parseCursor, parseLimit, toPage } from '../../utils/pagination.js'
import { filenameFromUrl, removeUploadedFile } from '../../utils/uploadFiles.js'
import {
  CATEGORIES,
  VISIBILITIES,
  optionalDateKey,
  optionalKeyword,
  optionalOneOf,
  requireDiaryPayload,
} from '../../utils/validate.js'

/**
 * 목록과 상세가 함께 쓰는 조회문.
 * 첫 번째 물음표는 '보고 있는 회원의 id' (좋아요 여부 확인용) 이다.
 */
const SELECT_DIARY = `
  SELECT d.id, d.author_id, d.title, d.content, d.category, d.mood,
         d.date_key, d.visibility, d.is_hidden, d.created_at, d.updated_at,
         u.nickname AS author_nickname,
         (SELECT COUNT(*) FROM diary_likes l WHERE l.diary_id = d.id) AS like_count,
         (SELECT COUNT(*) FROM comments c WHERE c.diary_id = d.id) AS comment_count,
         EXISTS (SELECT 1 FROM diary_likes m WHERE m.diary_id = d.id AND m.user_id = ?) AS liked_by_me
    FROM diaries d
    JOIN users u ON u.id = d.author_id
`

/** 최신 날짜 먼저, 같은 날짜면 나중에 쓴 글 먼저. (id 는 순서를 고정하기 위한 마지막 기준) */
const ORDER_BY_LATEST = ' ORDER BY d.date_key DESC, d.created_at DESC, d.id DESC'

/** 제목과 내용에서 검색어를 찾는 조건 (대소문자 구분 없음) */
const KEYWORD_CONDITION = "LOCATE(?, CONCAT(d.title, ' ', d.content)) > 0"

/** 글 여러 건의 이미지를 한 번에 읽어 { 글id: [이미지] } 형태로 만든다. */
async function loadImages(diaryIds) {
  const grouped = new Map()
  if (diaryIds.length === 0) return grouped

  const placeholders = diaryIds.map(() => '?').join(', ')
  const rows = await query(
    'SELECT diary_id, url, name FROM diary_images WHERE diary_id IN (' +
      placeholders +
      ') ORDER BY diary_id, sort_order',
    diaryIds,
  )

  rows.forEach((row) => {
    const images = grouped.get(row.diary_id) || []
    images.push({ url: row.url, name: row.name })
    grouped.set(row.diary_id, images)
  })
  return grouped
}

/** DB 한 줄을 프론트엔드가 기대하는 모양으로 바꾼다. */
function serializeDiary(row, images, viewer) {
  const isSelf = row.author_id === viewer.id
  // 공개 글에서는 작성자 닉네임을 익명 처리한다. (본인/관리자는 그대로)
  const nickname =
    row.visibility === 'public'
      ? displayNickname(row.author_nickname, { isSelf, isAdmin: viewer.isAdmin })
      : row.author_nickname

  return {
    id: row.id,
    authorId: row.author_id,
    author: { id: row.author_id, nickname },
    title: row.title,
    content: row.content,
    category: row.category,
    mood: row.mood,
    dateKey: row.date_key,
    visibility: row.visibility,
    isHidden: Boolean(Number(row.is_hidden)),
    images,
    likeCount: Number(row.like_count),
    likedByMe: Boolean(Number(row.liked_by_me)),
    commentCount: Number(row.comment_count),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  }
}

async function serializeMany(rows, viewer) {
  const images = await loadImages(rows.map((row) => row.id))
  return rows.map((row) => serializeDiary(row, images.get(row.id) || [], viewer))
}

/** 글 한 건을 읽는다. 없으면 404 */
async function findDiaryOrFail(viewer, id) {
  const row = await queryOne(SELECT_DIARY + ' WHERE d.id = ?', [viewer.id, id])
  if (!row) throw ApiError.notFound('다이어리를 찾을 수 없습니다.')
  return row
}

/** 이미지 목록을 다시 저장한다. (수정할 때는 통째로 교체) */
async function replaceImages(connection, diaryId, images) {
  await connection.execute('DELETE FROM diary_images WHERE diary_id = ?', [diaryId])

  for (let index = 0; index < images.length; index += 1) {
    await connection.execute(
      'INSERT INTO diary_images (diary_id, url, name, sort_order) VALUES (?, ?, ?, ?)',
      [diaryId, images[index].url, images[index].name, index],
    )
  }
}

/** category / keyword 필터를 조건 배열에 더한다. */
function applyListFilters(params, conditions, values) {
  const category = optionalOneOf(params.category, CATEGORIES, '글 종류가 올바르지 않습니다.')
  if (category) {
    conditions.push('d.category = ?')
    values.push(category)
  }

  const keyword = optionalKeyword(params.keyword)
  if (keyword) {
    conditions.push(KEYWORD_CONDITION)
    values.push(keyword)
  }
}

/**
 * 조건에 맞는 글을 한 페이지만큼 읽고 { items, nextCursor, total } 로 돌려준다.
 * - conditions / values : WHERE 조건 (values[0] 은 SELECT_DIARY 의 '보는 회원 id')
 * - params.cursor / params.limit : 페이지 위치와 크기 (utils/pagination.js)
 */
async function listPage(viewer, conditions, values, params) {
  const limit = parseLimit(params.limit)
  const cursor = cursorCondition(parseCursor(params.cursor))
  const where = cursor.sql ? [...conditions, cursor.sql] : conditions

  // limit 는 parseLimit 이 정수로 보장한다. (prepared statement 의 LIMIT ? 는
  // MySQL 버전에 따라 오류가 나므로 검증된 숫자를 직접 붙인다)
  // 다음 페이지가 있는지 알기 위해 하나 더 읽는다.
  const rows = await query(
    SELECT_DIARY +
      ' WHERE ' +
      where.join(' AND ') +
      ORDER_BY_LATEST +
      ' LIMIT ' +
      (limit + 1),
    [...values, ...cursor.values],
  )

  // 전체 개수는 커서와 상관없이 같은 조건으로 센다. (values[0] 인 '보는 회원 id' 는 빼고)
  const countRow = await queryOne(
    'SELECT COUNT(*) AS total FROM diaries d WHERE ' + conditions.join(' AND '),
    values.slice(1),
  )

  const page = toPage(rows, limit)
  return {
    items: await serializeMany(page.rows, viewer),
    nextCursor: page.nextCursor,
    total: Number(countRow.total),
  }
}

/**
 * 더 이상 어떤 글에서도 쓰지 않는 이미지 파일을 지운다.
 * 파일 정리는 부가 작업이므로 실패해도 요청 자체는 성공으로 둔다.
 */
async function cleanUpImages(urls) {
  if (urls.length === 0) return
  try {
    const placeholders = urls.map(() => '?').join(', ')
    const rows = await query(
      'SELECT DISTINCT url FROM diary_images WHERE url IN (' + placeholders + ')',
      urls,
    )
    const used = new Set(rows.map((row) => row.url))
    const unused = urls.filter((url) => !used.has(url))
    await Promise.all(unused.map((url) => removeUploadedFile(filenameFromUrl(url))))
  } catch (error) {
    console.error('[upload] 사용하지 않는 이미지를 정리하지 못했습니다.', error.message)
  }
}

async function findImageUrls(diaryId) {
  const rows = await query('SELECT url FROM diary_images WHERE diary_id = ?', [diaryId])
  return rows.map((row) => row.url)
}

/* -------------------------------------------------------------------------- */
/* 조회                                                                       */
/* -------------------------------------------------------------------------- */

/** 내가 쓴 글 목록 (한 페이지) */
export async function listMine(viewer, params = {}) {
  const conditions = ['d.author_id = ?']
  const values = [viewer.id, viewer.id]

  const dateKey = optionalDateKey(params.dateKey)
  if (dateKey) {
    conditions.push('d.date_key = ?')
    values.push(dateKey)
  }

  const visibility = optionalOneOf(
    params.visibility,
    VISIBILITIES,
    '공개 여부가 올바르지 않습니다.',
  )
  if (visibility) {
    conditions.push('d.visibility = ?')
    values.push(visibility)
  }

  applyListFilters(params, conditions, values)

  return listPage(viewer, conditions, values, params)
}

/**
 * 특정 회원이 쓴 글 목록. (마이페이지)
 * - 본인이나 관리자면 모든 글
 * - 그 외에는 공개 & 가림되지 않은 글만
 */
export async function listByAuthor(viewer, authorId, params = {}) {
  const isSelf = viewer.id === authorId
  const conditions = ['d.author_id = ?']
  const values = [viewer.id, authorId]

  if (!isSelf && !viewer.isAdmin) {
    conditions.push("d.visibility = 'public'")
    conditions.push('d.is_hidden = 0')
  }

  applyListFilters(params, conditions, values)

  const rows = await query(
    SELECT_DIARY + ' WHERE ' + conditions.join(' AND ') + ORDER_BY_LATEST,
    values,
  )
  return { items: await serializeMany(rows, viewer) }
}

/** 다른 회원에게 공개된 글 목록 (한 페이지) */
export async function listFeed(viewer, params = {}) {
  const conditions = ["d.visibility = 'public'", 'd.is_hidden = 0']
  const values = [viewer.id]

  applyListFilters(params, conditions, values)

  return listPage(viewer, conditions, values, params)
}

/**
 * 달력에 표시할 날짜별 글 개수.
 * scope 가 'mine'(기본) 이면 내 글만, 'public' 이면 공개(가림 제외) 글만 센다.
 */
export async function monthlyCounts(viewer, params = {}) {
  const year = Number(params.year)
  const month = Number(params.month)

  if (!Number.isInteger(year) || year < 1900 || year > 2999) {
    throw ApiError.badRequest('연도가 올바르지 않습니다.')
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw ApiError.badRequest('월이 올바르지 않습니다.')
  }

  const { start, end } = monthRange(year, month)
  const scope = params.scope === 'public' ? 'public' : 'mine'
  const ownerCondition =
    scope === 'mine' ? 'd.author_id = ?' : "d.visibility = 'public' AND d.is_hidden = 0"
  const values = scope === 'mine' ? [start, end, viewer.id] : [start, end]

  const rows = await query(
    "SELECT DATE_FORMAT(d.date_key, '%Y-%m-%d') AS date_key, COUNT(*) AS count" +
      ' FROM diaries d WHERE d.date_key BETWEEN ? AND ? AND ' +
      ownerCondition +
      ' GROUP BY d.date_key',
    values,
  )

  const counts = {}
  rows.forEach((row) => {
    counts[row.date_key] = Number(row.count)
  })
  return { counts }
}

/** 글 한 건 (비공개 글은 작성자만 / 가림 처리된 글은 작성자·관리자만) */
export async function get(viewer, id) {
  const row = await findDiaryOrFail(viewer, id)
  const isSelf = row.author_id === viewer.id

  if (row.visibility === 'private' && !isSelf) {
    throw ApiError.forbidden('비공개 글입니다.')
  }
  if (Number(row.is_hidden) && !isSelf && !viewer.isAdmin) {
    throw ApiError.forbidden('신고가 접수되어 가림 처리된 글입니다.')
  }

  const images = await loadImages([row.id])
  return { diary: serializeDiary(row, images.get(row.id) || [], viewer) }
}

/* -------------------------------------------------------------------------- */
/* 작성 / 수정 / 삭제                                                         */
/* -------------------------------------------------------------------------- */

export async function create(viewer, body) {
  const payload = requireDiaryPayload(body)
  const id = newId()
  const now = new Date()

  await withTransaction(async (connection) => {
    await connection.execute(
      'INSERT INTO diaries' +
        ' (id, author_id, title, content, category, mood, date_key, visibility, created_at, updated_at)' +
        ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        viewer.id,
        payload.title,
        payload.content,
        payload.category,
        payload.mood,
        payload.dateKey,
        payload.visibility,
        now,
        now,
      ],
    )
    await replaceImages(connection, id, payload.images)
  })

  return get(viewer, id)
}

export async function update(viewer, id, body) {
  const current = await findDiaryOrFail(viewer, id)

  // 다른 회원이 쓴 글은 수정할 수 없다.
  if (current.author_id !== viewer.id) throw ApiError.forbidden('수정 권한이 없습니다.')

  const payload = requireDiaryPayload(body)
  const before = await findImageUrls(id)

  await withTransaction(async (connection) => {
    await connection.execute(
      'UPDATE diaries SET title = ?, content = ?, category = ?, mood = ?,' +
        ' date_key = ?, visibility = ?, updated_at = ? WHERE id = ?',
      [
        payload.title,
        payload.content,
        payload.category,
        payload.mood,
        payload.dateKey,
        payload.visibility,
        new Date(),
        id,
      ],
    )
    await replaceImages(connection, id, payload.images)
  })

  // 수정하면서 뺀 이미지는 파일도 지운다.
  const kept = new Set(payload.images.map((image) => image.url))
  await cleanUpImages(before.filter((url) => !kept.has(url)))

  return get(viewer, id)
}

export async function remove(viewer, id) {
  const current = await findDiaryOrFail(viewer, id)

  // 다른 회원이 쓴 글은 삭제할 수 없다.
  if (current.author_id !== viewer.id) throw ApiError.forbidden('삭제 권한이 없습니다.')

  const imageUrls = await findImageUrls(id)

  // 이미지 / 댓글 / 좋아요 / 신고는 외래키 설정에 따라 함께 지워진다.
  await execute('DELETE FROM diaries WHERE id = ?', [id])
  await cleanUpImages(imageUrls)
  return {}
}

/** 좋아요를 누르거나 취소한다. */
export async function toggleLike(viewer, id) {
  const diary = await findDiaryOrFail(viewer, id)

  if (diary.visibility !== 'public') {
    throw ApiError.badRequest('공개된 글에만 좋아요를 누를 수 있습니다.')
  }
  if (Number(diary.is_hidden)) {
    throw ApiError.badRequest('가림 처리된 글에는 좋아요를 누를 수 없습니다.')
  }

  const liked = Boolean(Number(diary.liked_by_me))
  if (liked) {
    await execute('DELETE FROM diary_likes WHERE diary_id = ? AND user_id = ?', [id, viewer.id])
  } else {
    // IGNORE: 버튼을 아주 빠르게 두 번 눌러 같은 요청이 겹쳐도 오류 없이 한 번만 저장된다.
    await execute(
      'INSERT IGNORE INTO diary_likes (diary_id, user_id, created_at) VALUES (?, ?, ?)',
      [id, viewer.id, new Date()],
    )
  }

  const row = await queryOne('SELECT COUNT(*) AS count FROM diary_likes WHERE diary_id = ?', [id])
  return { liked: !liked, likeCount: Number(row.count) }
}
