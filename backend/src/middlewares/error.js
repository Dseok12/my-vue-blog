/** 오류를 항상 { message } 형태의 JSON 으로 바꿔 주는 미들웨어. */
import multer from 'multer'

import { config } from '../config/index.js'
import { ApiError } from '../utils/ApiError.js'

/** 업로드 오류를 사용자에게 보여 줄 문장으로 바꾼다. */
function fromMulterError(error) {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return new ApiError('이미지 용량은 10.0MB 이하여야 합니다.', 400)
  }
  if (error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new ApiError('이미지는 한 번에 한 장씩 올릴 수 있습니다.', 400)
  }
  return new ApiError('이미지를 업로드하지 못했습니다.', 400)
}

/** 등록되지 않은 주소 */
export function notFoundHandler(req, res) {
  res.status(404).json({ message: '요청한 주소를 찾을 수 없습니다.' })
}

/* eslint-disable-next-line no-unused-vars -- 에러 미들웨어는 인자가 4개여야 한다 */
export function errorHandler(error, req, res, next) {
  let normalized = error

  if (error instanceof multer.MulterError) {
    normalized = fromMulterError(error)
  } else if (error?.type === 'entity.parse.failed' || error instanceof SyntaxError) {
    normalized = new ApiError('요청 형식이 올바르지 않습니다.', 400)
  } else if (error?.code === 'ER_DUP_ENTRY') {
    normalized = new ApiError('이미 등록된 값입니다.', 409)
  }

  const status = normalized instanceof ApiError ? normalized.status : 500

  // 서버 잘못은 자세한 내용을 숨기고 로그로만 남긴다.
  if (status >= 500) {
    console.error('[error]', error)
  }

  const message = status >= 500 ? '서버에서 문제가 발생했습니다.' : normalized.message
  const body = { message }

  if (status >= 500 && !config.isProduction) {
    body.detail = String(error?.message || error)
  }

  res.status(status).json(body)
}
