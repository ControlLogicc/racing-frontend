import { useEffect, useState } from 'react';
import { entryService } from '../../services/entryService';
<<<<<<< HEAD
import { raceService } from '../../services/raceService';
=======
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
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

<<<<<<< HEAD
export default function StaffEntriesPage() {
  const [entries, setEntries] = useState([]);
  const [races, setRaces] = useState([]);
  const [selectedRaceId, setSelectedRaceId] = useState('');
  const [loading, setLoading] = useState(true);
  const [randomizing, setRandomizing] = useState(false);
=======
// D11: Entry tự tạo + tự xác nhận khi Jockey ACCEPT. Staff chỉ REMOVE nếu cần.
export default function StaffEntriesPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const load = () => {
<<<<<<< HEAD
    Promise.all([
      entryService.getAll(),
      raceService.getAssignedToStaff()
    ])
      .then(([entriesData, racesData]) => {
        setEntries(entriesData);
        setRaces(racesData);
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách.')))
=======
    entryService
      .getAll()
      .then(setEntries)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách entry.')))
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
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

<<<<<<< HEAD
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
=======
  const handleRemove = async (id) => {
    try {
      await entryService.remove(id);
      setToast({ message: 'Đã loại entry khỏi race.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Loại entry thất bại.'), variant: 'danger' });
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const activeEntries = entries.filter((e) => e.status !== RACE_ENTRY_STATUS.REMOVED);
  const removedEntries = entries.filter((e) => e.status === RACE_ENTRY_STATUS.REMOVED);

<<<<<<< HEAD
  const filteredEntries = selectedRaceId
    ? activeEntries.filter((e) => e.raceId === Number(selectedRaceId))
    : activeEntries;

=======
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
  const columns = [
    { key: 'raceName', label: 'Cuộc đua' },
    { key: 'horseName', label: 'Ngựa' },
    { key: 'jockeyName', label: 'Jockey' },
<<<<<<< HEAD
    { key: 'gateNumber', label: 'Số cổng', render: (e) => e.gateNumber || '—' },
    { key: 'handicapWeight', label: 'Handicap', render: (e) => e.handicapWeight ? `${e.handicapWeight} kg` : '—' },
    { key: 'status', label: 'Trạng thái', render: (e) => <StatusBadge status={e.status} /> },
    { key: 'createdAt', label: 'Tạo lúc', render: (e) => formatDate(e.createdAt) },
=======
    { key: 'status', label: 'Trạng thái', render: (e) => <StatusBadge status={e.status} /> },
    { key: 'createdAt', label: 'Tạo lúc', render: (e) => formatDate(e.createdAt) },
    {
      key: 'actions',
      label: 'Hành động',
      render: (e) => (
        <button className="btn-outline-gold-sm" onClick={() => handleRemove(e.id)}>
          Loại
        </button>
      ),
    },
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
  ];

  return (
    <div>
      <div className="page-header">
        <h2>Quản lý Entry</h2>
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
<<<<<<< HEAD
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
=======
          Entry tự tạo khi Jockey chấp nhận lời mời. Staff loại entry nếu có vấn đề phát sinh.
        </p>
      </div>

      <h5 style={{ color: '#D4AF37' }} className="mb-3">
        Entry trong race
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
        <span
          className="badge ms-2"
          style={{ backgroundColor: '#D4AF37', color: '#111', fontSize: '0.75rem' }}
        >
<<<<<<< HEAD
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
=======
          {activeEntries.length}
        </span>
      </h5>
      {activeEntries.length === 0 ? (
        <EmptyState message="Chưa có entry nào." />
      ) : (
        <DataTable columns={columns} rows={activeEntries} rowKey="id" />
      )}

      {removedEntries.length > 0 && (
        <>
          <h5 style={{ color: '#a0a0a0' }} className="mt-4 mb-3">Đã loại</h5>
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
          <EntryTable rows={removedEntries} />
        </>
      )}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
