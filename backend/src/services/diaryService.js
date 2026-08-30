/** 다이어리 조회 / 작성 / 수정 / 삭제 / 좋아요 규칙 */
const ApiError = require('../utils/ApiError')
const diaryModel = require('../models/diaryModel')
const likeModel = require('../models/likeModel')
const { toDiary, toDiaryList } = require('../serializers/diarySerializer')
const { toMonthPrefix } = require('../utils/date')

const NOT_FOUND = '다이어리를 찾을 수 없습니다.'

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

async function listMine(viewerId, filters) {
  const rows = await diaryModel.findMine(viewerId, filters)
  return { items: toDiaryList(rows) }
}

async function listFeed(viewerId, filters) {
  const rows = await diaryModel.findFeed(viewerId, filters)
  return { items: toDiaryList(rows) }
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

  await diaryModel.update(id, payload)
  const row = await diaryModel.findById(id, viewerId)
  return { diary: toDiary(row) }
}

async function remove(id, viewerId) {
  const owned = await findOrFail(id)
  assertOwner(owned, viewerId, '삭제 권한이 없습니다.')

  await diaryModel.remove(id)
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
