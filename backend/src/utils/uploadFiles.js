/** 업로드 폴더의 파일을 다루는 도우미 */
const fs = require('fs')
const path = require('path')

const config = require('../config/env')

const URL_PREFIX = config.upload.publicPath + '/'

/**
 * '/api/uploads/files/abc.png' -> 'abc.png'
 * 이 서버가 저장한 파일이 아니면 빈 문자열을 돌려준다.
 */
function filenameFromUrl(url) {
  const text = String(url || '')
  if (!text.startsWith(URL_PREFIX)) return ''

  const filename = text.slice(URL_PREFIX.length)
  // '../' 같은 경로 이동을 막기 위해 순수한 파일 이름만 허용한다.
  return filename && path.basename(filename) === filename ? filename : ''
}

/** 업로드 폴더에서 파일을 지운다. 이미 없으면 조용히 넘어간다. */
async function removeUploadedFile(filename) {
  if (!filename) return
  try {
    await fs.promises.unlink(path.join(config.upload.directory, filename))
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('[업로드] 파일을 지우지 못했습니다.', error.message)
  }
}

module.exports = { filenameFromUrl, removeUploadedFile }
