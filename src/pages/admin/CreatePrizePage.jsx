import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { ArrowLeft, ArrowRight, Calendar3, CalendarCheck, FlagFill, LayersFill, TrophyFill } from 'react-bootstrap-icons';
import { prizeService } from '../../services/prizeService';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import { getPrizeOrderError } from '../../utils/prizeValidation';
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';
import './season-wizard.css';

const EMPTY_FORM = { raceId: '', position: '', amount: '', score: '' };
const STEPS = [
  { id: 1, label: 'Season', icon: <CalendarCheck /> },
  { id: 2, label: 'Race Meeting', icon: <Calendar3 /> },
  { id: 3, label: 'Races', icon: <FlagFill /> },
  { id: 4, label: 'Prize Structure', icon: <TrophyFill /> },
];

const getRaceName = (race, raceId) => race?.name ?? race?.raceName ?? `Race #${raceId}`;
const formatMoney = (value) => Number(value || 0).toLocaleString('vi-VN');

export default function CreatePrizePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [races, setRaces] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [form, setForm] = useState({ ...EMPTY_FORM, raceId: searchParams.get('raceId') || '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    Promise.all([raceService.getAll(), prizeService.getAll()])
      .then(([r, p]) => { setRaces(r); setPrizes(p); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được dữ liệu tạo giải thưởng.')))
      .finally(() => setLoading(false));
  }, []);

  const selectedRace = useMemo(
    () => races.find((race) => Number(race.id) === Number(form.raceId)),
    [form.raceId, races]
  );

  const duplicatePosition = useMemo(
    () => prizes.some((prize) => Number(prize.raceId) === Number(form.raceId) && Number(prize.position) === Number(form.position)),
    [form.position, form.raceId, prizes]
  );

  const existingTiers = useMemo(() => {
    if (!form.raceId) return [];
    return prizes
      .filter((p) => Number(p.raceId) === Number(form.raceId))
      .sort((a, b) => Number(a.position) - Number(b.position));
  }, [form.raceId, prizes]);

  const orderError = useMemo(() => getPrizeOrderError({
    prizes,
    raceId: form.raceId,
    position: form.position,
    amount: form.amount,
    score: form.score,
  }), [form.amount, form.position, form.raceId, form.score, prizes]);

  const updateForm = (patch) => setForm((current) => ({ ...current, ...patch }));

  const handlePositionChange = (e) => {
    const pos = e.target.value;
    const posNum = Number(pos);
    if (posNum >= 4 && posNum <= 6) {
      updateForm({ position: pos, score: '0' });
    } else {
      updateForm({ position: pos });
    }
  };

  const handleCreate = async (e) => {
    if (e) e.preventDefault();
    if (!form.position) {
      navigate('/admin/prizes');
      return;
    }
    if (duplicatePosition) {
      setToast({ message: 'Race này đã có giải cho hạng đã chọn.', variant: 'warning' });
      return;
    }
    if (orderError) {
      setToast({ message: orderError, variant: 'warning' });
      return;
    }

    try {
      await prizeService.create({
        raceId: Number(form.raceId),
        position: Number(form.position),
        amount: form.amount ? parseFloat(form.amount) : 0,
        score: form.score ? parseFloat(form.score) : 0,
      });
      setToast({ message: 'Tạo giải thưởng thành công.', variant: 'success' });
      setForm(EMPTY_FORM);
      navigate('/admin/prizes');
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tạo giải thưởng thất bại.'), variant: 'danger' });
    }
  };

  const handleSaveAndNext = async (e) => {
    if (e) e.preventDefault();
    if (!form.raceId || !form.position) {
      setToast({ message: 'Vui lòng chọn Race và nhập Position.', variant: 'warning' });
      return;
    }
    if (duplicatePosition) {
      setToast({ message: 'Race này đã có giải cho hạng đã chọn.', variant: 'warning' });
      return;
    }
    if (orderError) {
      setToast({ message: orderError, variant: 'warning' });
      return;
    }

    try {
      const created = await prizeService.create({
        raceId: Number(form.raceId),
        position: Number(form.position),
        amount: form.amount ? parseFloat(form.amount) : 0,
        score: form.score ? parseFloat(form.score) : 0,
      });
      setPrizes((current) => [...current, created]);
      setToast({ message: `Đã lưu Hạng ${form.position} thành công!`, variant: 'success' });
      const nextPos = Number(form.position) + 1;
      setForm((current) => ({
        ...current,
        position: nextPos,
        amount: '',
        score: (nextPos >= 4 && nextPos <= 6) ? '0' : '',
      }));
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tạo giải thưởng thất bại.'), variant: 'danger' });
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="season-admin-page">
      <div className="season-wizard-shell">
        <div className="season-stepper" aria-label="Prize setup steps">
          {STEPS.map((step, index) => (
            <div className={`season-step ${step.id === 4 ? 'active' : ''}`} key={step.id}>
              <div className="season-step-node"><span className="season-step-number">{step.id}</span><span className="season-step-icon">{step.icon}</span></div>
              <span className="season-step-label">{step.label}</span>
              {index < STEPS.length - 1 && <span className="season-step-line" />}
            </div>
          ))}
        </div>

        <Form className="season-wizard-grid" noValidate onSubmit={handleCreate}>
          <section className="season-panel season-form-panel">
            <div className="season-panel-heading">
              <h2>Prize Structure</h2>
              <p>Create a payout tier for a race.</p>
            </div>

            <Form.Group className="season-field">
              <Form.Label>Race <span>*</span></Form.Label>
              <Form.Select value={form.raceId} onChange={(e) => updateForm({ raceId: e.target.value })} required>
                <option value="">-- Chọn race --</option>
                {races.map((race) => <option key={race.id} value={race.id}>{getRaceName(race, race.id)}</option>)}
              </Form.Select>
            </Form.Group>

            <div className="season-form-duo">
              <Form.Group className="season-field">
                <Form.Label>Position <span>*</span></Form.Label>
                <Form.Control type="number" value={form.position} onChange={handlePositionChange} required min="1" />
                {duplicatePosition && <Form.Text style={{ color: '#ffc400' }}>Race này đã có hạng này.</Form.Text>}
              </Form.Group>
              <Form.Group className="season-field">
                <Form.Label>Score</Form.Label>
                <Form.Control type="number" value={form.score} onChange={(e) => updateForm({ score: e.target.value })} step="0.5" />
              </Form.Group>
            </div>

            <Form.Group className="season-field">
              <Form.Label>Prize Amount</Form.Label>
              <Form.Control type="number" value={form.amount} onChange={(e) => updateForm({ amount: e.target.value })} min="0" step="1000" placeholder="50000000" />
              {orderError && <Form.Text style={{ color: '#ffc400' }}>{orderError}</Form.Text>}
            </Form.Group>

          </section>

          <aside className="season-panel season-summary-panel">
            <TrophyFill className="season-summary-icon" />
            <h3>Prize Summary</h3>
            <div className="season-summary-list">
              <div className="season-summary-row"><FlagFill /><span>Race</span><strong>{selectedRace ? getRaceName(selectedRace, selectedRace.id) : '-'}</strong></div>
              <div className="season-summary-row"><TrophyFill /><span>Position</span><strong>{form.position || '-'}</strong></div>
              <div className="season-summary-row"><Calendar3 /><span>Amount</span><strong>{form.amount ? `${formatMoney(form.amount)} VND` : '-'}</strong></div>
              <div className="season-summary-row"><LayersFill /><span>Score</span><strong>{form.score || '0'}</strong></div>
            </div>

            {existingTiers.length > 0 && (
              <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#fbbf24', marginBottom: '10px' }}>Tiers Created:</h4>
                <div style={{ maxHeight: '180px', overflowY: 'auto', fontSize: '0.82rem' }}>
                  {existingTiers.map((p) => (
                    <div key={p.id || p.prizeId} className="d-flex justify-content-between mb-1" style={{ opacity: 0.85, borderBottom: '1px dashed rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                      <span>Hạng #{p.position} ({p.score || 0}đ)</span>
                      <strong>{formatMoney(p.amount)} ₫</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </Form>

        <div className="season-wizard-footer">
          <Button type="button" className="season-btn season-btn-ghost" onClick={() => navigate('/admin/prizes')}>
            <ArrowLeft /> Back
          </Button>
          <div className="season-footer-actions">
            <Button type="button" className="season-btn season-btn-ghost me-2" style={{ marginRight: '10px' }} onClick={handleSaveAndNext}>
              Save & Add Next
            </Button>
            <Button type="button" className="season-btn season-btn-primary" onClick={handleCreate}>
              Finish <ArrowRight />
            </Button>
          </div>
        </div>
      </div>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
