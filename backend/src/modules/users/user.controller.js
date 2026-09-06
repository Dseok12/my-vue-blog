/** /users 요청을 받아 서비스에 넘긴다. */
import * as userService from './user.service.js'

export async function profile(req, res) {
  res.json(await userService.getProfile(req.user, req.params.id))
}

export async function diaries(req, res) {
  res.json(await userService.listDiaries(req.user, req.params.id, req.query))
}

export async function updateMe(req, res) {
  res.json(await userService.updateMe(req.user, req.body))
}
