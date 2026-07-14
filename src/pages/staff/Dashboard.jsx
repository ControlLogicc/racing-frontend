import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { raceService } from '../../services/raceService';
import { entryService } from '../../services/entryService';
import { RACE_ENTRY_STATUS, RACE_STATUS } from '../../constants/status';
import { formatDate } from '../../utils/formatDate';
import StatusBadge from '../../components/common/StatusBadge';
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import './staff-theme.css';

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

  const activeEntries = useMemo(
    () => entries.filter((e) => e.status !== RACE_ENTRY_STATUS.REMOVED && e.status !== RACE_ENTRY_STATUS.SCRATCHED),
    [entries]
  );

  const upcomingRaces = races.filter((r) =>
    r.status === RACE_STATUS.SCHEDULED || r.status === RACE_STATUS.OPEN_FOR_ENTRY
  );
  const runningRaces = races.filter((r) => r.status === RACE_STATUS.RUNNING);
  const pendingEntries = activeEntries.filter((e) => e.status === RACE_ENTRY_STATUS.DECLARED || e.status === RACE_ENTRY_STATUS.PENDING_CONFIRMATION);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="staff-theme-wrapper p-3">
      {/* Header */}
      <div className="staff-card mb-4 p-4 d-flex justify-content-between align-items-center" style={{ background: 'rgba(20,20,20,0.8)' }}>
        <div>
          <h4 className="mb-1" style={{ color: '#D4AF37', fontWeight: 700 }}>
            Xin chào, {user?.fullName || 'Staff'}
          </h4>
          <p className="mb-0" style={{ color: '#9ca3af', fontSize: 13 }}>
            Vận hành race — theo dõi entry, xác nhận, công bố kết quả.
          </p>
        </div>
        <Link to="/staff/races">
          <Button className="staff-btn-gold">Xem tất cả race</Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-xl-3">
          <div className="staff-card p-3">
            <div style={{ color: '#9ca3af', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Race được gán</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#D4AF37' }}>{races.length}</div>
            <div style={{ color: '#666', fontSize: 12 }}>{upcomingRaces.length} sắp tới</div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="staff-card p-3">
            <div style={{ color: '#9ca3af', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Entry cần xử lý</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#f59e0b' }}>{pendingEntries.length}</div>
            <div style={{ color: '#666', fontSize: 12 }}>Chờ confirm</div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="staff-card p-3">
            <div style={{ color: '#9ca3af', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Đang chạy</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#ef4444' }}>{runningRaces.length}</div>
            <div style={{ color: '#666', fontSize: 12 }}>Race RUNNING</div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="staff-card p-3">
            <div style={{ color: '#9ca3af', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Tổng entry</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#10b981' }}>{activeEntries.length}</div>
            <div style={{ color: '#666', fontSize: 12 }}>Đang hoạt động</div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Race table */}
        <div className="col-12 col-lg-8">
          <div className="staff-card">
            <div className="staff-card-header d-flex justify-content-between align-items-center">
              <span>Race được gán</span>
              <Link to="/staff/races">
                <Button size="sm" className="staff-btn-outline">Xem tất cả</Button>
              </Link>
            </div>
            <div className="p-0">
              {races.length === 0 ? (
                <EmptyState message="Chưa có race nào được gán." />
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
                      {races.slice(0, 6).map((r) => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 600, color: '#fff' }}>{r.name}</td>
                          <td style={{ whiteSpace: 'nowrap', color: '#aaa' }}>{formatDate(r.raceTime)}</td>
                          <td><StatusBadge status={r.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="col-12 col-lg-4">
          <div className="staff-card h-100">
            <div className="staff-card-header">Thao tác nhanh</div>
            <div className="p-3 d-grid gap-2">
              <Link to="/staff/entries" className="staff-btn-gold btn text-center text-decoration-none">Quản lý Entry</Link>
              <Link to="/staff/invitations" className="staff-btn-outline btn text-center text-decoration-none">Lời mời Jockey</Link>
              <Link to="/staff/registrations" className="staff-btn-outline btn text-center text-decoration-none">Xem đăng ký</Link>
              <Link to="/staff/results" className="staff-btn-outline btn text-center text-decoration-none">Kết quả & Payout</Link>
            </div>
          </div>
        </div>

        {/* Entry table */}
        <div className="col-12">
          <div className="staff-card">
            <div className="staff-card-header d-flex justify-content-between align-items-center">
              <span>Entry trong race</span>
              <Link to="/staff/entries">
                <Button size="sm" className="staff-btn-outline">Xem tất cả</Button>
              </Link>
            </div>
            <div className="p-0">
              {activeEntries.length === 0 ? (
                <EmptyState message="Chưa có entry nào." />
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
                          <td style={{ color: '#aaa' }}>{e.raceName}</td>
                          <td style={{ fontWeight: 600, color: '#fff' }}>{e.horseName}</td>
                          <td style={{ color: '#aaa' }}>{e.jockeyName}</td>
                          <td><StatusBadge status={e.rawStatus || e.status} /></td>
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
