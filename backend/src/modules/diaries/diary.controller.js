/** /diaries 요청을 받아 서비스에 넘기고 결과를 JSON 으로 돌려준다. */
import * as diaryService from './diary.service.js'

export async function listMine(req, res) {
  res.json(await diaryService.listMine(req.user, req.query))
}

export async function listFeed(req, res) {
  res.json(await diaryService.listFeed(req.user, req.query))
}

export async function monthlyCounts(req, res) {
  res.json(await diaryService.monthlyCounts(req.user, req.query))
}

export async function get(req, res) {
  res.json(await diaryService.get(req.user, req.params.id))
}

export async function create(req, res) {
  res.status(201).json(await diaryService.create(req.user, req.body))
}

export async function update(req, res) {
  res.json(await diaryService.update(req.user, req.params.id, req.body))
}

export async function remove(req, res) {
  res.json(await diaryService.remove(req.user, req.params.id))
}

export async function toggleLike(req, res) {
  res.json(await diaryService.toggleLike(req.user, req.params.id))
}
