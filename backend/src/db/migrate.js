/**
 * 데이터베이스와 테이블을 만든다.
 *
 *   npm run db:migrate            테이블이 없으면 만든다. (기존 데이터 유지)
 *   npm run db:migrate -- --fresh 데이터베이스를 통째로 지우고 다시 만든다. (데이터 전부 삭제)
 */
import fs from 'node:fs/promises'

import mysql from 'mysql2/promise'

import { config } from '../config/index.js'

const isFresh = process.argv.includes('--fresh')

/** 데이터베이스 이름에 이상한 문자가 들어오지 않게 확인한다. */
function safeDatabaseName(name) {
  if (!/^[A-Za-z0-9_]+$/.test(name)) {
    throw new Error('DB_NAME 은 영문, 숫자, 밑줄만 사용할 수 있습니다: ' + name)
  }
  return name
}

async function main() {
  const database = safeDatabaseName(config.db.database)

  // 데이터베이스 자체를 만들어야 하므로 database 를 지정하지 않고 접속한다.
  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    multipleStatements: true,
  })

  try {
    if (isFresh) {
      console.log('[migrate] --fresh : ' + database + ' 의 모든 데이터를 지우고 다시 만듭니다.')
      await connection.query('DROP DATABASE IF EXISTS `' + database + '`')
    }

    await connection.query(
      'CREATE DATABASE IF NOT EXISTS `' +
        database +
        '` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci',
    )
    await connection.changeUser({ database })

    const schema = await fs.readFile(new URL('./schema.sql', import.meta.url), 'utf8')
    await connection.query(schema)

    const [tables] = await connection.query('SHOW TABLES')
    console.log('[migrate] ' + database + ' 준비 완료 - 테이블 ' + tables.length + '개')
    tables.forEach((row) => console.log('           - ' + Object.values(row)[0]))
  } finally {
    await connection.end()
  }
}

main().catch((error) => {
  console.error('[migrate] 실패:', error.message)
  process.exit(1)
})
