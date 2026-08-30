/** comments 테이블 접근 */
const db = require('../config/db')

const SELECT_COMMENT = `
  SELECT c.id, c.diary_id, c.parent_id, c.user_id, c.content, c.created_at,
         u.nickname AS author_nickname
  FROM comments c
  INNER JOIN users u ON u.id = c.user_id
`

/** 특정 다이어리의 댓글 전체 (오래된 순) */
function findByDiaryId(diaryId) {
  return db.query(
    SELECT_COMMENT + ' WHERE c.diary_id = ? ORDER BY c.created_at ASC, c.id ASC',
    [diaryId],
  )
}

function findById(id) {
  return db.queryOne(SELECT_COMMENT + ' WHERE c.id = ?', [id])
}

/** 같은 다이어리에 속한 부모 댓글인지 확인한다. */
function findParent(diaryId, parentId) {
  return db.queryOne(
    'SELECT id, parent_id FROM comments WHERE id = ? AND diary_id = ?',
    [parentId, diaryId],
  )
}

/** 댓글을 만들고 저장된 행을 반환한다. */
async function create({ diaryId, parentId, userId, content }) {
  const result = await db.execute(
    `INSERT INTO comments (diary_id, parent_id, user_id, content, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [diaryId, parentId, userId, content, new Date()],
  )
  return findById(result.insertId)
}

/** 댓글과 그 대댓글을 함께 지운다. */
async function remove(id) {
  await db.execute('DELETE FROM comments WHERE id = ? OR parent_id = ?', [id, id])
}

module.exports = { findByDiaryId, findById, findParent, create, remove }
