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

// Admin
import AdminDashboardOverview from '../pages/admin/Dashboard';
import AdminUsersPage from '../pages/admin/UsersPage';

// Staff
import StaffDashboardOverview from '../pages/staff/Dashboard';
import SeasonsPage from '../pages/staff/SeasonsPage';
import MeetingsPage from '../pages/staff/MeetingsPage';
import RacesPage from '../pages/staff/RacesPage';
import StaffRegistrationsPage from '../pages/staff/RegistrationsPage';
import StaffEntriesPage from '../pages/staff/EntriesPage';

// Owner
import OwnerDashboardOverview from '../pages/owner/Dashboard';
import OwnerHorsesPage from '../pages/owner/HorsesPage';
import OwnerRegistrationsPage from '../pages/owner/RegistrationsPage';
import OwnerInvitationsPage from '../pages/owner/InvitationsPage';

// Jockey
import JockeyDashboardOverview from '../pages/jockey/Dashboard';
import JockeyInvitationsPage from '../pages/jockey/InvitationsPage';
import JockeyRacesPage from '../pages/jockey/RacesPage';

// Referee
import RefereeDashboardOverview from '../pages/referee/Dashboard';
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
        <Route path="forbidden" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* 2. Các route CẦN đăng nhập (Dashboard Layout) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>

          {/* Admin: quản lý user, gán role, khoá/mở tài khoản */}
          <Route path="admin" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminDashboardOverview /></ProtectedRoute>
          } />
          <Route path="admin/users" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminUsersPage /></ProtectedRoute>
          } />

          {/* Staff: Season, Meeting, Race; duyệt registration; xác nhận entry */}
          <Route path="staff" element={
            <ProtectedRoute allowedRoles={[ROLES.STAFF]}><StaffDashboardOverview /></ProtectedRoute>
          } />
          <Route path="staff/seasons" element={
            <ProtectedRoute allowedRoles={[ROLES.STAFF]}><SeasonsPage /></ProtectedRoute>
          } />
          <Route path="staff/meetings" element={
            <ProtectedRoute allowedRoles={[ROLES.STAFF]}><MeetingsPage /></ProtectedRoute>
          } />
          <Route path="staff/races" element={
            <ProtectedRoute allowedRoles={[ROLES.STAFF]}><RacesPage /></ProtectedRoute>
          } />
          <Route path="staff/registrations" element={
            <ProtectedRoute allowedRoles={[ROLES.STAFF]}><StaffRegistrationsPage /></ProtectedRoute>
          } />
          <Route path="staff/entries" element={
            <ProtectedRoute allowedRoles={[ROLES.STAFF]}><StaffEntriesPage /></ProtectedRoute>
          } />

          {/* Owner: quản lý ngựa, nộp đăng ký đua, gửi lời mời jockey */}
          <Route path="owner" element={
            <ProtectedRoute allowedRoles={[ROLES.OWNER]}><OwnerDashboardOverview /></ProtectedRoute>
          } />
          <Route path="owner/horses" element={
            <ProtectedRoute allowedRoles={[ROLES.OWNER]}><OwnerHorsesPage /></ProtectedRoute>
          } />
          <Route path="owner/registrations" element={
            <ProtectedRoute allowedRoles={[ROLES.OWNER]}><OwnerRegistrationsPage /></ProtectedRoute>
          } />
          <Route path="owner/invitations" element={
            <ProtectedRoute allowedRoles={[ROLES.OWNER]}><OwnerInvitationsPage /></ProtectedRoute>
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

          {/* Referee: nhập kết quả race, viết báo cáo vi phạm */}
          <Route path="referee" element={
            <ProtectedRoute allowedRoles={[ROLES.REFEREE]}><RefereeDashboardOverview /></ProtectedRoute>
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
        </Route>
      </Route>
    </Routes>
  );
}
