import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { invitationService } from '../../services/invitationService';
import { raceService } from '../../services/raceService';
import { entryService } from '../../services/entryService';
import { RACE_STATUS, RACE_INVITATION_STATUS, RACE_ENTRY_STATUS } from '../../constants/status';
import { formatDate } from '../../utils/formatDate';
import { StatCardGrid, QuickActions } from '../../components/common/DashboardWidgets';
import StatusBadge from '../../components/common/StatusBadge';
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';

const GOLD = '#D4AF37';

// Staff vận hành race (D11): chỉnh invitation deadline, quản lý entry, publish result, payout
const QUICK_ACTIONS = [
  { id: 'qa1', label: 'Lời mời Jockey', to: '/staff/invitations', icon: '✉️' },
  { id: 'qa2', label: 'Quản lý Entry', to: '/staff/entries', icon: '✅' },
  { id: 'qa3', label: 'Xem đăng ký', to: '/staff/registrations', icon: '📋' },
  { id: 'qa4', label: 'Kết quả & Payout', to: '/staff/results', icon: '🏆' },
];

export default function StaffDashboard() {
  const { user } = useAuth();
  const [trackedInvitations, setTrackedInvitations] = useState([]);
  const [upcomingRaces, setUpcomingRaces] = useState([]);
  const [pendingEntries, setPendingEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    Promise.all([
      invitationService.getAll(),
      raceService.getAll(),
      entryService.getAll(),
    ])
      .then(([invitations, races, entries]) => {
        // Lời mời cần theo dõi: SENT (chờ jockey phản hồi) + EXPIRED (cần Staff xử lý)
        setTrackedInvitations(
          invitations.filter(
            (i) =>
              i.status === RACE_INVITATION_STATUS.SENT ||
              i.status === RACE_INVITATION_STATUS.EXPIRED
          )
        );

        setUpcomingRaces(races.filter((r) => r.status === RACE_STATUS.UPCOMING));

        // Entry đang tham gia race (auto-confirmed, chưa bị REMOVE)
        setPendingEntries(entries.filter((e) => e.status !== RACE_ENTRY_STATUS.REMOVED));
      })
      .catch(() => setError('Không tải được dữ liệu dashboard.'))
      .finally(() => setLoading(false));
  };

  const refetch = () => {
    setLoading(true);
    setError('');
    load();
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const expiredCount = trackedInvitations.filter(
    (i) => i.status === RACE_INVITATION_STATUS.EXPIRED
  ).length;

  const stats = [
    {
      id: 's1',
      label: 'Lời mời cần theo dõi',
      value: trackedInvitations.length,
      hint: expiredCount > 0 ? `${expiredCount} đã hết hạn — cần xử lý` : 'Đang chờ jockey phản hồi',
      accent: expiredCount > 0 ? 'danger' : 'warning',
    },
    {
      id: 's2',
      label: 'Cuộc đua sắp tới',
      value: upcomingRaces.length,
      hint: 'Trạng thái UPCOMING',
      accent: 'primary',
    },
    {
      id: 's3',
      label: 'Entry trong race',
      value: pendingEntries.length,
      hint: 'Tự động tạo khi jockey accept',
      accent: 'primary',
    },
  ];

  return (
    <div>
      <h2 className="mb-1" style={{ color: GOLD }}>
        Xin chào, {user?.fullName || 'Staff'} 🏟️
      </h2>
      <p className="text-muted mb-4">
        Vận hành race — theo dõi lời mời, xác nhận entry, công bố kết quả.
      </p>

      <StatCardGrid items={stats} />

      <div className="row g-4">
        {/* ── Cột trái: 3 mini-sections ── */}
        <div className="col-12 col-lg-8">

          {/* 1. Lời mời cần theo dõi (SENT + EXPIRED) */}
          <div
            className="card shadow-sm mb-4"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
          >
            <div
              className="card-header bg-transparent d-flex justify-content-between align-items-center"
              style={{ borderBottom: `1px solid ${GOLD}` }}
            >
              <h5 className="mb-0" style={{ color: GOLD }}>
                Lời mời cần theo dõi
                {expiredCount > 0 && (
                  <span
                    className="badge ms-2"
                    style={{ backgroundColor: '#dc3545', color: '#fff', fontSize: '0.75rem' }}
                  >
                    {expiredCount} hết hạn
                  </span>
                )}
              </h5>
              <Link to="/staff/invitations" style={{ color: GOLD, fontSize: '0.875rem' }}>
                Xem tất cả →
              </Link>
            </div>
            <div className="card-body p-0">
              {trackedInvitations.length === 0 ? (
                <p className="text-muted p-3 mb-0">Không có lời mời nào cần theo dõi.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm mb-0" style={{ color: '#e9e9e9' }}>
                    <thead>
                      <tr style={{ color: '#a0a0a0', borderColor: '#2a2a2a' }}>
                        <th>Cuộc đua</th>
                        <th>Ngựa</th>
                        <th>Jockey</th>
                        <th>Deadline</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trackedInvitations.slice(0, 5).map((inv) => (
                        <tr key={inv.id} style={{ borderColor: '#2a2a2a' }}>
                          <td>{inv.raceName}</td>
                          <td>{inv.horseName}</td>
                          <td>{inv.jockeyName}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{formatDate(inv.deadline)}</td>
                          <td><StatusBadge status={inv.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* 2. Cuộc đua sắp tới */}
          <div
            className="card shadow-sm mb-4"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
          >
            <div
              className="card-header bg-transparent d-flex justify-content-between align-items-center"
              style={{ borderBottom: `1px solid ${GOLD}` }}
            >
              <h5 className="mb-0" style={{ color: GOLD }}>Cuộc đua sắp tới</h5>
              <Link to="/staff/races" style={{ color: GOLD, fontSize: '0.875rem' }}>
                Quản lý →
              </Link>
            </div>
            <div className="card-body p-0">
              {upcomingRaces.length === 0 ? (
                <p className="text-muted p-3 mb-0">Chưa có cuộc đua sắp tới.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm mb-0" style={{ color: '#e9e9e9' }}>
                    <thead>
                      <tr style={{ color: '#a0a0a0', borderColor: '#2a2a2a' }}>
                        <th>Tên cuộc đua</th>
                        <th>Cự ly</th>
                        <th>Thời gian</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingRaces.slice(0, 5).map((r) => (
                        <tr key={r.id} style={{ borderColor: '#2a2a2a' }}>
                          <td>{r.name}</td>
                          <td>{r.distance}m</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{formatDate(r.raceTime)}</td>
                          <td><StatusBadge status={r.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* 3. Entry trong race (auto-confirmed, không bị REMOVED) */}
          <div
            className="card shadow-sm"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
          >
            <div
              className="card-header bg-transparent d-flex justify-content-between align-items-center"
              style={{ borderBottom: `1px solid ${GOLD}` }}
            >
              <h5 className="mb-0" style={{ color: GOLD }}>
                Entry trong race
                <span
                  className="badge ms-2"
                  style={{ backgroundColor: '#D4AF37', color: '#111', fontSize: '0.75rem' }}
                >
                  {pendingEntries.length}
                </span>
              </h5>
              <Link to="/staff/entries" style={{ color: GOLD, fontSize: '0.875rem' }}>
                Quản lý →
              </Link>
            </div>
            <div className="card-body p-0">
              {pendingEntries.length === 0 ? (
                <p className="text-muted p-3 mb-0">Chưa có entry nào trong race.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm mb-0" style={{ color: '#e9e9e9' }}>
                    <thead>
                      <tr style={{ color: '#a0a0a0', borderColor: '#2a2a2a' }}>
                        <th>Cuộc đua</th>
                        <th>Ngựa</th>
                        <th>Jockey</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingEntries.slice(0, 5).map((e) => (
                        <tr key={e.id} style={{ borderColor: '#2a2a2a' }}>
                          <td>{e.raceName}</td>
                          <td>{e.horseName}</td>
                          <td>{e.jockeyName}</td>
                          <td><StatusBadge status={e.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Cột phải: Quick Actions ── */}
        <div className="col-12 col-lg-4">
          <QuickActions title="Thao tác nhanh" actions={QUICK_ACTIONS} />
        </div>
      </div>
    </div>
  );
}
