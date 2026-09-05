/**
 * 로그인 확인 미들웨어.
 * Authorization: Bearer <토큰> 헤더를 읽어 req.user 를 채운다.
 */
import jwt from 'jsonwebtoken'

import { config } from '../config/index.js'
import { queryOne } from '../db/pool.js'
import { ApiError } from '../utils/ApiError.js'

/** 로그인 성공 시 내려 줄 토큰을 만든다. */
export function createToken(userId) {
  return jwt.sign({ sub: userId }, config.jwt.secret, { expiresIn: config.jwt.expiresIn })
}

function readBearerToken(req) {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) return ''
  return header.slice('Bearer '.length).trim()
}

/** 토큰의 회원을 DB 에서 찾아 돌려준다. 없으면 null */
async function findUserByToken(token) {
  if (!token) return null

  let payload
  try {
    payload = jwt.verify(token, config.jwt.secret)
  } catch {
    return null
  }

  const row = await queryOne(
    'SELECT id, email, nickname, created_at FROM users WHERE id = ?',
    [payload.sub],
  )
  return row || null
}

/** 로그인한 회원만 통과시킨다. */
export async function requireAuth(req, res, next) {
  const user = await findUserByToken(readBearerToken(req))
  if (!user) throw ApiError.unauthorized()

  req.user = user
  next()
}

/** 로그인하지 않아도 통과시키되, 로그인했다면 req.user 를 채운다. */
export async function optionalAuth(req, res, next) {
  req.user = await findUserByToken(readBearerToken(req))
  next()
}
