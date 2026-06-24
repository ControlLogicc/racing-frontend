import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Form, Row, Col, Spinner } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { raceService } from '../../services/raceService';
import { horseService } from '../../services/horseService';
import { registrationService } from '../../services/registrationService';
import { prizeService } from '../../services/prizeService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';
import './owner-theme.css';

const STEPS = [
  { num: 1, label: 'Chọn thông tin', icon: '🏇' },
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
        <div style={{ fontSize: '0.85rem' }}>Chọn race để xem thông tin chi tiết</div>
      </div>
    );
  }
  return (
    <div className="lux-panel" style={{ height: '100%' }}>
      <div className="owner-hero-badge mb-3" style={{ fontSize: '0.68rem' }}>🏆 Thông tin race</div>
      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f0e8d0', marginBottom: 6 }}>{race.name}</div>
      <div style={{
        display: 'inline-block', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)',
        borderRadius: 4, padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700, color: '#D4AF37',
        textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 20,
      }}>Open for Entry</div>

      {[
        ['📅 Ngày & giờ', formatDate(race.raceTime)],
        ['📏 Cự ly', `${race.distance ?? '—'} m`],
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
            .map((p) => (
              <InfoRow
                key={p.id ?? p.position}
                label={`Hạng ${p.position}`}
                value={p.amount != null ? `₫${Number(p.amount).toLocaleString('vi-VN')}` : '—'}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default function RegisterRacePage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const preRaceId = searchParams.get('raceId') ? Number(searchParams.get('raceId')) : null;

  const [step, setStep] = useState(1);
  const [races, setRaces] = useState([]);
  const [horses, setHorses] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [raceId, setRaceId] = useState(preRaceId ? String(preRaceId) : '');
  const [horseId, setHorseId] = useState('');

  // Load races & horses
  useEffect(() => {
    Promise.all([raceService.getOpen(), horseService.getByOwner()])
      .then(([r, h]) => {
        setRaces(r);
        setHorses(h.filter((horse) => !horse.ownerId || Number(horse.ownerId) === Number(user.userId)));
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được dữ liệu.')))
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
  const selectedHorse = horses.find((h) => h.id === Number(horseId));

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await registrationService.create({
        raceId: Number(raceId),
        horseId: Number(horseId),
      });
      setStep(3);
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Nộp đăng ký thất bại.'), variant: 'danger' });
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
          <h2>Đăng ký đua</h2>
          <p style={{ margin: 0, marginTop: 4 }}>Nộp đăng ký ngựa tham dự race</p>
        </div>
      </div>

      <StepIndicator current={step} />

      {/* ── Step 1 ─────────────────────────────────────────────── */}
      {step === 1 && (
        <Row className="g-4">
          <Col md={6}>
            <div className="lux-panel">
              <div className="owner-section-label mb-4"><h5>Thông tin đăng ký</h5></div>
              <Form
                onSubmit={(e) => { e.preventDefault(); setStep(2); }}
                className="d-flex flex-column gap-4"
              >
                {!preRaceId && (
                  <Form.Group>
                    <Form.Label>Race <span style={{ color: '#e55' }}>*</span></Form.Label>
                    <Form.Select value={raceId} onChange={(e) => setRaceId(e.target.value)} required>
                      <option value="">-- Chọn race --</option>
                      {races.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </Form.Select>
                    {races.length === 0 && (
                      <Form.Text style={{ color: '#e55' }}>Hiện không có race nào đang mở.</Form.Text>
                    )}
                  </Form.Group>
                )}

                <Form.Group>
                  <Form.Label>Ngựa <span style={{ color: '#e55' }}>*</span></Form.Label>
                  <Form.Select value={horseId} onChange={(e) => setHorseId(e.target.value)} required>
                    <option value="">-- Chọn ngựa --</option>
                    {horses.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </Form.Select>
                  {horses.length === 0 && (
                    <Form.Text style={{ color: '#e55' }}>Bạn chưa có ngựa. Hãy thêm ngựa trước.</Form.Text>
                  )}
                </Form.Group>

                <div className="d-flex gap-3 pt-2">
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ padding: '9px 20px', fontSize: '0.82rem' }}
                    onClick={() => navigate(-1)}
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    className="btn-gold btn-gold-sm"
                    style={{ padding: '9px 28px', flex: 1 }}
                    disabled={!raceId || !horseId}
                  >
                    Tiếp tục xem lại →
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
              <div className="owner-section-label mb-4"><h5>Xác nhận đăng ký</h5></div>

              <InfoRow label="Race" value={selectedRace?.name ?? '—'} />
              <InfoRow label="Ngựa" value={selectedHorse?.name ?? '—'} />
              <InfoRow label="Owner" value={user.fullName} />

              <div style={{
                marginTop: 20, padding: '12px 14px',
                background: 'rgba(212,175,55,0.05)', borderRadius: 8,
                borderLeft: '3px solid rgba(212,175,55,0.35)',
                fontSize: '0.8rem', color: '#6a6250', lineHeight: 1.6,
              }}>
                Đăng ký sẽ được ghi nhận ngay.
              </div>

              <div className="d-flex gap-3 mt-4">
                <button
                  className="btn-ghost"
                  style={{ padding: '9px 20px', fontSize: '0.82rem' }}
                  onClick={() => setStep(1)}
                >
                  ← Quay lại
                </button>
                <button
                  className="btn-gold btn-gold-sm"
                  style={{ padding: '9px 0', flex: 1 }}
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
            <div style={{ color: '#6a6250', fontSize: '0.88rem', marginBottom: 24 }}>
              Ngựa <strong style={{ color: '#D4AF37' }}>{selectedHorse?.name}</strong> đã được đăng ký thành công.
            </div>

            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <button
                className="btn-ghost"
                style={{ padding: '10px 22px', fontSize: '0.82rem' }}
                onClick={() => navigate('/owner/registrations')}
              >
                Xem đăng ký của tôi
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
