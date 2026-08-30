/** 어떤 라우터에도 걸리지 않은 요청 */
const ApiError = require('../utils/ApiError')

function notFound(req, res, next) {
  next(ApiError.notFound('요청한 주소를 찾을 수 없습니다.'))
}

module.exports = notFound
