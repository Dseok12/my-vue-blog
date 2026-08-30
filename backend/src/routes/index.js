/**
 * API 라우터 모음. 모든 주소는 /api 아래에 붙는다.
 * (프론트엔드 api/index.js 의 목록과 1:1 로 맞춰져 있다.)
 */
const express = require('express')

const authRoutes = require('./authRoutes')
const diaryRoutes = require('./diaryRoutes')
const uploadRoutes = require('./uploadRoutes')
const { requireAuth } = require('../middlewares/auth')

const router = express.Router()

/** 서버가 살아 있는지 확인용 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

router.use('/auth', authRoutes)

// 로그인한 회원만 다이어리와 업로드를 사용할 수 있다.
router.use('/diaries', requireAuth, diaryRoutes)
router.use('/uploads', requireAuth, uploadRoutes)

module.exports = router
