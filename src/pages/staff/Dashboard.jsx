import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { raceService } from '../../services/raceService';
import { entryService } from '../../services/entryService';
import { RACE_STATUS, RACE_ENTRY_STATUS } from '../../constants/status';
import { formatDate } from '../../utils/formatDate';
import { StatCardGrid, QuickActions } from '../../components/common/DashboardWidgets';
import StatusBadge from '../../components/common/StatusBadge';
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import './staff-theme.css';

const GOLD = '#D4AF37';

import { FlagFill, EnvelopePaperFill, CheckCircleFill, PencilSquare, TrophyFill } from 'react-bootstrap-icons';

const QUICK_ACTIONS = [
  { id: 'qa0', label: 'Races của tôi', to: '/staff/races', icon: <FlagFill className="me-2" /> },
  { id: 'qa1', label: 'Lời mời Jockey', to: '/staff/invitations', icon: <EnvelopePaperFill className="me-2" /> },
  { id: 'qa2', label: 'Quản lý Entry', to: '/staff/entries', icon: <CheckCircleFill className="me-2" /> },
  { id: 'qa3', label: 'Xem đăng ký', to: '/staff/registrations', icon: <PencilSquare className="me-2" /> },
  { id: 'qa4', label: 'Kết quả & Payout', to: '/staff/results', icon: <TrophyFill className="me-2" /> },
];

export default function StaffDashboard() {
  const { user } = useAuth();
  const [races, setRaces] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      // Dùng allSettled để một cái fail không crash cả dashboard
      const [racesResult, entriesResult] = await Promise.allSettled([
        raceService.getAssignedToStaff(),
        entryService.getAll(),
      ]);
      setRaces(racesResult.status === 'fulfilled' ? racesResult.value : []);
      setEntries(entriesResult.status === 'fulfilled' ? entriesResult.value : []);
    } catch {
      setError('Không tải được dữ liệu dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const upcomingRaces = races.filter((r) =>
    r.status === RACE_STATUS.SCHEDULED || r.status === RACE_STATUS.OPEN_FOR_ENTRY
  );
  const activeEntries = entries.filter((e) => e.status !== RACE_ENTRY_STATUS.REMOVED && e.status !== RACE_ENTRY_STATUS.SCRATCHED);

  const stats = [
    {
      id: 's1',
      label: 'Race được gán',
      value: races.length,
      hint: `${upcomingRaces.length} sắp tới`,
      accent: 'primary',
    },
    {
      id: 's2',
      label: 'Entry trong race',
      value: activeEntries.length,
      hint: 'Tự động tạo khi jockey accept',
      accent: 'primary',
    },
    {
      id: 's3',
      label: 'Race đang chạy',
      value: races.filter((r) => r.status === RACE_STATUS.RUNNING).length,
      hint: 'Trạng thái RUNNING',
      accent: 'danger',
    },
  ];

  return (
    <div className="staff-theme-wrapper p-3">
      <h2 className="staff-header-title">
        Xin chào, {user?.fullName || 'Staff'}
      </h2>
      <p className="staff-subtitle mb-4">
        Vận hành race — theo dõi entry, xác nhận, công bố kết quả.
      </p>

      <StatCardGrid items={stats} />

      <div className="row g-4">
        <div className="col-12">

          {/* Races sắp tới */}
          <div className="staff-card mb-4">
            <div className="staff-card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Race được gán</h5>
              <span style={{ color: '#888', fontSize: 13, textTransform: 'none' }}>{races.length} race</span>
            </div>
            <div className="card-body p-0">
              {races.length === 0 ? (
                <p className="text-muted p-3 mb-0">Chưa có race nào được gán.</p>
              ) : (
                <div className="table-responsive">
                  <table className="staff-table mb-0">
                    <thead>
                      <tr>
                        <th>Tên cuộc đua</th>
                        <th>Thời gian</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {races.slice(0, 5).map((r) => (
                        <tr key={r.id}>
                          <td>{r.name}</td>
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

          {/* Entry trong race */}
          <div className="staff-card">
            <div className="staff-card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                Entry trong race
                <span className="badge ms-2" style={{ backgroundColor: '#D4AF37', color: '#111', fontSize: '0.75rem', verticalAlign: 'middle' }}>
                  {activeEntries.length}
                </span>
              </h5>
            </div>
            <div className="card-body p-0">
              {activeEntries.length === 0 ? (
                <p className="text-muted p-3 mb-0">Chưa có entry nào trong race.</p>
              ) : (
                <div className="table-responsive">
                  <table className="staff-table mb-0">
                    <thead>
                      <tr>
                        <th>Cuộc đua</th>
                        <th>Ngựa</th>
                        <th>Jockey</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeEntries.slice(0, 5).map((e) => (
                        <tr key={e.id}>
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
      </div>
    </div>
  );
}
