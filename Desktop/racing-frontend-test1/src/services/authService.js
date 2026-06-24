import api from './api';
import { mockLogin, mockRegister } from '../mocks/mockAuth';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const authService = {
  // 🟡 Chuyển sang API thật: đặt VITE_USE_MOCK=false trong .env — không cần sửa code
  login: (credentials) =>
    USE_MOCK
      ? mockLogin(credentials)
      : api.post('/auth/login', credentials).then((r) => r.data),

  register: (userData) =>
    USE_MOCK
      ? mockRegister(userData)
      : api.post('/auth/register', userData).then((r) => r.data),
};