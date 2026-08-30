/**
 * 마지막 오류 처리기.
 * 응답 형태는 항상 { message } 로 통일한다. (프론트엔드 api/client.js 참고)
 */
const multer = require('multer')

const config = require('../config/env')
const ApiError = require('../utils/ApiError')
const { formatBytes } = require('../utils/format')

/** multer 오류를 사용자에게 보여줄 메시지로 바꾼다. */
function fromMulterError(error) {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return ApiError.badRequest(
      '이미지 용량은 ' + formatBytes(config.upload.maxBytes) + ' 이하여야 합니다.',
    )
  }
  if (error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_UNEXPECTED_FILE') {
    return ApiError.badRequest('이미지는 한 번에 한 장씩 업로드할 수 있습니다.')
  }
  return ApiError.badRequest('이미지를 업로드하지 못했습니다.')
}

/** DB 오류 중 사용자에게 알려 줄 수 있는 것만 골라낸다. */
function fromDatabaseError(error) {
  if (error.code === 'ER_DUP_ENTRY') {
    return ApiError.conflict('이미 등록된 정보입니다.')
  }
  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return ApiError.badRequest('연결된 정보를 찾을 수 없습니다.')
  }
  if (error.code === 'ECONNREFUSED' || error.code === 'PROTOCOL_CONNECTION_LOST') {
    return new ApiError('데이터베이스에 연결할 수 없습니다.', 503)
  }
  return null
}

function toApiError(error) {
  if (error instanceof ApiError) return error
  if (error instanceof multer.MulterError) return fromMulterError(error)
  // 업로드 폴더에 없는 파일을 요청한 경우 (express.static)
  if (error.code === 'ENOENT') {
    return ApiError.notFound('이미지를 찾을 수 없습니다.')
  }
  if (error.type === 'entity.parse.failed') {
    return ApiError.badRequest('요청 형식이 올바르지 않습니다.')
  }
  if (error.type === 'entity.too.large') {
    return ApiError.badRequest('요청 크기가 너무 큽니다.')
  }
  return fromDatabaseError(error)
}

// eslint-disable-next-line no-unused-vars -- express 오류 처리기는 인자가 4개여야 한다.
function errorHandler(error, req, res, next) {
  const apiError = toApiError(error)

  if (!apiError) {
    console.error('[처리하지 못한 오류]', error)
    res.status(500).json({ message: '요청을 처리하지 못했습니다.' })
    return
  }

  if (apiError.status >= 500) console.error('[서버 오류]', error)
  res.status(apiError.status).json({ message: apiError.message })
}

module.exports = errorHandler
