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

  /**
   * Nginx 같은 프록시 뒤에서 실행할 때 거치는 프록시 수 (보통 1).
   * 설정하면 X-Forwarded-For 로 실제 접속 IP 를 읽는다. (로그인 시도 제한이 IP 기준이라 필요)
   * 프록시 없이 직접 접속받을 때는 비워 둔다. (비워야 IP 를 위조할 수 없다)
   */
  trustProxy: toNumber(process.env.TRUST_PROXY, 0),

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

  /**
   * 관리자 이메일 목록 (쉼표 구분).
   * 이 이메일로 가입/로그인한 회원은 신고된 글을 검토하고 가림을 해제할 수 있다.
   */
  adminEmails: (process.env.ADMIN_EMAILS || 'dnjstjr1031@gmail.com')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),

  report: {
    /** 신고가 접수되면 이 주소로 메일을 보낸다. */
    to: (process.env.REPORT_EMAIL || 'dnjstjr1031@gmail.com').trim(),
  },

  /**
   * 메일 발송(SMTP) 설정. SMTP_HOST 가 비어 있으면 메일을 실제로 보내지 않고
   * 콘솔에만 남긴다. (개발 중에는 설정 없이도 나머지 기능이 정상 동작한다)
   */
  mail: {
    host: process.env.SMTP_HOST || '',
    port: toNumber(process.env.SMTP_PORT, 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@diary.local',
  },

  /** 로그인 / 회원가입 요청 제한 - 같은 IP 기준 */
  authRateLimit: {
    windowMs: toNumber(process.env.AUTH_RATE_WINDOW_MINUTES, 15) * 60 * 1000,
    max: toNumber(process.env.AUTH_RATE_MAX, 20),
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
