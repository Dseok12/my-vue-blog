/**
 * API 진입점.
 *
 * VITE_USE_MOCK=true  : 브라우저 저장소를 쓰는 mock 구현 (백엔드 없이 동작)
 * VITE_USE_MOCK=false : 실제 백엔드 호출 (api/server.js)
 *
 * ---------------------------------------------------------------------------
 * 백엔드가 맞춰야 하는 응답 형태
 * ---------------------------------------------------------------------------
 * User    { id, email, nickname, createdAt }
 * Diary   { id, authorId, author: { id, nickname }, title, content,
 *           category: 'diary' | 'book' | 'emotion', mood, dateKey: 'YYYY-MM-DD',
 *           visibility: 'public' | 'private', images: [{ url, name }],
 *           likeCount, likedByMe, commentCount, createdAt, updatedAt }
 * Comment { id, diaryId, parentId, author: { id, nickname }, content, createdAt }
 *
 * POST   /auth/signup                  -> { user, token }
 * POST   /auth/login                   -> { user, token }
 * GET    /auth/me                      -> { user }
 * POST   /auth/logout                  -> {}
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
 * POST   /uploads/image                -> { url, name, size }
 *
 * ---------------------------------------------------------------------------
 * 권한 규칙 - 화면에서도 막지만 백엔드에서 반드시 다시 검증해야 한다.
 * ---------------------------------------------------------------------------
 * - PUT/DELETE /diaries/:id            : 작성자 본인만 허용, 아니면 403
 * - GET  /diaries/:id                  : 비공개 글은 작성자 본인만, 아니면 403
 * - POST /diaries/:id/like, /comments  : 공개(public) 글에만 허용, 아니면 400
 * - DELETE /diaries/:id/comments/:cid  : 댓글 작성자 본인만, 아니면 403
 */
import { USE_MOCK } from '@/config'

import * as mockApi from './mock'
import * as serverApi from './server'

const api = USE_MOCK ? mockApi : serverApi

export const { auth, diaries, comments, uploads } = api
export { ApiError } from './client'
export default api
