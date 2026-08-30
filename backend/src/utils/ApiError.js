/**
 * 화면에 그대로 보여줄 수 있는 오류.
 * message 는 사용자에게 노출되므로 한국어로 짧게 작성한다.
 */
class ApiError extends Error {
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

  static notFound(message = '요청한 정보를 찾을 수 없습니다.') {
    return new ApiError(message, 404)
  }

  static conflict(message) {
    return new ApiError(message, 409)
  }
}

module.exports = ApiError
