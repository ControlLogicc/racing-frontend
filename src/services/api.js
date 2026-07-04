import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // đọc từ .env — KHÔNG hardcode
  headers: { 'Content-Type': 'application/json' },
});

// Request: tự gắn Bearer token (key 'token')
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response: unwrap ApiResponse wrapper { success, message, data } nếu backend dùng
// và xử lý 401 toàn cục
api.interceptors.response.use(
  (res) => {
    const body = res.data;
    // Backend wraps: { success: true, message: "...", data: <payload> }
    // Unwrap để các service chỉ cần .then(r => r.data) như bình thường
    if (
      body !== null &&
      typeof body === 'object' &&
      'success' in body &&
      'data' in body
    ) {
      return { ...res, data: body.data };
    }
    return res;
  },
  (error) => {
    const url = error.config?.url || '';
    const isAuthCall = url.includes('/auth/login') || url.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // JWT filter chặn user bị ban ngay giữa phiên (403 "Account is banned") — tự đăng xuất
    // thay vì để mỗi trang tự hiện lỗi 403 rời rạc, khó hiểu cho người dùng.
    if (error.response?.status === 403 && !isAuthCall && error.response?.data?.error === 'Account is banned') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?banned=1';
    }

    return Promise.reject(error);
  }
);

export default api;
