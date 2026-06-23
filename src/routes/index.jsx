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

// Admin
import AdminDashboardOverview from '../pages/admin/Dashboard';
import AdminUsersPage from '../pages/admin/UsersPage';

// Staff
import StaffDashboardOverview from '../pages/staff/Dashboard';
import StaffInvitationsPage from '../pages/staff/InvitationsPage';
import StaffRegistrationsPage from '../pages/staff/RegistrationsPage';
import StaffEntriesPage from '../pages/staff/EntriesPage';
import StaffResultsPage from '../pages/staff/ResultsPage';

// Admin — cấu hình hệ thống (D11: Admin tạo Season/Meeting/Race, không phải Staff)
import SeasonsPage from '../pages/admin/SeasonsPage';
import MeetingsPage from '../pages/admin/MeetingsPage';
import AdminRacesPage from '../pages/admin/RacesPage';
import RaceConditionsPage from '../pages/admin/RaceConditionsPage';
import RacecoursesPage from '../pages/admin/RacecoursesPage';
import PrizesPage from '../pages/admin/PrizesPage';
import AdminRefereeReportsPage from '../pages/admin/RefereeReportsPage';
import AdminResultsPage from '../pages/admin/ResultsPage';

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
import JockeyInvitationsPage from '../pages/jockey/InvitationsPage';
import JockeyRacesPage from '../pages/jockey/RacesPage';

// Referee
import RefereeDashboardOverview from '../pages/referee/Dashboard';
import RefereeReportsPage from '../pages/referee/ReportsPage';
import RefereeWeightCheckPage from '../pages/referee/WeightCheckPage';

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
          <Route path="admin/seasons" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><SeasonsPage /></ProtectedRoute>
          } />
          <Route path="admin/meetings" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><MeetingsPage /></ProtectedRoute>
          } />
          <Route path="admin/races" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminRacesPage /></ProtectedRoute>
          } />
          <Route path="admin/race-conditions" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><RaceConditionsPage /></ProtectedRoute>
          } />
          <Route path="admin/racecourses" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><RacecoursesPage /></ProtectedRoute>
          } />
          <Route path="admin/prizes" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><PrizesPage /></ProtectedRoute>
          } />
          <Route path="admin/reports" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminRefereeReportsPage /></ProtectedRoute>
          } />
          <Route path="admin/results" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminResultsPage /></ProtectedRoute>
          } />

          {/* Staff: vận hành race — theo dõi invitation, remove entry nếu cần (D11) */}
          <Route path="staff" element={
            <ProtectedRoute allowedRoles={[ROLES.STAFF]}><StaffDashboardOverview /></ProtectedRoute>
          } />
          <Route path="staff/invitations" element={
            <ProtectedRoute allowedRoles={[ROLES.STAFF]}><StaffInvitationsPage /></ProtectedRoute>
          } />
          <Route path="staff/registrations" element={
            <ProtectedRoute allowedRoles={[ROLES.STAFF]}><StaffRegistrationsPage /></ProtectedRoute>
          } />
          <Route path="staff/entries" element={
            <ProtectedRoute allowedRoles={[ROLES.STAFF]}><StaffEntriesPage /></ProtectedRoute>
          } />
          <Route path="staff/results" element={
            <ProtectedRoute allowedRoles={[ROLES.STAFF]}><StaffResultsPage /></ProtectedRoute>
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
          <Route path="jockey/invitations" element={
            <ProtectedRoute allowedRoles={[ROLES.JOCKEY]}><JockeyInvitationsPage /></ProtectedRoute>
          } />
          <Route path="jockey/races" element={
            <ProtectedRoute allowedRoles={[ROLES.JOCKEY]}><JockeyRacesPage /></ProtectedRoute>
          } />

          {/* Referee */}
          <Route path="referee" element={
            <ProtectedRoute allowedRoles={[ROLES.REFEREE]}><RefereeDashboardOverview /></ProtectedRoute>
          } />
          <Route path="referee/reports" element={
            <ProtectedRoute allowedRoles={[ROLES.REFEREE]}><RefereeReportsPage /></ProtectedRoute>
          } />
          <Route path="referee/weight-check/:raceId" element={
            <ProtectedRoute allowedRoles={[ROLES.REFEREE]}><RefereeWeightCheckPage /></ProtectedRoute>
          } />

          {/* Spectator đã đăng nhập: dashboard overview (link nhanh tới /schedule, /ranking) */}
          <Route path="spectator" element={
            <ProtectedRoute allowedRoles={[ROLES.SPECTATOR]}><SpectatorDashboardOverview /></ProtectedRoute>
          } />
        </Route>
      </Route>
    </Routes>
  );
}
