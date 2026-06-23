import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { registrationService } from '../../services/registrationService';
import { invitationService } from '../../services/invitationService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { RACE_REGISTRATION_STATUS, RACE_INVITATION_STATUS, canOwnerInviteJockey } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable from '../../components/common/DataTable';
import Toaster from '../../components/common/Toaster';
import './owner-theme.css';

const JOCKEY_STATUS_LABEL = {
  [RACE_INVITATION_STATUS.ACCEPTED]: { text: 'Đã nhận', color: '#4caf7d' },
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

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
    Promise.all([registrationService.getByOwner(), invitationService.getAll()])
      .then(([regs, invs]) => {
        setRows(regs.map((r) => ({ ...r, ...pickJockey(invs, r.id) })));
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
          <br />
          <span style={{ color: '#888', fontSize: '0.8rem' }}>(ID: {r.id})</span>
        </div>
      ),
    },
    {
      key: 'horseName',
      label: 'Ngựa',
      render: (r) => <span style={{ color: '#D4AF37', fontWeight: 600 }}>🐎 {r.horseName}</span>,
    },
    {
      key: 'jockeyName',
      label: 'Jockey',
      render: (r) => <JockeyCell name={r.jockeyName} status={r.jockeyStatus} />,
    },
    {
      key: 'submittedAt',
      label: 'Ngày nộp',
      render: (r) => <span style={{ color: '#6a6250', fontSize: '0.85rem' }}>{formatDate(r.submittedAt)}</span>,
    },
    { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'action',
      label: '',
      render: (r) =>
        canOwnerInviteJockey(r.status) && !r.jockeyName ? (
          <button
            className="btn-outline-gold-sm"
            onClick={() => navigate('/owner/invitations')}
          >
            Mời Jockey
          </button>
        ) : null,
    },
  ];

  const active = rows.filter((r) => r.status === RACE_REGISTRATION_STATUS.APPROVED || r.status === 'APPROVED').length;
  const submitted = rows.filter((r) => r.status === RACE_REGISTRATION_STATUS.PENDING_REVIEW || r.status === RACE_REGISTRATION_STATUS.SUBMITTED || r.status === 'PENDING_REVIEW' || r.status === 'SUBMITTED').length;

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
            { label: 'Đang hoạt động', value: active, color: '#4caf7d' },
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
