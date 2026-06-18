import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // Thay đổi theo URL backend của bạn
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Tự động đính kèm token vào header nếu đã đăng nhập
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;