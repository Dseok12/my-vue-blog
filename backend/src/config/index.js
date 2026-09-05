/**
 * 환경 설정 모음.
 * .env 값을 여기서 한 번만 읽어서 앱 전체가 이 파일만 참조하도록 한다.
 */
import 'dotenv/config'

function toNumber(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const env = process.env.NODE_ENV || 'development'
const isProduction = env === 'production'

/** 운영 환경에서는 반드시 .env 에 실제 값을 넣어야 한다. */
function requireInProduction(key, fallback) {
  const value = process.env[key]
  if (value) return value
  if (isProduction) {
    throw new Error('.env 에 ' + key + ' 값을 설정해 주세요.')
  }
  return fallback
}

export const config = {
  env,
  isProduction,
  port: toNumber(process.env.PORT, 4000),

  /** CORS 허용 주소 목록 (쉼표 구분) */
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: toNumber(process.env.DB_PORT, 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'my_vue_blog',
    connectionLimit: toNumber(process.env.DB_CONNECTION_LIMIT, 10),
  },

  jwt: {
    secret: requireInProduction('JWT_SECRET', 'local-dev-secret-change-me'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  upload: {
    /** 업로드 파일이 저장되는 폴더 (backend/uploads) */
    directory: process.env.UPLOAD_DIR || 'uploads',
    /** 이미지 한 장의 최대 용량 - 10MB */
    maxBytes: 10 * 1024 * 1024,
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    /** 다이어리 한 건에 붙일 수 있는 이미지 수 */
    maxCount: 5,
    /** 이미지 주소 앞에 붙일 도메인. 비워 두면 '/uploads/파일명' 형태로 돌려준다. */
    publicBaseUrl: (process.env.PUBLIC_BASE_URL || '').replace(/\/+$/, ''),
  },
}

export default config
