/**
 * Express 앱 구성.
 *
 * 참고: Express 5 는 async 라우터에서 발생한 오류를 자동으로 에러 핸들러로 넘겨 준다.
 *       그래서 컨트롤러마다 try / catch 를 쓰지 않는다.
 */
import cors from 'cors'
import express from 'express'
import morgan from 'morgan'

import { config } from './config/index.js'
import { errorHandler, notFoundHandler } from './middlewares/error.js'
import { securityHeaders } from './middlewares/securityHeaders.js'
import { uploadDirectory } from './middlewares/upload.js'
import { apiRouter } from './routes/index.js'

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.use(securityHeaders)
  app.use(cors({ origin: config.corsOrigins, credentials: true }))
  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: true }))

  if (!config.isProduction) {
    app.use(morgan('dev'))
  }

  // 업로드된 이미지 파일 제공 (예: /uploads/abcd-1234.png)
  app.use('/uploads', express.static(uploadDirectory, { maxAge: '7d', fallthrough: true }))

  app.use('/api', apiRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

export default createApp
