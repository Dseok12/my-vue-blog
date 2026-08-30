/**
 * MySQL 커넥션 풀.
 *
 * timezone: 'Z' 로 두어 DATETIME 값을 항상 UTC 로 읽고 쓴다.
 * (날짜 표시는 dateKey 컬럼에 한국 시간 기준 'YYYY-MM-DD' 로 따로 저장한다.)
 */
const mysql = require('mysql2/promise')

const config = require('./env')

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4_unicode_ci',
  timezone: 'Z',
  dateStrings: false,
  supportBigNumbers: true,
  bigNumberStrings: true,
})

/** SELECT 결과 행 배열을 반환한다. */
async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params)
  return rows
}

/** SELECT 결과의 첫 행(없으면 null)을 반환한다. */
async function queryOne(sql, params = []) {
  const rows = await query(sql, params)
  return rows.length ? rows[0] : null
}

/** INSERT/UPDATE/DELETE 결과 정보를 반환한다. */
async function execute(sql, params = []) {
  const [result] = await pool.query(sql, params)
  return result
}

/**
 * 트랜잭션으로 여러 쿼리를 묶어서 실행한다.
 * handler 는 커넥션을 인자로 받는다.
 */
async function transaction(handler) {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const result = await handler(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

module.exports = { pool, query, queryOne, execute, transaction }
