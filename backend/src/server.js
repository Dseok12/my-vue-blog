/** 서버 실행 진입점 */
const app = require('./app')
const config = require('./config/env')
const { pool } = require('./config/db')

async function start() {
  try {
    // 시작할 때 DB 연결을 한 번 확인한다.
    const connection = await pool.getConnection()
    connection.release()
    console.log('[DB] ' + config.db.database + ' 연결 확인 완료')
  } catch (error) {
    console.error('[DB] 연결에 실패했습니다. .env 설정을 확인해 주세요.')
    console.error('      ' + error.message)
    process.exit(1)
  }

  const server = app.listen(config.port, () => {
    console.log('[서버] http://localhost:' + config.port + ' (' + config.env + ')')
  })

  const shutdown = async (signal) => {
    console.log('\n[서버] ' + signal + ' 신호를 받아 종료합니다.')
    server.close(async () => {
      await pool.end()
      process.exit(0)
    })
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

start()
