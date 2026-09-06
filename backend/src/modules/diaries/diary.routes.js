import { Router } from 'express'

import * as controller from './diary.controller.js'
import { commentRouter } from '../comments/comment.routes.js'
import { reportRouter } from '../reports/report.routes.js'
import { requireAuth } from '../../middlewares/auth.js'

export const diaryRouter = Router()

// 다이어리는 모두 로그인한 회원만 사용할 수 있다.
diaryRouter.use(requireAuth)

// '/feed', '/monthly-counts' 는 '/:id' 보다 먼저 등록해야 한다.
diaryRouter.get('/feed', controller.listFeed)
diaryRouter.get('/monthly-counts', controller.monthlyCounts)

diaryRouter.get('/', controller.listMine)
diaryRouter.post('/', controller.create)

diaryRouter.get('/:id', controller.get)
diaryRouter.put('/:id', controller.update)
diaryRouter.delete('/:id', controller.remove)
diaryRouter.post('/:id/like', controller.toggleLike)

// /diaries/:id/comments 아래는 댓글 라우터가 담당한다.
diaryRouter.use('/:id/comments', commentRouter)

// /diaries/:id/reports 아래는 신고 라우터가 담당한다.
diaryRouter.use('/:id/reports', reportRouter)

export default diaryRouter
