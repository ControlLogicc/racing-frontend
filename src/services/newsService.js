import api from './api';

// Backend NewsArticleResponse: { newsId, title, summary, content, thumbnailUrl, externalLink,
//   publishDate, status, createdBy, updatedBy, createdAt, updatedAt }
// GET /news (public, summary — không có content) chỉ trả bài status=published.
// GET /news/{id} (public) trả đủ field kể cả content, chỉ khi status=published.
const mapNews = (n) => ({
  id: n.newsId,
  newsId: n.newsId,
  title: n.title,
  summary: n.summary,
  content: n.content,
  thumbnailUrl: n.thumbnailUrl,
  externalLink: n.externalLink,
  publishDate: n.publishDate,
  status: n.status,
  createdBy: n.createdBy,
  updatedBy: n.updatedBy,
  createdAt: n.createdAt,
  updatedAt: n.updatedAt,
});

// Backend dùng Spring Data Page<T> (không phải shape { items, total } của Mục 16) — map riêng cho News.
const mapPage = (data) => ({
  items: Array.isArray(data?.content) ? data.content.map(mapNews) : [],
  page: data?.number ?? 0,
  size: data?.size ?? 10,
  totalElements: data?.totalElements ?? 0,
  totalPages: data?.totalPages ?? 0,
});

export const newsService = {
  // Public — /api/news/** permitAll, không cần token
  getPublished: (page = 0, size = 10) =>
    api.get('/news', { params: { page, size } }).then((r) => mapPage(r.data)),
  getPublishedById: (id) => api.get(`/news/${id}`).then((r) => mapNews(r.data)),

  // Admin only
  getAdminAll: (status = '', page = 0, size = 20) =>
    api.get('/admin/news', { params: { status: status || undefined, page, size } }).then((r) => mapPage(r.data)),
  create: (payload) => api.post('/admin/news', payload).then((r) => mapNews(r.data)),
  update: (id, payload) => api.put(`/admin/news/${id}`, payload).then((r) => mapNews(r.data)),
  remove: (id) => api.delete(`/admin/news/${id}`).then((r) => mapNews(r.data)),
  publish: (id) => api.put(`/admin/news/${id}/publish`).then((r) => mapNews(r.data)),
  hide: (id) => api.put(`/admin/news/${id}/hide`).then((r) => mapNews(r.data)),
};
