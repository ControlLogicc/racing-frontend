import { RACE_INVITATION_STATUS } from '../constants/status';

// 1 registration -> nhiều invitation (đã chốt trong CLAUDE.md Mục 15, 2026-06-16)
export const MOCK_INVITATIONS = [
  { id: 1, registrationId: 2, raceName: 'Race #13', horseName: 'Phi Long', jockeyId: 20, jockeyName: 'L. Tran', status: RACE_INVITATION_STATUS.ACCEPTED, sentAt: '2026-06-14T10:00:00' },
  { id: 2, registrationId: 2, raceName: 'Race #13', horseName: 'Phi Long', jockeyId: 21, jockeyName: 'M. Le', status: RACE_INVITATION_STATUS.DECLINED, sentAt: '2026-06-14T10:05:00' },
  { id: 3, registrationId: 1, raceName: 'Race #12', horseName: 'Thần Mã', jockeyId: 20, jockeyName: 'L. Tran', status: RACE_INVITATION_STATUS.SENT, sentAt: '2026-06-15T11:00:00' },
];
