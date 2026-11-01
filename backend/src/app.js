/** express 앱 구성 */
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const config = require('./config/env')
const routes = require('./routes')
const notFound = require('./middlewares/notFound')
const errorHandler = require('./middlewares/errorHandler')
const securityHeaders = require('./middlewares/securityHeaders')

const app = express()

app.disable('x-powered-by')
app.use(securityHeaders)

// 프론트엔드 개발 서버에서 직접 호출하는 경우를 위해 CORS 를 열어 둔다.
app.use(
  cors({
    origin: config.clientOrigins,
    credentials: false,
  }),
)

if (config.env !== 'test') {
  app.use(morgan('dev'))
}

app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

/**
 * 업로드된 이미지 파일.
 * <img> 태그는 인증 헤더를 보낼 수 없으므로 로그인 검사 앞에 둔다.
 */
app.use(
  config.upload.publicPath,
  express.static(config.upload.directory, {
    maxAge: '7d',
    fallthrough: false,
  }),
)

app.use('/api', routes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
