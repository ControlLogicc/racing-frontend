import api from './api';

export const authService = {
  // EXCEPTION #2: route auth là action -> KHÔNG số nhiều
  login: (credentials) => api.post('/auth/login', credentials).then((r) => r.data),
  register: (userData) => api.post('/auth/register', userData).then((r) => r.data),
};