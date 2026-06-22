import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { raceService } from '../../services/raceService';
import { meetingService } from '../../services/meetingService';
import { raceConditionService } from '../../services/raceConditionService';
import { prizeService } from '../../services/prizeService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import Toaster from '../../components/common/Toaster';

const STEPS = [
  { id: 1, label: 'Race Info' },
  { id: 2, label: 'Condition' },
  { id: 3, label: 'Prize Structure' },
];

function StepIndicator({ current }) {
  return (
    <div className="d-flex align-items-center justify-content-center mb-5" style={{ gap: 0 }}>
      {STEPS.map((step, idx) => {
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="d-flex align-items-center" style={{ flex: idx < STEPS.length - 1 ? 1 : undefined }}>
            <div className="d-flex flex-column align-items-center" style={{ minWidth: 72 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: active ? '#D4AF37' : done ? '#5a4a1a' : '#1e1e2e',
                border: `2px solid ${active || done ? '#D4AF37' : '#444'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 16,
                color: active ? '#000' : done ? '#D4AF37' : '#888',
                flexShrink: 0,
              }}>
                {done ? '✓' : step.id}
              </div>
              <div style={{
                fontSize: 11, marginTop: 6, whiteSpace: 'nowrap',
                color: active ? '#D4AF37' : done ? '#a08020' : '#666',
                fontWeight: active ? 700 : 400,
              }}>
                {step.label}
              </div>
            </div>
            {idx < STEPS.length - 1 && (
              <div style={{ height: 2, flex: 1, background: done ? '#D4AF37' : '#333', marginBottom: 20 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SummaryRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="d-flex justify-content-between align-items-start gap-2 py-2" style={{ borderBottom: '1px solid #2a2a3e' }}>
      <div className="d-flex align-items-center gap-2" style={{ color: '#888', fontSize: 13 }}>
        <span>{icon}</span><span>{label}</span>
      </div>
      <span style={{ color: '#e0d6b0', fontSize: 13, textAlign: 'right', maxWidth: 200 }}>{value}</span>
    </div>
  );
}

function SummarySection({ title, children }) {
  return (
    <div className="mb-3">
      <div style={{ color: '#D4AF37', fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function SummaryPanel({ step, data, meetingName }) {
  return (
    <div className="dash-card h-100">
      <div className="text-center mb-4">
        <div style={{ fontSize: 36, marginBottom: 8 }}>🏁</div>
        <div style={{ color: '#D4AF37', fontWeight: 700, fontSize: 16 }}>Race Summary</div>
      </div>

      {(data.race.name || meetingName) && (
        <SummarySection title="Race">
          <SummaryRow icon="🏟️" label="Meeting" value={meetingName} />
          <SummaryRow icon="🏁" label="Tên race" value={data.race.name} />
          <SummaryRow icon="📐" label="Cự ly" value={data.race.distance ? `${data.race.distance}m` : null} />
          <SummaryRow icon="🕐" label="Giờ đua" value={data.race.raceTime} />
        </SummarySection>
      )}

      {step >= 2 && data.condition.conditionName && (
        <SummarySection title="Condition">
          <SummaryRow icon="📋" label="Tên" value={data.condition.conditionName} />
          <SummaryRow icon="🛤️" label="Track" value={data.condition.trackType} />
          <SummaryRow icon="👥" label="Entries" value={
            data.condition.minEntries || data.condition.maxEntries
              ? `${data.condition.minEntries || '?'} – ${data.condition.maxEntries || '?'}`
              : null
          } />
        </SummarySection>
      )}

      {step >= 3 && data.prizes.some((p) => p.prizeAmount) && (
        <SummarySection title="Prize Structure">
          {data.prizes.filter((p) => p.prizeAmount).map((p) => (
            <SummaryRow
              key={p.position}
              icon={['🥇', '🥈', '🥉'][p.position - 1] ?? '🏅'}
              label={`Hạng ${p.position}`}
              value={Number(p.prizeAmount).toLocaleString('vi-VN') + 'đ'}
            />
          ))}
        </SummarySection>
      )}
    </div>
  );
}

const TRACK_TYPES = ['Turf', 'Dirt', 'Synthetic'];
const CLASS_OPTIONS = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];

function FL({ children }) {
  return <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>{children} <span style={{ color: '#e05555' }}>*</span></Form.Label>;
}

function Step1({ data, meetings, onChange }) {
  return (
    <div>
      <h5 style={{ color: '#D4AF37', marginBottom: 4 }}>Race Information</h5>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Tạo race mới trong một meeting đã có.</p>
      <div className="d-flex flex-column gap-3">
        <Form.Group>
          <FL>Meeting</FL>
          <Form.Select value={data.meetingId} onChange={(e) => onChange('meetingId', e.target.value)} required>
            <option value="">-- Chọn meeting --</option>
            {meetings.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </Form.Select>
        </Form.Group>
        <Form.Group>
          <FL>Tên race</FL>
          <Form.Control value={data.name} onChange={(e) => onChange('name', e.target.value)} placeholder="Eg. Race #1" required />
        </Form.Group>
        <Row className="g-3">
          <Col sm={6}>
            <Form.Group>
              <FL>Cự ly (m)</FL>
              <Form.Control type="number" value={data.distance} onChange={(e) => onChange('distance', e.target.value)} placeholder="1200" required />
            </Form.Group>
          </Col>
          <Col sm={6}>
            <Form.Group>
              <FL>Giờ đua</FL>
              <Form.Control type="datetime-local" value={data.raceTime} onChange={(e) => onChange('raceTime', e.target.value)} required />
            </Form.Group>
          </Col>
        </Row>
      </div>
    </div>
  );
}

function Step2({ data, onChange }) {
  return (
    <div>
      <h5 style={{ color: '#D4AF37', marginBottom: 4 }}>Race Condition</h5>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Tuỳ chọn — có thể bỏ qua và thêm sau.</p>
      <div className="d-flex flex-column gap-3">
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>Tên condition</Form.Label>
          <Form.Control value={data.conditionName} onChange={(e) => onChange('conditionName', e.target.value)} placeholder="Eg. Open Class" />
        </Form.Group>
        <Row className="g-3">
          <Col sm={4}>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>Loại track</Form.Label>
              <Form.Select value={data.trackType} onChange={(e) => onChange('trackType', e.target.value)}>
                <option value="">-- Chọn --</option>
                {TRACK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col sm={4}>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>Min entries</Form.Label>
              <Form.Control type="number" value={data.minEntries} onChange={(e) => onChange('minEntries', e.target.value)} placeholder="4" />
            </Form.Group>
          </Col>
          <Col sm={4}>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>Max entries</Form.Label>
              <Form.Control type="number" value={data.maxEntries} onChange={(e) => onChange('maxEntries', e.target.value)} placeholder="12" />
            </Form.Group>
          </Col>
          <Col sm={12}>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>Class yêu cầu</Form.Label>
              <Form.Select value={data.classRequirement} onChange={(e) => onChange('classRequirement', e.target.value)}>
                <option value="">-- Không yêu cầu --</option>
                {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </div>
    </div>
  );
}

function Step3({ prizes, onChange }) {
  return (
    <div>
      <h5 style={{ color: '#D4AF37', marginBottom: 4 }}>Prize Structure</h5>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Tuỳ chọn — có thể bỏ qua và thêm sau.</p>
      <div className="d-flex flex-column gap-2">
        {prizes.map((p, i) => (
          <div key={i} className="d-flex align-items-center gap-3">
            <div style={{ width: 32, textAlign: 'center', fontSize: 18 }}>{['🥇', '🥈', '🥉'][i] ?? '🏅'}</div>
            <div style={{ color: '#888', fontSize: 13, width: 56 }}>Hạng {p.position}</div>
            <Form.Control
              type="number"
              value={p.prizeAmount}
              onChange={(e) => onChange(i, e.target.value)}
              placeholder="Giải thưởng (VNĐ)"
              style={{ flex: 1 }}
            />
            <div style={{ color: '#888', fontSize: 12, width: 20 }}>đ</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function validate(step, data) {
  if (step === 1) {
    if (!data.race.meetingId) return 'Vui lòng chọn meeting.';
    if (!data.race.name) return 'Vui lòng nhập tên race.';
    if (!data.race.distance || Number(data.race.distance) <= 0) return 'Vui lòng nhập cự ly hợp lệ.';
    if (!data.race.raceTime) return 'Vui lòng chọn giờ đua.';
  }
  return null;
}

const EMPTY = {
  race: { meetingId: '', name: '', distance: '', raceTime: '' },
  condition: { conditionName: '', trackType: '', minEntries: '', maxEntries: '', classRequirement: '' },
  prizes: [
    { position: 1, prizeAmount: '' },
    { position: 2, prizeAmount: '' },
    { position: 3, prizeAmount: '' },
    { position: 4, prizeAmount: '' },
    { position: 5, prizeAmount: '' },
  ],
};

export default function CreateRaceWizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState(EMPTY);
  const [meetings, setMeetings] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [stepError, setStepError] = useState('');

  useEffect(() => {
    meetingService.getAll().then(setMeetings).finally(() => setLoadingMeetings(false));
  }, []);

  const updateRace = (field, value) => setData((d) => ({ ...d, race: { ...d.race, [field]: value } }));
  const updateCondition = (field, value) => setData((d) => ({ ...d, condition: { ...d.condition, [field]: value } }));
  const updatePrize = (i, value) => setData((d) => ({
    ...d, prizes: d.prizes.map((p, idx) => idx === i ? { ...p, prizeAmount: value } : p),
  }));

  const next = () => {
    const err = validate(step, data);
    if (err) { setStepError(err); return; }
    setStepError('');
    setStep((s) => Math.min(s + 1, STEPS.length));
  };

  const prev = () => { setStepError(''); setStep((s) => Math.max(s - 1, 1)); };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const meeting = meetings.find((m) => m.id === Number(data.race.meetingId));
      const race = await raceService.create({
        meetingId: Number(data.race.meetingId),
        meetingName: meeting?.name ?? '',
        name: data.race.name,
        distance: Number(data.race.distance),
        raceTime: data.race.raceTime,
      });

      if (data.condition.conditionName) {
        await raceConditionService.create({ raceId: race.id, ...data.condition });
      }

      const validPrizes = data.prizes.filter((p) => p.prizeAmount);
      for (const p of validPrizes) {
        await prizeService.create({ raceId: race.id, position: p.position, prizeAmount: Number(p.prizeAmount) });
      }

      setToast({ message: 'Tạo race thành công!', variant: 'success' });
      setTimeout(() => navigate('/admin/races'), 1200);
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tạo race thất bại.'), variant: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMeeting = meetings.find((m) => m.id === Number(data.race.meetingId));

  if (loadingMeetings) return <Loading />;

  return (
    <div>
      <div className="page-header d-flex align-items-center gap-3">
        <button className="btn-outline-gold-sm" style={{ padding: '5px 12px' }} onClick={() => navigate('/admin/races')}>
          ← Quay lại
        </button>
        <h2 style={{ margin: 0 }}>Tạo Race mới</h2>
      </div>

      <StepIndicator current={step} />

      <Row className="g-4">
        <Col lg={7}>
          <div className="dash-card h-100">
            {step === 1 && <Step1 data={data.race} meetings={meetings} onChange={updateRace} />}
            {step === 2 && <Step2 data={data.condition} onChange={updateCondition} />}
            {step === 3 && <Step3 prizes={data.prizes} onChange={updatePrize} />}

            {stepError && (
              <div className="mt-3" style={{ color: '#e05555', fontSize: 13 }}>⚠️ {stepError}</div>
            )}

            <div className="d-flex justify-content-between mt-4">
              <Button variant="outline-secondary" onClick={prev} disabled={step === 1}>← Quay lại</Button>
              {step < STEPS.length ? (
                <Button className="btn-gold-sm" style={{ padding: '8px 28px' }} onClick={next}>Tiếp theo →</Button>
              ) : (
                <Button className="btn-gold-sm" style={{ padding: '8px 28px' }} onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Đang tạo...' : '✓ Hoàn thành'}
                </Button>
              )}
            </div>
          </div>
        </Col>

        <Col lg={5}>
          <SummaryPanel step={step} data={data} meetingName={selectedMeeting?.name ?? ''} />
        </Col>
      </Row>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
