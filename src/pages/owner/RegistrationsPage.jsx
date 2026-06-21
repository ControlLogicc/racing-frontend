import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { registrationService } from '../../services/registrationService';
import { invitationService } from '../../services/invitationService';
import { getApiErrorMessage } from '../../utils/apiError';
import { RACE_INVITATION_STATUS } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';
import RegistrationTable from '../../components/shared/RegistrationTable';

export default function OwnerRegistrationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // Ưu tiên: ACCEPTED > SENT > còn lại (lấy cái đầu tiên theo thứ tự ưu tiên)
  const pickJockey = (invitations, registrationId) => {
    const inv = invitations.filter((i) => i.registrationId === registrationId);
    const accepted = inv.find((i) => i.status === RACE_INVITATION_STATUS.ACCEPTED);
    if (accepted) return { jockeyName: accepted.jockeyName, jockeyStatus: accepted.status };
    const sent = inv.find((i) => i.status === RACE_INVITATION_STATUS.SENT);
    if (sent) return { jockeyName: sent.jockeyName, jockeyStatus: sent.status };
    if (inv.length) return { jockeyName: inv[0].jockeyName, jockeyStatus: inv[0].status };
    return { jockeyName: null, jockeyStatus: null };
  };

  const load = () => {
    Promise.all([registrationService.getByOwner(user.userId), invitationService.getAll()])
      .then(([regs, invs]) => {
        const enriched = regs.map((r) => ({ ...r, ...pickJockey(invs, r.id) }));
        setRows(enriched);
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách đăng ký.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <div className="page-header">
        <h2>Đăng ký đua của tôi</h2>
        <Button className="btn-gold-sm" onClick={() => navigate('/owner/register')}>
          + Đăng ký race mới
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState message="Bạn chưa nộp đăng ký nào." />
      ) : (
        <RegistrationTable rows={rows} />
      )}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
