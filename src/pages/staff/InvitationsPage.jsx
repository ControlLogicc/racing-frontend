import { useEffect, useState } from 'react';
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

const PAGE_SIZE = 10;

// Staff: xem danh sách lời mời — deadline/remove chưa có endpoint backend
export default function StaffInvitationsPage() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const load = () => {
    invitationService
      .getAll()
      .then(setInvitations)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách lời mời.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const columns = [
    { key: 'raceName', label: 'Cuộc đua' },
    { key: 'horseName', label: 'Ngựa' },
    { key: 'jockeyName', label: 'Jockey' },
    { key: 'ownerName', label: 'Owner' },
    { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'sentAt', label: 'Ngày gửi', render: (r) => formatDate(r.sentAt) },
    { key: 'respondedAt', label: 'Ngày trả lời', render: (r) => r.respondedAt ? formatDate(r.respondedAt) : '—' },
  ];

  const pageRows = invitations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const expiredCount = invitations.filter((i) => i.status === RACE_INVITATION_STATUS.EXPIRED).length;
  const sentCount = invitations.filter((i) => i.status === RACE_INVITATION_STATUS.SENT).length;
  const acceptedCount = invitations.filter((i) => i.status === RACE_INVITATION_STATUS.ACCEPTED).length;

  return (
    <div>
      <div className="page-header">
        <h2>
          Lời mời Jockey
          {expiredCount > 0 && (
            <span className="badge ms-2" style={{ backgroundColor: '#dc3545', color: '#fff', fontSize: '0.75rem' }}>
              {expiredCount} hết hạn
            </span>
          )}
        </h2>
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
          Theo dõi trạng thái lời mời jockey — chờ: <strong>{sentCount}</strong>, đã nhận: <strong>{acceptedCount}</strong>, hết hạn: <strong>{expiredCount}</strong>
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
          <Pagination page={page} pageSize={PAGE_SIZE} total={invitations.length} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
