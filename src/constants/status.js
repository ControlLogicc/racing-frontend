// Enum trạng thái nghiệp vụ — Mục 15 CLAUDE.md. AI/UI KHÔNG cho phép hành động sai trạng thái.

export const RACE_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
};

export const RACE_REGISTRATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const RACE_INVITATION_STATUS = {
  SENT: 'sent',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
};

export const STATUS_LABEL = {
  [RACE_STATUS.UPCOMING]: 'Sắp diễn ra',
  [RACE_STATUS.ONGOING]: 'Đang diễn ra',
  [RACE_STATUS.COMPLETED]: 'Đã hoàn thành',
  [RACE_REGISTRATION_STATUS.PENDING]: 'Chờ duyệt',
  [RACE_REGISTRATION_STATUS.APPROVED]: 'Đã duyệt',
  [RACE_REGISTRATION_STATUS.REJECTED]: 'Bị từ chối',
  [RACE_INVITATION_STATUS.SENT]: 'Đã gửi',
  [RACE_INVITATION_STATUS.ACCEPTED]: 'Đã nhận',
  [RACE_INVITATION_STATUS.DECLINED]: 'Đã từ chối',
};

export const STATUS_BADGE_VARIANT = {
  [RACE_STATUS.UPCOMING]: 'info',
  [RACE_STATUS.ONGOING]: 'warning',
  [RACE_STATUS.COMPLETED]: 'success',
  [RACE_REGISTRATION_STATUS.PENDING]: 'warning',
  [RACE_REGISTRATION_STATUS.APPROVED]: 'success',
  [RACE_REGISTRATION_STATUS.REJECTED]: 'danger',
  [RACE_INVITATION_STATUS.SENT]: 'warning',
  [RACE_INVITATION_STATUS.ACCEPTED]: 'success',
  [RACE_INVITATION_STATUS.DECLINED]: 'danger',
};

// RACE_ENTRY chỉ được tạo khi registration=APPROVED và có >=1 invitation ACCEPTED
export const canCreateEntry = (registrationStatus, hasAcceptedInvitation) =>
  registrationStatus === RACE_REGISTRATION_STATUS.APPROVED && hasAcceptedInvitation;

// RACE_RESULT chỉ nhập được khi race đã COMPLETED
export const canEnterResult = (raceStatus) => raceStatus === RACE_STATUS.COMPLETED;
