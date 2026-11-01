/** /api/auth */
const express = require('express')

const config = require('../config/env')
const authController = require('../controllers/authController')
const { requireAuth } = require('../middlewares/auth')
const rateLimit = require('../middlewares/rateLimit')

const router = express.Router()

// 비밀번호 대입 공격을 막기 위해 로그인 / 회원가입 시도 횟수를 제한한다.
const authLimiter = rateLimit({
  ...config.authRateLimit,
  message: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.',
})

router.post('/signup', authLimiter, authController.signup)
router.post('/login', authLimiter, authController.login)
router.get('/me', requireAuth, authController.me)
router.post('/logout', requireAuth, authController.logout)

module.exports = router
