const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function request(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = { method, headers };
  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    localStorage.clear();
    window.location.href = '/login';
    throw new Error('Hết phiên làm việc. Vui lòng đăng nhập lại.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Có lỗi xảy ra từ hệ thống');
  }

  return response.json();
}

export const apiService = {
  // Login sẽ trả về { token, user: { role, fullName, ... } }
  login: (credentials) => request('/auth/login', 'POST', credentials),
  register: (userData) => request('/auth/register', 'POST', userData),
  
  getMyHorses: () => request('/owner/horses', 'GET'),
  createHorse: (horseData) => request('/owner/horses', 'POST', horseData),
};