import { MOCK_INVITATIONS } from '../mocks/mockInvitations';
import { RACE_INVITATION_STATUS } from '../constants/status';

let invitations = [...MOCK_INVITATIONS];
let nextId = invitations.length + 1;

export const invitationService = {
  getAll: () => Promise.resolve(invitations), // 🟡 mock — khi có API: api.get('/race-invitations').then(r => r.data)
  getByRegistration: (registrationId) => Promise.resolve(invitations.filter((i) => i.registrationId === registrationId)),
  getByJockey: (jockeyId) => Promise.resolve(invitations.filter((i) => i.jockeyId === jockeyId)),
  // 1 registration -> nhiều invitation (CLAUDE.md Mục 15, đã chốt 2026-06-16)
  send: (payload) => {
    const created = { id: nextId++, status: RACE_INVITATION_STATUS.SENT, sentAt: new Date().toISOString(), ...payload };
    invitations = [...invitations, created];
    return Promise.resolve(created);
  },
  cancel: (id) => {
    invitations = invitations.filter((i) => i.id !== id);
    return Promise.resolve({ success: true });
  },
  accept: (id) => {
    invitations = invitations.map((i) => (i.id === id ? { ...i, status: RACE_INVITATION_STATUS.ACCEPTED } : i));
    return Promise.resolve(invitations.find((i) => i.id === id));
  },
  decline: (id) => {
    invitations = invitations.map((i) => (i.id === id ? { ...i, status: RACE_INVITATION_STATUS.DECLINED } : i));
    return Promise.resolve(invitations.find((i) => i.id === id));
  },
};
