/** 다이어리 조회 / 작성 / 수정 / 삭제 / 좋아요 규칙 */
const ApiError = require('../utils/ApiError')
const diaryModel = require('../models/diaryModel')
const likeModel = require('../models/likeModel')
const { toDiary, toDiaryList } = require('../serializers/diarySerializer')
const { toMonthPrefix } = require('../utils/date')
const { toPage } = require('../utils/pagination')
const { filenameFromUrl, removeUploadedFile } = require('../utils/uploadFiles')

const NOT_FOUND = '다이어리를 찾을 수 없습니다.'

/** 목록 응답 - { items, nextCursor, total } */
function toListResponse(rows, total, limit) {
  const { rows: pageRows, nextCursor } = toPage(rows, limit)
  return { items: toDiaryList(pageRows), nextCursor, total }
}

/**
 * 더 이상 어떤 글에서도 쓰지 않는 이미지 파일을 지운다.
 * 파일 정리는 부가 작업이므로 실패해도 요청 자체는 성공으로 둔다.
 */
async function cleanUpImages(urls) {
  try {
    const unused = await diaryModel.findUnusedImageUrls(urls)
    await Promise.all(unused.map((url) => removeUploadedFile(filenameFromUrl(url))))
  } catch (error) {
    console.error('[업로드] 사용하지 않는 이미지를 정리하지 못했습니다.', error.message)
  }
}

/** 다이어리를 찾고, 없으면 404 를 던진다. */
async function findOrFail(id) {
  const diary = await diaryModel.findOwnership(id)
  if (!diary) throw ApiError.notFound(NOT_FOUND)
  return diary
}

/** 읽기 권한 - 비공개 글은 작성자 본인만 볼 수 있다. */
function assertReadable(diary, viewerId) {
  if (diary.visibility === 'private' && String(diary.user_id) !== String(viewerId)) {
    throw ApiError.forbidden('비공개 글입니다.')
  }
}

/** 수정 / 삭제 권한 - 작성자 본인만 가능하다. */
function assertOwner(diary, viewerId, message) {
  if (String(diary.user_id) !== String(viewerId)) {
    throw ApiError.forbidden(message)
  }
}

/** 좋아요 / 댓글은 공개 글에서만 가능하다. */
function assertPublic(diary, message) {
  if (diary.visibility !== 'public') throw ApiError.badRequest(message)
}

/** page = { cursor, limit } (utils/pagination.js) */
async function listMine(viewerId, filters, page) {
  const [rows, total] = await Promise.all([
    diaryModel.findMine(viewerId, filters, page),
    diaryModel.countMine(viewerId, filters),
  ])
  return toListResponse(rows, total, page.limit)
}

async function listFeed(viewerId, filters, page) {
  const [rows, total] = await Promise.all([
    diaryModel.findFeed(viewerId, filters, page),
    diaryModel.countFeed(filters),
  ])
  return toListResponse(rows, total, page.limit)
}

/** scope 가 'mine' 이면 내 글만, 그 외에는 공개 글 전체를 센다. */
async function monthlyCounts(viewerId, { year, month, scope }) {
  const counts = await diaryModel.countByMonth({
    monthPrefix: toMonthPrefix(year, month),
    authorId: scope === 'mine' ? viewerId : null,
    publicOnly: scope !== 'mine',
  })
  return { counts }
}

async function get(id, viewerId) {
  const owned = await findOrFail(id)
  assertReadable(owned, viewerId)

  const row = await diaryModel.findById(id, viewerId)
  if (!row) throw ApiError.notFound(NOT_FOUND)
  return { diary: toDiary(row) }
}

async function create(viewerId, payload) {
  const id = await diaryModel.create(viewerId, payload)
  const row = await diaryModel.findById(id, viewerId)
  return { diary: toDiary(row) }
}

async function update(id, viewerId, payload) {
  const owned = await findOrFail(id)
  assertOwner(owned, viewerId, '수정 권한이 없습니다.')

  const before = await diaryModel.findImageUrls(id)
  await diaryModel.update(id, payload)
  // 수정하면서 뺀 이미지는 파일도 지운다.
  const kept = new Set(payload.images.map((image) => image.url))
  await cleanUpImages(before.filter((url) => !kept.has(url)))

  const row = await diaryModel.findById(id, viewerId)
  return { diary: toDiary(row) }
}

async function remove(id, viewerId) {
  const owned = await findOrFail(id)
  assertOwner(owned, viewerId, '삭제 권한이 없습니다.')

  const imageUrls = await diaryModel.findImageUrls(id)
  await diaryModel.remove(id)
  await cleanUpImages(imageUrls)
  return {}
}

/** 좋아요를 누르면 켜지고, 다시 누르면 꺼진다. */
async function toggleLike(id, viewerId) {
  const diary = await findOrFail(id)
  assertPublic(diary, '공개된 글에만 좋아요를 누를 수 있습니다.')

  const liked = await likeModel.exists(id, viewerId)
  if (liked) {
    await likeModel.remove(id, viewerId)
  } else {
    await likeModel.add(id, viewerId)
  }

  return { liked: !liked, likeCount: await likeModel.count(id) }
}

module.exports = {
  listMine,
  listFeed,
  monthlyCounts,
  get,
  create,
  update,
  remove,
  toggleLike,
  findOrFail,
  assertReadable,
  assertPublic,
}
