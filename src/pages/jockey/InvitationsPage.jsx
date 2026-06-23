import { useEffect, useState } from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { invitationService } from '../../services/invitationService';
import { raceService } from '../../services/raceService';
import { prizeService } from '../../services/prizeService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { RACE_INVITATION_STATUS } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';
import Toaster from '../../components/common/Toaster';

const POSITION_MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };

function PrizeList({ prizes }) {
  if (!prizes.length) return <p style={{ color: '#555', fontSize: 13 }}>Chưa có thông tin giải thưởng.</p>;
  return (
    <div className="d-flex flex-column gap-1 mt-2">
      {prizes.map((p) => (
        <div key={p.id} className="d-flex justify-content-between align-items-center" style={{ fontSize: 13 }}>
          <span style={{ color: '#aaa' }}>
            {POSITION_MEDAL[p.position] ?? `Hạng ${p.position}`} Hạng {p.position}
          </span>
          <span style={{ color: '#D4AF37', fontWeight: 700 }}>
            ${(p.amount ?? 0).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

function InvitationCard({ inv, race, prizes, onAccept, onDecline }) {
  const isPending = inv.status === RACE_INVITATION_STATUS.SENT || inv.status === RACE_INVITATION_STATUS.PENDING_RESPONSE;

  return (
    <div className="dash-card" style={{ borderLeft: isPending ? '3px solid #D4AF37' : '3px solid #333' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h5 style={{ color: '#D4AF37', marginBottom: 4 }}>{inv.raceName}</h5>
          <span style={{ color: '#888', fontSize: 13 }}>🐎 Ngựa: <strong style={{ color: '#fff' }}>{inv.horseName}</strong></span>
        </div>
        <StatusBadge status={inv.status} />
      </div>

      <Row className="g-3">
        {/* Race details */}
        <Col md={7}>
          <p style={{ color: '#D4AF37', fontSize: 12, fontWeight: 600, marginBottom: 8, letterSpacing: 1 }}>THÔNG TIN RACE</p>
          {race ? (
            <div className="d-flex flex-column gap-2">
              {[
                ['📅 Ngày đua', formatDate(race.raceTime)],
                ['📏 Cự ly', `${race.distance}m`],
                ['🏟️ Meeting', race.meetingName ?? '—'],
              ].map(([label, val]) => (
                <div key={label} className="d-flex justify-content-between" style={{ borderBottom: '1px solid #222', paddingBottom: 6, fontSize: 13 }}>
                  <span style={{ color: '#777' }}>{label}</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{val}</span>
                </div>
              ))}
              <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
                Deadline lời mời: <span style={{ color: inv.deadline ? '#D4AF37' : '#555' }}>{formatDate(inv.deadline)}</span>
              </div>
            </div>
          ) : (
            <p style={{ color: '#555', fontSize: 13 }}>Không tải được thông tin race.</p>
          )}
        </Col>

        {/* Prize info */}
        <Col md={5}>
          <p style={{ color: '#D4AF37', fontSize: 12, fontWeight: 600, marginBottom: 8, letterSpacing: 1 }}>GIẢI THƯỞNG</p>
          <PrizeList prizes={prizes} />
        </Col>
      </Row>

      {/* Actions */}
      {isPending && (
        <div className="d-flex gap-3 mt-4 pt-3" style={{ borderTop: '1px solid #222' }}>
          <button
            className="btn-gold-sm"
            style={{ padding: '8px 28px' }}
            onClick={() => onAccept(inv.id)}
          >
            ✓ Nhận lời mời
          </button>
          <button
            className="btn-outline-gold-sm"
            style={{ padding: '8px 28px' }}
            onClick={() => onDecline(inv.id)}
          >
            ✕ Từ chối
          </button>
        </div>
      )}
    </div>
  );
}

export default function JockeyInvitationsPage() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [races, setRaces] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('all');

  const load = () => {
    Promise.all([
      invitationService.getByJockey(user.userId),
      raceService.getPublic(),
      prizeService.getPublicAll(),
    ])
      .then(([invs, r, p]) => { setInvitations(invs); setRaces(r); setPrizes(p); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được lời mời.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const handleAccept = async (id) => {
    try {
      await invitationService.accept(id);
      setToast({ message: 'Đã nhận lời mời.', variant: 'success' });
      refetch();
    } catch (err) {
      let msg = getApiErrorMessage(err, 'Thao tác thất bại.');
      if (err?.response?.status === 409) {
        msg = 'Không thể nhận: Bạn đã tham gia Race này rồi, HOẶC ngựa này bị kẹt Entry (lỗi BE).';
      }
      setToast({ message: msg, variant: 'danger' });
    }
  };

  const handleDecline = async (id) => {
    if (!window.confirm('Xác nhận từ chối lời mời này?')) return;
    try {
      await invitationService.decline(id);
      setToast({ message: 'Đã từ chối lời mời.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Thao tác thất bại.'), variant: 'danger' });
    }
  };

  const filtered = filter === 'pending'
    ? invitations.filter((i) => i.status === RACE_INVITATION_STATUS.SENT)
    : invitations;

  const pendingCount = invitations.filter((i) => i.status === RACE_INVITATION_STATUS.SENT).length;

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <div className="page-header">
        <h2>
          Lời mời đua
          {pendingCount > 0 && (
            <Badge bg="warning" text="dark" style={{ fontSize: 13, marginLeft: 10 }}>
              {pendingCount} chờ phản hồi
            </Badge>
          )}
        </h2>
      </div>

      {/* Filter tabs */}
      <div className="d-flex gap-2 mb-4">
        {[
          { key: 'all', label: `Tất cả (${invitations.length})` },
          { key: 'pending', label: `Chờ phản hồi (${pendingCount})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '6px 18px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13,
              background: filter === tab.key ? '#D4AF37' : '#1e1e30',
              color: filter === tab.key ? '#000' : '#888',
              fontWeight: filter === tab.key ? 700 : 400,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState message={filter === 'pending' ? 'Không có lời mời nào chờ phản hồi.' : 'Bạn chưa có lời mời nào.'} />
      ) : (
        <div className="d-flex flex-column gap-3">
          {filtered.map((inv) => (
            <InvitationCard
              key={inv.id}
              inv={inv}
              race={races.find((r) => r.id === inv.raceId)}
              prizes={prizes.filter((p) => p.raceId === inv.raceId).sort((a, b) => a.position - b.position)}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          ))}
        </div>
      )}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
