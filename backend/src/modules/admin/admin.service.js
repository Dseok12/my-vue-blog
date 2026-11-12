/**
 * 관리자 - 신고 검토 / 가림 해제.
 * 라우터에서 requireAdmin 을 이미 통과했으므로 여기서는 권한 검사를 다시 하지 않는다.
 */
import { execute, query, queryOne } from '../../db/pool.js'
import { ApiError } from '../../utils/ApiError.js'
import { toIso } from '../../utils/date.js'
import { reasonLabel } from '../reports/report.constants.js'

const REPORT_STATUSES = ['pending', 'reviewed', 'dismissed']

function serializeReport(row) {
  return {
    id: row.id,
    diaryId: row.diary_id,
    diaryTitle: row.diary_title,
    diaryHidden: Boolean(Number(row.diary_hidden)),
    diaryVisibility: row.diary_visibility,
    authorId: row.author_id,
    authorNickname: row.author_nickname,
    reporterNickname: row.reporter_nickname,
    reason: row.reason,
    reasonLabel: reasonLabel(row.reason),
    detail: row.detail,
    status: row.status,
    createdAt: toIso(row.created_at),
    handledAt: toIso(row.handled_at),
  }
}

/** 신고 목록 - status 를 주면 그 상태만, 없으면 전체 (화면의 기본 탭은 처리 대기) */
export async function listReports(params = {}) {
  const status = REPORT_STATUSES.includes(params.status) ? params.status : null
  const where = status ? ' WHERE r.status = ?' : ''
  const values = status ? [status] : []

  const rows = await query(
    'SELECT r.id, r.diary_id, r.reason, r.detail, r.status, r.created_at, r.handled_at,' +
      ' d.title AS diary_title, d.is_hidden AS diary_hidden, d.visibility AS diary_visibility,' +
      ' author.id AS author_id, author.nickname AS author_nickname,' +
      ' reporter.nickname AS reporter_nickname' +
      ' FROM diary_reports r' +
      ' JOIN diaries d ON d.id = r.diary_id' +
      ' JOIN users author ON author.id = d.author_id' +
      ' JOIN users reporter ON reporter.id = r.reporter_id' +
      where +
      ' ORDER BY r.created_at DESC',
    values,
  )
  return { items: rows.map(serializeReport) }
}

async function findDiaryOrFail(diaryId) {
  const diary = await queryOne('SELECT id FROM diaries WHERE id = ?', [diaryId])
  if (!diary) throw ApiError.notFound('다이어리를 찾을 수 없습니다.')
  return diary
}

/** 가림 해제 - 관련 신고를 '검토함'으로 바꾼다. */
export async function unhideDiary(diaryId) {
  await findDiaryOrFail(diaryId)
  await execute('UPDATE diaries SET is_hidden = 0 WHERE id = ?', [diaryId])
  await execute(
    "UPDATE diary_reports SET status = 'reviewed', handled_at = ?" +
      " WHERE diary_id = ? AND status = 'pending'",
    [new Date(), diaryId],
  )
  return { isHidden: false }
}

/** 다시 가림 처리 */
export async function hideDiary(diaryId) {
  await findDiaryOrFail(diaryId)
  await execute('UPDATE diaries SET is_hidden = 1 WHERE id = ?', [diaryId])
  return { isHidden: true }
}

/** 신고 반려 - 가림은 유지하지 않고 해제, 신고를 '반려'로 표시 */
export async function dismissReport(reportId) {
  const report = await queryOne('SELECT id, diary_id FROM diary_reports WHERE id = ?', [reportId])
  if (!report) throw ApiError.notFound('신고를 찾을 수 없습니다.')

  await execute(
    "UPDATE diary_reports SET status = 'dismissed', handled_at = ? WHERE id = ?",
    [new Date(), reportId],
  )

  // 이 글에 대기 중인 다른 신고가 없으면 가림을 해제한다.
  const pending = await queryOne(
    "SELECT COUNT(*) AS count FROM diary_reports WHERE diary_id = ? AND status = 'pending'",
    [report.diary_id],
  )
  if (Number(pending.count) === 0) {
    await execute('UPDATE diaries SET is_hidden = 0 WHERE id = ?', [report.diary_id])
  }
  return {}
}
