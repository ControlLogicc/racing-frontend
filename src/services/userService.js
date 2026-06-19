import api from './api';
import { MOCK_USERS } from '../mocks/mockUsers';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let _users = [...MOCK_USERS];
let _nextId = Math.max(..._users.map((u) => u.id)) + 1;

const mockService = {
  getAll: () => Promise.resolve([..._users]),
  create: (payload) => {
    const created = { id: _nextId++, locked: false, ...payload };
    _users = [..._users, created];
    return Promise.resolve(created);
  },
  setRole: (id, role) => {
    _users = _users.map((u) => (u.id === id ? { ...u, role } : u));
    return Promise.resolve(_users.find((u) => u.id === id));
  },
  setLocked: (id, locked) => {
    _users = _users.map((u) => (u.id === id ? { ...u, locked } : u));
    return Promise.resolve(_users.find((u) => u.id === id));
  },
};

const realService = {
  getAll: () => api.get('/users').then((r) => r.data),
  create: (payload) => api.post('/users', payload).then((r) => r.data),
  setRole: (id, role) => api.patch(`/users/${id}/role`, { role }).then((r) => r.data),
  setLocked: (id, locked) => api.patch(`/users/${id}/locked`, { locked }).then((r) => r.data),
};

export const userService = USE_MOCK ? mockService : realService;
