// Hiển thị ngày giờ theo chuẩn DD/MM/YYYY HH:mm (giờ VN) — Mục 17 CLAUDE.md
export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—';
