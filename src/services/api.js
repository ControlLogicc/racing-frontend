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

// Response: xử lý 401 toàn cục, NHƯNG bỏ qua route auth (EXCEPTION #5)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url || '';
    const isAuthCall = url.includes('/auth/login') || url.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login'; // EXCEPTION #6: dùng window.location, KHÔNG useNavigate
    }
    return Promise.reject(error); // luôn reject để nơi gọi tự bắt lỗi
  }
);

export default api;