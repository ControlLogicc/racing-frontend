import { useEffect, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { registrationService } from '../../services/registrationService';
import { invitationService } from '../../services/invitationService';
import { userService } from '../../services/userService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { RACE_REGISTRATION_STATUS, RACE_INVITATION_STATUS } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Toaster from '../../components/common/Toaster';

export default function OwnerInvitationsPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [jockeys, setJockeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [registrationId, setRegistrationId] = useState('');
  const [jockeyId, setJockeyId] = useState('');

  const load = () => {
    Promise.all([registrationService.getByOwner(user.userId), invitationService.getAll(), userService.getAll()])
      .then(([regs, invs, users]) => {
        setRegistrations(regs.filter((r) => r.status !== RACE_REGISTRATION_STATUS.CANCELLED));
        setInvitations(invs.filter((i) => regs.some((r) => r.id === i.registrationId)));
        setJockeys(users.filter((u) => u.role === 'jockey' && !u.locked));
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được dữ liệu lời mời.')))
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

  const handleSend = async (e) => {
    e.preventDefault();
    const registration = registrations.find((r) => r.id === Number(registrationId));
    const jockey = jockeys.find((j) => j.id === Number(jockeyId));
    if (!registration || !jockey) return;
    try {
      await invitationService.send({
        registrationId: registration.id,
        raceName: registration.raceName,
        horseName: registration.horseName,
        jockeyId: jockey.id,
        jockeyName: jockey.fullName,
      });
      setToast({ message: 'Đã gửi lời mời.', variant: 'success' });
      setRegistrationId('');
      setJockeyId('');
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Gửi lời mời thất bại.'), variant: 'danger' });
    }
  };

  const handleCancel = async (id) => {
    try {
      await invitationService.cancel(id);
      setToast({ message: 'Đã huỷ lời mời.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Huỷ thất bại.'), variant: 'danger' });
    }
  };

  const columns = [
    { key: 'raceName', label: 'Race' },
    { key: 'horseName', label: 'Ngựa' },
    { key: 'jockeyName', label: 'Jockey' },
    { key: 'sentAt', label: 'Ngày gửi', render: (r) => formatDate(r.sentAt) },
    { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      label: 'Hành động',
      render: (r) =>
        r.status === RACE_INVITATION_STATUS.SENT ? (
          <button className="btn-outline-gold-sm" onClick={() => handleCancel(r.id)}>Huỷ lời mời</button>
        ) : '—',
    },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <div className="page-header"><h2>Lời mời Jockey</h2></div>

      <Form onSubmit={handleSend} className="dash-card d-flex flex-wrap gap-3 align-items-end mb-4">
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Đăng ký</Form.Label>
          <Form.Select value={registrationId} onChange={(e) => setRegistrationId(e.target.value)} required>
            <option value="">-- Chọn đăng ký --</option>
            {registrations.map((r) => (
              <option key={r.id} value={r.id}>{r.raceName} — {r.horseName}</option>
            ))}
          </Form.Select>
        </Form.Group>
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Jockey</Form.Label>
          <Form.Select value={jockeyId} onChange={(e) => setJockeyId(e.target.value)} required>
            <option value="">-- Chọn jockey --</option>
            {jockeys.map((j) => <option key={j.id} value={j.id}>{j.fullName}</option>)}
          </Form.Select>
        </Form.Group>
        <Button type="submit" className="btn-gold-sm" style={{ padding: '8px 20px' }}>Gửi lời mời</Button>
      </Form>

      {invitations.length === 0 ? (
        <EmptyState message="Chưa có lời mời nào được gửi." />
      ) : (
        <DataTable columns={columns} rows={invitations} />
      )}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
