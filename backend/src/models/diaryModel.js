/** diaries / diary_images 테이블 접근 */
const db = require('../config/db')

/**
 * 다이어리 한 건을 읽는 기본 SELECT.
 * 첫 번째 파라미터는 항상 "보는 사람의 id"(likedByMe 계산용)이다.
 */
const SELECT_DIARY = `
  SELECT
    d.id, d.user_id, d.title, d.content, d.category, d.mood,
    d.date_key, d.visibility, d.created_at, d.updated_at,
    u.nickname AS author_nickname,
    (SELECT COUNT(*) FROM diary_likes l WHERE l.diary_id = d.id) AS like_count,
    (SELECT COUNT(*) FROM comments c WHERE c.diary_id = d.id) AS comment_count,
    EXISTS (SELECT 1 FROM diary_likes v WHERE v.diary_id = d.id AND v.user_id = ?) AS liked_by_me
  FROM diaries d
  INNER JOIN users u ON u.id = d.user_id
`

const ORDER_BY_LATEST = ' ORDER BY d.date_key DESC, d.created_at DESC, d.id DESC'

/** LIKE 검색어에 쓰이는 특수문자(역슬래시, %, _)를 그대로 찾도록 이스케이프한다. */
const LIKE_ESCAPE = String.fromCharCode(92) // 역슬래시
const LIKE_SPECIAL_PATTERN = new RegExp('[' + LIKE_ESCAPE + '%_]', 'g')

function toLikePattern(keyword) {
  const escaped = String(keyword).replace(LIKE_SPECIAL_PATTERN, (char) => LIKE_ESCAPE + char)
  return '%' + escaped + '%'
}

/** 조회한 다이어리 행들에 images 배열을 붙인다. */
async function attachImages(rows) {
  if (!rows.length) return rows

  const ids = rows.map((row) => row.id)
  const images = await db.query(
    `SELECT diary_id, url, name
     FROM diary_images
     WHERE diary_id IN (?)
     ORDER BY diary_id ASC, sort_order ASC, id ASC`,
    [ids],
  )

  const grouped = new Map()
  images.forEach((image) => {
    const key = String(image.diary_id)
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key).push({ url: image.url, name: image.name })
  })

  rows.forEach((row) => {
    row.images = grouped.get(String(row.id)) || []
  })
  return rows
}

/** 내 다이어리 목록 */
async function findMine(viewerId, { dateKey, category, visibility, keyword } = {}) {
  const conditions = ['d.user_id = ?']
  const params = [viewerId, viewerId]

  if (dateKey) {
    conditions.push('d.date_key = ?')
    params.push(dateKey)
  }
  if (category) {
    conditions.push('d.category = ?')
    params.push(category)
  }
  if (visibility) {
    conditions.push('d.visibility = ?')
    params.push(visibility)
  }
  if (keyword) {
    conditions.push('(d.title LIKE ? OR d.content LIKE ?)')
    params.push(toLikePattern(keyword), toLikePattern(keyword))
  }

  const rows = await db.query(
    SELECT_DIARY + ' WHERE ' + conditions.join(' AND ') + ORDER_BY_LATEST,
    params,
  )
  return attachImages(rows)
}

/** 공개 피드 목록 */
async function findFeed(viewerId, { category, keyword } = {}) {
  const conditions = ["d.visibility = 'public'"]
  const params = [viewerId]

  if (category) {
    conditions.push('d.category = ?')
    params.push(category)
  }
  if (keyword) {
    conditions.push('(d.title LIKE ? OR d.content LIKE ?)')
    params.push(toLikePattern(keyword), toLikePattern(keyword))
  }

  const rows = await db.query(
    SELECT_DIARY + ' WHERE ' + conditions.join(' AND ') + ORDER_BY_LATEST,
    params,
  )
  return attachImages(rows)
}

/** 다이어리 한 건 */
async function findById(id, viewerId) {
  const row = await db.queryOne(SELECT_DIARY + ' WHERE d.id = ?', [viewerId, id])
  if (!row) return null
  const [withImages] = await attachImages([row])
  return withImages
}

/** 월별 작성 개수 - { 'YYYY-MM-DD': 개수 } */
async function countByMonth({ monthPrefix, authorId = null, publicOnly = false }) {
  const conditions = ['d.date_key LIKE ?']
  const params = [monthPrefix + '%']

  if (authorId) {
    conditions.push('d.user_id = ?')
    params.push(authorId)
  }
  if (publicOnly) {
    conditions.push("d.visibility = 'public'")
  }

  const rows = await db.query(
    `SELECT d.date_key, COUNT(*) AS total
     FROM diaries d
     WHERE ${conditions.join(' AND ')}
     GROUP BY d.date_key`,
    params,
  )

  const counts = {}
  rows.forEach((row) => {
    counts[row.date_key] = Number(row.total)
  })
  return counts
}

/** 이미지 목록을 통째로 다시 저장한다. */
async function replaceImages(connection, diaryId, images) {
  await connection.query('DELETE FROM diary_images WHERE diary_id = ?', [diaryId])
  if (!images.length) return

  const values = images.map((image, index) => [diaryId, image.url, image.name, index])
  await connection.query(
    'INSERT INTO diary_images (diary_id, url, name, sort_order) VALUES ?',
    [values],
  )
}

/** 다이어리를 새로 만들고 id 를 반환한다. */
async function create(authorId, payload) {
  const now = new Date()
  return db.transaction(async (connection) => {
    const [result] = await connection.query(
      `INSERT INTO diaries
        (user_id, title, content, category, mood, date_key, visibility, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        authorId,
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
    await replaceImages(connection, result.insertId, payload.images)
    return String(result.insertId)
  })
}

/** 다이어리를 수정한다. */
async function update(id, payload) {
  await db.transaction(async (connection) => {
    await connection.query(
      `UPDATE diaries
       SET title = ?, content = ?, category = ?, mood = ?,
           date_key = ?, visibility = ?, updated_at = ?
       WHERE id = ?`,
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
}

/** 다이어리를 삭제한다. (댓글/좋아요/이미지는 FK 로 함께 지워진다.) */
async function remove(id) {
  await db.execute('DELETE FROM diaries WHERE id = ?', [id])
}

/** 권한 확인용 - 작성자와 공개 여부만 읽는다. */
function findOwnership(id) {
  return db.queryOne('SELECT id, user_id, visibility FROM diaries WHERE id = ?', [id])
}

module.exports = {
  findMine,
  findFeed,
  findById,
  findOwnership,
  countByMonth,
  create,
  update,
  remove,
}
