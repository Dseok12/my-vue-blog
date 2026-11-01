/**
 * 환경 변수 로딩.
 * 값은 이 파일에서 한 번만 읽고, 다른 파일은 여기서 가져다 쓴다.
 */
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') })

const toNumber = (value, fallback) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: toNumber(process.env.PORT, 4000),

  /** CORS 허용 주소 목록 */
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: toNumber(process.env.DB_PORT, 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'my_diary',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  /** 로그인 / 회원가입 요청 제한 - 같은 IP 기준 */
  authRateLimit: {
    windowMs: toNumber(process.env.AUTH_RATE_WINDOW_MINUTES, 15) * 60 * 1000,
    max: toNumber(process.env.AUTH_RATE_MAX, 20),
  },

  upload: {
    /** 업로드 파일이 저장되는 실제 폴더 */
    directory: path.join(__dirname, '..', '..', 'uploads'),
    /** 업로드 파일이 서비스되는 URL 앞부분 */
    publicPath: '/api/uploads/files',
    maxBytes: 10 * 1024 * 1024, // 10MB
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
}

if (config.env === 'production' && config.jwt.secret.startsWith('change-this-secret')) {
  console.warn('[경고] JWT_SECRET 이 기본값입니다. .env 에서 반드시 변경해 주세요.')
}

module.exports = config
