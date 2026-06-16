import api from './api';

export const authService = {
  login: async (credentials) => {
    // Gọi API thật tới https://traveller-bags-spring-rica.trycloudflare.com/ (đã cấu hình trong .env)
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    // Gọi API thật
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};