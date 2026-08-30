/** 비밀번호 해시 - 평문은 절대 저장하지 않는다. */
const bcrypt = require('bcryptjs')

const SALT_ROUNDS = 10

function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

function verifyPassword(plain, hashed) {
  return bcrypt.compare(plain, hashed)
}

module.exports = { hashPassword, verifyPassword }
