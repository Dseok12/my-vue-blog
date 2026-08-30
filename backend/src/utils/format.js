/** 표시용 문자열 변환 */

/** 바이트 수를 '10.0MB' 처럼 읽기 쉬운 문자열로 바꾼다. */
function formatBytes(bytes) {
  if (!bytes) return '0B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, index)
  return value.toFixed(index === 0 ? 0 : 1) + units[index]
}

module.exports = { formatBytes }
