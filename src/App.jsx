import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// 1. Pages chung
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// 2. Layout
import AdminLayout from './layouts/AdminLayout'; 

// 3. Các Dashboards bạn đã tạo
import AdminDashboard from './pages/admin/Dashboard';
import OwnerDashboard from './pages/owner/Dashboard';
import JockeyDashboard from './pages/jockey/Dashboard';
import RefereeDashboard from './pages/referee/Dashboard';
import HandicapperDashboard from './pages/handicapper/Dashboard';
import SpectatorDashboard from './pages/spectator/Dashboard'; // Đã thêm Spectator

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Ban Tổ Chức (ADMIN) */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
          </Route>

          {/* Chủ Ngựa (OWNER) */}
          <Route element={<ProtectedRoute allowedRoles={['OWNER']} />}>
            <Route element={<AdminLayout />}> 
              <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            </Route>
          </Route>

          {/* Nài Ngựa (JOCKEY) */}
          <Route element={<ProtectedRoute allowedRoles={['JOCKEY']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/jockey/dashboard" element={<JockeyDashboard />} />
            </Route>
          </Route>

          {/* Trọng Tài (REFEREE) */}
          <Route element={<ProtectedRoute allowedRoles={['REFEREE']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/referee/dashboard" element={<RefereeDashboard />} />
            </Route>
          </Route>

          {/* Xếp Hạng (HANDICAPPER) */}
          <Route element={<ProtectedRoute allowedRoles={['HANDICAPPER']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/handicapper/dashboard" element={<HandicapperDashboard />} />
            </Route>
          </Route>

          {/* Khán Giả (SPECTATOR) */}
          <Route element={<ProtectedRoute allowedRoles={['SPECTATOR']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/spectator/dashboard" element={<SpectatorDashboard />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

