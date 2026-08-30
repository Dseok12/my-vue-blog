/** 회원가입 / 로그인 규칙 */
const ApiError = require('../utils/ApiError')
const userModel = require('../models/userModel')
const { toPublicUser } = require('../serializers/userSerializer')
const { createToken } = require('../utils/token')
const { hashPassword, verifyPassword } = require('../utils/password')

async function signup({ email, nickname, password }) {
  if (await userModel.findByEmail(email)) {
    throw ApiError.conflict('이미 가입된 이메일입니다.')
  }
  if (await userModel.findByNickname(nickname)) {
    throw ApiError.conflict('이미 사용 중인 닉네임입니다.')
  }

  const passwordHash = await hashPassword(password)
  const user = await userModel.create({ email, nickname, passwordHash })

  return { user: toPublicUser(user), token: createToken(user.id) }
}

async function login({ email, password }) {
  const user = await userModel.findByEmail(email)
  const matched = user ? await verifyPassword(password, user.password_hash) : false

  // 가입 여부가 드러나지 않도록 오류 메시지를 하나로 통일한다.
  if (!user || !matched) {
    throw ApiError.unauthorized('이메일 또는 비밀번호가 올바르지 않습니다.')
  }

  return { user: toPublicUser(user), token: createToken(user.id) }
}

async function getProfile(userId) {
  const user = await userModel.findById(userId)
  if (!user) throw ApiError.unauthorized('로그인이 필요합니다.')
  return { user: toPublicUser(user) }
}

module.exports = { signup, login, getProfile }
