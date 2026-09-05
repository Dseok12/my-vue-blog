import { Router } from 'express'

import * as controller from './comment.controller.js'

// mergeParams: true 여야 위쪽 라우터의 :id (글 id) 를 여기서도 읽을 수 있다.
export const commentRouter = Router({ mergeParams: true })

commentRouter.get('/', controller.list)
commentRouter.post('/', controller.create)
commentRouter.delete('/:commentId', controller.remove)

export default commentRouter
