import { Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import { ROLES } from '../constants/roles';

import HomePage from '../pages/public/HomePage';
import NewsPage from '../pages/public/NewsPage';
import MenuPage from '../pages/public/MenuPage';
import NotFoundPage from '../pages/errors/NotFoundPage';
import ForbiddenPage from '../pages/errors/ForbiddenPage';

// Spectator (read-only, public — Mục 4 CLAUDE.md)
import SchedulePage from '../pages/spectator/SchedulePage';
import RankingPage from '../pages/spectator/RankingPage';
import SpectatorHorsesPage from '../pages/spectator/HorsesPage';
import SpectatorDashboardOverview from '../pages/spectator/Dashboard';
import RaceResultPage from '../pages/spectator/RaceResultPage';
import SpectatorRaceDetailPage from '../pages/spectator/RaceDetailPage';
import SpectatorResultsListPage from '../pages/spectator/ResultsListPage';

// Admin
import AdminDashboardOverview from '../pages/admin/Dashboard';
import AdminUsersPage from '../pages/admin/UsersPage';
import CreateUserPage from '../pages/admin/CreateUserPage';

// Staff
import StaffDashboardOverview from '../pages/staff/Dashboard';
import StaffHorsesPage from '../pages/staff/HorsesPage';
import StaffInvitationsPage from '../pages/staff/InvitationsPage';
import StaffRegistrationsPage from '../pages/staff/RegistrationsPage';
import StaffEntriesPage from '../pages/staff/EntriesPage';
import StaffCreateEntryPage from '../pages/staff/CreateEntryPage';
import StaffResultsPage from '../pages/staff/ResultsPage';
import StaffRacesPage from '../pages/staff/RacesPage';
import StaffRaceDetailPage from '../pages/staff/RaceDetailPage';
import StaffReportsPage from '../pages/staff/ReportsPage';

// Admin — cấu hình hệ thống (D11: Admin tạo Season/Meeting/Race, không phải Staff)
import SeasonsPage from '../pages/admin/SeasonsPage';
import CreateSeasonPage from '../pages/admin/CreateSeasonPage';
import EditSeasonPage from '../pages/admin/EditSeasonPage';
import MeetingsPage from '../pages/admin/MeetingsPage';
import CreateMeetingPage from '../pages/admin/CreateMeetingPage';
import EditMeetingPage from '../pages/admin/EditMeetingPage';
import AdminRacesPage from '../pages/admin/RacesPage';
import CreateRacePage from '../pages/admin/CreateRacePage';
import EditRacePage from '../pages/admin/EditRacePage';
import RaceConditionsPage from '../pages/admin/RaceConditionsPage';
import CreateRaceConditionPage from '../pages/admin/CreateRaceConditionPage';
import EditRaceConditionPage from '../pages/admin/EditRaceConditionPage';
import RacecoursesPage from '../pages/admin/RacecoursesPage';
import CreateRacecoursePage from '../pages/admin/CreateRacecoursePage';
import EditRacecoursePage from '../pages/admin/EditRacecoursePage';
import PrizesPage from '../pages/admin/PrizesPage';
import CreatePrizePage from '../pages/admin/CreatePrizePage';
import EditPrizePage from '../pages/admin/EditPrizePage';
import AdminRefereeReportsPage from '../pages/admin/RefereeReportsPage';
import AdminResultsPage from '../pages/admin/ResultsPage';
import AdminNewsPage from '../pages/admin/NewsPage';
import CreateNewsPage from '../pages/admin/CreateNewsPage';

// Owner
import OwnerDashboardOverview from '../pages/owner/Dashboard';
import OwnerHorsesPage from '../pages/owner/HorsesPage';
import OwnerRegistrationsPage from '../pages/owner/RegistrationsPage';
import OwnerInvitationsPage from '../pages/owner/InvitationsPage';
import OwnerOpenRacesPage from '../pages/owner/OpenRacesPage';
import RegisterRacePage from '../pages/owner/RegisterRacePage';
import HorseDetailPage from '../pages/owner/HorseDetailPage';

// Jockey
import JockeyDashboardOverview from '../pages/jockey/Dashboard';
import JockeyProfilePage from '../pages/jockey/ProfilePage';
import JockeyInvitationsPage from '../pages/jockey/InvitationsPage';
import JockeyRacesPage from '../pages/jockey/RacesPage';

// Referee
import RefereeDashboardOverview from '../pages/referee/Dashboard';
import RefereeChecksPage from '../pages/referee/ChecksPage';
import RefereeResultsPage from '../pages/referee/ResultsPage';
import RefereeReportsPage from '../pages/referee/ReportsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. Các route công khai KHÔNG cần đăng nhập (Public Layout) — read-only cho spectator + khách */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="ranking" element={<RankingPage />} />
        <Route path="horses" element={<SpectatorHorsesPage />} />
        <Route path="race/:raceId" element={<SpectatorRaceDetailPage />} />
        <Route path="race-results/:raceId" element={<RaceResultPage />} />
        <Route path="forbidden" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* 2. Các route CẦN đăng nhập (Dashboard Layout) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>

          {/* Admin: quản lý user + tạo cấu hình hệ thống (Season, Meeting, Race) — D11 */}
          <Route path="admin" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminDashboardOverview /></ProtectedRoute>
          } />
          <Route path="admin/users" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminUsersPage /></ProtectedRoute>
          } />
          <Route path="admin/users/create" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><CreateUserPage /></ProtectedRoute>
          } />
          <Route path="admin/seasons" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><SeasonsPage /></ProtectedRoute>
          } />
          <Route path="admin/seasons/create" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><CreateSeasonPage /></ProtectedRoute>
          } />
          <Route path="admin/seasons/:id/edit" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><EditSeasonPage /></ProtectedRoute>
          } />
          <Route path="admin/meetings" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><MeetingsPage /></ProtectedRoute>
          } />
          <Route path="admin/meetings/create" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><CreateMeetingPage /></ProtectedRoute>
          } />
          <Route path="admin/meetings/:id/edit" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><EditMeetingPage /></ProtectedRoute>
          } />
          <Route path="admin/races" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}><AdminRacesPage /></ProtectedRoute>
          } />
          <Route path="admin/races/create" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><CreateRacePage /></ProtectedRoute>
          } />
          <Route path="admin/races/:id/edit" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><EditRacePage /></ProtectedRoute>
          } />
          <Route path="admin/race-conditions" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><RaceConditionsPage /></ProtectedRoute>
          } />
          <Route path="admin/race-conditions/create" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><CreateRaceConditionPage /></ProtectedRoute>
          } />
          <Route path="admin/race-conditions/:id/edit" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><EditRaceConditionPage /></ProtectedRoute>
          } />
          <Route path="admin/racecourses" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><RacecoursesPage /></ProtectedRoute>
          } />
          <Route path="admin/racecourses/create" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><CreateRacecoursePage /></ProtectedRoute>
          } />
          <Route path="admin/racecourses/:id/edit" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><EditRacecoursePage /></ProtectedRoute>
          } />
          <Route path="admin/prizes" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><PrizesPage /></ProtectedRoute>
          } />
          <Route path="admin/prizes/create" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><CreatePrizePage /></ProtectedRoute>
          } />
          <Route path="admin/prizes/:id/edit" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><EditPrizePage /></ProtectedRoute>
          } />
          <Route path="admin/reports" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminRefereeReportsPage /></ProtectedRoute>
          } />
          <Route path="admin/results" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminResultsPage /></ProtectedRoute>
          } />
          <Route path="admin/news" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminNewsPage /></ProtectedRoute>
          } />
          <Route path="admin/news/create" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><CreateNewsPage /></ProtectedRoute>
          } />
          {/* Staff: vận hành race — theo dõi invitation, remove entry nếu cần (D11) */}
          <Route path="staff" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}><StaffDashboardOverview /></ProtectedRoute>
          } />
          <Route path="staff/horses" element={
            <ProtectedRoute allowedRoles={[ROLES.STAFF]}><StaffHorsesPage /></ProtectedRoute>
          } />
          <Route path="staff/races" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}><StaffRacesPage /></ProtectedRoute>
          } />
          <Route path="staff/races/:id" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}><StaffRaceDetailPage /></ProtectedRoute>
          } />
          <Route path="staff/invitations" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}><StaffInvitationsPage /></ProtectedRoute>
          } />
          <Route path="staff/registrations" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}><StaffRegistrationsPage /></ProtectedRoute>
          } />
          <Route path="staff/entries" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}><StaffEntriesPage /></ProtectedRoute>
          } />
          <Route path="staff/create-entry" element={
            <ProtectedRoute allowedRoles={[ROLES.STAFF]}><StaffCreateEntryPage /></ProtectedRoute>
          } />
          <Route path="staff/results" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}><StaffResultsPage /></ProtectedRoute>
          } />
          <Route path="staff/reports" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF]}><StaffReportsPage /></ProtectedRoute>
          } />
          {/* Owner: quản lý ngựa, nộp đăng ký đua, gửi lời mời jockey */}
          <Route path="owner" element={
            <ProtectedRoute allowedRoles={[ROLES.OWNER]}><OwnerDashboardOverview /></ProtectedRoute>
          } />
          <Route path="owner/horses" element={
            <ProtectedRoute allowedRoles={[ROLES.OWNER]}><OwnerHorsesPage /></ProtectedRoute>
          } />
          <Route path="owner/horses/:id" element={
            <ProtectedRoute allowedRoles={[ROLES.OWNER]}><HorseDetailPage /></ProtectedRoute>
          } />
          <Route path="owner/registrations" element={
            <ProtectedRoute allowedRoles={[ROLES.OWNER]}><OwnerRegistrationsPage /></ProtectedRoute>
          } />
          <Route path="owner/invitations" element={
            <ProtectedRoute allowedRoles={[ROLES.OWNER]}><OwnerInvitationsPage /></ProtectedRoute>
          } />
          <Route path="owner/races" element={
            <ProtectedRoute allowedRoles={[ROLES.OWNER]}><OwnerOpenRacesPage /></ProtectedRoute>
          } />
          <Route path="owner/register" element={
            <ProtectedRoute allowedRoles={[ROLES.OWNER]}><RegisterRacePage /></ProtectedRoute>
          } />

          {/* Jockey: xem & phản hồi lời mời, lịch đua của mình */}
          <Route path="jockey" element={
            <ProtectedRoute allowedRoles={[ROLES.JOCKEY]}><JockeyDashboardOverview /></ProtectedRoute>
          } />
          <Route path="jockey/profile" element={
            <ProtectedRoute allowedRoles={[ROLES.JOCKEY]}><JockeyProfilePage /></ProtectedRoute>
          } />
          <Route path="jockey/invitations" element={
            <ProtectedRoute allowedRoles={[ROLES.JOCKEY]}><JockeyInvitationsPage /></ProtectedRoute>
          } />
          <Route path="jockey/races" element={
            <ProtectedRoute allowedRoles={[ROLES.JOCKEY]}><JockeyRacesPage /></ProtectedRoute>
          } />

          {/* Referee: nhập kết quả race, viết báo cáo vi phạm */}
          <Route path="referee" element={
            <ProtectedRoute allowedRoles={[ROLES.REFEREE]}><RefereeDashboardOverview /></ProtectedRoute>
          } />
          <Route path="referee/checks" element={
            <ProtectedRoute allowedRoles={[ROLES.REFEREE]}><RefereeChecksPage /></ProtectedRoute>
          } />
          <Route path="referee/results" element={
            <ProtectedRoute allowedRoles={[ROLES.REFEREE]}><RefereeResultsPage /></ProtectedRoute>
          } />
          <Route path="referee/reports" element={
            <ProtectedRoute allowedRoles={[ROLES.REFEREE]}><RefereeReportsPage /></ProtectedRoute>
          } />

          {/* Spectator đã đăng nhập: dashboard overview (link nhanh tới /schedule, /ranking) */}
          <Route path="spectator" element={
            <ProtectedRoute allowedRoles={[ROLES.SPECTATOR]}><SpectatorDashboardOverview /></ProtectedRoute>
          } />
          <Route path="spectator/schedule" element={
            <ProtectedRoute allowedRoles={[ROLES.SPECTATOR]}><SchedulePage /></ProtectedRoute>
          } />
          <Route path="spectator/rankings" element={
            <ProtectedRoute allowedRoles={[ROLES.SPECTATOR]}><RankingPage /></ProtectedRoute>
          } />
          <Route path="spectator/horses" element={
            <ProtectedRoute allowedRoles={[ROLES.SPECTATOR]}><SpectatorHorsesPage /></ProtectedRoute>
          } />
          <Route path="spectator/results" element={
            <ProtectedRoute allowedRoles={[ROLES.SPECTATOR]}><SpectatorResultsListPage /></ProtectedRoute>
          } />
          <Route path="spectator/results/:raceId" element={
            <ProtectedRoute allowedRoles={[ROLES.SPECTATOR]}><RaceResultPage /></ProtectedRoute>
          } />
          <Route path="spectator/race/:raceId" element={
            <ProtectedRoute allowedRoles={[ROLES.SPECTATOR]}><SpectatorRaceDetailPage /></ProtectedRoute>
          } />
        </Route>
      </Route>
    </Routes>
  );
}
