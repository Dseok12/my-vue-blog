/** 신고 사유 코드와 한국어 라벨. (프론트엔드 config 와 같은 목록) */
export const REPORT_REASON_LABELS = {
  obscene: '음란성',
  defamation: '비방',
  political: '정치적 게시물',
  violent: '잔인한 게시물',
  scam: '사기',
  threat: '협박',
  illegal: '불법거래',
  etc: '기타',
}

export function reasonLabel(code) {
  return REPORT_REASON_LABELS[code] || code
}
