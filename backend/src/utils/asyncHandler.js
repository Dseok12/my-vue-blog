/**
 * async 컨트롤러의 오류를 express 오류 처리기로 넘겨준다.
 * 모든 라우터 핸들러는 이 함수로 감싼다.
 */
function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}

module.exports = asyncHandler
