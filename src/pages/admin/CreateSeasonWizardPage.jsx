import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { seasonService } from '../../services/seasonService';
import { meetingService } from '../../services/meetingService';
import { raceService } from '../../services/raceService';
import { raceConditionService } from '../../services/raceConditionService';
import { prizeService } from '../../services/prizeService';
import { getApiErrorMessage } from '../../utils/apiError';
import Toaster from '../../components/common/Toaster';

// ─── Step config ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Season' },
  { id: 2, label: 'Race Meeting' },
  { id: 3, label: 'Races' },
  { id: 4, label: 'Conditions' },
  { id: 5, label: 'Prize Structure' },
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
            <div className="d-flex flex-column align-items-center" style={{ minWidth: 60 }}>
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
                height: 2, flex: 1, background: done ? '#D4AF37' : '#333',
                marginBottom: 20,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Summary Panel ────────────────────────────────────────────────────────────
function SummaryItem({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="d-flex justify-content-between align-items-start gap-2 py-2" style={{ borderBottom: '1px solid #2a2a3e' }}>
      <div className="d-flex align-items-center gap-2" style={{ color: '#888', fontSize: 13 }}>
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <span style={{ color: '#e0d6b0', fontSize: 13, textAlign: 'right', maxWidth: 180 }}>{value}</span>
    </div>
  );
}

