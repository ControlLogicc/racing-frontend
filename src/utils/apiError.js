export const getApiErrorMessage = (err, fallback = 'Đã có lỗi xảy ra.') => {
  // eslint-disable-next-line no-console
  console.error('API Error detail:', err?.response?.status, err?.response?.data ?? err?.message);

  if (!err.response) {
    // Network error, CORS, backend offline
    return 'Không kết nối được máy chủ. Kiểm tra backend đang chạy.';
  }

  const status = err.response.status;
  const data = err.response.data;

  if (!data) return `${fallback} (HTTP ${status})`;

  // HTML error page (Spring default error page)
  if (typeof data === 'string') {
    if (data.includes('<html') || data.includes('<!DOCTYPE')) {
      return `Lỗi máy chủ (${status}). ${fallback}`;
    }
    return data || fallback;
  }

  if (typeof data === 'object') {
    // Spring ResponseStatusException: { timestamp, status, error, message, path }
    // GlobalExceptionHandler: { error: "..." } or { message: "..." }
    // Validation errors: { violations: [...] } or { errors: [...] }
    const msg =
      data.message ||
      data.error ||
      data.detail ||
      (Array.isArray(data.violations) ? data.violations.map((v) => v.message).join('; ') : null) ||
      (Array.isArray(data.errors) ? data.errors.map((e) => e.defaultMessage ?? e).join('; ') : null);

    if (msg && msg !== 'No message available') return msg;
  }

  return `${fallback} (HTTP ${status})`;
};