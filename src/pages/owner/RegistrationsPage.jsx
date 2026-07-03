import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Row, Col } from 'react-bootstrap';
import { registrationService } from '../../services/registrationService';
import { invitationService } from '../../services/invitationService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { RACE_INVITATION_STATUS, RACE_REGISTRATION_STATUS } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Toaster from '../../components/common/Toaster';
import './owner-theme.css';

const PAGE_SIZE = 10;
const REGISTRATION_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'PENDING', label: 'Chờ xét duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Bị từ chối' },
  { value: 'WITHDRAWN', label: 'Đã rút đơn' },
];

const JOCKEY_STATUS_LABEL = {
  [RACE_INVITATION_STATUS.ACCEPTED]: { text: 'Đã nhận', color: '#4caf7d' },
  USED: { text: 'Đã vào Entry', color: '#4caf7d' },
  [RACE_INVITATION_STATUS.SENT]: { text: 'Chờ phản hồi', color: '#D4AF37' },
  [RACE_INVITATION_STATUS.PENDING_RESPONSE]: { text: 'Chờ phản hồi', color: '#D4AF37' },
  [RACE_INVITATION_STATUS.DECLINED]: { text: 'Từ chối', color: '#e57373' },
  [RACE_INVITATION_STATUS.CANCELLED]: { text: 'Đã hủy', color: '#666' },
  [RACE_INVITATION_STATUS.EXPIRED]: { text: 'Hết hạn', color: '#666' },
  [RACE_INVITATION_STATUS.REMOVED]: { text: 'Đã xoá', color: '#666' },
};

const WITHDRAWABLE_REGISTRATION_STATUSES = new Set([
  RACE_REGISTRATION_STATUS.PENDING,
]);

const CLOSED_RACE_STATUSES = new Set(['RUNNING', 'RESULT_PENDING', 'OFFICIAL', 'CANCELLED']);
const CANCELLABLE_INVITATION_STATUSES = new Set([
  RACE_INVITATION_STATUS.SENT,
  RACE_INVITATION_STATUS.PENDING_RESPONSE,
]);

