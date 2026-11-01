/**
 * 실제 백엔드(node.js) 호출 구현.
 * mock 구현(api/mock/index.js)과 완전히 같은 형태를 가져야 한다.
 */
import { client } from './client'

export const auth = {
  signup: (payload) => client.post('/auth/signup', payload),
  login: (payload) => client.post('/auth/login', payload),
  me: () => client.get('/auth/me'),
  logout: () => client.post('/auth/logout'),
}

export const diaries = {
  listMine: (params) => client.get('/diaries', { params }),
  listFeed: (params) => client.get('/diaries/feed', { params }),
  monthlyCounts: (params) => client.get('/diaries/monthly-counts', { params }),
  get: (id) => client.get('/diaries/' + id),
  create: (payload) => client.post('/diaries', payload),
  update: (id, payload) => client.put('/diaries/' + id, payload),
  remove: (id) => client.delete('/diaries/' + id),
  toggleLike: (id) => client.post('/diaries/' + id + '/like'),
}

export const comments = {
  list: (diaryId) => client.get('/diaries/' + diaryId + '/comments'),
  create: (diaryId, payload) => client.post('/diaries/' + diaryId + '/comments', payload),
  remove: (diaryId, commentId) => client.delete('/diaries/' + diaryId + '/comments/' + commentId),
}

export const uploads = {
  image: (file) => {
    const form = new FormData()
    form.append('image', file)
    return client.post('/uploads/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
