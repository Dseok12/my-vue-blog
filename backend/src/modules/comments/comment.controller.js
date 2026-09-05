/** /diaries/:id/comments 요청을 처리한다. */
import * as commentService from './comment.service.js'

export async function list(req, res) {
  res.json(await commentService.list(req.user.id, req.params.id))
}

export async function create(req, res) {
  res.status(201).json(await commentService.create(req.user.id, req.params.id, req.body))
}

export async function remove(req, res) {
  res.json(await commentService.remove(req.user.id, req.params.id, req.params.commentId))
}
