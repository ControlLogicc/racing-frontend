import { RACE_INVITATION_STATUS } from '../constants/status';

// 1 registration -> nhiều invitation (CLAUDE.md Mục 15, đã chốt)
export const MOCK_INVITATIONS = [
  {
    id: 1,
    registrationId: 2,
    raceName: 'Race #13',
    horseName: 'Phi Long',
    jockeyId: 20,
    jockeyName: 'L. Tran',
    status: RACE_INVITATION_STATUS.ACCEPTED,
    sentAt: '2026-06-14T10:00:00',
    deadline: '2026-06-18T23:59:00',
  },
  {
    id: 2,
    registrationId: 2,
    raceName: 'Race #13',
    horseName: 'Phi Long',
    jockeyId: 21,
    jockeyName: 'M. Le',
    status: RACE_INVITATION_STATUS.DECLINED,
    sentAt: '2026-06-14T10:05:00',
    deadline: '2026-06-18T23:59:00',
  },
  {
    id: 3,
    registrationId: 1,
    raceName: 'Race #12',
    horseName: 'Thần Mã',
    jockeyId: 20,
    jockeyName: 'L. Tran',
    status: RACE_INVITATION_STATUS.SENT,
    sentAt: '2026-06-15T11:00:00',
    deadline: '2026-06-20T23:59:00',
  },
  {
    id: 4,
    registrationId: 3,
    raceName: 'Race #12',
    horseName: 'Bão Tố',
    jockeyId: 22,
    jockeyName: 'K. Pham',
    status: RACE_INVITATION_STATUS.EXPIRED,
    sentAt: '2026-06-10T08:00:00',
    deadline: '2026-06-12T23:59:00',
  },
];
