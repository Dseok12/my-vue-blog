import { Router } from 'express'

import * as controller from './auth.controller.js'
import { requireAuth } from '../../middlewares/auth.js'

export const authRouter = Router()

authRouter.post('/signup', controller.signup)
authRouter.post('/login', controller.login)
authRouter.get('/me', requireAuth, controller.me)
authRouter.post('/logout', controller.logout)

export default authRouter
