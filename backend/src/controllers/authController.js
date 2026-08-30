/** POST /auth/* */
const asyncHandler = require('../utils/asyncHandler')
const authService = require('../services/authService')
const { parseSignupPayload, parseLoginPayload } = require('../utils/validators')

const signup = asyncHandler(async (req, res) => {
  const result = await authService.signup(parseSignupPayload(req.body))
  res.status(201).json(result)
})

const login = asyncHandler(async (req, res) => {
  res.json(await authService.login(parseLoginPayload(req.body)))
})

const me = asyncHandler(async (req, res) => {
  res.json(await authService.getProfile(req.user.id))
})

/** 토큰 방식이라 서버에 지울 세션이 없다. 프론트엔드에서 토큰을 지운다. */
const logout = asyncHandler(async (req, res) => {
  res.json({})
})

module.exports = { signup, login, me, logout }
