import api from './api';
import { MOCK_INVITATIONS } from '../mocks/mockInvitations';
import { RACE_INVITATION_STATUS } from '../constants/status';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let mockStore = [...MOCK_INVITATIONS];
let nextId = mockStore.length + 1;

const mockService = {
  getAll: () => Promise.resolve([...mockStore]),
  getByRegistration: (registrationId) =>
    Promise.resolve(mockStore.filter((i) => i.registrationId === registrationId)),
  getByJockey: (jockeyId) =>
    Promise.resolve(mockStore.filter((i) => i.jockeyId === jockeyId)),
  send: (payload) => {
    const created = {
      id: nextId++,
      status: RACE_INVITATION_STATUS.SENT,
      sentAt: new Date().toISOString(),
      ...payload,
    };
    mockStore = [...mockStore, created];
    return Promise.resolve(created);
  },
  cancel: (id) => {
    mockStore = mockStore.filter((i) => i.id !== id);
    return Promise.resolve({ success: true });
  },
  accept: (id) => {
    mockStore = mockStore.map((i) =>
      i.id === id ? { ...i, status: RACE_INVITATION_STATUS.ACCEPTED } : i
    );
    return Promise.resolve(mockStore.find((i) => i.id === id));
  },
  decline: (id) => {
    mockStore = mockStore.map((i) =>
      i.id === id ? { ...i, status: RACE_INVITATION_STATUS.DECLINED } : i
    );
    return Promise.resolve(mockStore.find((i) => i.id === id));
  },
  setDeadline: (id, deadline) => {
    mockStore = mockStore.map((i) => (i.id === id ? { ...i, deadline } : i));
    return Promise.resolve(mockStore.find((i) => i.id === id));
  },
  removeExpired: (id) => {
    mockStore = mockStore.map((i) =>
      i.id === id ? { ...i, status: RACE_INVITATION_STATUS.REMOVED } : i
    );
    return Promise.resolve({ success: true });
  },
};

// ─── Field mapper ─────────────────────────────────────────────────────────────
// Backend InvitationResponse: { invitationId, raceRegistrationId, raceId, raceName,
//   horseId, horseName, ownerId, ownerName, jockeyId, jockeyName, status, sentAt, respondedAt, message }
// Frontend JSX dùng: { id, registrationId, ... } — map invitationId→id, raceRegistrationId→registrationId
const mapInv = (i) => ({
  id: i.invitationId,
  invitationId: i.invitationId,
  registrationId: i.raceRegistrationId,   // raceRegistrationId → registrationId
  raceId: i.raceId,
  raceName: i.raceName,
  horseId: i.horseId,
  horseName: i.horseName,
  ownerId: i.ownerId,
  ownerName: i.ownerName,
  jockeyId: i.jockeyId,
  jockeyName: i.jockeyName,
  status: i.status,
  sentAt: i.sentAt,
  respondedAt: i.respondedAt,
  deadline: i.deadline,
  message: i.message,
});
const mapInvs = (list) => (Array.isArray(list) ? list.map(mapInv) : []);

const realService = {
  // Owner/Jockey: GET /invitations — backend filter theo JWT + role
  getAll: () => api.get('/invitations').then((r) => mapInvs(r.data)),
  getByRegistration: async (registrationId) => {
    // Backend chưa hỗ trợ lọc theo raceRegistrationId, tải toàn bộ và tự lọc bằng JS
    const data = await api.get('/invitations').then((r) => mapInvs(r.data));
    return data.filter((i) => i.registrationId === Number(registrationId));
  },

  // Jockey: cùng endpoint /invitations — backend tự biết qua JWT
  getByJockey: () => api.get('/invitations').then((r) => mapInvs(r.data)),

  // Owner gửi lời mời — backend field là raceRegistrationId
  send: ({ registrationId, raceRegistrationId, jockeyId, message }) =>
    api.post('/invitations', {
      raceRegistrationId: raceRegistrationId || registrationId,
      jockeyId,
      message,
    }).then((r) => mapInv(r.data)),

  // Jockey accept/decline — PUT
  accept: (id) => api.put(`/invitations/${id}/accept`).then((r) => mapInv(r.data)),
  decline: (id) => api.put(`/invitations/${id}/decline`).then((r) => mapInv(r.data)),

  // Backend chưa có endpoint — sẽ trả lỗi rõ ràng thay vì gọi sai
  cancel: () => Promise.reject(new Error('Chức năng huỷ lời mời chưa được backend hỗ trợ.')),
  setDeadline: () => Promise.reject(new Error('Chức năng chỉnh deadline chưa được backend hỗ trợ.')),
  removeExpired: () => Promise.reject(new Error('Chức năng loại hết hạn chưa được backend hỗ trợ.')),
};

export const invitationService = realService;
