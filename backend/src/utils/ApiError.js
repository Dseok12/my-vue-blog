/**
 * 화면에 그대로 보여줄 수 있는 오류.
 * throw new ApiError('메시지', 400) 형태로 사용하면 에러 핸들러가 JSON 으로 바꿔 준다.
 */
export class ApiError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }

  static badRequest(message) {
    return new ApiError(message, 400)
  }

  static unauthorized(message = '로그인이 필요합니다.') {
    return new ApiError(message, 401)
  }

  static forbidden(message = '권한이 없습니다.') {
    return new ApiError(message, 403)
  }

  static notFound(message = '찾을 수 없습니다.') {
    return new ApiError(message, 404)
  }

  static conflict(message) {
    return new ApiError(message, 409)
  }

  static tooManyRequests(message = '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.') {
    return new ApiError(message, 429)
  }
}

export default ApiError
