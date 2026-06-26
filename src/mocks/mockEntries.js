import { RACE_ENTRY_STATUS } from '../constants/status';

// RACE_ENTRY tự tạo + tự xác nhận khi Jockey ACCEPT invitation (D11 CLAUDE.md)
// Staff KHÔNG cần confirm — chỉ có thể REMOVE nếu cần
export const MOCK_ENTRIES = [
  {
    id: 1,
    registrationId: 2,
    raceId: 2,
    raceName: 'Race #13',
    horseName: 'Phi Long',
    jockeyId: 5,
    jockeyName: 'Jockey User',
    status: RACE_ENTRY_STATUS.CONFIRMED,
    createdAt: '2026-06-14T12:00:00',
  },
  {
    id: 2,
    registrationId: 1,
    raceId: 1,
    raceName: 'Race #12',
    horseName: 'Thần Mã',
    jockeyId: 5,
    jockeyName: 'Jockey User',
    status: RACE_ENTRY_STATUS.CONFIRMED,
    createdAt: '2026-06-15T14:00:00',
  },
  {
    id: 3,
    registrationId: 3,
    raceId: 3,
    raceName: 'Race #9',
    horseName: 'Bão Tố',
    jockeyId: 22,
    jockeyName: 'K. Pham',
    status: RACE_ENTRY_STATUS.CONFIRMED,
    createdAt: '2026-06-13T09:00:00',
  },
  {
    id: 4,
    registrationId: 4,
    raceId: 2,
    raceName: 'Race #13',
    horseName: 'Sấm Sét',
    jockeyId: 23,
    jockeyName: 'T. Nguyen',
    status: RACE_ENTRY_STATUS.REMOVED,
    createdAt: '2026-06-12T08:00:00',
  },
  {
    id: 5,
    registrationId: 6,
    raceId: 7,
    raceName: 'Race 7 - Test Bốc Thăm Cổng',
    horseName: 'Hắc Dạ',
    jockeyId: 5,
    jockeyName: 'Jockey User',
    status: RACE_ENTRY_STATUS.DECLARED,
    createdAt: '2026-06-25T10:00:00',
    gateNumber: null,
    handicapWeight: 55.5
  },
  {
    id: 6,
    registrationId: 7,
    raceId: 7,
    raceName: 'Race 7 - Test Bốc Thăm Cổng',
    horseName: 'Bạch Tuyết',
    jockeyId: 22,
    jockeyName: 'K. Pham',
    status: RACE_ENTRY_STATUS.DECLARED,
    createdAt: '2026-06-25T11:00:00',
    gateNumber: null,
    handicapWeight: 54.0
  },
  {
    id: 7,
    registrationId: 8,
    raceId: 7,
    raceName: 'Race 7 - Test Bốc Thăm Cổng',
    horseName: 'Tia Chớp',
    jockeyId: 23,
    jockeyName: 'T. Nguyen',
    status: RACE_ENTRY_STATUS.DECLARED,
    createdAt: '2026-06-25T12:00:00',
    gateNumber: null,
    handicapWeight: 56.0
  }
];
