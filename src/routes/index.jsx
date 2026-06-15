import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForbiddenPage from '../pages/errors/ForbiddenPage';
import NotFoundPage from '../pages/errors/NotFoundPage';
import { ROLES } from '../constants/roles';

const Page = ({ title }) => <h4>{title}</h4>; // placeholder tạm

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />

      {/* Cần login, không giới hạn role */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Page title="Home" />} />
        </Route>
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/users" element={<Page title="Admin · Quản lý User" />} />
        </Route>
      </Route>

      {/* Staff */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.STAFF]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/staff/races" element={<Page title="Staff · Races" />} />
          <Route path="/staff/registrations" element={<Page title="Staff · Duyệt đăng ký" />} />
        </Route>
      </Route>

      {/* Referee */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.REFEREE]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/referee/reports" element={<Page title="Referee · Báo cáo" />} />
          <Route path="/referee/results" element={<Page title="Referee · Nhập kết quả" />} />
        </Route>
      </Route>

      {/* Owner */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.OWNER]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/owner/horses" element={<Page title="Owner · Ngựa của tôi" />} />
          <Route path="/owner/registrations" element={<Page title="Owner · Đăng ký đua" />} />
          <Route path="/owner/invitations" element={<Page title="Owner · Mời jockey" />} />
        </Route>
      </Route>

      {/* Jockey */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.JOCKEY]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/jockey/invitations" element={<Page title="Jockey · Lời mời" />} />
          <Route path="/jockey/schedule" element={<Page title="Jockey · Lịch đua" />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="/not-found" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}