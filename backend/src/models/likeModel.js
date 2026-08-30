/** diary_likes 테이블 접근 */
const db = require('../config/db')

async function exists(diaryId, userId) {
  const row = await db.queryOne(
    'SELECT 1 AS found FROM diary_likes WHERE diary_id = ? AND user_id = ?',
    [diaryId, userId],
  )
  return Boolean(row)
}

async function add(diaryId, userId) {
  await db.execute(
    'INSERT IGNORE INTO diary_likes (diary_id, user_id, created_at) VALUES (?, ?, ?)',
    [diaryId, userId, new Date()],
  )
}

async function remove(diaryId, userId) {
  await db.execute('DELETE FROM diary_likes WHERE diary_id = ? AND user_id = ?', [
    diaryId,
    userId,
  ])
}

async function count(diaryId) {
  const row = await db.queryOne(
    'SELECT COUNT(*) AS total FROM diary_likes WHERE diary_id = ?',
    [diaryId],
  )
  return Number(row.total)
}

module.exports = { exists, add, remove, count }
