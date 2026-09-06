/** /admin 요청을 받아 서비스에 넘긴다. (라우터에서 관리자 확인을 마친 상태) */
import * as adminService from './admin.service.js'

export async function listReports(req, res) {
  res.json(await adminService.listReports(req.query))
}

export async function unhideDiary(req, res) {
  res.json(await adminService.unhideDiary(req.params.id))
}

export async function hideDiary(req, res) {
  res.json(await adminService.hideDiary(req.params.id))
}

export async function dismissReport(req, res) {
  res.json(await adminService.dismissReport(req.params.reportId))
}
