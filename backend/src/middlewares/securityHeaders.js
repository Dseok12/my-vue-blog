/**
 * 기본 보안 헤더 - 모든 응답에 붙인다.
 * 더 많은 헤더가 필요해지면 helmet 라이브러리로 바꾸면 된다.
 */
const HEADERS = {
  // 브라우저가 Content-Type 을 무시하고 내용을 추측하지 못하게 한다.
  // (이미지로 올린 파일이 스크립트로 실행되는 것을 막는다)
  'X-Content-Type-Options': 'nosniff',
  // 다른 사이트가 이 서버의 응답을 iframe 안에 넣지 못하게 한다.
  'X-Frame-Options': 'DENY',
  // 다른 사이트로 이동할 때 주소의 경로까지는 넘기지 않는다.
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // API 서버는 JSON 과 이미지만 주므로 그 외의 실행을 모두 막는다.
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
}

export function securityHeaders(req, res, next) {
  res.set(HEADERS)
  next()
}

export default securityHeaders
