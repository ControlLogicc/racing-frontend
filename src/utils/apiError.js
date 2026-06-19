export const getApiErrorMessage = (err, fallback = 'Đã có lỗi xảy ra.') => {
  if (!err.response) return 'Không kết nối được máy chủ. Kiểm tra backend / VITE_API_BASE_URL.';
  return err.response.data?.error || err.response.data?.message || fallback;
};