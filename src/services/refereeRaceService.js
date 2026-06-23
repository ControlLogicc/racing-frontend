import api from './api';

// Mappers from backend DTOs to frontend models
const mapRace = (r) => ({
  id: r.raceId,
  name: r.raceName,
  seasonId: r.seasonId,
  seasonName: r.seasonName,
  meetingId: r.meetingId,
  meetingName: r.meetingName,
  raceTime: r.raceTime,
  status: r.status,
  resultStatus: r.resultStatus,
  description: r.description,
  maxHorses: r.maxHorses,
  minAge: r.minAge,
  maxAge: r.maxAge,
  minRating: r.minRating,
  maxRating: r.maxRating,
});
const mapRaces = (list) => (Array.isArray(list) ? list.map(mapRace) : []);

const mapEntry = (e) => ({
  id: e.entryId,
  entryId: e.entryId,
  horseId: e.horseId,
  horseName: e.horseName,
  jockeyId: e.jockeyId,
  jockeyName: e.jockeyName,
  gateNumber: e.drawNumber,
  handicapWeight: e.handicapWeight,
  actualWeight: e.actualWeight,
  weightCheckStatus: e.weightCheckStatus ? e.weightCheckStatus.toUpperCase() : 'PENDING',
  status: e.entryStatus ? e.entryStatus.toUpperCase() : 'CONFIRMED',
});
const mapEntries = (list) => (Array.isArray(list) ? list.map(mapEntry) : []);

export const refereeRaceService = {
  // Lấy danh sách giải đấu ĐƯỢC PHÂN CÔNG cho Trọng tài
  getAssignedRaces: () => api.get('/referee/races').then((r) => mapRaces(r.data)),

  // Lấy danh sách ngựa của một giải đấu ĐƯỢC PHÂN CÔNG
  getAssignedRaceEntries: (raceId) => api.get(`/referee/races/${raceId}/entries`).then((r) => mapEntries(r.data)),
};
