// src/pages/jockey/Dashboard.jsx
import { useAuth } from '../../context/AuthContext';
import { StatCardGrid, ActivityPanel, QuickActions } from '../../components/common/DashboardWidgets';
import { JOCKEY_STATS, JOCKEY_ACTIVITY, JOCKEY_ACTIONS } from '../../mocks/mockDashboard';

const GOLD = '#D4AF37';

// Jockey: lời mời đang chờ, các ride đã nhận, các race sắp tới.
const JockeyDashboard = () => {
  const { user } = useAuth();
  const name = user?.fullName || user?.username || user?.name || 'Jockey';

  return (
    <div>
      <h2 className="mb-1" style={{ color: GOLD }}>Welcome back, {name} 🏇</h2>
      <p className="text-muted mb-4">Your invitations, accepted rides and upcoming races.</p>

      <StatCardGrid items={JOCKEY_STATS} />

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <ActivityPanel title="Upcoming & Recent" items={JOCKEY_ACTIVITY} />
        </div>
        <div className="col-12 col-lg-5">
          <QuickActions title="Quick Actions" actions={JOCKEY_ACTIONS} />
        </div>
      </div>
    </div>
  );
};

export default JockeyDashboard;