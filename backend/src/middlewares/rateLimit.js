/**
 * 요청 횟수 제한 - 비밀번호를 무작위로 대입하는 공격을 늦춘다.
 * 같은 IP 가 windowMs 동안 max 번을 넘게 요청하면 429 를 돌려준다.
 *
 * 기록은 서버 메모리에 둔다. 서버를 여러 대 띄우면 서로 기록을 모르므로
 * 그때는 Redis 같은 공용 저장소를 쓰는 라이브러리(express-rate-limit 등)로 바꾼다.
 */
const ApiError = require('../utils/ApiError')

/** 기록이 이 개수를 넘으면 만료된 것을 한 번 청소한다. */
const SWEEP_THRESHOLD = 1000

function rateLimit({ windowMs, max, message = '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' }) {
  /** IP -> { count, resetAt } */
  const hits = new Map()

  function sweep(now) {
    hits.forEach((entry, key) => {
      if (entry.resetAt <= now) hits.delete(key)
    })
  }

  return function rateLimitMiddleware(req, res, next) {
    const now = Date.now()
    if (hits.size > SWEEP_THRESHOLD) sweep(now)

    const key = req.ip || 'unknown'
    let entry = hits.get(key)
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs }
      hits.set(key, entry)
    }

    entry.count += 1
    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)))
      next(ApiError.tooManyRequests(message))
      return
    }
    next()
  }
}

module.exports = rateLimit
