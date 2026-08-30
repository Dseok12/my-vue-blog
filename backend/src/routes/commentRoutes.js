/** /api/diaries/:diaryId/comments */
const express = require('express')

const commentController = require('../controllers/commentController')

// 부모 라우터의 :diaryId 를 그대로 쓰기 위해 mergeParams 를 켠다.
const router = express.Router({ mergeParams: true })

router.get('/', commentController.list)
router.post('/', commentController.create)
router.delete('/:commentId', commentController.remove)

module.exports = router
