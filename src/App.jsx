import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

// Layouts & Components (public)
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';

// Guard + Dashboard layout dùng chung
import RoleRoute from './components/RoleRoute.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';

// Public pages
import HomePage from './pages/spectator/HomePage.jsx';
import RaceSchedulePage from './pages/spectator/RaceSchedulePage.jsx';
import HorseRankingPage from './pages/spectator/HorseRankingPage.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';

// Dashboard pages (theo role)
import AdminDashboard from './pages/admin/Dashboard.jsx';
import OwnerDashboard from './pages/owner/Dashboard.jsx';
import JockeyDashboard from './pages/jockey/Dashboard.jsx';
import RefereeDashboard from './pages/referee/Dashboard.jsx';
import HandicapperDashboard from './pages/handicapper/Dashboard.jsx';
import SpectatorDashboard from './pages/spectator/Dashboard.jsx';

// Placeholder + error pages
import PlaceholderPage from './pages/common/PlaceholderPage.jsx';
import ForbiddenPage from './pages/errors/ForbiddenPage.jsx';
import NotFoundPage from './pages/errors/NotFoundPage.jsx';

/* === Layout công khai (Navbar + Sidebar tĩnh) cho trang read-only === */
const MainLayout = () => (
  <>
    <Navbar />
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '20px' }}>
        <Outlet />
      </div>
    </div>
  </>
);

/* === Layout trống cho Login/Register === */
const AuthLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

function App() {
  return (
    <Routes>
      {/* NHÓM 1: AUTH (không sidebar) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* NHÓM 2: TRANG CÔNG KHAI (read-only) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/schedule" element={<RaceSchedulePage />} />
        <Route path="/ranking" element={<HorseRankingPage />} />
        <Route path="/horses" element={<PlaceholderPage title="Horse Profiles" />} />
      </Route>

      {/* NHÓM 3: DASHBOARD ADMIN */}
      <Route element={<RoleRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<PlaceholderPage title="Users" />} />
          <Route path="/admin/seasons" element={<PlaceholderPage title="Seasons" />} />
          <Route path="/admin/meetings" element={<PlaceholderPage title="Meetings" />} />
          <Route path="/admin/races" element={<PlaceholderPage title="Races" />} />
        </Route>
      </Route>

      {/* NHÓM 4: DASHBOARD OWNER */}
      <Route element={<RoleRoute allowedRoles={['owner']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/owner" element={<OwnerDashboard />} />
          <Route path="/owner/horses" element={<PlaceholderPage title="My Horses" />} />
          <Route path="/owner/registrations" element={<PlaceholderPage title="Race Registrations" />} />
          <Route path="/owner/invitations" element={<PlaceholderPage title="Jockey Invitations" />} />
        </Route>
      </Route>

      {/* NHÓM 5: DASHBOARD JOCKEY */}
      <Route element={<RoleRoute allowedRoles={['jockey']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/jockey" element={<JockeyDashboard />} />
          <Route path="/jockey/invitations" element={<PlaceholderPage title="Invitations" />} />
          <Route path="/jockey/races" element={<PlaceholderPage title="My Race Schedule" />} />
        </Route>
      </Route>

      {/* NHÓM 6: DASHBOARD REFEREE */}
      <Route element={<RoleRoute allowedRoles={['referee']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/referee" element={<RefereeDashboard />} />
          <Route path="/referee/races" element={<PlaceholderPage title="Assigned Races" />} />
          <Route path="/referee/pre-check" element={<PlaceholderPage title="Race Review / Pre-check" />} />
          <Route path="/referee/results" element={<PlaceholderPage title="Results" />} />
          <Route path="/referee/reports" element={<PlaceholderPage title="Reports" />} />
        </Route>
      </Route>

      {/* NHÓM 7: DASHBOARD HANDICAPPER */}
      <Route element={<RoleRoute allowedRoles={['handicapper']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/handicapper" element={<HandicapperDashboard />} />
          <Route path="/handicapper/races" element={<PlaceholderPage title="Assigned Races" />} />
          <Route path="/handicapper/weights" element={<PlaceholderPage title="Handicap Weights" />} />
        </Route>
      </Route>

      {/* NHÓM 8: DASHBOARD SPECTATOR (cần đăng nhập) */}
      <Route element={<RoleRoute allowedRoles={['spectator']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/spectator" element={<SpectatorDashboard />} />
        </Route>
      </Route>

      {/* TRANG LỖI */}
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path="/not-found" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;