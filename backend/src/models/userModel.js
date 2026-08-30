/** users 테이블 접근 */
const db = require('../config/db')

const SELECT_USER = `
  SELECT id, email, password_hash, nickname, created_at
  FROM users
`

function findById(id) {
  return db.queryOne(SELECT_USER + ' WHERE id = ?', [id])
}

function findByEmail(email) {
  return db.queryOne(SELECT_USER + ' WHERE email = ?', [email])
}

function findByNickname(nickname) {
  return db.queryOne(SELECT_USER + ' WHERE nickname = ?', [nickname])
}

/** 새 회원을 만들고 저장된 행을 반환한다. */
async function create({ email, nickname, passwordHash }) {
  const result = await db.execute(
    `INSERT INTO users (email, password_hash, nickname, created_at)
     VALUES (?, ?, ?, ?)`,
    [email, passwordHash, nickname, new Date()],
  )
  return findById(result.insertId)
}

module.exports = { findById, findByEmail, findByNickname, create }
