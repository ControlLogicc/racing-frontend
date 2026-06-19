import { MOCK_USERS } from '../mocks/mockUsers';

let users = [...MOCK_USERS];

export const userService = {
  getAll: () => Promise.resolve(users), // 🟡 mock — khi có API: api.get('/users').then(r => r.data)
  setRole: (id, role) => {
    users = users.map((u) => (u.id === id ? { ...u, role } : u));
    return Promise.resolve(users.find((u) => u.id === id));
  },
  setLocked: (id, locked) => {
    users = users.map((u) => (u.id === id ? { ...u, locked } : u));
    return Promise.resolve(users.find((u) => u.id === id));
  },
};
