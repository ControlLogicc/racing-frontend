import { useEffect, useState } from 'react';
import { entryService } from '../../services/entryService';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import { RACE_ENTRY_STATUS } from '../../constants/status';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import EntryTable from '../../components/shared/EntryTable';
import Toaster from '../../components/common/Toaster';

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
    // if (
    // window.confirm(
    //   'Bạn có chắc chắn muốn bốc thăm cổng ngẫu nhiên cho cuộc đua này? Tất cả số cổng hiện có của cuộc đua sẽ bị ghi đè.'
    // )
    {
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
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const activeEntries = entries.filter((e) => e.status !== RACE_ENTRY_STATUS.REMOVED);
  const removedEntries = entries.filter((e) => e.status === RACE_ENTRY_STATUS.REMOVED);

  const filteredEntries = selectedRaceId
    ? activeEntries.filter((e) => e.raceId === Number(selectedRaceId))
    : activeEntries;

  const columns = [
    { key: 'raceName', label: 'Cuộc đua' },
    { key: 'horseName', label: 'Ngựa' },
    { key: 'jockeyName', label: 'Jockey' },
    { key: 'gateNumber', label: 'Số cổng', render: (e) => e.gateNumber || '—' },
    { key: 'handicapWeight', label: 'Handicap', render: (e) => e.handicapWeight ? `${e.handicapWeight} kg` : '—' },
    { key: 'status', label: 'Trạng thái', render: (e) => <StatusBadge status={e.status} /> },
    { key: 'createdAt', label: 'Tạo lúc', render: (e) => formatDate(e.createdAt) },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>Quản lý Entry</h2>
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
          Xem danh sách và thực hiện bốc thăm cổng xuất phát ngẫu nhiên cho các cuộc đua.
        </p>
      </div>

      {/* Filter and Randomize Action */}
      <div className="dash-card mb-4 p-3" style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}>
        <div className="d-flex align-items-end gap-3 flex-wrap">
          <div style={{ minWidth: '280px' }}>
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
                  {r.name} ({r.meetingName})
                </option>
              ))}
            </select>
          </div>

          {selectedRaceId && (
            <div>
              <button
                className="btn btn-warning fw-bold px-4"
                style={{ backgroundColor: '#D4AF37', borderColor: '#D4AF37', color: '#111' }}
                onClick={handleRandomizeGates}
                disabled={randomizing || filteredEntries.length === 0}
              >
                {randomizing ? 'Đang bốc thăm...' : 'Bốc thăm cổng ngẫu nhiên'}
              </button>
            </div>
          )}
        </div>
      </div>

      <h5 style={{ color: '#D4AF37' }} className="mb-3">
        {selectedRaceId ? 'Entry của cuộc đua' : 'Tất cả Entry đang hoạt động'}
        <span
          className="badge ms-2"
          style={{ backgroundColor: '#D4AF37', color: '#111', fontSize: '0.75rem' }}
        >
          {filteredEntries.length}
        </span>
      </h5>

      {filteredEntries.length === 0 ? (
        <EmptyState message="Chưa có entry nào." />
      ) : (
        <DataTable columns={columns} rows={filteredEntries} rowKey="id" />
      )}

      {removedEntries.length > 0 && !selectedRaceId && (
        <>
          <h5 style={{ color: '#a0a0a0' }} className="mt-5 mb-3">Đã loại khỏi giải đấu</h5>
          <EntryTable rows={removedEntries} />
        </>
      )}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
