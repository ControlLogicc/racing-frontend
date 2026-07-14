import { useEffect, useState } from 'react';
import { entryService } from '../../services/entryService';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import { RACE_ENTRY_STATUS, RACE_STATUS } from '../../constants/status';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';
import Toaster from '../../components/common/Toaster';
import './staff-theme.css';

export default function StaffEntriesPage() {
  const [entries, setEntries] = useState([]);
  const [races, setRaces] = useState([]);
  const [selectedRaceId, setSelectedRaceId] = useState('');
  const [loading, setLoading] = useState(true);
  const [randomizing, setRandomizing] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const load = () => {
    Promise.all([
      entryService.getAll(),
      raceService.getAssignedToStaff()
    ])
      .then(([entriesData, racesData]) => {
        setEntries(entriesData);
        setRaces(racesData);
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách.')))
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

  const handleRandomizeGates = () => {
    if (!selectedRaceId) return;

    const selectedRace = races.find((r) => String(r.id) === String(selectedRaceId));
    const status = selectedRace?.status || '';
    const allowedStatuses = [
      RACE_STATUS.CLOSED_FOR_ENTRY, RACE_STATUS.RUNNING,
      RACE_STATUS.RESULT_PENDING, RACE_STATUS.OFFICIAL,
    ];
    if (!allowedStatuses.includes(status)) {
      setToast({
        message: `Chỉ được bốc thăm sau khi đăng ký đã đóng (${RACE_STATUS.CLOSED_FOR_ENTRY}). Trạng thái hiện tại: ${status}`,
        variant: 'warning',
      });
      return;
    }

    setRandomizing(true);
    entryService
      .randomizeGates(Number(selectedRaceId))
      .then(() => {
        setToast({ message: 'Bốc thăm cổng ngẫu nhiên thành công!', variant: 'success' });
        refetch();
      })
      .catch((err) =>
        setToast({ message: getApiErrorMessage(err, 'Bốc thăm thất bại.'), variant: 'danger' })
      )
      .finally(() => setRandomizing(false));
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const activeEntries = entries.filter((e) => e.status !== RACE_ENTRY_STATUS.REMOVED);
  const removedEntries = entries.filter((e) => e.status === RACE_ENTRY_STATUS.REMOVED);

  const filteredEntries = selectedRaceId
    ? activeEntries.filter((e) => e.raceId === Number(selectedRaceId))
    : [];

  return (
    <div className="staff-theme-wrapper p-3">
      {/* Header */}
      <div className="staff-card mb-4 p-4">
        <h4 className="mb-1" style={{ color: '#D4AF37', fontWeight: 700 }}>Quản lý Entry</h4>
        <p className="mb-0" style={{ color: '#9ca3af', fontSize: 13 }}>
          Xem danh sách và thực hiện bốc thăm cổng xuất phát ngẫu nhiên cho các cuộc đua.
        </p>
      </div>

      {/* Filter + Bốc thăm */}
      <div className="staff-card mb-4 p-3">
        <div className="d-flex align-items-end gap-3 flex-wrap">
          <div style={{ minWidth: 280 }}>
            <label className="form-label fw-semibold" style={{ color: '#D4AF37', fontSize: '0.9rem' }}>
              Chọn cuộc đua để bốc thăm
            </label>
            <select
              className="form-select bg-dark text-white border-secondary"
              value={selectedRaceId}
              onChange={(e) => setSelectedRaceId(e.target.value)}
            >
              <option value="">-- Tất cả cuộc đua --</option>
              {races.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.meetingName}) — {r.status}
                </option>
              ))}
            </select>
          </div>

          {selectedRaceId && (() => {
            const selectedRace = races.find((r) => String(r.id) === String(selectedRaceId));
            const allowedStatuses = [RACE_STATUS.CLOSED_FOR_ENTRY, RACE_STATUS.RUNNING, RACE_STATUS.RESULT_PENDING, RACE_STATUS.OFFICIAL];
            const canRandomize = allowedStatuses.includes(selectedRace?.status);
            return (
              <div>
                <button
                  className={canRandomize ? 'btn staff-btn-gold px-4' : 'btn staff-btn-outline px-4'}
                  onClick={handleRandomizeGates}
                  disabled={randomizing || filteredEntries.length === 0 || !canRandomize}
                  title={!canRandomize ? `Cần đóng đăng ký (${RACE_STATUS.CLOSED_FOR_ENTRY}) trước khi bốc thăm` : ''}
                >
                  {randomizing ? 'Đang bốc thăm...' : 'Bốc thăm cổng ngẫu nhiên'}
                </button>
                {!canRandomize && (
                  <div style={{ fontSize: '0.75rem', color: '#e5a000', marginTop: 4 }}>
                    Cần chuyển race sang <strong>{RACE_STATUS.CLOSED_FOR_ENTRY}</strong> trước
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Entry table */}
      <div className="staff-card">
        <div className="staff-card-header d-flex justify-content-between align-items-center">
          <span>
            Entry của cuộc đua
            {selectedRaceId && (
              <span className="badge ms-2" style={{ backgroundColor: '#D4AF37', color: '#111', fontSize: '0.75rem' }}>
                {filteredEntries.length}
              </span>
            )}
          </span>
        </div>
        <div className="p-0">
          {!selectedRaceId ? (
            <EmptyState message="Hãy chọn cuộc đua để xem danh sách entry." />
          ) : filteredEntries.length === 0 ? (
            <EmptyState message="Chưa có entry nào trong cuộc đua này." />
          ) : (
            <div className="table-responsive">
              <table className="staff-table mb-0">
                <thead>
                  <tr>
                    <th>Cuộc đua</th>
                    <th>Ngựa</th>
                    <th>Jockey</th>
                    <th>Rating</th>
                    <th>Số cổng</th>
                    <th>Handicap</th>
                    <th>Trạng thái</th>
                    <th>Tạo lúc</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((e) => (
                    <tr key={e.id}>
                      <td style={{ color: '#fff', fontWeight: 600 }}>{e.raceName}</td>
                      <td style={{ color: '#fff' }}>{e.horseName}</td>
                      <td style={{ color: '#aaa' }}>{e.jockeyName || '—'}</td>
                      <td>
                        {e.currentScore != null ? (
                          <span style={{ color: '#D4AF37', fontWeight: 600 }}>{e.currentScore}</span>
                        ) : '—'}
                        {e.ratingVerified === false && (
                          <span className="badge ms-2" style={{ backgroundColor: '#dc3545', fontSize: '0.65rem' }}>Chưa duyệt</span>
                        )}
                      </td>
                      <td style={{ color: '#aaa' }}>{e.gateNumber || '—'}</td>
                      <td style={{ color: '#aaa' }}>{e.handicapWeight ? `${e.handicapWeight} kg` : '—'}</td>
                      <td><StatusBadge status={e.rawStatus || e.status} /></td>
                      <td style={{ color: '#666', whiteSpace: 'nowrap' }}>{formatDate(e.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {removedEntries.length > 0 && !selectedRaceId && (
        <div className="staff-card mt-4">
          <div className="staff-card-header" style={{ color: '#9ca3af' }}>Đã loại khỏi giải đấu</div>
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
                {removedEntries.map((e) => (
                  <tr key={e.id}>
                    <td style={{ color: '#aaa' }}>{e.raceName}</td>
                    <td style={{ color: '#aaa' }}>{e.horseName}</td>
                    <td style={{ color: '#aaa' }}>{e.jockeyName || '—'}</td>
                    <td><StatusBadge status={e.rawStatus || e.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
