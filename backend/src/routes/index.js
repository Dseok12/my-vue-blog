/** /api 아래의 모든 라우터를 모아 둔다. */
import { Router } from 'express'

import { authRouter } from '../modules/auth/auth.routes.js'
import { diaryRouter } from '../modules/diaries/diary.routes.js'
import { uploadRouter } from '../modules/uploads/upload.routes.js'

export const apiRouter = Router()

/** 서버가 살아 있는지 확인하는 주소 */
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

apiRouter.use('/auth', authRouter)
apiRouter.use('/diaries', diaryRouter)
apiRouter.use('/uploads', uploadRouter)

export default apiRouter
