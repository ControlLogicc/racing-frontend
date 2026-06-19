import { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { invitationService } from '../../services/invitationService';
import { RACE_INVITATION_STATUS } from '../../constants/status';
import { formatDate } from '../../utils/formatDate';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import Toaster from '../../components/common/Toaster';

const PAGE_SIZE = 10;

// Staff: chỉnh deadline invitation SENT, loại invitation EXPIRED khỏi race (D11 CLAUDE.md Mục 15)
export default function StaffInvitationsPage() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [newDeadline, setNewDeadline] = useState('');

  const load = () => {
    invitationService
      .getAll()
      .then(setInvitations)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách lời mời.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const refetch = () => {
    setLoading(true);
    setError('');
    load();
  };

  const handleSetDeadline = async (id) => {
    try {
      await invitationService.setDeadline(id, newDeadline);
      setToast({ message: 'Đã cập nhật deadline.', variant: 'success' });
      setEditingId(null);
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cập nhật deadline thất bại.'), variant: 'danger' });
    }
  };

  const handleRemoveExpired = async (id) => {
    try {
      await invitationService.removeExpired(id);
      setToast({ message: 'Đã loại lời mời hết hạn khỏi race.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Loại thất bại.'), variant: 'danger' });
    }
  };

  const columns = [
    { key: 'raceName', label: 'Cuộc đua' },
    { key: 'horseName', label: 'Ngựa' },
    { key: 'jockeyName', label: 'Jockey' },
    { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'deadline',
      label: 'Deadline',
      render: (r) => {
        if (editingId === r.id) {
          return (
            <div className="d-flex gap-2 align-items-center flex-wrap">
              <Form.Control
                type="datetime-local"
                size="sm"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                style={{ maxWidth: 200 }}
              />
              <button className="btn-gold-sm" onClick={() => handleSetDeadline(r.id)}>
                Lưu
              </button>
              <button
                className="btn-outline-gold-sm"
                style={{ padding: '4px 10px' }}
                onClick={() => setEditingId(null)}
              >
                Huỷ
              </button>
            </div>
          );
        }
        return formatDate(r.deadline);
      },
    },
    {
      key: 'actions',
      label: 'Hành động',
      render: (r) => {
        if (r.status === RACE_INVITATION_STATUS.SENT) {
          return (
            <button
              className="btn-gold-sm"
              disabled={editingId !== null && editingId !== r.id}
              onClick={() => {
                setEditingId(r.id);
                setNewDeadline(r.deadline ? r.deadline.slice(0, 16) : '');
              }}
            >
              Chỉnh deadline
            </button>
          );
        }
        if (r.status === RACE_INVITATION_STATUS.EXPIRED) {
          return (
            <button className="btn-outline-gold-sm" onClick={() => handleRemoveExpired(r.id)}>
              Loại khỏi race
            </button>
          );
        }
        return <span className="text-muted">—</span>;
      },
    },
  ];

  const pageRows = invitations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const expiredCount = invitations.filter((i) => i.status === RACE_INVITATION_STATUS.EXPIRED).length;

  return (
    <div>
      <div className="page-header">
        <h2>
          Lời mời Jockey
          {expiredCount > 0 && (
            <span
              className="badge ms-2"
              style={{ backgroundColor: '#dc3545', color: '#fff', fontSize: '0.75rem' }}
            >
              {expiredCount} hết hạn
            </span>
          )}
        </h2>
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
          Chỉnh deadline lời mời <strong>SENT</strong> hoặc loại lời mời <strong>EXPIRED</strong> khỏi race.
        </p>
      </div>

      {loading && <Loading />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && invitations.length === 0 && (
        <EmptyState message="Chưa có lời mời nào." />
      )}
      {!loading && !error && invitations.length > 0 && (
        <>
          <DataTable columns={columns} rows={pageRows} rowKey="id" />
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={invitations.length}
            onPageChange={setPage}
          />
        </>
      )}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
