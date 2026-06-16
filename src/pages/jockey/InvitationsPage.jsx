import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { invitationService } from '../../services/invitationService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { RACE_INVITATION_STATUS } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Toaster from '../../components/common/Toaster';

export default function JockeyInvitationsPage() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const load = () => {
    invitationService
      .getByJockey(user.userId)
      .then(setInvitations)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được lời mời.')))
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

  const handleAccept = async (id) => {
    try {
      await invitationService.accept(id);
      setToast({ message: 'Đã nhận lời mời.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Thao tác thất bại.'), variant: 'danger' });
    }
  };

  const handleDecline = async (id) => {
    try {
      await invitationService.decline(id);
      setToast({ message: 'Đã từ chối lời mời.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Thao tác thất bại.'), variant: 'danger' });
    }
  };

  const columns = [
    { key: 'raceName', label: 'Race' },
    { key: 'horseName', label: 'Ngựa' },
    { key: 'sentAt', label: 'Ngày gửi', render: (r) => formatDate(r.sentAt) },
    { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      label: 'Hành động',
      render: (r) =>
        r.status === RACE_INVITATION_STATUS.SENT ? (
          <div className="d-flex gap-2">
            <button className="btn-gold-sm" onClick={() => handleAccept(r.id)}>Nhận</button>
            <button className="btn-outline-gold-sm" onClick={() => handleDecline(r.id)}>Từ chối</button>
          </div>
        ) : '—',
    },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <div className="page-header"><h2>Lời mời đua</h2></div>
      {invitations.length === 0 ? (
        <EmptyState message="Bạn chưa có lời mời nào." />
      ) : (
        <DataTable columns={columns} rows={invitations} />
      )}
      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
