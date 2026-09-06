/**
 * API 진입점.
 *
 * VITE_USE_MOCK=true  : 브라우저 저장소를 쓰는 mock 구현 (백엔드 없이 동작)
 * VITE_USE_MOCK=false : 실제 백엔드 호출 (api/server.js)
 *
 * ---------------------------------------------------------------------------
 * 백엔드가 맞춰야 하는 응답 형태
 * ---------------------------------------------------------------------------
 * User    { id, email, nickname, createdAt, isAdmin }
 * Diary   { id, authorId, author: { id, nickname }, title, content,
 *           category: 'diary' | 'book' | 'emotion', mood, dateKey: 'YYYY-MM-DD',
 *           visibility: 'public' | 'private', isHidden, images: [{ url, name }],
 *           likeCount, likedByMe, commentCount, createdAt, updatedAt }
 * Comment { id, diaryId, parentId, author: { id, nickname }, content, createdAt }
 * Profile { user: { id, nickname, joinedAt, diaryCount }, isMe }
 *
 * POST   /auth/signup                  -> { user, token }
 * POST   /auth/login                   -> { user, token }
 * GET    /auth/me                      -> { user }
 * POST   /auth/logout                  -> {}
 * GET    /users/:id                    -> { user, isMe }
 * GET    /users/:id/diaries?category&keyword  -> { items }
 * PATCH  /users/me   { nickname?, currentPassword?, newPassword? }  -> { user }
 * GET    /diaries?dateKey&category&visibility&keyword   -> { items }
 * GET    /diaries/feed?keyword&category                 -> { items }
 * GET    /diaries/monthly-counts?year&month&scope       -> { counts }
 * GET    /diaries/:id                  -> { diary }
 * POST   /diaries                      -> { diary }
 * PUT    /diaries/:id                  -> { diary }
 * DELETE /diaries/:id                  -> {}
 * POST   /diaries/:id/like             -> { liked, likeCount }
 * GET    /diaries/:id/comments         -> { items }
 * POST   /diaries/:id/comments         -> { comment }
 * DELETE /diaries/:id/comments/:cid    -> {}
 * POST   /diaries/:id/reports  { reason, detail }  -> { report }
 * POST   /uploads/image               -> { url, name, size }
 * GET    /admin/reports?status         -> { items }           (관리자)
 * POST   /admin/diaries/:id/unhide     -> { isHidden }        (관리자)
 * POST   /admin/diaries/:id/hide       -> { isHidden }        (관리자)
 * POST   /admin/reports/:reportId/dismiss  -> {}              (관리자)
 *
 * ---------------------------------------------------------------------------
 * 권한 규칙 - 화면에서도 막지만 백엔드에서 반드시 다시 검증해야 한다.
 * ---------------------------------------------------------------------------
 * - PUT/DELETE /diaries/:id            : 작성자 본인만 허용, 아니면 403
 * - GET  /diaries/:id                  : 비공개 글은 작성자만 / 가림글은 작성자·관리자만, 아니면 403
 * - POST /diaries/:id/like, /comments  : 공개(public) 이고 가림되지 않은 글에만, 아니면 400
 * - DELETE /diaries/:id/comments/:cid  : 댓글 작성자 본인만, 아니면 403
 * - POST /diaries/:id/reports          : 공개 글, 자기 글 아님, 중복 아님 - 신고 시 자동 가림
 * - 공개 맥락(피드/공개글/댓글)의 닉네임은 첫 글자만 남기고 * 처리한다. (본인·관리자 제외)
 * - /admin/*                           : 관리자만 (403)
 */
import { USE_MOCK } from '@/config'

import * as mockApi from './mock'
import * as serverApi from './server'

const api = USE_MOCK ? mockApi : serverApi

export const { auth, users, diaries, comments, reports, uploads, admin } = api
export { ApiError } from './client'
export default api
