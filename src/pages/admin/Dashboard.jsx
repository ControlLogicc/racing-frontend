// src/pages/admin/Dashboard.jsx
import { useAuth } from '../../context/AuthContext';
import { StatCardGrid, ActivityPanel, QuickActions } from '../../components/common/DashboardWidgets';
import { ADMIN_STATS, ADMIN_ACTIVITY, ADMIN_ACTIONS } from '../../mocks/mockDashboard';

const GOLD = '#D4AF37';

// Admin: tập trung users / roles / accounts + tổng quan seasons / meetings / races.
// KHÔNG có hành động staff-only (publish kết quả, payout...).
const AdminDashboard = () => {
  const { user } = useAuth();
  const name = user?.fullName || user?.username || user?.name || 'Admin';

  return (
    <div>
      <h2 className="mb-1" style={{ color: GOLD }}>Welcome back, {name} 👋</h2>
      <p className="text-muted mb-4">System overview — users, accounts and race calendar.</p>

      <StatCardGrid items={ADMIN_STATS} />

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <ActivityPanel title="Recent Activity" items={ADMIN_ACTIVITY} />
        </div>
        <div className="col-12 col-lg-5">
          <QuickActions title="Quick Actions" actions={ADMIN_ACTIONS} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;