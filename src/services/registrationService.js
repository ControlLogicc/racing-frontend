import { MOCK_REGISTRATIONS } from '../mocks/mockRegistrations';
import { RACE_REGISTRATION_STATUS } from '../constants/status';

let registrations = [...MOCK_REGISTRATIONS];
let nextId = registrations.length + 1;

export const registrationService = {
  getAll: () => Promise.resolve(registrations), // 🟡 mock — khi có API: api.get('/race-registrations').then(r => r.data)
  getByOwner: (ownerId) => Promise.resolve(registrations.filter((r) => r.ownerId === ownerId)),
  create: (payload) => {
    const created = { id: nextId++, status: RACE_REGISTRATION_STATUS.PENDING, submittedAt: new Date().toISOString(), ...payload };
    registrations = [...registrations, created];
    return Promise.resolve(created);
  },
  approve: (id) => {
    registrations = registrations.map((r) => (r.id === id ? { ...r, status: RACE_REGISTRATION_STATUS.APPROVED } : r));
    return Promise.resolve(registrations.find((r) => r.id === id));
  },
  reject: (id) => {
    registrations = registrations.map((r) => (r.id === id ? { ...r, status: RACE_REGISTRATION_STATUS.REJECTED } : r));
    return Promise.resolve(registrations.find((r) => r.id === id));
  },
};
