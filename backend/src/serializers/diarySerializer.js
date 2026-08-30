/** diaries 행 -> 프론트엔드 Diary 형태 */
const { toIso } = require('../utils/date')

function toDiary(row) {
  if (!row) return null
  return {
    id: String(row.id),
    authorId: String(row.user_id),
    author: { id: String(row.user_id), nickname: row.author_nickname },
    title: row.title,
    content: row.content,
    category: row.category,
    mood: row.mood || '',
    dateKey: row.date_key,
    visibility: row.visibility,
    images: row.images || [],
    likeCount: Number(row.like_count || 0),
    likedByMe: Number(row.liked_by_me || 0) === 1,
    commentCount: Number(row.comment_count || 0),
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  }
}

function toDiaryList(rows) {
  return rows.map(toDiary)
}

module.exports = { toDiary, toDiaryList }
