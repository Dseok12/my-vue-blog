/** 이미지 파일 검증 및 변환 유틸 */
import { IMAGE_ALLOWED_EXTENSIONS, IMAGE_ALLOWED_MIME_TYPES, IMAGE_MAX_BYTES } from '@/config'

/** 파일 크기를 사람이 읽기 쉬운 문자열로 바꾼다. */
export function formatBytes(bytes) {
  if (!bytes) return '0B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, index)
  return value.toFixed(index === 0 ? 0 : 1) + units[index]
}

/** 확장자 추출 (소문자) */
export function getExtension(name) {
  const parts = String(name).split('.')
  return parts.length > 1 ? parts.pop().toLowerCase() : ''
}

/** 업로드 가능한 이미지인지 확인한다. 문제가 없으면 빈 문자열을 반환한다. */
export function validateImageFile(file) {
  if (!file) return '파일을 선택해 주세요.'

  const extension = getExtension(file.name)
  const allowedExtension = IMAGE_ALLOWED_EXTENSIONS.includes(extension)
  const allowedMime = IMAGE_ALLOWED_MIME_TYPES.includes(file.type)
  if (!allowedExtension || !allowedMime) {
    return IMAGE_ALLOWED_EXTENSIONS.join(', ') + ' 형식만 업로드할 수 있습니다.'
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return '이미지 용량은 ' + formatBytes(IMAGE_MAX_BYTES) + ' 이하여야 합니다.'
  }
  return ''
}

/** 파일을 data URL 문자열로 읽는다. */
export function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('이미지를 읽지 못했습니다.'))
    reader.readAsDataURL(file)
  })
}

/**
 * 이미지를 축소해 data URL 로 만든다.
 * (mock 모드에서 브라우저 저장 공간을 아끼기 위한 용도이며,
 *  gif 는 애니메이션 보존을 위해 원본 그대로 사용한다.)
 */
export async function toStorableDataUrl(file, { maxEdge = 1280, quality = 0.72 } = {}) {
  const dataUrl = await readAsDataUrl(file)
  if (file.type === 'image/gif') return dataUrl

  try {
    const image = await loadImage(dataUrl)
    const ratio = Math.min(1, maxEdge / Math.max(image.width, image.height))
    if (ratio === 1 && file.size < 400 * 1024) return dataUrl

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(image.width * ratio)
    canvas.height = Math.round(image.height * ratio)
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', quality)
  } catch {
    // 축소에 실패하면 원본을 그대로 사용한다.
    return dataUrl
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('이미지를 불러오지 못했습니다.'))
    image.src = src
  })
}
