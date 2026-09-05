/**
 * 이미지 업로드.
 * 파일은 backend/uploads 에 저장하고, 화면에서 쓸 주소를 돌려준다.
 */
import { Router } from 'express'

import { config } from '../../config/index.js'
import { requireAuth } from '../../middlewares/auth.js'
import { uploadSingleImage } from '../../middlewares/upload.js'
import { ApiError } from '../../utils/ApiError.js'

export const uploadRouter = Router()

uploadRouter.post('/image', requireAuth, uploadSingleImage, (req, res) => {
  if (!req.file) throw ApiError.badRequest('파일을 선택해 주세요.')

  // PUBLIC_BASE_URL 을 채우면 절대 주소로, 비워 두면 '/uploads/파일명' 으로 돌려준다.
  const url = config.upload.publicBaseUrl + '/uploads/' + req.file.filename

  res.status(201).json({
    url,
    name: req.file.originalname,
    size: req.file.size,
  })
})

export default uploadRouter
