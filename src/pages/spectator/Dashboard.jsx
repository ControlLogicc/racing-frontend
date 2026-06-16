// src/pages/spectator/Dashboard.jsx
import { useAuth } from '../../context/AuthContext';
import { StatCardGrid, ActivityPanel, QuickActions } from '../../components/common/DashboardWidgets';
import { SPECTATOR_STATS, SPECTATOR_ACTIVITY, SPECTATOR_ACTIONS } from '../../mocks/mockDashboard';

const GOLD = '#D4AF37';

// Spectator: lịch đua, bảng xếp hạng, hồ sơ ngựa — thông tin read-only.
const SpectatorDashboard = () => {
  const { user } = useAuth();
  const name = user?.fullName || user?.username || user?.name || 'Guest';

  return (
    <div>
      <h2 className="mb-1" style={{ color: GOLD }}>Welcome, {name} 🎟️</h2>
      <p className="text-muted mb-4">Race schedule, rankings and horse profiles (read-only).</p>

      <StatCardGrid items={SPECTATOR_STATS} />

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <ActivityPanel title="What's Happening" items={SPECTATOR_ACTIVITY} />
        </div>
        <div className="col-12 col-lg-5">
          <QuickActions title="Explore" actions={SPECTATOR_ACTIONS} />
        </div>
      </div>
    </div>
  );
};

export default SpectatorDashboard;