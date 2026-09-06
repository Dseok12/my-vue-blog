import { Router } from 'express'

import * as controller from './admin.controller.js'
import { requireAdmin, requireAuth } from '../../middlewares/auth.js'

export const adminRouter = Router()

// 관리자만 사용할 수 있다.
adminRouter.use(requireAuth, requireAdmin)

adminRouter.get('/reports', controller.listReports)
adminRouter.post('/reports/:reportId/dismiss', controller.dismissReport)
adminRouter.post('/diaries/:id/unhide', controller.unhideDiary)
adminRouter.post('/diaries/:id/hide', controller.hideDiary)

export default adminRouter
