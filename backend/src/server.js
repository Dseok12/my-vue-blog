/** 서버 실행 진입점. (npm run dev / npm start) */
import { createApp } from './app.js'
import { config } from './config/index.js'
import { pool } from './db/pool.js'

async function checkDatabase() {
  const connection = await pool.getConnection()
  try {
    await connection.ping()
  } finally {
    connection.release()
  }
}

async function start() {
  try {
    await checkDatabase()
    console.log('[db] ' + config.db.database + ' 에 연결했습니다.')
  } catch (error) {
    console.error('[db] 데이터베이스에 연결하지 못했습니다:', error.message)
    console.error('     .env 의 DB_HOST / DB_USER / DB_PASSWORD / DB_NAME 을 확인하고,')
    console.error('     처음이라면 npm run db:migrate 를 먼저 실행해 주세요.')
    process.exit(1)
  }

  const server = createApp().listen(config.port, () => {
    console.log('[api] http://localhost:' + config.port + '/api 에서 실행 중입니다.')
  })

  /** Ctrl+C 등으로 종료할 때 연결을 정리한다. */
  const shutdown = async (signal) => {
    console.log('\n[api] ' + signal + ' 수신 - 서버를 정리합니다.')
    server.close(async () => {
      await pool.end()
      process.exit(0)
    })
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

start()
