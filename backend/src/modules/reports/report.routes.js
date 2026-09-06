import { Router } from 'express'

import * as controller from './report.controller.js'

// mergeParams: true 여야 위쪽 라우터의 :id (글 id) 를 여기서도 읽을 수 있다.
export const reportRouter = Router({ mergeParams: true })

reportRouter.post('/', controller.create)

export default reportRouter
