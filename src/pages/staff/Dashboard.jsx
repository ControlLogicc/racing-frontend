import { useAuth } from '../../hooks/useAuth';
import { StatCardGrid, ActivityPanel, QuickActions } from '../../components/common/DashboardWidgets';
import { STAFF_STATS, STAFF_ACTIVITY, STAFF_ACTIONS } from '../../mocks/mockDashboard';

const GOLD = '#D4AF37';

export default function StaffDashboard() {
  const { user } = useAuth();
  const name = user?.fullName || 'Staff';

  return (
    <div>
      <h2 className="mb-1" style={{ color: GOLD }}>Welcome back, {name} 🏟️</h2>
      <p className="text-muted mb-4">Race schedule, meetings and result publishing overview.</p>

      <StatCardGrid items={STAFF_STATS} />

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <ActivityPanel title="Recent Activity" items={STAFF_ACTIVITY} />
        </div>
        <div className="col-12 col-lg-5">
          <QuickActions title="Quick Actions" actions={STAFF_ACTIONS} />
        </div>
      </div>
    </div>
  );
}
