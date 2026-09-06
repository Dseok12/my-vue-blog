import { Router } from 'express'

import * as controller from './user.controller.js'
import { requireAuth } from '../../middlewares/auth.js'

export const userRouter = Router()

userRouter.use(requireAuth)

// '/me' 는 '/:id' 보다 먼저 등록한다.
userRouter.patch('/me', controller.updateMe)

userRouter.get('/:id', controller.profile)
userRouter.get('/:id/diaries', controller.diaries)

export default userRouter
