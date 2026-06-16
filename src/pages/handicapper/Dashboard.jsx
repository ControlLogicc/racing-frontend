// src/pages/handicapper/Dashboard.jsx
import { useAuth } from '../../context/AuthContext';
import { StatCardGrid, ActivityPanel, QuickActions } from '../../components/common/DashboardWidgets';
import { HANDICAPPER_STATS, HANDICAPPER_ACTIVITY, HANDICAPPER_ACTIONS } from '../../mocks/mockDashboard';

const GOLD = '#D4AF37';

// Handicapper: race được phân công, gán/duyệt handicap weights, công việc review.
const HandicapperDashboard = () => {
  const { user } = useAuth();
  const name = user?.fullName || user?.username || user?.name || 'Handicapper';

  return (
    <div>
      <h2 className="mb-1" style={{ color: GOLD }}>Welcome back, {name} 📊</h2>
      <p className="text-muted mb-4">Assigned races, handicap weights and review tasks.</p>

      <StatCardGrid items={HANDICAPPER_STATS} />

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <ActivityPanel title="Weight Review Tasks" items={HANDICAPPER_ACTIVITY} />
        </div>
        <div className="col-12 col-lg-5">
          <QuickActions title="Quick Actions" actions={HANDICAPPER_ACTIONS} />
        </div>
      </div>
    </div>
  );
};

export default HandicapperDashboard;