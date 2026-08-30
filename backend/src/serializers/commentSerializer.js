/** comments 행 -> 프론트엔드 Comment 형태 */
const { toIso } = require('../utils/date')

function toComment(row) {
  if (!row) return null
  return {
    id: String(row.id),
    diaryId: String(row.diary_id),
    parentId: row.parent_id === null ? null : String(row.parent_id),
    authorId: String(row.user_id),
    author: { id: String(row.user_id), nickname: row.author_nickname },
    content: row.content,
    createdAt: toIso(row.created_at),
  }
}

function toCommentList(rows) {
  return rows.map(toComment)
}

module.exports = { toComment, toCommentList }
