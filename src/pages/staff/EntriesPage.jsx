import { useEffect, useState } from 'react';
import { entryService } from '../../services/entryService';
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

// D11: Entry tự tạo + tự xác nhận khi Jockey ACCEPT. Staff chỉ REMOVE nếu cần.
export default function StaffEntriesPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const load = () => {
    entryService
      .getAll()
      .then(setEntries)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách entry.')))
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

  const handleRemove = async (id) => {
    try {
      await entryService.remove(id);
      setToast({ message: 'Đã loại entry khỏi race.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Loại entry thất bại.'), variant: 'danger' });
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const activeEntries = entries.filter((e) => e.status !== RACE_ENTRY_STATUS.REMOVED);
  const removedEntries = entries.filter((e) => e.status === RACE_ENTRY_STATUS.REMOVED);

  const columns = [
    { key: 'raceName', label: 'Cuộc đua' },
    { key: 'horseName', label: 'Ngựa' },
    { key: 'jockeyName', label: 'Jockey' },
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
  ];

  return (
    <div>
      <div className="page-header">
        <h2>Quản lý Entry</h2>
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
          Entry tự tạo khi Jockey chấp nhận lời mời. Staff loại entry nếu có vấn đề phát sinh.
        </p>
      </div>

      <h5 style={{ color: '#D4AF37' }} className="mb-3">
        Entry trong race
        <span
          className="badge ms-2"
          style={{ backgroundColor: '#D4AF37', color: '#111', fontSize: '0.75rem' }}
        >
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
          <EntryTable rows={removedEntries} />
        </>
      )}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
