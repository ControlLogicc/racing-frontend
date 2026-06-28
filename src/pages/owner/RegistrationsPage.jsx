import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { registrationService } from '../../services/registrationService';
import { invitationService } from '../../services/invitationService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { RACE_INVITATION_STATUS } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable from '../../components/common/DataTable';
import Toaster from '../../components/common/Toaster';
import './owner-theme.css';

const JOCKEY_STATUS_LABEL = {
  [RACE_INVITATION_STATUS.ACCEPTED]: { text: 'Đã nhận', color: '#4caf7d' },
  USED: { text: 'Đã vào Entry', color: '#4caf7d' },
  [RACE_INVITATION_STATUS.SENT]: { text: 'Chờ phản hồi', color: '#D4AF37' },
  [RACE_INVITATION_STATUS.DECLINED]: { text: 'Từ chối', color: '#e57373' },
  [RACE_INVITATION_STATUS.EXPIRED]: { text: 'Hết hạn', color: '#666' },
  [RACE_INVITATION_STATUS.REMOVED]: { text: 'Đã xoá', color: '#666' },
};

function JockeyCell({ name, status }) {
  if (!name) return <span style={{ color: '#444', fontStyle: 'italic', fontSize: '0.82rem' }}>Chưa mời</span>;
  const cfg = JOCKEY_STATUS_LABEL[status];
  return (
    <div>
      <div style={{ fontWeight: 600, color: '#c8bea0', fontSize: '0.88rem' }}>{name}</div>
      {cfg && <div style={{ fontSize: '0.73rem', color: cfg.color, marginTop: 2 }}>{cfg.text}</div>}
    </div>
  );
}

export default function OwnerRegistrationsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const pickJockey = (invitations, registrationId, horseId, raceId) => {
    // Match ưu tiên theo registrationId, fallback theo horseId+raceId
    let regInvs = invitations.filter((i) => i.registrationId != null && String(i.registrationId) === String(registrationId));
    if (!regInvs.length && horseId && raceId) {
      regInvs = invitations.filter((i) => String(i.horseId) === String(horseId) && String(i.raceId) === String(raceId));
    }
    const used = regInvs.find((i) => i.status === 'USED');
    if (used) return { jockeyName: used.jockeyName, invStatus: 'USED' };
    const accepted = regInvs.find((i) => i.status === 'ACCEPTED');
    if (accepted) return { jockeyName: accepted.jockeyName, invStatus: 'ACCEPTED' };
    const sent = regInvs.find((i) => i.status === 'SENT');
    if (sent) return { jockeyName: sent.jockeyName, invStatus: 'SENT' };
    const declined = regInvs.filter((i) => i.status === 'DECLINED');
    if (declined.length) return { jockeyName: declined[0].jockeyName, invStatus: 'DECLINED' };
    return { jockeyName: null, invStatus: null };
  };

  const load = () => {
    Promise.all([
      registrationService.getByOwner(),
      invitationService.getAll()
    ])
      .then(([regs, invs]) => {
        console.log('[DEBUG] regs:', JSON.stringify(regs.map(r => ({ id: r.id, horseId: r.horseId, raceId: r.raceId, horseName: r.horseName }))));
        console.log('[DEBUG] invs:', JSON.stringify(invs.map(i => ({ registrationId: i.registrationId, horseId: i.horseId, raceId: i.raceId, jockeyName: i.jockeyName, status: i.status }))));
        setRows(
          regs.map((r) => ({
            ...r,
            ...pickJockey(invs, r.id, r.horseId, r.raceId)
          }))
        );
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách đăng ký.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const columns = [
    {
      key: 'raceName',
      label: 'Race',
      render: (r) => (
        <div>
          <span style={{ fontWeight: 700, color: '#f0e8d0' }}>{r.raceName}</span>
          <div style={{ fontSize: '0.75rem', color: '#8a8065', marginTop: 2 }}>
            {r.scheduledTime ? formatDate(r.scheduledTime) : 'Chưa có lịch'}
          </div>
        </div>
      ),
    },
    {
      key: 'raceStatus',
      label: 'Trạng thái Race',
      render: (r) => r.raceStatus ? <StatusBadge status={r.raceStatus} /> : <span style={{ color: '#555' }}>—</span>,
    },
    {
      key: 'horseName',
      label: 'Ngựa',
      render: (r) => (
        <div>
          <span style={{ color: '#D4AF37', fontWeight: 600 }}>🐎 {r.horseName}</span>
        </div>
      ),
    },
    {
      key: 'jockeyName',
      label: 'Jockey',
      render: (r) => <JockeyCell name={r.jockeyName} status={r.invStatus} />,
    },
    { 
      key: 'status', 
      label: 'Trạng thái', 
      render: (r) => (
        <div>
          <StatusBadge status={r.status} />
          {r.status === 'PENDING_REVIEW' && <div style={{ fontSize: '0.7rem', color: '#888', marginTop: 4 }}>Đang chờ Staff duyệt</div>}
          {r.status === 'APPROVED' && <div style={{ fontSize: '0.7rem', color: '#4caf7d', marginTop: 4 }}>Đã duyệt — có thể mời Jockey</div>}
          {r.status === 'REJECTED' && <div style={{ fontSize: '0.7rem', color: '#e57373', marginTop: 4 }}>Bị từ chối</div>}
        </div>
      ) 
    },
    {
      key: 'action',
      label: '',
      render: (r) => {
        if (r.entryId) {
          return (
            <button
              className="btn-outline-gold-sm"
              onClick={() => navigate(`/race-results/${r.raceId}`)}
            >
              Xem kết quả
            </button>
          );
        }
        if (r.canInviteJockey && !r.jockeyName) {
          return (
            <button
              className="btn-gold-sm"
              onClick={() => navigate(`/owner/invitations?regId=${r.id}`)}
            >
              Mời Jockey
            </button>
          );
        }
        if (r.invStatus === 'DECLINED') {
          return (
            <button
              className="btn-outline-gold-sm"
              style={{ color: '#e57373', borderColor: '#e57373' }}
              onClick={() => navigate(`/owner/invitations?regId=${r.id}`)}
            >
              Mời lại
            </button>
          );
        }
        return null;
      },
    },
  ];

  const active = rows.filter((r) => r.status === 'APPROVED').length;
  const submitted = rows.filter((r) => r.status === 'PENDING_REVIEW' || r.status === 'SUBMITTED').length;

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      {/* Header */}
      <div className="page-header mb-4">
        <div>
          <h2>Đăng ký đua</h2>
          <p style={{ margin: 0, marginTop: 4 }}>Theo dõi trạng thái đăng ký và lời mời jockey</p>
        </div>
        <button
          className="btn-gold btn-gold-sm"
          style={{ padding: '9px 22px' }}
          onClick={() => navigate('/owner/register')}
        >
          + Đăng ký race mới
        </button>
      </div>

      {/* Summary pills */}
      {rows.length > 0 && (
        <div className="d-flex gap-3 mb-4 flex-wrap">
          {[
            { label: 'Tổng đăng ký', value: rows.length, color: '#D4AF37' },
            { label: 'Đã duyệt', value: active, color: '#4caf7d' },
            { label: 'Chờ xét duyệt', value: submitted, color: '#f1c40f' },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(212,175,55,0.13)',
                borderRadius: 10, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: '0.75rem', color: '#6a5a40', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="lux-panel">
        {rows.length === 0 ? (
          <EmptyState message="Bạn chưa nộp đăng ký nào." />
        ) : (
          <DataTable columns={columns} rows={rows} />
        )}
      </div>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
