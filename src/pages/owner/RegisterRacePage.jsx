import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { raceService } from '../../services/raceService';
import { horseService } from '../../services/horseService';
import { registrationService } from '../../services/registrationService';
import { invitationService } from '../../services/invitationService';
import { userService } from '../../services/userService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { RACE_STATUS } from '../../constants/status';
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';

const STEPS = [
  { num: 1, label: 'Chọn thông tin', sub: 'Chọn ngựa và race' },
  { num: 2, label: 'Xác nhận', sub: 'Kiểm tra đăng ký' },
  { num: 3, label: 'Đã nộp', sub: 'Chờ xác nhận' },
];

function StepIndicator({ current }) {
  return (
    <div className="d-flex align-items-start mb-4">
      {STEPS.map((s, i) => (
        <div key={s.num} className="d-flex align-items-start">
          <div className="d-flex flex-column align-items-center">
            <div
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: current >= s.num ? '#D4AF37' : '#333',
                color: current >= s.num ? '#000' : '#999',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14, flexShrink: 0,
              }}
            >
              {s.num}
            </div>
            <div style={{ fontSize: 12, color: current >= s.num ? '#D4AF37' : '#666', marginTop: 6, textAlign: 'center', lineHeight: 1.4 }}>
              <div style={{ fontWeight: 600 }}>{s.label}</div>
              <div style={{ color: '#666' }}>{s.sub}</div>
            </div>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ height: 2, width: 100, background: current > s.num ? '#D4AF37' : '#333', margin: '18px 12px 0' }} />
          )}
        </div>
      ))}
    </div>
  );
}

