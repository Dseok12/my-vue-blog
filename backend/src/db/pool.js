/**
 * MySQL 커넥션 풀.
 *
 * - DATE 컬럼(date_key)은 문자열 'YYYY-MM-DD' 그대로 받는다. (시간대 변환 방지)
 * - DATETIME 은 UTC 로 저장하고 UTC 로 읽는다. 화면에 보여줄 때 한국 시간으로 바꾼다.
 */
import mysql from 'mysql2/promise'

import { config } from '../config/index.js'

export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: config.db.connectionLimit,
  queueLimit: 0,
  charset: 'utf8mb4_general_ci',
  timezone: 'Z',
  dateStrings: ['DATE'],
  supportBigNumbers: true,
  bigNumberStrings: false,
})

// 세션 시간대를 UTC 로 고정해 서버 설정과 상관없이 같은 값이 저장되도록 한다.
pool.on('connection', (connection) => {
  connection.query("SET time_zone = '+00:00'")
})

/** SELECT 용 헬퍼 - 결과 배열만 돌려준다. */
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params)
  return rows
}

/** 한 건만 필요한 경우 */
export async function queryOne(sql, params = []) {
  const rows = await query(sql, params)
  return rows[0] || null
}

/** INSERT / UPDATE / DELETE 용 헬퍼 */
export async function execute(sql, params = []) {
  const [result] = await pool.execute(sql, params)
  return result
}

/**
 * 트랜잭션으로 묶어서 실행한다.
 * 콜백 안에서는 전달받은 connection 으로 쿼리해야 한다.
 */
export async function withTransaction(callback) {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export default pool
