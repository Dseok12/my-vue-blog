/**
 * 이미지 업로드 미들웨어 (multer).
 * 용량 10MB, 확장자 jpg / jpeg / png / gif / webp 만 허용한다.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import multer from 'multer'

import { config } from '../config/index.js'
import { ApiError } from '../utils/ApiError.js'
import { newId } from '../utils/id.js'

/** backend/uploads 폴더 (실행 위치와 상관없이 같은 곳을 가리킨다) */
const backendRoot = fileURLToPath(new URL('../../', import.meta.url))
export const uploadDirectory = path.resolve(backendRoot, config.upload.directory)

fs.mkdirSync(uploadDirectory, { recursive: true })

function getExtension(name) {
  const parts = String(name).split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : ''
}

const storage = multer.diskStorage({
  destination: (req, file, done) => done(null, uploadDirectory),
  filename: (req, file, done) => done(null, newId() + '.' + getExtension(file.originalname)),
})

function fileFilter(req, file, done) {
  const extension = getExtension(file.originalname)
  const allowedExtension = config.upload.allowedExtensions.includes(extension)
  const allowedMime = config.upload.allowedMimeTypes.includes(file.mimetype)

  if (!allowedExtension || !allowedMime) {
    done(
      ApiError.badRequest(
        config.upload.allowedExtensions.join(', ') + ' 형식만 업로드할 수 있습니다.',
      ),
    )
    return
  }
  done(null, true)
}

/** 이미지 한 장을 'image' 필드로 받는다. */
export const uploadSingleImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxBytes, files: 1 },
}).single('image')
