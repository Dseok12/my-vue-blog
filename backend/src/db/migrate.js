/**
 * 데이터베이스와 테이블을 만든다.
 *
 *   npm run db:migrate          테이블이 없으면 만든다.
 *   npm run db:migrate -- --drop  데이터베이스를 지우고 처음부터 다시 만든다.
 */
const fs = require('fs')
const path = require('path')

const mysql = require('mysql2/promise')

const config = require('./../config/env')

const SCHEMA_PATH = path.join(__dirname, 'schema.sql')

async function migrate() {
  const drop = process.argv.includes('--drop')

  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    multipleStatements: true,
  })

  try {
    if (drop) {
      await connection.query('DROP DATABASE IF EXISTS `' + config.db.database + '`')
      console.log('[DB] 기존 데이터베이스를 삭제했습니다.')
    }

    await connection.query(
      'CREATE DATABASE IF NOT EXISTS `' +
        config.db.database +
        '` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
    )
    await connection.query('USE `' + config.db.database + '`')

    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8')
    await connection.query(schema)

    console.log('[DB] ' + config.db.database + ' 준비가 끝났습니다.')
  } finally {
    await connection.end()
  }
}

migrate().catch((error) => {
  console.error('[DB] 마이그레이션에 실패했습니다.')
  console.error('      ' + error.message)
  process.exit(1)
})
