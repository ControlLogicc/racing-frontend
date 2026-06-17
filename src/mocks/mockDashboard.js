// Dữ liệu tạm cho các trang Dashboard overview theo role.
// Khi backend có endpoint thống kê thật, chỉ cần đổi nguồn data ở đây,
// JSX của các trang Dashboard.jsx không cần đổi.

/* ----------------------------- ADMIN ----------------------------- */
export const ADMIN_STATS = [
  { id: 'a1', label: 'Total Users', value: 128, hint: '+6 this week', accent: 'primary' },
  { id: 'a2', label: 'Open Seasons', value: 2, hint: 'Active now', accent: 'success' },
  { id: 'a3', label: 'Meetings', value: 4, hint: 'Scheduled', accent: 'warning' },
  { id: 'a4', label: 'Races', value: 36, hint: 'Across seasons', accent: 'info' },
];
export const ADMIN_ACTIVITY = [
  { id: 'aa1', text: 'New owner account "P. Nguyen" created', time: '10 mins ago' },
  { id: 'aa2', text: 'Role updated: user #84 → jockey', time: '1 hour ago' },
  { id: 'aa3', text: 'Season "Spring 2026" opened', time: 'Yesterday' },
  { id: 'aa4', text: 'Meeting "Saigon Cup" added to calendar', time: '2 days ago' },
];
export const ADMIN_ACTIONS = [
  { id: 'ac1', label: 'Manage Users', to: '/admin/users', icon: '👥' },
];

/* ----------------------------- STAFF ----------------------------- */
export const STAFF_STATS = [
  { id: 'st1', label: 'Upcoming Races', value: 12, hint: 'Next 2 weeks', accent: 'primary' },
  { id: 'st2', label: 'Pending Approvals', value: 3, hint: 'Race registrations', accent: 'warning' },
  { id: 'st3', label: 'Open Meetings', value: 2, hint: 'Active now', accent: 'success' },
  { id: 'st4', label: 'Results to Publish', value: 1, hint: 'Awaiting referee', accent: 'danger' },
];
export const STAFF_ACTIVITY = [
  { id: 'sta1', text: 'Race "Saigon Cup #12" schedule confirmed', time: '20 mins ago' },
  { id: 'sta2', text: 'New registration awaiting approval', time: '1 hour ago' },
  { id: 'sta3', text: 'Meeting "Spring Classic" opened', time: 'Yesterday' },
  { id: 'sta4', text: 'Race #9 result published', time: '2 days ago' },
];
export const STAFF_ACTIONS = [
  { id: 'stc1', label: 'Manage Race Schedule', to: '/staff/races', icon: '🏁' },
];

/* ----------------------------- OWNER ----------------------------- */
export const OWNER_STATS = [
  { id: 'o1', label: 'My Horses', value: 5, hint: 'In stable', accent: 'primary' },
  { id: 'o2', label: 'Pending Registrations', value: 3, hint: 'Awaiting approval', accent: 'warning' },
  { id: 'o3', label: 'Jockey Invitations', value: 2, hint: 'Sent', accent: 'info' },
  { id: 'o4', label: 'Upcoming Entries', value: 4, hint: 'Next 2 weeks', accent: 'success' },
];
export const OWNER_ACTIVITY = [
  { id: 'oa1', text: 'Registration for "Thần Mã" is PENDING approval', time: 'Today' },
  { id: 'oa2', text: 'Jockey "L. Tran" ACCEPTED your invitation', time: '3 hours ago' },
  { id: 'oa3', text: '"Phi Long" entered into Race #12', time: 'Yesterday' },
  { id: 'oa4', text: 'New invitation sent to jockey "M. Le"', time: '2 days ago' },
];
export const OWNER_ACTIONS = [
  { id: 'oc1', label: 'View My Horses', to: '/owner/horses', icon: '🐎' },
  { id: 'oc2', label: 'Race Registrations', to: '/owner/registrations', icon: '📝' },
  { id: 'oc3', label: 'Jockey Invitations', to: '/owner/invitations', icon: '✉️' },
];

