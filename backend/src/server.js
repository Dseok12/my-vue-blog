/** 서버 실행 진입점. (npm run dev / npm start) */
import { createApp } from './app.js'
import { config } from './config/index.js'
import { pool, query } from './db/pool.js'

async function checkDatabase() {
  const connection = await pool.getConnection()
  try {
    await connection.ping()
  } finally {
    connection.release()
  }
}

/**
 * 코드가 기대하는 테이블 / 컬럼이 실제로 있는지 확인한다.
 * 예전 구조의 DB 에 연결되면 모든 요청이 "서버에서 문제가 발생했습니다" 로만 보여서
 * 원인을 찾기 어렵다. 시작할 때 바로 알려 준다.
 */
const REQUIRED_COLUMNS = [
  ['users', 'password_hash'],
  ['diaries', 'author_id'],
  ['diaries', 'is_hidden'],
  ['diary_images', 'sort_order'],
  ['comments', 'author_id'],
  ['diary_likes', 'user_id'],
  ['diary_reports', 'reporter_id'],
]

async function findMissingColumns() {
  const rows = await query(
    'SELECT table_name AS t, column_name AS c FROM information_schema.columns' +
      ' WHERE table_schema = ?',
    [config.db.database],
  )
  const existing = new Set(rows.map((row) => row.t + '.' + row.c))
  return REQUIRED_COLUMNS.map(([table, column]) => table + '.' + column).filter(
    (name) => !existing.has(name),
  )
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

  const missing = await findMissingColumns()
  if (missing.length > 0) {
    console.error('[db] ' + config.db.database + ' 의 테이블 구조가 현재 코드와 맞지 않습니다.')
    console.error('     없는 항목: ' + missing.join(', '))
    console.error('     · 처음 실행이라면          : npm run db:migrate')
    console.error('     · 예전 버전의 DB 라면      : .env 의 DB_NAME 을 새 이름으로 바꾸고 npm run db:migrate')
    console.error('     · 데이터를 지워도 된다면   : npm run db:reset  (모든 데이터가 삭제됩니다)')
    await pool.end()
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