const canWithdrawRegistration = (registration) =>
  WITHDRAWABLE_REGISTRATION_STATUSES.has(registration.status)
  && !registration.entryId
  && !CLOSED_RACE_STATUSES.has(registration.raceStatus);

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
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [cancellingInvitationId, setCancellingInvitationId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);

  const pickJockey = (invitations, registrationId, horseId, raceId) => {
    // Match ưu tiên theo registrationId, fallback theo horseId+raceId
    let regInvs = invitations.filter((i) => i.registrationId != null && String(i.registrationId) === String(registrationId));
    if (!regInvs.length && horseId && raceId) {
      regInvs = invitations.filter((i) => String(i.horseId) === String(horseId) && String(i.raceId) === String(raceId));
    }
    const used = regInvs.find((i) => i.status === 'USED');
    if (used) return { jockeyName: used.jockeyName, invStatus: 'USED', activeInvitationId: used.id };
    const accepted = regInvs.find((i) => i.status === 'ACCEPTED');
    if (accepted) return { jockeyName: accepted.jockeyName, invStatus: 'ACCEPTED', activeInvitationId: accepted.id };
    const sent = regInvs.find((i) => i.status === 'SENT' || i.status === 'PENDING_RESPONSE');
    if (sent) return { jockeyName: sent.jockeyName, invStatus: sent.status, activeInvitationId: sent.id };
    const declined = regInvs.filter((i) => i.status === 'DECLINED');
    if (declined.length) return { jockeyName: declined[0].jockeyName, invStatus: 'DECLINED', activeInvitationId: declined[0].id };
    const cancelled = regInvs.find((i) => i.status === 'CANCELLED');
    if (cancelled) return { jockeyName: null, invStatus: 'CANCELLED', activeInvitationId: cancelled.id };
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

  const handleWithdraw = async (registration) => {
    if (!window.confirm(`Rút đơn đăng ký "${registration.raceName}" cho ngựa "${registration.horseName}"?`)) return;

    setWithdrawingId(registration.id);
    try {
      await registrationService.cancel(registration.id);
      setToast({ message: 'Đã rút đơn đăng ký.', variant: 'success' });
      load();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Rút đơn thất bại.'), variant: 'danger' });
    } finally {
      setWithdrawingId(null);
    }
  };

  const handleCancelInvitation = async (registration) => {
    if (!registration.activeInvitationId) return;
    if (!window.confirm(`Hủy lời mời jockey "${registration.jockeyName}" cho race "${registration.raceName}"?`)) return;

    setCancellingInvitationId(registration.activeInvitationId);
    try {
      await invitationService.cancel(registration.activeInvitationId);
      setToast({ message: 'Đã hủy lời mời.', variant: 'success' });
      load();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Hủy lời mời thất bại.'), variant: 'danger' });
    } finally {
      setCancellingInvitationId(null);
    }
  };

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
          {r.status === 'PENDING' && <div style={{ fontSize: '0.7rem', color: '#888', marginTop: 4 }}>Đang chờ Staff duyệt</div>}
          {r.status === 'APPROVED' && <div style={{ fontSize: '0.7rem', color: '#4caf7d', marginTop: 4 }}>Đã duyệt — có thể mời Jockey</div>}
          {r.status === 'REJECTED' && <div style={{ fontSize: '0.7rem', color: '#e57373', marginTop: 4 }}>Bị từ chối</div>}
          {r.status === 'WITHDRAWN' && <div style={{ fontSize: '0.7rem', color: '#888', marginTop: 4 }}>Owner đã rút đơn</div>}
        </div>
      ) 
    },
    {
      key: 'action',
      label: '',
      render: (r) => {
        const actions = [];
        if (r.entryId) {
          actions.push(
            <button
              key="results"
              className="btn-outline-gold-sm"
              onClick={() => navigate(`/race-results/${r.raceId}`)}
            >
              Xem kết quả
            </button>
          );
        }
        if (r.canInviteJockey && !r.jockeyName) {
          actions.push(
            <button
              key="invite"
              className="btn-gold-sm"
              onClick={() => navigate(`/owner/invitations?regId=${r.id}`)}
            >
              Mời Jockey
            </button>
          );
        }
        if (r.invStatus === 'DECLINED') {
          actions.push(
            <button
              key="reinvite"
              className="btn-outline-gold-sm"
              style={{ color: '#e57373', borderColor: '#e57373' }}
              onClick={() => navigate(`/owner/invitations?regId=${r.id}`)}
            >
              Mời lại
            </button>
          );
        }
        if (CANCELLABLE_INVITATION_STATUSES.has(r.invStatus) && r.activeInvitationId) {
          actions.push(
            <button
              key="cancel-invitation"
              className="btn-outline-gold-sm"
              style={{ color: '#e57373', borderColor: '#e57373' }}
              disabled={cancellingInvitationId === r.activeInvitationId}
              onClick={() => handleCancelInvitation(r)}
            >
              {cancellingInvitationId === r.activeInvitationId ? 'Đang hủy...' : 'Hủy lời mời'}
            </button>
          );
        }
        if (canWithdrawRegistration(r)) {
          actions.push(
            <button
              key="withdraw"
              className="btn-outline-gold-sm"
              style={{ color: '#e57373', borderColor: '#e57373' }}
              disabled={withdrawingId === r.id}
              onClick={() => handleWithdraw(r)}
            >
              {withdrawingId === r.id ? 'Đang rút...' : 'Rút đơn'}
            </button>
          );
        }

        return actions.length ? (
          <div className="d-flex gap-2 flex-wrap justify-content-end">
            {actions}
          </div>
        ) : null;
      },
    },
  ];

  const active = rows.filter((r) => r.status === 'APPROVED').length;
  const submitted = rows.filter((r) => r.status === 'PENDING').length;

  const filteredRows = useMemo(() => rows.filter((r) => {
    const term = search.trim().toLowerCase();
    const matchSearch = !term
      || (r.raceName || '').toLowerCase().includes(term)
      || (r.horseName || '').toLowerCase().includes(term);
    const matchStatus = !filterStatus || r.status === filterStatus;
    return matchSearch && matchStatus;
  }), [rows, search, filterStatus]);

  const pageRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (setter) => (e) => { setter(e.target.value); setPage(1); };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="owner-context">
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

      {/* Tìm kiếm / lọc */}
      {rows.length > 0 && (
        <div className="lux-panel mb-3">
          <Row className="g-3 align-items-end">
            <Col md={7}>
              <Form.Group>
                <Form.Label style={{ fontSize: 13 }}>Tìm theo race / ngựa</Form.Label>
                <Form.Control
                  placeholder="VD: Phú Thọ Grand Cup, Thần Mã..."
                  value={search}
                  onChange={handleFilterChange(setSearch)}
                />
              </Form.Group>
            </Col>
            <Col md={5}>
              <Form.Group>
                <Form.Label style={{ fontSize: 13 }}>Trạng thái đăng ký</Form.Label>
                <Form.Select value={filterStatus} onChange={handleFilterChange(setFilterStatus)}>
                  {REGISTRATION_STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </div>
      )}

      {/* Table */}
      <div className="lux-panel">
        {rows.length === 0 ? (
          <EmptyState message="Bạn chưa nộp đăng ký nào." />
        ) : filteredRows.length === 0 ? (
          <EmptyState message="Không tìm thấy đăng ký nào khớp bộ lọc." />
        ) : (
          <>
            <DataTable columns={columns} rows={pageRows} />
            <Pagination page={page} pageSize={PAGE_SIZE} total={filteredRows.length} onPageChange={setPage} />
          </>
        )}
      </div>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