/* ----------------------------- JOCKEY ----------------------------- */
export const JOCKEY_STATS = [
  { id: 'j1', label: 'Pending Invitations', value: 2, hint: 'Need response', accent: 'warning' },
  { id: 'j2', label: 'Accepted Rides', value: 4, hint: 'Confirmed', accent: 'success' },
  { id: 'j3', label: 'Upcoming Races', value: 3, hint: 'Next 2 weeks', accent: 'primary' },
  { id: 'j4', label: 'Wins This Season', value: 6, hint: 'Top 3 finishes: 11', accent: 'info' },
];
export const JOCKEY_ACTIVITY = [
  { id: 'ja1', text: 'Invitation from owner "P. Nguyen" for Race #18', time: '1 hour ago' },
  { id: 'ja2', text: 'You ACCEPTED ride on "Bão Tố" — Race #12', time: 'Yesterday' },
  { id: 'ja3', text: 'Race #9 marked COMPLETED — finished 2nd', time: '3 days ago' },
  { id: 'ja4', text: 'New schedule published for "Saigon Cup"', time: '4 days ago' },
];
export const JOCKEY_ACTIONS = [
  { id: 'jc1', label: 'View Invitations', to: '/jockey/invitations', icon: '✉️' },
  { id: 'jc2', label: 'My Race Schedule', to: '/jockey/races', icon: '🗓️' },
];

/* ----------------------------- REFEREE ----------------------------- */
export const REFEREE_STATS = [
  { id: 'r1', label: 'Assigned Races', value: 5, hint: 'This meeting', accent: 'primary' },
  { id: 'r2', label: 'Pre-checks Pending', value: 2, hint: 'Before start', accent: 'warning' },
  { id: 'r3', label: 'Results to Enter', value: 1, hint: 'Race completed', accent: 'danger' },
  { id: 'r4', label: 'Reports Filed', value: 8, hint: 'This season', accent: 'info' },
];
export const REFEREE_ACTIVITY = [
  { id: 'ra1', text: 'Race #12 is COMPLETED — result entry available', time: 'Just now' },
  { id: 'ra2', text: 'Pre-check required for Race #13 (barrier draw)', time: '30 mins ago' },
  { id: 'ra3', text: 'Incident report filed for Race #9', time: 'Yesterday' },
  { id: 'ra4', text: 'You were assigned to "Saigon Cup" meeting', time: '2 days ago' },
];
export const REFEREE_ACTIONS = [
  { id: 'rc1', label: 'Enter Results', to: '/referee/results', icon: '🏆' },
  { id: 'rc2', label: 'Reports', to: '/referee/reports', icon: '📋' },
];

/* --------------------------- SPECTATOR --------------------------- */
export const SPECTATOR_STATS = [
  { id: 's1', label: 'Upcoming Races', value: 7, hint: 'This week', accent: 'primary' },
  { id: 's2', label: 'Active Meetings', value: 2, hint: 'Ongoing', accent: 'success' },
  { id: 's3', label: 'Horses Tracked', value: 24, hint: 'In rankings', accent: 'info' },
  { id: 's4', label: 'Top Jockeys', value: 10, hint: 'Leaderboard', accent: 'warning' },
];
export const SPECTATOR_ACTIVITY = [
  { id: 'sa1', text: '"Saigon Cup" — Race #12 starts in 2 hours', time: 'Upcoming' },
  { id: 'sa2', text: 'New rankings published for Spring 2026', time: 'Today' },
  { id: 'sa3', text: 'Horse profile updated: "Phi Long"', time: 'Yesterday' },
  { id: 'sa4', text: 'Race #9 result is now available', time: '2 days ago' },
];
export const SPECTATOR_ACTIONS = [
  { id: 'sc1', label: 'Race Schedule', to: '/schedule', icon: '🗓️' },
  { id: 'sc2', label: 'Rankings', to: '/ranking', icon: '🏆' },
];
