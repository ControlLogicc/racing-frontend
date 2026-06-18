import { RACE_REGISTRATION_STATUS } from '../constants/status';

export const MOCK_REGISTRATIONS = [
  { id: 1, raceId: 1, raceName: 'Race #12', horseId: 1, horseName: 'Thần Mã', ownerId: 10, ownerName: 'P. Nguyen', status: RACE_REGISTRATION_STATUS.PENDING, submittedAt: '2026-06-15T09:00:00' },
  { id: 2, raceId: 2, raceName: 'Race #13', horseId: 2, horseName: 'Phi Long', ownerId: 10, ownerName: 'P. Nguyen', status: RACE_REGISTRATION_STATUS.APPROVED, submittedAt: '2026-06-14T09:00:00' },
  { id: 3, raceId: 1, raceName: 'Race #12', horseId: 3, horseName: 'Bão Tố', ownerId: 11, ownerName: 'T. Le', status: RACE_REGISTRATION_STATUS.REJECTED, submittedAt: '2026-06-13T09:00:00' },
];
