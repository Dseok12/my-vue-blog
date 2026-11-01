/** axios 인스턴스 - 실제 백엔드와 통신할 때 사용한다. */
import axios from 'axios'

import { API_BASE_URL, STORAGE_KEYS } from '@/config'

/** 화면에서 그대로 보여줄 수 있는 형태로 정규화된 API 오류 */
export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

/**
 * 로그인이 만료되어 401 을 받았을 때 실행할 함수.
 * api 폴더는 라우터·스토어를 모르게 두고, 실제 처리는 main.js 에서 등록한다.
 */
let unauthorizedHandler = null

export function onUnauthorized(handler) {
  unauthorizedHandler = handler
}

/** 로그인 / 회원가입 / 내 정보 요청의 401 은 각 화면에서 직접 처리한다. */
function isAuthRequest(config) {
  return String(config?.url || '').startsWith('/auth/')
}

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.token)
  if (token) {
    config.headers.Authorization = 'Bearer ' + token
  }
  return config
})

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status ?? 0
    if (status === 401 && !isAuthRequest(error.config)) unauthorizedHandler?.()

    const message =
      error.response?.data?.message ||
      (status === 0 ? '서버에 연결할 수 없습니다.' : '요청을 처리하지 못했습니다.')
    return Promise.reject(new ApiError(message, status))
  },
)
