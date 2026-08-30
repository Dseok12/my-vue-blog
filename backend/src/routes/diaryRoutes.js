/** /api/diaries */
const express = require('express')

const diaryController = require('../controllers/diaryController')
const commentRoutes = require('./commentRoutes')

const router = express.Router()

// 고정 주소를 먼저 두어야 '/:diaryId' 에 잡히지 않는다.
router.get('/feed', diaryController.listFeed)
router.get('/monthly-counts', diaryController.monthlyCounts)

router.get('/', diaryController.listMine)
router.post('/', diaryController.create)

router.get('/:diaryId', diaryController.get)
router.put('/:diaryId', diaryController.update)
router.delete('/:diaryId', diaryController.remove)
router.post('/:diaryId/like', diaryController.toggleLike)

router.use('/:diaryId/comments', commentRoutes)

module.exports = router
