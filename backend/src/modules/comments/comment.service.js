/**
 * 댓글 / 대댓글.
 *
 * 권한 규칙
 * - 목록 : 볼 수 있는 글의 댓글만 (비공개 글은 작성자 본인만)
 * - 작성 : 공개된 글에만
 * - 삭제 : 댓글 작성자 본인만 (딸린 대댓글도 함께 지운다)
 */
import { execute, query, queryOne, withTransaction } from '../../db/pool.js'
import { ApiError } from '../../utils/ApiError.js'
import { toIso } from '../../utils/date.js'
import { newId } from '../../utils/id.js'
import { requireContent } from '../../utils/validate.js'

const SELECT_COMMENT = `
  SELECT c.id, c.diary_id, c.parent_id, c.author_id, c.content, c.created_at,
         u.nickname AS author_nickname
    FROM comments c
    JOIN users u ON u.id = c.author_id
`

function serializeComment(row) {
  return {
    id: row.id,
    diaryId: row.diary_id,
    parentId: row.parent_id,
    author: { id: row.author_id, nickname: row.author_nickname },
    authorId: row.author_id,
    content: row.content,
    createdAt: toIso(row.created_at),
  }
}

/** 댓글을 달 글을 찾는다. 없으면 404 */
async function findDiaryOrFail(diaryId) {
  const diary = await queryOne('SELECT id, author_id, visibility FROM diaries WHERE id = ?', [
    diaryId,
  ])
  if (!diary) throw ApiError.notFound('다이어리를 찾을 수 없습니다.')
  return diary
}

export async function list(viewerId, diaryId) {
  const diary = await findDiaryOrFail(diaryId)

  if (diary.visibility === 'private' && diary.author_id !== viewerId) {
    throw ApiError.forbidden('비공개 글입니다.')
  }

  const rows = await query(SELECT_COMMENT + ' WHERE c.diary_id = ? ORDER BY c.created_at ASC', [
    diaryId,
  ])
  return { items: rows.map(serializeComment) }
}

export async function create(viewerId, diaryId, body = {}) {
  const diary = await findDiaryOrFail(diaryId)

  if (diary.visibility !== 'public') {
    throw ApiError.badRequest('공개된 글에만 댓글을 쓸 수 있습니다.')
  }

  const content = requireContent(body.content, '댓글')
  const parentId = body.parentId ? String(body.parentId) : null

  if (parentId) {
    // 대댓글은 같은 글에 달린 댓글에만 달 수 있다.
    const parent = await queryOne('SELECT id FROM comments WHERE id = ? AND diary_id = ?', [
      parentId,
      diaryId,
    ])
    if (!parent) throw ApiError.notFound('원본 댓글을 찾을 수 없습니다.')
  }

  const id = newId()
  const createdAt = new Date()

  await execute(
    'INSERT INTO comments (id, diary_id, parent_id, author_id, content, created_at)' +
      ' VALUES (?, ?, ?, ?, ?, ?)',
    [id, diaryId, parentId, viewerId, content, createdAt],
  )

  const row = await queryOne(SELECT_COMMENT + ' WHERE c.id = ?', [id])
  return { comment: serializeComment(row) }
}

export async function remove(viewerId, diaryId, commentId) {
  const comment = await queryOne(
    'SELECT id, author_id FROM comments WHERE id = ? AND diary_id = ?',
    [commentId, diaryId],
  )
  if (!comment) throw ApiError.notFound('댓글을 찾을 수 없습니다.')

  // 다른 회원이 쓴 댓글은 삭제할 수 없다.
  if (comment.author_id !== viewerId) throw ApiError.forbidden('삭제 권한이 없습니다.')

  await withTransaction(async (connection) => {
    // 딸린 대댓글을 먼저 지운다.
    await connection.execute('DELETE FROM comments WHERE parent_id = ?', [commentId])
    await connection.execute('DELETE FROM comments WHERE id = ?', [commentId])
  })

  return {}
}
