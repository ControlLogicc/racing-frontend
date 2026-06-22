import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { meetingService } from '../../services/meetingService';
import { seasonService } from '../../services/seasonService';
import { raceService } from '../../services/raceService';
import { raceConditionService } from '../../services/raceConditionService';
import { prizeService } from '../../services/prizeService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import Toaster from '../../components/common/Toaster';

// ─── Steps ────────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Meeting Info' },
  { id: 2, label: 'Races' },
  { id: 3, label: 'Conditions' },
  { id: 4, label: 'Prize Structure' },
];

// ─── Step Indicator ───────────────────────────────────────────────────────────
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
              <div style={{
                height: 2, flex: 1,
                background: done ? '#D4AF37' : '#333',
                marginBottom: 20,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Summary ──────────────────────────────────────────────────────────────────
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

function SummaryPanel({ step, data, seasonName }) {
  return (
    <div className="dash-card h-100">
      <div className="text-center mb-4">
        <div style={{ fontSize: 36, marginBottom: 8 }}>🏟️</div>
        <div style={{ color: '#D4AF37', fontWeight: 700, fontSize: 16 }}>Meeting Summary</div>
      </div>

      {(data.meeting.name || data.meeting.racecourse || data.meeting.date) && (
        <SummarySection title="Meeting">
          <SummaryRow icon="📅" label="Season" value={seasonName} />
          <SummaryRow icon="🏟️" label="Tên meeting" value={data.meeting.name} />
          <SummaryRow icon="📍" label="Địa điểm" value={data.meeting.racecourse} />
          <SummaryRow icon="🕐" label="Ngày" value={data.meeting.date} />
        </SummarySection>
      )}

      {step >= 2 && data.races.length > 0 && (
        <SummarySection title={`Races (${data.races.length})`}>
          {data.races.map((r, i) => (
            <SummaryRow key={i} icon="🏁" label={`Race ${i + 1}`} value={r.name ? `${r.name}${r.distance ? ` — ${r.distance}m` : ''}` : ''} />
          ))}
        </SummarySection>
      )}

      {step >= 3 && data.condition.conditionName && (
        <SummarySection title="Condition">
          <SummaryRow icon="📐" label="Tên" value={data.condition.conditionName} />
          <SummaryRow icon="🛤️" label="Track" value={data.condition.trackType} />
          <SummaryRow icon="👥" label="Entries" value={
            data.condition.minEntries || data.condition.maxEntries
              ? `${data.condition.minEntries || '?'} – ${data.condition.maxEntries || '?'}`
              : null
          } />
        </SummarySection>
      )}

      {step >= 4 && data.prizes.some((p) => p.prizeAmount) && (
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

// ─── Constants ────────────────────────────────────────────────────────────────
const TRACK_TYPES = ['Turf', 'Dirt', 'Synthetic'];
const CLASS_OPTIONS = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];

function FieldLabel({ children }) {
  return <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>{children} <span style={{ color: '#e05555' }}>*</span></Form.Label>;
}

// ─── Step 1: Meeting Info ─────────────────────────────────────────────────────
function Step1({ data, seasons, onChange }) {
  return (
    <div>
      <h5 style={{ color: '#D4AF37', marginBottom: 4 }}>Meeting Information</h5>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Tạo race meeting mới trong một season đã có.</p>
      <div className="d-flex flex-column gap-3">
        <Form.Group>
          <FieldLabel>Season</FieldLabel>
          <Form.Select value={data.seasonId} onChange={(e) => onChange('seasonId', e.target.value)} required>
            <option value="">-- Chọn season --</option>
            {seasons.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Form.Select>
        </Form.Group>
        <Form.Group>
          <FieldLabel>Tên meeting</FieldLabel>
          <Form.Control value={data.name} onChange={(e) => onChange('name', e.target.value)} placeholder="Eg. Saigon Cup 2026" required />
        </Form.Group>
        <Form.Group>
          <FieldLabel>Địa điểm</FieldLabel>
          <Form.Control value={data.racecourse} onChange={(e) => onChange('racecourse', e.target.value)} placeholder="Eg. Saigon Racecourse" required />
        </Form.Group>
        <Form.Group>
          <FieldLabel>Ngày tổ chức</FieldLabel>
          <Form.Control type="date" value={data.date} onChange={(e) => onChange('date', e.target.value)} required />
        </Form.Group>
      </div>
    </div>
  );
}

// ─── Step 2: Races ────────────────────────────────────────────────────────────
function Step2({ races, onAdd, onRemove, onChange }) {
  return (
    <div>
      <h5 style={{ color: '#D4AF37', marginBottom: 4 }}>Races</h5>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Thêm các race sẽ diễn ra trong meeting này.</p>
      <div className="d-flex flex-column gap-3">
        {races.map((r, i) => (
          <div key={i} className="p-3" style={{ background: '#0d0d1a', borderRadius: 8, border: '1px solid #2a2a3e' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ color: '#D4AF37', fontWeight: 600, fontSize: 13 }}>🏁 Race {i + 1}</span>
              {races.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  style={{ background: 'none', border: 'none', color: '#e05555', cursor: 'pointer', fontSize: 13 }}
                >
                  ✕ Xoá
                </button>
              )}
            </div>
            <Row className="g-2">
              <Col sm={6}>
                <Form.Group>
                  <Form.Label style={{ color: '#aaa', fontSize: 12 }}>Tên race</Form.Label>
                  <Form.Control size="sm" value={r.name} onChange={(e) => onChange(i, 'name', e.target.value)} placeholder="Race #1" />
                </Form.Group>
              </Col>
              <Col sm={3}>
                <Form.Group>
                  <Form.Label style={{ color: '#aaa', fontSize: 12 }}>Cự ly (m)</Form.Label>
                  <Form.Control size="sm" type="number" value={r.distance} onChange={(e) => onChange(i, 'distance', e.target.value)} placeholder="1200" />
                </Form.Group>
              </Col>
              <Col sm={3}>
                <Form.Group>
                  <Form.Label style={{ color: '#aaa', fontSize: 12 }}>Giờ đua</Form.Label>
                  <Form.Control size="sm" type="time" value={r.raceTime} onChange={(e) => onChange(i, 'raceTime', e.target.value)} />
                </Form.Group>
              </Col>
            </Row>
          </div>
        ))}
        <button type="button" onClick={onAdd} className="btn-outline-gold-sm" style={{ padding: '8px 0', width: '100%' }}>
          + Thêm race
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Conditions ───────────────────────────────────────────────────────
function Step3({ condition, onChange }) {
  return (
    <div>
      <h5 style={{ color: '#D4AF37', marginBottom: 4 }}>Race Condition</h5>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Tuỳ chọn — có thể bỏ qua và thêm sau.</p>
      <div className="d-flex flex-column gap-3">
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>Tên condition</Form.Label>
          <Form.Control value={condition.conditionName} onChange={(e) => onChange('conditionName', e.target.value)} placeholder="Eg. Open Class" />
        </Form.Group>
        <Row className="g-3">
          <Col sm={4}>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>Loại track</Form.Label>
              <Form.Select value={condition.trackType} onChange={(e) => onChange('trackType', e.target.value)}>
                <option value="">-- Chọn --</option>
                {TRACK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col sm={4}>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>Min entries</Form.Label>
              <Form.Control type="number" value={condition.minEntries} onChange={(e) => onChange('minEntries', e.target.value)} placeholder="4" />
            </Form.Group>
          </Col>
          <Col sm={4}>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>Max entries</Form.Label>
              <Form.Control type="number" value={condition.maxEntries} onChange={(e) => onChange('maxEntries', e.target.value)} placeholder="12" />
            </Form.Group>
          </Col>
          <Col sm={12}>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>Class yêu cầu</Form.Label>
              <Form.Select value={condition.classRequirement} onChange={(e) => onChange('classRequirement', e.target.value)}>
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

// ─── Step 4: Prize Structure ──────────────────────────────────────────────────
function Step4({ prizes, onChange }) {
  return (
    <div>
      <h5 style={{ color: '#D4AF37', marginBottom: 4 }}>Prize Structure</h5>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Tuỳ chọn — có thể bỏ qua và thêm sau.</p>
      <div className="d-flex flex-column gap-2">
        {prizes.map((p, i) => (
          <div key={i} className="d-flex align-items-center gap-3">
            <div style={{ width: 32, textAlign: 'center', fontSize: 18 }}>
              {['🥇', '🥈', '🥉'][i] ?? '🏅'}
            </div>
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

// ─── Validate ─────────────────────────────────────────────────────────────────
function validate(step, data) {
  if (step === 1) {
    if (!data.meeting.seasonId) return 'Vui lòng chọn season.';
    if (!data.meeting.name) return 'Vui lòng nhập tên meeting.';
    if (!data.meeting.racecourse) return 'Vui lòng nhập địa điểm.';
    if (!data.meeting.date) return 'Vui lòng chọn ngày tổ chức.';
  }
  if (step === 2) {
    if (data.races.some((r) => !r.name)) return 'Vui lòng nhập tên cho tất cả race.';
  }
  return null;
}

// ─── Initial state ────────────────────────────────────────────────────────────
const EMPTY = {
  meeting: { seasonId: '', name: '', racecourse: '', date: '' },
  races: [{ name: '', distance: '', raceTime: '' }],
  condition: { conditionName: '', trackType: '', minEntries: '', maxEntries: '', classRequirement: '' },
  prizes: [
    { position: 1, prizeAmount: '' },
    { position: 2, prizeAmount: '' },
    { position: 3, prizeAmount: '' },
    { position: 4, prizeAmount: '' },
    { position: 5, prizeAmount: '' },
  ],
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CreateMeetingWizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState(EMPTY);
  const [seasons, setSeasons] = useState([]);
  const [loadingSeasons, setLoadingSeasons] = useState(true);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [stepError, setStepError] = useState('');

  useEffect(() => {
    seasonService.getAll().then(setSeasons).finally(() => setLoadingSeasons(false));
  }, []);

  const updateMeeting = (field, value) => setData((d) => ({ ...d, meeting: { ...d.meeting, [field]: value } }));
  const updateCondition = (field, value) => setData((d) => ({ ...d, condition: { ...d.condition, [field]: value } }));
  const addRace = () => setData((d) => ({ ...d, races: [...d.races, { name: '', distance: '', raceTime: '' }] }));
  const removeRace = (i) => setData((d) => ({ ...d, races: d.races.filter((_, idx) => idx !== i) }));
  const updateRace = (i, field, value) => setData((d) => ({
    ...d, races: d.races.map((r, idx) => idx === i ? { ...r, [field]: value } : r),
  }));
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
      const season = seasons.find((s) => s.id === Number(data.meeting.seasonId));
      const meeting = await meetingService.create({
        seasonId: Number(data.meeting.seasonId),
        seasonName: season?.name ?? '',
        name: data.meeting.name,
        racecourse: data.meeting.racecourse,
        date: data.meeting.date,
      });

      for (const r of data.races) {
        if (!r.name) continue;
        const race = await raceService.create({
          meetingId: meeting.id,
          meetingName: meeting.name,
          name: r.name,
          distance: Number(r.distance) || 0,
          raceTime: r.raceTime ? `${data.meeting.date}T${r.raceTime}:00` : data.meeting.date,
        });
        if (data.condition.conditionName) {
          await raceConditionService.create({ raceId: race.id, ...data.condition });
        }
        const validPrizes = data.prizes.filter((p) => p.prizeAmount);
        for (const p of validPrizes) {
          await prizeService.create({ raceId: race.id, position: p.position, prizeAmount: Number(p.prizeAmount) });
        }
      }

      setToast({ message: 'Tạo meeting thành công!', variant: 'success' });
      setTimeout(() => navigate('/admin/meetings'), 1500);
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tạo meeting thất bại.'), variant: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSeason = seasons.find((s) => s.id === Number(data.meeting.seasonId));

  if (loadingSeasons) return <Loading />;

  return (
    <div>
      <div className="page-header d-flex align-items-center gap-3">
        <button className="btn-outline-gold-sm" style={{ padding: '5px 12px' }} onClick={() => navigate('/admin/meetings')}>
          ← Quay lại
        </button>
        <h2 style={{ margin: 0 }}>Tạo Meeting mới</h2>
      </div>

      <StepIndicator current={step} />

      <Row className="g-4">
        <Col lg={7}>
          <div className="dash-card h-100">
            {step === 1 && <Step1 data={data.meeting} seasons={seasons} onChange={updateMeeting} />}
            {step === 2 && <Step2 races={data.races} onAdd={addRace} onRemove={removeRace} onChange={updateRace} />}
            {step === 3 && <Step3 condition={data.condition} onChange={updateCondition} />}
            {step === 4 && <Step4 prizes={data.prizes} onChange={updatePrize} />}

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
          <SummaryPanel step={step} data={data} seasonName={selectedSeason?.name ?? ''} />
        </Col>
      </Row>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
