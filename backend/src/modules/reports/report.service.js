/**
 * 게시물 신고.
 *
 * - 공개 글만 신고할 수 있고, 자신의 글은 신고할 수 없다.
 * - 한 사람이 같은 글을 두 번 신고할 수 없다.
 * - 신고가 접수되면 글은 자동으로 가림 처리된다. (요구사항 21)
 * - 관리자에게 메일로 알린다. 메일이 실패해도 신고 접수는 유지한다.
 */
import { config } from '../../config/index.js'
import { execute, queryOne } from '../../db/pool.js'
import { ApiError } from '../../utils/ApiError.js'
import { newId } from '../../utils/id.js'
import { sendMail } from '../../utils/mailer.js'
import { requireReportPayload } from '../../utils/validate.js'
import { reasonLabel } from './report.constants.js'

async function notifyAdmin({ diary, reason, detail, reporterNickname }) {
  const label = reasonLabel(reason)
  const text =
    '게시물 신고가 접수되었습니다.\n\n' +
    '· 글 제목 : ' + diary.title + '\n' +
    '· 글 ID   : ' + diary.id + '\n' +
    '· 작성자 ID : ' + diary.author_id + '\n' +
    '· 신고 사유 : ' + label + '\n' +
    '· 상세 내용 : ' + (detail || '(없음)') + '\n' +
    '· 신고자   : ' + reporterNickname + '\n\n' +
    '해당 글은 자동으로 가림 처리되었습니다.\n' +
    '관리자 페이지에서 검토 후 가림을 해제할 수 있습니다.'

  await sendMail({
    to: config.report.to,
    subject: '[나만의 다양한 diary] 게시물 신고 - ' + label,
    text,
  })
}

export async function create(viewer, diaryId, body) {
  const { reason, detail } = requireReportPayload(body)

  const diary = await queryOne(
    'SELECT id, author_id, title, visibility, is_hidden FROM diaries WHERE id = ?',
    [diaryId],
  )
  if (!diary) throw ApiError.notFound('다이어리를 찾을 수 없습니다.')
  if (diary.visibility !== 'public') {
    throw ApiError.badRequest('공개된 글만 신고할 수 있습니다.')
  }
  if (diary.author_id === viewer.id) {
    throw ApiError.badRequest('자신이 쓴 글은 신고할 수 없습니다.')
  }

  const already = await queryOne(
    'SELECT id FROM diary_reports WHERE diary_id = ? AND reporter_id = ?',
    [diaryId, viewer.id],
  )
  if (already) throw ApiError.conflict('이미 신고한 글입니다.')

  const id = newId()
  await execute(
    'INSERT INTO diary_reports (id, diary_id, reporter_id, reason, detail, status, created_at)' +
      ' VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, diaryId, viewer.id, reason, detail, 'pending', new Date()],
  )

  if (!Number(diary.is_hidden)) {
    await execute('UPDATE diaries SET is_hidden = 1 WHERE id = ?', [diaryId])
  }

  await notifyAdmin({ diary, reason, detail, reporterNickname: viewer.nickname })

  return { report: { id, reason, detail, status: 'pending' } }
}
