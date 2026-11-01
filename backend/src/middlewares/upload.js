/**
 * 이미지 업로드 미들웨어 (multer).
 * 용량 10MB, 확장자 jpg / jpeg / png / gif / webp 만 허용한다.
 */
const crypto = require('crypto')
const fs = require('fs')

const multer = require('multer')

const config = require('../config/env')
const ApiError = require('../utils/ApiError')

fs.mkdirSync(config.upload.directory, { recursive: true })

/** 확장자 (소문자, 점 제외) */
function getExtension(name) {
  const parts = String(name).split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : ''
}

const storage = multer.diskStorage({
  destination: (req, file, done) => done(null, config.upload.directory),
  filename: (req, file, done) => {
    const extension = getExtension(file.originalname)
    const unique = Date.now() + '-' + crypto.randomBytes(8).toString('hex')
    done(null, unique + '.' + extension)
  },
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

const uploader = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxBytes, files: 1 },
})

module.exports = {
  uploadImage: uploader.single('image'),
}
