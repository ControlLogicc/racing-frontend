import { useAuth } from '../../hooks/useAuth';
import { StatCardGrid, ActivityPanel, QuickActions } from '../../components/common/DashboardWidgets';
import { REFEREE_STATS, REFEREE_ACTIVITY, REFEREE_ACTIONS } from '../../mocks/mockDashboard';

const GOLD = '#D4AF37';

export default function RefereeDashboard() {
  const { user } = useAuth();
  const name = user?.fullName || 'Referee';

  return (
    <div>
      <h2 className="mb-1" style={{ color: GOLD }}>Welcome back, {name} ⚖️</h2>
      <p className="text-muted mb-4">Assigned races, results and reports.</p>

      <StatCardGrid items={REFEREE_STATS} />

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <ActivityPanel title="Pending Tasks" items={REFEREE_ACTIVITY} />
        </div>
        <div className="col-12 col-lg-5">
          <QuickActions title="Quick Actions" actions={REFEREE_ACTIONS} />
        </div>
      </div>
    </div>
  );
}