function SummaryPanel({ step, data }) {
  return (
    <div className="dash-card h-100">
      <div className="text-center mb-4">
        <div style={{ fontSize: 36, marginBottom: 8 }}>📅</div>
        <div style={{ color: '#D4AF37', fontWeight: 700, fontSize: 16 }}>Season Summary</div>
      </div>

      {/* Season */}
      {(data.season.name || data.season.startDate || data.season.endDate) && (
        <div className="mb-3">
          <div style={{ color: '#D4AF37', fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Season</div>
          <SummaryItem icon="📋" label="Season Name" value={data.season.name} />
          <SummaryItem icon="📅" label="Start Date" value={data.season.startDate} />
          <SummaryItem icon="📅" label="End Date" value={data.season.endDate} />
        </div>
      )}

      {/* Meeting */}
      {step >= 2 && (data.meeting.name || data.meeting.racecourse) && (
        <div className="mb-3">
          <div style={{ color: '#D4AF37', fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Meeting</div>
          <SummaryItem icon="🏟️" label="Tên meeting" value={data.meeting.name} />
          <SummaryItem icon="📍" label="Địa điểm" value={data.meeting.racecourse} />
          <SummaryItem icon="🕐" label="Ngày" value={data.meeting.date} />
        </div>
      )}

      {/* Races */}
      {step >= 3 && data.races.length > 0 && (
        <div className="mb-3">
          <div style={{ color: '#D4AF37', fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
            Races ({data.races.length})
          </div>
          {data.races.map((r, i) => (
            <SummaryItem key={i} icon="🏁" label={`Race ${i + 1}`} value={`${r.name} — ${r.distance}m`} />
          ))}
        </div>
      )}

      {/* Condition */}
      {step >= 4 && data.condition.conditionName && (
        <div className="mb-3">
          <div style={{ color: '#D4AF37', fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Condition</div>
          <SummaryItem icon="📐" label="Tên" value={data.condition.conditionName} />
          <SummaryItem icon="🛤️" label="Track" value={data.condition.trackType} />
          <SummaryItem icon="👥" label="Entries" value={`${data.condition.minEntries ?? '?'} – ${data.condition.maxEntries ?? '?'}`} />
        </div>
      )}

      {/* Prizes */}
      {step >= 5 && data.prizes.length > 0 && (
        <div>
          <div style={{ color: '#D4AF37', fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
            Prize Structure
          </div>
          {data.prizes.map((p, i) => (
            <SummaryItem
              key={i}
              icon={['🥇', '🥈', '🥉'][i] ?? '🏅'}
              label={`Hạng ${p.position}`}
              value={p.prizeAmount ? Number(p.prizeAmount).toLocaleString('vi-VN') + 'đ' : ''}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Step forms ───────────────────────────────────────────────────────────────
const FIELD = (label, color = '#D4AF37') => (
  <Form.Label style={{ color, fontSize: 13 }}>{label} <span style={{ color: '#e05555' }}>*</span></Form.Label>
);

function Step1({ data, onChange }) {
  return (
    <div>
      <h5 style={{ color: '#D4AF37', marginBottom: 4 }}>Season Information</h5>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Create a new season to organize race meetings and races.</p>
      <div className="d-flex flex-column gap-3">
        <Form.Group>
          {FIELD('Season Name')}
          <Form.Control
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Eg. 2025/2026 Racing Season"
            required
          />
        </Form.Group>
        <Form.Group>
          {FIELD('Start Date')}
          <Form.Control type="date" value={data.startDate} onChange={(e) => onChange('startDate', e.target.value)} required />
        </Form.Group>
        <Form.Group>
          {FIELD('End Date')}
          <Form.Control type="date" value={data.endDate} onChange={(e) => onChange('endDate', e.target.value)} required />
        </Form.Group>
      </div>
    </div>
  );
}

function Step2({ data, onChange }) {
  return (
    <div>
      <h5 style={{ color: '#D4AF37', marginBottom: 4 }}>Race Meeting</h5>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Add a race meeting within this season.</p>
      <div className="d-flex flex-column gap-3">
        <Form.Group>
          {FIELD('Tên meeting')}
          <Form.Control value={data.name} onChange={(e) => onChange('name', e.target.value)} placeholder="Eg. Saigon Cup" required />
        </Form.Group>
        <Form.Group>
          {FIELD('Địa điểm')}
          <Form.Control value={data.racecourse} onChange={(e) => onChange('racecourse', e.target.value)} placeholder="Eg. Saigon Racecourse" required />
        </Form.Group>
        <Form.Group>
          {FIELD('Ngày tổ chức')}
          <Form.Control type="date" value={data.date} onChange={(e) => onChange('date', e.target.value)} required />
        </Form.Group>
      </div>
    </div>
  );
}

function Step3({ races, onAdd, onRemove, onChange }) {
  return (
    <div>
      <h5 style={{ color: '#D4AF37', marginBottom: 4 }}>Races</h5>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Thêm các race trong meeting này.</p>
      <div className="d-flex flex-column gap-3">
        {races.map((r, i) => (
          <div key={i} className="p-3" style={{ background: '#0d0d1a', borderRadius: 8, border: '1px solid #2a2a3e' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span style={{ color: '#D4AF37', fontWeight: 600, fontSize: 13 }}>Race {i + 1}</span>
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
                  <Form.Control
                    size="sm"
                    value={r.name}
                    onChange={(e) => onChange(i, 'name', e.target.value)}
                    placeholder="Race #1"
                  />
                </Form.Group>
              </Col>
              <Col sm={3}>
                <Form.Group>
                  <Form.Label style={{ color: '#aaa', fontSize: 12 }}>Cự ly (m)</Form.Label>
                  <Form.Control
                    size="sm"
                    type="number"
                    value={r.distance}
                    onChange={(e) => onChange(i, 'distance', e.target.value)}
                    placeholder="1200"
                  />
                </Form.Group>
              </Col>
              <Col sm={3}>
                <Form.Group>
                  <Form.Label style={{ color: '#aaa', fontSize: 12 }}>Giờ đua</Form.Label>
                  <Form.Control
                    size="sm"
                    type="time"
                    value={r.raceTime}
                    onChange={(e) => onChange(i, 'raceTime', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        ))}
        <button
          type="button"
          onClick={onAdd}
          className="btn-outline-gold-sm"
          style={{ padding: '8px 0', width: '100%' }}
        >
          + Thêm race
        </button>
      </div>
    </div>
  );
}

const TRACK_TYPES = ['Turf', 'Dirt', 'Synthetic'];
const CLASS_OPTIONS = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];

function Step4({ data, onChange }) {
  return (
    <div>
      <h5 style={{ color: '#D4AF37', marginBottom: 4 }}>Race Condition</h5>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Thiết lập điều kiện chung cho các race trong meeting.</p>
      <div className="d-flex flex-column gap-3">
        <Form.Group>
          {FIELD('Tên condition')}
          <Form.Control value={data.conditionName} onChange={(e) => onChange('conditionName', e.target.value)} placeholder="Eg. Open Class" required />
        </Form.Group>
        <Row className="g-3">
          <Col sm={12}>
            <Form.Group>
              {FIELD('Loại track')}
              <Form.Select value={data.trackType} onChange={(e) => onChange('trackType', e.target.value)}>
                <option value="">-- Chọn --</option>
                {TRACK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col sm={4}>
            <Form.Group>
              {FIELD('Min entries')}
              <Form.Control type="number" value={data.minEntries} onChange={(e) => onChange('minEntries', e.target.value)} placeholder="4" />
            </Form.Group>
          </Col>
          <Col sm={4}>
            <Form.Group>
              {FIELD('Max entries')}
              <Form.Control type="number" value={data.maxEntries} onChange={(e) => onChange('maxEntries', e.target.value)} placeholder="12" />
            </Form.Group>
          </Col>
          <Col sm={4}>
            <Form.Group>
              {FIELD('Class')}
              <Form.Select value={data.classRequirement} onChange={(e) => onChange('classRequirement', e.target.value)}>
                <option value="">-- Chọn --</option>
                {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </div>
    </div>
  );
}

function Step5({ prizes, onChange }) {
  return (
    <div>
      <h5 style={{ color: '#D4AF37', marginBottom: 4 }}>Prize Structure</h5>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Thiết lập giải thưởng cho từng vị trí.</p>
      <div className="d-flex flex-column gap-2">
        {prizes.map((p, i) => (
          <div key={i} className="d-flex align-items-center gap-3">
            <div style={{ width: 36, textAlign: 'center', fontSize: 20 }}>
              {['🥇', '🥈', '🥉'][i] ?? '🏅'}
            </div>
            <div style={{ color: '#888', fontSize: 13, width: 60 }}>Hạng {p.position}</div>
            <Form.Control
              type="number"
              value={p.prizeAmount}
              onChange={(e) => onChange(i, e.target.value)}
              placeholder="Giải thưởng (VNĐ)"
              style={{ flex: 1 }}
            />
            <div style={{ color: '#888', fontSize: 12, width: 30 }}>đ</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validateStep(step, data) {
  if (step === 1) {
    if (!data.season.name) return 'Vui lòng nhập tên season.';
    if (!data.season.startDate) return 'Vui lòng chọn ngày bắt đầu.';
    if (!data.season.endDate) return 'Vui lòng chọn ngày kết thúc.';
    if (data.season.startDate >= data.season.endDate) return 'Ngày kết thúc phải sau ngày bắt đầu.';
  }
  if (step === 2) {
    if (!data.meeting.name) return 'Vui lòng nhập tên meeting.';
    if (!data.meeting.racecourse) return 'Vui lòng nhập địa điểm.';
    if (!data.meeting.date) return 'Vui lòng chọn ngày tổ chức.';
  }
  if (step === 3) {
    if (data.races.some((r) => !r.name)) return 'Vui lòng nhập tên cho tất cả race.';
  }
  return null;
}

// ─── Initial state ────────────────────────────────────────────────────────────
const EMPTY_DATA = {
  season: { name: '', startDate: '', endDate: '' },
  meeting: { name: '', racecourse: '', date: '' },
  races: [{ name: '', distance: '', raceTime: '' }],
  condition: { conditionName: '', distance: '', trackType: '', minEntries: '', maxEntries: '', classRequirement: '' },
  prizes: [
    { position: 1, prizeAmount: '' },
    { position: 2, prizeAmount: '' },
    { position: 3, prizeAmount: '' },
    { position: 4, prizeAmount: '' },
    { position: 5, prizeAmount: '' },
  ],
};

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CreateSeasonWizardPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState(EMPTY_DATA);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [stepError, setStepError] = useState('');

  const updateSeason = (field, value) => setData((d) => ({ ...d, season: { ...d.season, [field]: value } }));
  const updateMeeting = (field, value) => setData((d) => ({ ...d, meeting: { ...d.meeting, [field]: value } }));
  const updateCondition = (field, value) => setData((d) => ({ ...d, condition: { ...d.condition, [field]: value } }));

  const addRace = () => setData((d) => ({ ...d, races: [...d.races, { name: '', distance: '', raceTime: '' }] }));
  const removeRace = (i) => setData((d) => ({ ...d, races: d.races.filter((_, idx) => idx !== i) }));
  const updateRace = (i, field, value) => setData((d) => ({
    ...d,
    races: d.races.map((r, idx) => idx === i ? { ...r, [field]: value } : r),
  }));
  const updatePrize = (i, value) => setData((d) => ({
    ...d,
    prizes: d.prizes.map((p, idx) => idx === i ? { ...p, prizeAmount: value } : p),
  }));

  const next = () => {
    const err = validateStep(step, data);
    if (err) { setStepError(err); return; }
    setStepError('');
    setStep((s) => Math.min(s + 1, 5));
  };

  const prev = () => { setStepError(''); setStep((s) => Math.max(s - 1, 1)); };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const season = await seasonService.create({
        name: data.season.name,
        startDate: data.season.startDate,
        endDate: data.season.endDate,
      });
      const meeting = await meetingService.create({
        seasonId: season.id,
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
      setToast({ message: 'Tạo season thành công!', variant: 'success' });
      setTimeout(() => navigate('/admin/seasons'), 1500);
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tạo season thất bại.'), variant: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header d-flex align-items-center gap-3">
        <button
          className="btn-outline-gold-sm"
          style={{ padding: '5px 12px' }}
          onClick={() => navigate('/admin/seasons')}
        >
          ← Quay lại
        </button>
        <h2 style={{ margin: 0 }}>Tạo Season mới</h2>
      </div>

      <StepIndicator current={step} />

      <Row className="g-4">
        {/* Left: form */}
        <Col lg={7}>
          <div className="dash-card h-100">
            {step === 1 && <Step1 data={data.season} onChange={updateSeason} />}
            {step === 2 && <Step2 data={data.meeting} onChange={updateMeeting} />}
            {step === 3 && (
              <Step3
                races={data.races}
                onAdd={addRace}
                onRemove={removeRace}
                onChange={updateRace}
              />
            )}
            {step === 4 && <Step4 data={data.condition} onChange={updateCondition} />}
            {step === 5 && <Step5 prizes={data.prizes} onChange={updatePrize} />}

            {stepError && (
              <div className="mt-3" style={{ color: '#e05555', fontSize: 13 }}>⚠️ {stepError}</div>
            )}

            <div className="d-flex justify-content-between mt-4">
              <Button
                variant="outline-secondary"
                onClick={prev}
                disabled={step === 1}
              >
                ← Quay lại
              </Button>
              {step < 5 ? (
                <Button className="btn-gold-sm" style={{ padding: '8px 28px' }} onClick={next}>
                  Tiếp theo →
                </Button>
              ) : (
                <Button
                  className="btn-gold-sm"
                  style={{ padding: '8px 28px' }}
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Đang tạo...' : '✓ Hoàn thành'}
                </Button>
              )}
            </div>
          </div>
        </Col>

        {/* Right: summary */}
        <Col lg={5}>
          <SummaryPanel step={step} data={data} />
        </Col>
      </Row>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
