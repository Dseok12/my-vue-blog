/** users 행 -> 프론트엔드 User 형태 */
const { toIso } = require('../utils/date')

function toPublicUser(row) {
  if (!row) return null
  return {
    id: String(row.id),
    email: row.email,
    nickname: row.nickname,
    createdAt: toIso(row.created_at),
  }
}

module.exports = { toPublicUser }
