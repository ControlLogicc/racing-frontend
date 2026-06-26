import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Row, Col, Spinner } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { jockeyService } from '../../services/jockeyService';
import { prizeService } from '../../services/prizeService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';
import '../owner/owner-theme.css';

const STEPS = [
  { num: 1, label: 'Chọn giải đấu', icon: '🏇' },
  { num: 2, label: 'Xác nhận', icon: '📋' },
  { num: 3, label: 'Hoàn thành', icon: '✅' },
];

function StepIndicator({ current }) {
  return (
    <div className="d-flex align-items-center mb-5 px-2">
      {STEPS.map((s, i) => (
        <div key={s.num} className="d-flex align-items-center" style={{ flex: i < STEPS.length - 1 ? 1 : 0 }}>
          <div className="d-flex flex-column align-items-center" style={{ position: 'relative' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: current > s.num
                ? 'linear-gradient(135deg,#4caf7d,#388e5d)'
                : current === s.num
                  ? 'linear-gradient(135deg,#D4AF37,#b8941d)'
                  : 'rgba(255,255,255,0.04)',
              border: current >= s.num ? 'none' : '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
              boxShadow: current === s.num ? '0 0 20px rgba(212,175,55,0.35)' : 'none',
              transition: 'all 0.3s ease',
            }}>
              {current > s.num ? '✓' : s.icon}
            </div>
            <div style={{
              fontSize: '0.72rem', fontWeight: 600, marginTop: 8, textAlign: 'center',
              color: current >= s.num ? '#D4AF37' : '#444',
              textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap',
            }}>
              {s.label}
            </div>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{
              flex: 1, height: 2, marginBottom: 22, marginLeft: 12, marginRight: 12,
              background: current > s.num
                ? 'linear-gradient(90deg,#4caf7d,#D4AF37)'
                : 'rgba(255,255,255,0.07)',
              transition: 'background 0.4s ease',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <span style={{ color: '#5a5040', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        {label}
      </span>
      <span style={{ fontWeight: 600, color: '#f0e8d0', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  );
}

function RacePreviewCard({ race, prizes = [] }) {
  if (!race) {
    return (
      <div className="lux-panel d-flex flex-column align-items-center justify-content-center text-center"
        style={{ minHeight: 280, color: '#3a3028' }}>
        <div style={{ fontSize: 52, marginBottom: 14, opacity: 0.5 }}>🏁</div>
        <div style={{ fontSize: '0.85rem' }}>Chọn giải đua để xem thông tin chi tiết</div>
      </div>
    );
  }
  return (
    <div className="lux-panel" style={{ height: '100%' }}>
      <div className="owner-hero-badge mb-3" style={{ fontSize: '0.68rem' }}>🏆 Thông tin giải đấu</div>
      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f0e8d0', marginBottom: 6 }}>{race.name || race.raceName}</div>
      <div style={{
        display: 'inline-block', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)',
        borderRadius: 4, padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700, color: '#D4AF37',
        textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 20,
      }}>Đang mở đăng ký</div>

      {[
        ['📅 Ngày & giờ', formatDate(race.raceTime || race.scheduledTime)],
        ['📏 Cự ly', `${race.distance || race.distanceMeters || '—'} m`],
        ['🏟️ Meeting', race.meetingName ?? '—'],
      ].map(([label, val]) => (
        <InfoRow key={label} label={label} value={val} />
      ))}

      {prizes.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{
            fontSize: '0.68rem', fontWeight: 700, color: '#5a5040',
            textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 4,
          }}>💰 Cơ cấu giải thưởng</div>
          {prizes
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((p, idx) => {
              const bgOpacity = Math.max(0.05, 0.25 - idx * 0.05);
              const barWidth = Math.max(20, 100 - idx * 15);
              return (
                <div key={p.id ?? p.position} style={{ marginBottom: 6, position: 'relative' }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0,
                    width: `${barWidth}%`,
                    background: `linear-gradient(90deg, rgba(212,175,55,${bgOpacity}), transparent)`,
                    borderRadius: 4, zIndex: 0
                  }} />
                  <div style={{
                    position: 'relative', zIndex: 1,
                    display: 'flex', justifyContent: 'space-between', padding: '6px 8px'
                  }}>
                    <span style={{ color: '#c8bea0', fontSize: '0.8rem', fontWeight: 600 }}>Hạng {p.position}</span>
                    <span style={{ fontWeight: 700, color: '#f0e8d0' }}>
                      {p.amount != null ? `₫${Number(p.amount).toLocaleString('vi-VN')}` : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

export default function JockeyRegisterRacePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [races, setRaces] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [raceId, setRaceId] = useState('');
  const [note, setNote] = useState('');

  // Load available races for jockey
  useEffect(() => {
    jockeyService.getAvailableRaces()
      .then((r) => {
        // Map to consistent shape
        const mapped = (Array.isArray(r) ? r : []).map(race => ({
          ...race,
          id: race.raceId ?? race.id,
          name: race.raceName ?? race.name,
          raceTime: race.scheduledTime ?? race.raceTime,
          distance: race.distanceMeters ?? race.distance,
        }));
        setRaces(mapped);
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách giải đua.')))
      .finally(() => setLoading(false));
  }, []);

  // Load prizes when race changes
  useEffect(() => {
    if (raceId) {
      prizeService.getByRace(Number(raceId)).then(setPrizes).catch(() => setPrizes([]));
    } else {
      setPrizes([]);
    }
  }, [raceId]);

  const selectedRace = races.find((r) => r.id === Number(raceId));

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await jockeyService.registerForRace({
        raceId: Number(raceId),
        note: note.trim() || undefined,
      });
      setStep(3);
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Đăng ký thất bại.'), variant: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <div className="page-header mb-4">
        <div>
          <h2>Đăng ký ứng tuyển giải đấu</h2>
          <p style={{ margin: 0, marginTop: 4 }}>Đăng ký vào giải đua để Owner có thể mời bạn cưỡi ngựa thi đấu</p>
        </div>
      </div>

      <StepIndicator current={step} />

      {/* ── Step 1 ─────────────────────────────────────────────── */}
      {step === 1 && (
        <Row className="g-4">
          <Col md={6}>
            <div className="lux-panel">
              <div className="owner-section-label mb-4"><h5>Chọn giải đấu</h5></div>
              <Form className="d-flex flex-column gap-4">
                <Form.Group>
                  <Form.Label>Giải đua đang mở <span style={{ color: '#e55' }}>*</span></Form.Label>
                  <Form.Select value={raceId} onChange={(e) => setRaceId(e.target.value)} required>
                    <option value="">-- Chọn giải đấu --</option>
                    {races.map((r) => <option key={r.id} value={r.id}>{r.name} — {r.raceTime ? formatDate(r.raceTime) : 'Chưa có lịch'}</option>)}
                  </Form.Select>
                  {races.length === 0 && (
                    <Form.Text style={{ color: '#e55' }}>Hiện không có giải đua nào đang mở đăng ký.</Form.Text>
                  )}
                </Form.Group>

                <Form.Group>
                  <Form.Label>Ghi chú gửi ban tổ chức <span style={{ color: '#888', fontWeight: 400, fontSize: '0.8rem' }}>(tùy chọn)</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Nhập lời nhắn gửi ban tổ chức (tối đa 500 ký tự)..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={500}
                  />
                </Form.Group>

                <div className="d-flex gap-3 pt-2">
                  <button
                    type="button"
                    className="btn-outline-gold"
                    onClick={() => navigate('/jockey/races')}
                  >
                    ← Quay lại
                  </button>
                  <button
                    type="button"
                    className="btn-gold"
                    onClick={() => setStep(2)}
                    disabled={!raceId}
                  >
                    Tiếp tục ›
                  </button>
                </div>
              </Form>
            </div>
          </Col>
          <Col md={6}>
            <RacePreviewCard race={selectedRace} prizes={prizes} />
          </Col>
        </Row>
      )}

      {/* ── Step 2 ─────────────────────────────────────────────── */}
      {step === 2 && (
        <Row className="g-4">
          <Col md={6}>
            <div className="lux-panel">
              <div className="owner-section-label mb-4"><h5>Xác nhận ứng tuyển</h5></div>

              <InfoRow label="Giải đấu" value={selectedRace?.name ?? '—'} />
              <InfoRow label="Ngày đua" value={formatDate(selectedRace?.raceTime)} />
              <InfoRow label="Cự ly" value={`${selectedRace?.distance ?? '—'} m`} />
              <InfoRow label="Jockey" value={user.fullName} />
              {note && <InfoRow label="Ghi chú" value={note} />}

              <div style={{
                marginTop: 20, padding: '12px 14px',
                background: 'rgba(212,175,55,0.05)', borderRadius: 8,
                borderLeft: '3px solid rgba(212,175,55,0.35)',
                fontSize: '0.8rem', color: '#6a6250', lineHeight: 1.6,
              }}>
                Sau khi đăng ký, Owner sẽ thấy bạn trong danh sách Jockey đã ứng tuyển và có thể gửi lời mời cho bạn.
              </div>

              <div className="d-flex gap-3 mt-4">
                <button
                  className="btn-outline-gold"
                  onClick={() => setStep(1)}
                >
                  ← Quay lại
                </button>
                <button
                  className="btn-gold"
                  style={{ flex: 1 }}
                  onClick={handleConfirm}
                  disabled={submitting}
                >
                  {submitting
                    ? <><Spinner size="sm" animation="border" className="me-2" />Đang nộp...</>
                    : 'Xác nhận đăng ký'}
                </button>
              </div>
            </div>
          </Col>
          <Col md={6}>
            <RacePreviewCard race={selectedRace} prizes={prizes} />
          </Col>
        </Row>
      )}

      {/* ── Step 3 — Success ─────────────────────────────────── */}
      {step === 3 && (
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div className="lux-panel text-center" style={{ padding: '52px 36px' }}>
            <div style={{ fontSize: 68, marginBottom: 20 }}>🏆</div>
            <div className="owner-hero-badge mx-auto mb-4" style={{ width: 'fit-content' }}>
              Đăng ký thành công
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f0e8d0', marginBottom: 8 }}>
              {selectedRace?.name}
            </div>
            <div style={{ color: '#6a6250', fontSize: '0.88rem', marginBottom: 8 }}>
              Bạn đã ứng tuyển thành công vào giải đấu này.
            </div>
            <div style={{
              color: '#8a7a60', fontSize: '0.8rem', marginBottom: 24,
              background: 'rgba(212,175,55,0.05)', borderRadius: 8, padding: '10px 14px',
            }}>
              Owner sẽ xem hồ sơ của bạn và gửi lời mời nếu muốn bạn cưỡi ngựa thi đấu. Hãy theo dõi mục <strong style={{ color: '#D4AF37' }}>Lời mời đua</strong> để nhận lời mời nhé!
            </div>

            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <button
                className="btn-outline-gold"
                onClick={() => navigate('/jockey/races')}
              >
                Xem lịch đua của tôi
              </button>
              <button
                className="btn-gold"
                onClick={() => navigate('/jockey/invitations')}
              >
                Xem lời mời đua
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
