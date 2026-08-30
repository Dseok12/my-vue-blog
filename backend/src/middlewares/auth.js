/**
 * 인증 미들웨어 - Authorization: Bearer <token> 을 확인한다.
 * 통과하면 req.user 에 로그인한 사용자 정보를 넣어 준다.
 */
const ApiError = require('../utils/ApiError')
const userModel = require('../models/userModel')
const { readUserId } = require('../utils/token')
const asyncHandler = require('../utils/asyncHandler')

function readBearerToken(req) {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) return ''
  return header.slice(7).trim()
}

const requireAuth = asyncHandler(async (req, res, next) => {
  const token = readBearerToken(req)
  if (!token) throw ApiError.unauthorized()

  const userId = readUserId(token)
  if (!userId) throw ApiError.unauthorized('로그인 정보가 만료되었습니다. 다시 로그인해 주세요.')

  const user = await userModel.findById(userId)
  if (!user) throw ApiError.unauthorized()

  req.user = { id: String(user.id), email: user.email, nickname: user.nickname }
  next()
})

module.exports = { requireAuth }
