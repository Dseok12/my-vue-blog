/** /diaries/:id/reports 요청을 처리한다. */
import * as reportService from './report.service.js'

export async function create(req, res) {
  res.status(201).json(await reportService.create(req.user, req.params.id, req.body))
}
