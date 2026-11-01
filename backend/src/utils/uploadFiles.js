/** 업로드 폴더의 파일을 다루는 도우미 */
import fs from 'node:fs'
import path from 'node:path'

import { uploadDirectory } from '../middlewares/upload.js'

const URL_MARKER = '/uploads/'

/**
 * '/uploads/abc.png' 또는 'https://도메인/uploads/abc.png' -> 'abc.png'
 * 이 서버가 저장한 파일 주소가 아니면 빈 문자열을 돌려준다.
 */
export function filenameFromUrl(url) {
  const text = String(url || '')
  const index = text.lastIndexOf(URL_MARKER)
  if (index < 0) return ''

  const filename = text.slice(index + URL_MARKER.length)
  // '../' 같은 경로 이동을 막기 위해 순수한 파일 이름만 허용한다.
  return filename && path.basename(filename) === filename ? filename : ''
}

/** 업로드 폴더에서 파일을 지운다. 이미 없으면 조용히 넘어간다. */
export async function removeUploadedFile(filename) {
  if (!filename) return
  try {
    await fs.promises.unlink(path.join(uploadDirectory, filename))
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('[upload] 파일을 지우지 못했습니다.', error.message)
  }
}
