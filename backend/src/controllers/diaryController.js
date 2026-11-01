/** /diaries/* */
const asyncHandler = require('../utils/asyncHandler')
const diaryService = require('../services/diaryService')
const {
  CATEGORIES,
  VISIBILITIES,
  parseDiaryPayload,
  parseOptionalEnum,
  parseDateKey,
  parseId,
  parseKeyword,
  parseYearMonth,
} = require('../utils/validators')
const { parseCursor, parseLimit } = require('../utils/pagination')

const diaryIdOf = (req) => parseId(req.params.diaryId, '다이어리를 찾을 수 없습니다.')

/** ?cursor=...&limit=... -> { cursor, limit } */
const pageOf = (req) => ({
  cursor: parseCursor(req.query.cursor),
  limit: parseLimit(req.query.limit),
})

const listMine = asyncHandler(async (req, res) => {
  const filters = {
    dateKey: req.query.dateKey ? parseDateKey(req.query.dateKey) : '',
    category: parseOptionalEnum(req.query.category, CATEGORIES, '종류'),
    visibility: parseOptionalEnum(req.query.visibility, VISIBILITIES, '공개 여부'),
    keyword: parseKeyword(req.query.keyword),
  }
  res.json(await diaryService.listMine(req.user.id, filters, pageOf(req)))
})

const listFeed = asyncHandler(async (req, res) => {
  const filters = {
    category: parseOptionalEnum(req.query.category, CATEGORIES, '종류'),
    keyword: parseKeyword(req.query.keyword),
  }
  res.json(await diaryService.listFeed(req.user.id, filters, pageOf(req)))
})

const monthlyCounts = asyncHandler(async (req, res) => {
  const { year, month } = parseYearMonth(req.query)
  const scope = req.query.scope === 'feed' ? 'feed' : 'mine'
  res.json(await diaryService.monthlyCounts(req.user.id, { year, month, scope }))
})

const get = asyncHandler(async (req, res) => {
  res.json(await diaryService.get(diaryIdOf(req), req.user.id))
})

const create = asyncHandler(async (req, res) => {
  const result = await diaryService.create(req.user.id, parseDiaryPayload(req.body))
  res.status(201).json(result)
})

const update = asyncHandler(async (req, res) => {
  const result = await diaryService.update(
    diaryIdOf(req),
    req.user.id,
    parseDiaryPayload(req.body),
  )
  res.json(result)
})

const remove = asyncHandler(async (req, res) => {
  res.json(await diaryService.remove(diaryIdOf(req), req.user.id))
})

const toggleLike = asyncHandler(async (req, res) => {
  res.json(await diaryService.toggleLike(diaryIdOf(req), req.user.id))
})

module.exports = { listMine, listFeed, monthlyCounts, get, create, update, remove, toggleLike }
