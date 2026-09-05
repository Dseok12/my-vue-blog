/** /auth 요청을 받아 서비스에 넘기고 결과를 JSON 으로 돌려준다. */
import * as authService from './auth.service.js'

export async function signup(req, res) {
  res.status(201).json(await authService.signup(req.body))
}

export async function login(req, res) {
  res.json(await authService.login(req.body))
}

export async function me(req, res) {
  res.json({ user: authService.toPublicUser(req.user) })
}

/** 토큰 방식이라 서버에 지울 상태가 없다. 화면에서 토큰을 지우면 로그아웃이 된다. */
export async function logout(req, res) {
  res.json({})
}
