import { useEffect, useState } from 'react';
import { Row, Col, Badge, Modal, Spinner } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { invitationService } from '../../services/invitationService';
import { raceService } from '../../services/raceService';
import { prizeService } from '../../services/prizeService';
import { horseService } from '../../services/horseService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { RACE_INVITATION_STATUS } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';
import Toaster from '../../components/common/Toaster';

const POSITION_MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };
const GOLD = '#D4AF37';

const GENDER_LABEL = { M: 'Đực', F: 'Cái', G: 'Thiến' };

function HorseModal({ horseId, onClose }) {
  const [horse, setHorse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!horseId) return;
    setLoading(true);
    setError('');
    horseService.getPublicById(horseId)
      .then(setHorse)
      .catch(() => setError('Không tải được thông tin ngựa.'))
      .finally(() => setLoading(false));
  }, [horseId]);

  const rows = horse ? [
    { icon: '🎂', label: 'Tuổi', value: horse.age ? `${horse.age} tuổi` : '—' },
    { icon: '🎨', label: 'Màu / Giống', value: [horse.breed, horse.color].filter(Boolean).join(' / ') || '—' },
    { icon: '⚥', label: 'Giới tính', value: GENDER_LABEL[horse.gender] ?? horse.gender ?? '—' },
    { icon: '🏷️', label: 'Hạng (Class)', value: horse.horseClass ?? '—' },
    { icon: '⭐', label: 'Điểm rating', value: horse.rating != null ? horse.rating : '—' },
    { icon: '🏆', label: 'Số lần thắng', value: horse.totalWins != null ? horse.totalWins : '—' },
    { icon: '👤', label: 'Chủ ngựa', value: horse.ownerName || '—' },
    ...(horse.pedigree ? [{ icon: '🧬', label: 'Huyết thống', value: horse.pedigree }] : []),
    ...(horse.trainerName ? [{ icon: '🧑‍🏫', label: 'Huấn luyện viên', value: horse.trainerName }] : []),
    ...(horse.stableName ? [{ icon: '🏡', label: 'Trang trại', value: horse.stableName }] : []),
    ...(horse.healthNote ? [{ icon: '📋', label: 'Ghi chú sức khoẻ', value: horse.healthNote }] : []),
  ] : [];

  return (
    <Modal show onHide={onClose} centered size="md">
      <Modal.Header closeButton style={{ background: '#111', borderBottom: '1px solid rgba(212,175,55,0.25)' }}>
        <Modal.Title style={{ color: GOLD, fontWeight: 700, fontSize: '1.1rem' }}>
          🐎 Hồ sơ ngựa
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: '#0d0d0d', padding: '1.5rem' }}>
        {loading && (
          <div className="text-center py-4">
            <Spinner animation="border" style={{ color: GOLD }} />
          </div>
        )}
        {error && <p style={{ color: '#ff6b6b', textAlign: 'center' }}>{error}</p>}
        {horse && (
          <>
            {/* Tên ngựa */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              {horse.imageUrl ? (
                <img
                  src={horse.imageUrl}
                  alt={horse.name}
                  style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', marginBottom: 8, border: '2px solid rgba(212,175,55,0.4)' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = ''; }}
                />
              ) : null}
              <div style={{ fontSize: 40, marginBottom: 8, display: horse.imageUrl ? 'none' : '' }}>🐎</div>
              <h4 style={{ color: '#fff', fontWeight: 800, marginBottom: 4 }}>{horse.name}</h4>
              <span style={{
                display: 'inline-block',
                background: 'rgba(212,175,55,0.15)',
                border: '1px solid rgba(212,175,55,0.35)',
                color: GOLD,
                borderRadius: 20,
                padding: '3px 14px',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}>
                {horse.horseClass ?? 'Chưa xếp hạng'}
              </span>
            </div>

            {/* Rating bar */}
            {horse.rating != null && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                  <span>Rating</span>
                  <span style={{ color: GOLD, fontWeight: 700 }}>{horse.rating} / 100</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, horse.rating)}%`,
                    background: `linear-gradient(90deg, ${GOLD}, #FFDF73)`,
                    borderRadius: 6,
                    boxShadow: `0 0 8px rgba(212,175,55,0.5)`,
                    transition: 'width 0.8s ease',
                  }} />
                </div>
              </div>
            )}

            {/* Thông tin chi tiết */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rows.map(({ icon, label, value }) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 8,
                }}>
                  <span style={{ color: '#777', fontSize: 13 }}>{icon} {label}</span>
                  <span style={{ color: '#f0e8d0', fontWeight: 600, fontSize: 13, textAlign: 'right', maxWidth: '55%' }}>{value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}

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
  const [showHorse, setShowHorse] = useState(false);

  return (
    <div className="dash-card smooth-hover" style={{ borderLeft: isPending ? '3px solid #D4AF37' : '3px solid #333' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h5 style={{ color: '#D4AF37', marginBottom: 4 }}>{inv.raceName}</h5>
          <span style={{ color: '#888', fontSize: 13 }}>
            🐎 Ngựa:{' '}
            <strong
              style={{ color: '#fff', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(212,175,55,0.5)', textUnderlineOffset: 3 }}
              onClick={() => setShowHorse(true)}
              title="Xem hồ sơ ngựa"
            >
              {inv.horseName}
            </strong>
          </span>
        </div>
        <StatusBadge status={inv.status} />
      </div>

      {showHorse && (
        <HorseModal horseId={inv.horseId} onClose={() => setShowHorse(false)} />
      )}

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
      setToast({ message: getApiErrorMessage(err, 'Thao tác thất bại.'), variant: 'danger' });
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

  const filtered = [...(filter === 'pending'
    ? invitations.filter((i) => i.status === RACE_INVITATION_STATUS.SENT)
    : invitations
  )].sort((a, b) => {
    const sentAtDifference = (Date.parse(b.sentAt) || 0) - (Date.parse(a.sentAt) || 0);
    return sentAtDifference || Number(b.id || 0) - Number(a.id || 0);
  });

  const pendingCount = invitations.filter((i) => i.status === RACE_INVITATION_STATUS.SENT).length;

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <div className="page-header smooth-hover">
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
              transition: 'all 0.2s ease',
            }}
            className="smooth-hover-btn"
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
