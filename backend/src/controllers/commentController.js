/** /diaries/:diaryId/comments/* */
const asyncHandler = require('../utils/asyncHandler')
const commentService = require('../services/commentService')
const { parseCommentPayload, parseId } = require('../utils/validators')

const diaryIdOf = (req) => parseId(req.params.diaryId, '다이어리를 찾을 수 없습니다.')

const list = asyncHandler(async (req, res) => {
  res.json(await commentService.list(diaryIdOf(req), req.user.id))
})

const create = asyncHandler(async (req, res) => {
  const result = await commentService.create(
    diaryIdOf(req),
    req.user.id,
    parseCommentPayload(req.body),
  )
  res.status(201).json(result)
})

const remove = asyncHandler(async (req, res) => {
  const commentId = parseId(req.params.commentId, '댓글을 찾을 수 없습니다.')
  res.json(await commentService.remove(diaryIdOf(req), commentId, req.user.id))
})

module.exports = { list, create, remove }
