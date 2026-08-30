/** 댓글 / 대댓글 규칙 */
const ApiError = require('../utils/ApiError')
const commentModel = require('../models/commentModel')
const diaryService = require('./diaryService')
const { toComment, toCommentList } = require('../serializers/commentSerializer')

async function list(diaryId, viewerId) {
  const diary = await diaryService.findOrFail(diaryId)
  diaryService.assertReadable(diary, viewerId)

  const rows = await commentModel.findByDiaryId(diaryId)
  return { items: toCommentList(rows) }
}

async function create(diaryId, viewerId, { content, parentId }) {
  const diary = await diaryService.findOrFail(diaryId)
  diaryService.assertPublic(diary, '공개된 글에만 댓글을 쓸 수 있습니다.')

  let rootParentId = null
  if (parentId) {
    const parent = await commentModel.findParent(diaryId, parentId)
    if (!parent) throw ApiError.notFound('원본 댓글을 찾을 수 없습니다.')
    // 대댓글의 대댓글은 같은 단계로 묶어 2단계까지만 유지한다.
    rootParentId = parent.parent_id === null ? parent.id : parent.parent_id
  }

  const row = await commentModel.create({
    diaryId,
    parentId: rootParentId,
    userId: viewerId,
    content,
  })
  return { comment: toComment(row) }
}

async function remove(diaryId, commentId, viewerId) {
  const comment = await commentModel.findById(commentId)
  if (!comment || String(comment.diary_id) !== String(diaryId)) {
    throw ApiError.notFound('댓글을 찾을 수 없습니다.')
  }
  if (String(comment.user_id) !== String(viewerId)) {
    throw ApiError.forbidden('삭제 권한이 없습니다.')
  }

  await commentModel.remove(commentId)
  return {}
}

module.exports = { list, create, remove }
