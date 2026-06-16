// src/pages/owner/Dashboard.jsx
import { useAuth } from '../../context/AuthContext';
import { StatCardGrid, ActivityPanel, QuickActions } from '../../components/common/DashboardWidgets';
import { OWNER_STATS, OWNER_ACTIVITY, OWNER_ACTIONS } from '../../mocks/mockDashboard';

const GOLD = '#D4AF37';

// Owner: ngựa sở hữu, đăng ký đua, lời mời jockey, các entry sắp tới.
const OwnerDashboard = () => {
  const { user } = useAuth();
  const name = user?.fullName || user?.username || user?.name || 'Owner';

  return (
    <div>
      <h2 className="mb-1" style={{ color: GOLD }}>Welcome back, {name} 🐎</h2>
      <p className="text-muted mb-4">Your stable, registrations and jockey invitations.</p>

      <StatCardGrid items={OWNER_STATS} />

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <ActivityPanel title="Recent Activity" items={OWNER_ACTIVITY} />
        </div>
        <div className="col-12 col-lg-5">
          <QuickActions title="Quick Actions" actions={OWNER_ACTIONS} />
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;