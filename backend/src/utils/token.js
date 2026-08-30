/** JWT 발급 / 검증 */
const jwt = require('jsonwebtoken')

const config = require('./../config/env')

/** 사용자 id 로 액세스 토큰을 만든다. */
function createToken(userId) {
  return jwt.sign({ sub: String(userId) }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  })
}

/** 토큰이 유효하면 사용자 id(문자열)를, 아니면 null 을 반환한다. */
function readUserId(token) {
  try {
    const payload = jwt.verify(token, config.jwt.secret)
    return payload.sub ? String(payload.sub) : null
  } catch {
    return null
  }
}

module.exports = { createToken, readUserId }