function RaceInfoCard({ race }) {
  if (!race) {
    return (
      <div className="dash-card d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 300, color: '#555' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏁</div>
        <div>Chọn race để xem thông tin</div>
      </div>
    );
  }

  const rows = [
    ['📅 Ngày & giờ', formatDate(race.raceTime)],
    ['📏 Cự ly', `${race.distance ?? '—'}m`],
    ['🏟️ Meeting', race.meetingName ?? '—'],
  ];

  return (
    <div className="dash-card">
      <h6 style={{ color: '#D4AF37', marginBottom: 16 }}>🏆 THÔNG TIN RACE</h6>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>{race.name}</div>
        <span style={{ background: '#D4AF37', color: '#000', borderRadius: 4, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
          OPEN FOR ENTRY
        </span>
      </div>
      {rows.map(([label, val]) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2a2a2a', padding: '10px 0', color: '#ccc' }}>
          <span style={{ color: '#888' }}>{label}</span>
          <span style={{ fontWeight: 600, color: '#fff' }}>{val}</span>
        </div>
      ))}
      <div style={{ marginTop: 16, background: '#1e1e30', borderRadius: 8, padding: 12, fontSize: 13, color: '#aaa', borderLeft: '3px solid #D4AF37' }}>
        ⚠️ Đăng ký sẽ được ghi nhận ngay. Bạn sẽ được thông báo khi có cập nhật về race.
      </div>
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
  const [jockeys, setJockeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [invitationSent, setInvitationSent] = useState(false);

  const [raceId, setRaceId] = useState(preRaceId ? String(preRaceId) : '');
  const [horseId, setHorseId] = useState('');
  const [jockeyId, setJockeyId] = useState('');
  const [ownerNote, setOwnerNote] = useState('');

  useEffect(() => {
    Promise.all([raceService.getAll(), horseService.getByOwner(user.userId), userService.getAll()])
      .then(([r, h, users]) => {
        setRaces(r.filter((race) => race.status === RACE_STATUS.UPCOMING));
        setHorses(h);
        setJockeys(users.filter((u) => u.role === 'jockey' && !u.locked));
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được dữ liệu.')))
      .finally(() => setLoading(false));
  }, []);

  const selectedRace = races.find((r) => r.id === Number(raceId));
  const selectedHorse = horses.find((h) => h.id === Number(horseId));
  const selectedJockey = jockeys.find((j) => j.id === Number(jockeyId));

  const handleStep1Submit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const created = await registrationService.create({
        raceId: Number(raceId),
        raceName: selectedRace?.name,
        horseId: Number(horseId),
        horseName: selectedHorse?.name,
        ownerId: user.userId,
        ownerName: user.fullName,
        ownerNote,
      });

      if (jockeyId && created?.id) {
        try {
          await invitationService.send({
            registrationId: created.id,
            raceName: selectedRace?.name,
            horseName: selectedHorse?.name,
            jockeyId: Number(jockeyId),
            jockeyName: selectedJockey?.fullName,
          });
          setInvitationSent(true);
        } catch {
          // đăng ký vẫn thành công, chỉ invitation thất bại
          setToast({ message: 'Đăng ký thành công nhưng gửi lời mời jockey thất bại. Hãy thử lại từ trang Lời mời Jockey.', variant: 'warning' });
        }
      }

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
      <div className="page-header"><h2>Đăng ký đua</h2></div>

      <StepIndicator current={step} />

      {step === 1 && (
        <Row className="g-4">
          <Col md={6}>
            <div className="dash-card">
              <h6 style={{ color: '#D4AF37', marginBottom: 4 }}>🚩 ĐĂNG KÝ NGỰA VÀO RACE</h6>
              <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>
                Chọn ngựa muốn đăng ký, sau đó thêm ghi chú nếu cần.
              </p>
              <Form onSubmit={handleStep1Submit} className="d-flex flex-column gap-3">
                {!preRaceId && (
                  <Form.Group>
                    <Form.Label style={{ color: '#D4AF37' }}>Race <span style={{ color: '#f66' }}>*</span></Form.Label>
                    <Form.Select value={raceId} onChange={(e) => setRaceId(e.target.value)} required>
                      <option value="">-- Chọn race --</option>
                      {races.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </Form.Select>
                  </Form.Group>
                )}

                <Form.Group>
                  <Form.Label style={{ color: '#D4AF37' }}>Ngựa <span style={{ color: '#f66' }}>*</span></Form.Label>
                  <Form.Select value={horseId} onChange={(e) => setHorseId(e.target.value)} required>
                    <option value="">-- Chọn ngựa --</option>
                    {horses.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </Form.Select>
                  {horses.length === 0 && (
                    <Form.Text style={{ color: '#f66' }}>Bạn chưa có ngựa. Hãy thêm ngựa trước.</Form.Text>
                  )}
                </Form.Group>

                <Form.Group>
                  <Form.Label style={{ color: '#D4AF37' }}>Jockey (Tuỳ chọn)</Form.Label>
                  <Form.Select value={jockeyId} onChange={(e) => setJockeyId(e.target.value)}>
                    <option value="">-- Chọn jockey (có thể mời sau) --</option>
                    {jockeys.map((j) => <option key={j.id} value={j.id}>{j.fullName}</option>)}
                  </Form.Select>
                  <Form.Text style={{ color: '#666' }}>Nếu chọn jockey, lời mời sẽ được gửi ngay sau khi đăng ký.</Form.Text>
                </Form.Group>

                <Form.Group>
                  <Form.Label style={{ color: '#D4AF37' }}>Ghi chú của owner (Tuỳ chọn)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={ownerNote}
                    onChange={(e) => setOwnerNote(e.target.value)}
                    placeholder="Nhập ghi chú về tình trạng ngựa hoặc yêu cầu đặc biệt..."
                    maxLength={500}
                    style={{ resize: 'none' }}
                  />
                  <div style={{ textAlign: 'right', fontSize: 12, color: '#555', marginTop: 4 }}>
                    {ownerNote.length} / 500
                  </div>
                </Form.Group>

                <div className="d-flex gap-3 mt-2">
                  <Button variant="secondary" onClick={() => navigate(-1)}>Huỷ</Button>
                  <Button
                    type="submit"
                    className="btn-gold-sm"
                    style={{ padding: '8px 24px' }}
                    disabled={!raceId || !horseId}
                  >
                    Tiếp tục xem lại →
                  </Button>
                </div>
              </Form>
            </div>
          </Col>
          <Col md={6}>
            <RaceInfoCard race={selectedRace} />
          </Col>
        </Row>
      )}

      {step === 2 && (
        <Row className="g-4">
          <Col md={6}>
            <div className="dash-card">
              <h6 style={{ color: '#D4AF37', marginBottom: 16 }}>📋 XÁC NHẬN ĐĂNG KÝ</h6>
              {[
                ['Race', selectedRace?.name ?? '—'],
                ['Ngựa', selectedHorse?.name ?? '—'],
                ['Jockey', selectedJockey?.fullName ?? '(mời sau)'],
                ['Owner', user.fullName],
                ['Ghi chú', ownerNote || '(không có)'],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2a2a2a', padding: '12px 0' }}>
                  <span style={{ color: '#888' }}>{label}</span>
                  <span style={{ fontWeight: 600, color: '#fff', maxWidth: '60%', textAlign: 'right' }}>{val}</span>
                </div>
              ))}
              <p style={{ fontSize: 13, color: '#666', marginTop: 16 }}>
                Đăng ký của bạn sẽ được ghi nhận ngay. Bạn cần mời jockey riêng sau khi đăng ký thành công.
              </p>
              <div className="d-flex gap-3 mt-3">
                <Button variant="secondary" onClick={() => setStep(1)}>← Quay lại</Button>
                <Button
                  className="btn-gold-sm"
                  style={{ padding: '8px 24px' }}
                  onClick={handleConfirm}
                  disabled={submitting}
                >
                  {submitting ? 'Đang nộp...' : 'Xác nhận đăng ký'}
                </Button>
              </div>
            </div>
          </Col>
          <Col md={6}>
            <RaceInfoCard race={selectedRace} />
          </Col>
        </Row>
      )}

      {step === 3 && (
        <div className="dash-card text-center" style={{ maxWidth: 480, margin: '0 auto', padding: '48px 32px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h4 style={{ color: '#D4AF37', marginBottom: 8 }}>Đăng ký thành công!</h4>
          <p style={{ color: '#999', marginBottom: 8 }}>
            Đăng ký của bạn cho <strong style={{ color: '#fff' }}>{selectedRace?.name}</strong> đã được ghi nhận.
          </p>
          {invitationSent ? (
            <p style={{ color: '#4caf7d', marginBottom: 24 }}>
              ✉️ Lời mời đã được gửi tới <strong>{selectedJockey?.fullName}</strong>.
            </p>
          ) : (
            <p style={{ color: '#888', marginBottom: 24 }}>
              Bạn chưa chọn jockey. Hãy mời jockey từ trang Lời mời Jockey.
            </p>
          )}
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Button variant="secondary" onClick={() => navigate('/owner/registrations')}>
              Xem đăng ký của tôi
            </Button>
            {!invitationSent && (
              <Button className="btn-gold-sm" onClick={() => navigate('/owner/invitations')}>
                Mời Jockey ngay
              </Button>
            )}
          </div>
        </div>
      )}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
