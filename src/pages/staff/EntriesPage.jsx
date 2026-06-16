import { useEffect, useState } from 'react';
import { registrationService } from '../../services/registrationService';
import { invitationService } from '../../services/invitationService';
import { entryService } from '../../services/entryService';
import { getApiErrorMessage } from '../../utils/apiError';
import { RACE_REGISTRATION_STATUS, RACE_INVITATION_STATUS, canCreateEntry } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import Toaster from '../../components/common/Toaster';
import EntryTable from '../../components/shared/EntryTable';

export default function StaffEntriesPage() {
  const [registrations, setRegistrations] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const load = () => {
    Promise.all([registrationService.getAll(), invitationService.getAll(), entryService.getAll()])
      .then(([r, i, e]) => { setRegistrations(r); setInvitations(i); setEntries(e); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được dữ liệu.')))
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

  // Registration đủ điều kiện tạo entry: APPROVED + có invitation ACCEPTED + chưa có entry.
  const candidates = registrations
    .filter((r) => r.status === RACE_REGISTRATION_STATUS.APPROVED)
    .filter((r) => !entries.some((e) => e.registrationId === r.id))
    .map((r) => {
      const accepted = invitations.find((i) => i.registrationId === r.id && i.status === RACE_INVITATION_STATUS.ACCEPTED);
      return { ...r, acceptedInvitation: accepted };
    })
    .filter((r) => canCreateEntry(r.status, !!r.acceptedInvitation));

  const handleConfirm = async (candidate) => {
    try {
      await entryService.confirm({
        registrationId: candidate.id,
        raceId: candidate.raceId,
        raceName: candidate.raceName,
        horseName: candidate.horseName,
        jockeyId: candidate.acceptedInvitation.jockeyId,
        jockeyName: candidate.acceptedInvitation.jockeyName,
      });
      setToast({ message: 'Đã xác nhận entry.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Xác nhận thất bại.'), variant: 'danger' });
    }
  };

  const candidateColumns = [
    { key: 'raceName', label: 'Race' },
    { key: 'horseName', label: 'Ngựa' },
    { key: 'acceptedInvitation', label: 'Jockey nhận lời mời', render: (r) => r.acceptedInvitation?.jockeyName },
    {
      key: 'actions',
      label: 'Hành động',
      render: (r) => <button className="btn-gold-sm" onClick={() => handleConfirm(r)}>Xác nhận Entry</button>,
    },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <div className="page-header"><h2>Xác nhận Entry</h2></div>

      <h5 style={{ color: '#D4AF37' }} className="mb-3">Chờ xác nhận</h5>
      {candidates.length === 0 ? (
        <EmptyState message="Chưa có registration đủ điều kiện tạo entry." />
      ) : (
        <DataTable columns={candidateColumns} rows={candidates} rowKey="id" />
      )}

      <h5 style={{ color: '#D4AF37' }} className="mt-4 mb-3">Entry đã xác nhận</h5>
      {entries.length === 0 ? <EmptyState message="Chưa có entry nào." /> : <EntryTable rows={entries} />}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
