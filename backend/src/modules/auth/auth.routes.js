import { Router } from 'express'

import * as controller from './auth.controller.js'
import { config } from '../../config/index.js'
import { requireAuth } from '../../middlewares/auth.js'
import { rateLimit } from '../../middlewares/rateLimit.js'

export const authRouter = Router()

// 비밀번호 대입 공격을 막기 위해 로그인 / 회원가입 시도 횟수를 제한한다.
const authLimiter = rateLimit({
  ...config.authRateLimit,
  message: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.',
})

authRouter.post('/signup', authLimiter, controller.signup)
authRouter.post('/login', authLimiter, controller.login)
authRouter.get('/me', requireAuth, controller.me)
authRouter.post('/logout', controller.logout)

export default authRouter
