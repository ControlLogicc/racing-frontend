import { RACE_REGISTRATION_STATUS } from '../constants/status';

// ownerId: 4 = "Owner User" (mock login owner@test.com — userId 4 trong mockAuth.js)
export const MOCK_REGISTRATIONS = [
  { id: 1, raceId: 1, raceName: 'Race #12', horseId: 1, horseName: 'Thần Mã', ownerId: 4, ownerName: 'Owner User', status: RACE_REGISTRATION_STATUS.SUBMITTED, submittedAt: '2026-06-15T09:00:00' },
  { id: 2, raceId: 2, raceName: 'Race #13', horseId: 2, horseName: 'Phi Long', ownerId: 4, ownerName: 'Owner User', status: RACE_REGISTRATION_STATUS.ACTIVE, submittedAt: '2026-06-14T09:00:00' },
  { id: 3, raceId: 1, raceName: 'Race #12', horseId: 3, horseName: 'Bão Tố', ownerId: 4, ownerName: 'Owner User', status: RACE_REGISTRATION_STATUS.CANCELLED, submittedAt: '2026-06-13T09:00:00' },
  { id: 4, raceId: 6, raceName: 'Race 6 - Test Duyệt Đăng Ký', horseId: 4, horseName: 'Hắc Điểu', ownerId: 4, ownerName: 'Owner User', status: RACE_REGISTRATION_STATUS.SUBMITTED, submittedAt: '2026-06-25T09:00:00' },
  { id: 5, raceId: 6, raceName: 'Race 6 - Test Duyệt Đăng Ký', horseId: 5, horseName: 'Xích Thố', ownerId: 4, ownerName: 'Owner User', status: RACE_REGISTRATION_STATUS.SUBMITTED, submittedAt: '2026-06-25T09:30:00' },
];
