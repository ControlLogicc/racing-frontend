import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { ArrowLeft, TrophyFill } from 'react-bootstrap-icons';
import { prizeService } from '../../services/prizeService';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import { getPrizeOrderError } from '../../utils/prizeValidation';
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';
import './season-wizard.css';

const EMPTY_FORM = { raceId: '', position: '', amount: '', score: '' };
const normalizePrize = (prize) => ({
  ...prize,
  id: prize.id ?? prize.prizeId,
  raceId: Number(prize.raceId),
  position: Number(prize.position),
  amount: Number(prize.amount ?? prize.prizeAmount ?? 0),
  score: Number(prize.score ?? prize.scoreAwarded ?? 0),
});
const getRaceName = (race, raceId) => race?.name ?? race?.raceName ?? `Race #${raceId}`;

export default function EditPrizePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [races, setRaces] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const normalizedPrizes = useMemo(() => prizes.map(normalizePrize), [prizes]);
  const selectedRace = races.find((race) => Number(race.id) === Number(form.raceId));
  const duplicatePosition = normalizedPrizes.some((prize) => (
    String(prize.id) !== String(id)
    && Number(prize.raceId) === Number(form.raceId)
    && Number(prize.position) === Number(form.position)
  ));
  const orderError = getPrizeOrderError({
    prizes: normalizedPrizes,
    raceId: form.raceId,
    position: form.position,
    amount: form.amount,
    score: form.score,
    ignoredPrizeId: id,
  });

  useEffect(() => {
    Promise.all([prizeService.getAll(), raceService.getAll()])
      .then(([prizeRows, raceRows]) => {
        const normalizedRows = prizeRows.map(normalizePrize);
        const row = normalizedRows.find((item) => String(item.id) === String(id));
        if (!row) throw new Error('Prize not found.');
        setPrizes(prizeRows);
        setRaces(raceRows);
        setForm({
          raceId: String(row.raceId ?? ''),
          position: String(row.position ?? ''),
          amount: String(row.amount ?? ''),
          score: String(row.score ?? 0),
        });
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Khong tai duoc giai thuong.')))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePositionChange = (e) => {
    const pos = e.target.value;
    const posNum = Number(pos);
    if (posNum >= 4 && posNum <= 6) {
      setForm({ ...form, position: pos, score: '0' });
    } else {
      setForm({ ...form, position: pos });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!form.raceId || !form.position) {
      setToast({ message: 'Vui long nhap race va hang.', variant: 'warning' });
      return;
    }
    if (duplicatePosition) {
      setToast({ message: 'Race nay da co giai cho hang da chon.', variant: 'warning' });
      return;
    }
    if (orderError) {
      setToast({ message: orderError, variant: 'warning' });
      return;
    }
    try {
      await prizeService.update(id, {
        raceId: Number(form.raceId),
        position: Number(form.position),
        amount: form.amount ? parseFloat(form.amount) : 0,
        score: parseFloat(form.score) || 0,
      });
      setToast({ message: 'Cap nhat giai thuong thanh cong.', variant: 'success' });
      navigate('/admin/prizes');
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cap nhat giai thuong that bai.'), variant: 'danger' });
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="season-admin-page">
      <div className="season-wizard-shell">
        <Form className="season-wizard-grid" noValidate onSubmit={handleUpdate}>
          <section className="season-panel season-form-panel">
            <div className="season-panel-heading">
              <h2>Edit Prize Structure</h2>
              <p>Update payout tier for a race.</p>
            </div>
            <Form.Group className="season-field">
              <Form.Label>Race <span>*</span></Form.Label>
              <Form.Select value={form.raceId} onChange={(e) => setForm({ ...form, raceId: e.target.value })} required>
                <option value="">-- Chon race --</option>
                {races.map((race) => <option key={race.id} value={race.id}>{getRaceName(race, race.id)}</option>)}
              </Form.Select>
            </Form.Group>
            <div className="season-form-duo">
              <Form.Group className="season-field">
                <Form.Label>Position <span>*</span></Form.Label>
                <Form.Control type="number" value={form.position} onChange={handlePositionChange} required min="1" />
                {duplicatePosition && <Form.Text style={{ color: '#ffc400' }}>Race nay da co hang nay.</Form.Text>}
              </Form.Group>
              <Form.Group className="season-field">
                <Form.Label>Score</Form.Label>
                <Form.Control type="number" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} step="0.5" />
              </Form.Group>
            </div>
            <Form.Group className="season-field">
              <Form.Label>Prize Amount</Form.Label>
              <Form.Control type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} min="0" step="1000" />
              {orderError && <Form.Text style={{ color: '#ffc400' }}>{orderError}</Form.Text>}
            </Form.Group>
          </section>
          <aside className="season-panel season-summary-panel">
            <TrophyFill className="season-summary-icon" />
            <h3>Prize Summary</h3>
            <div className="season-summary-list">
              <div className="season-summary-row"><TrophyFill /><span>Race</span><strong>{selectedRace ? getRaceName(selectedRace, selectedRace.id) : '-'}</strong></div>
              <div className="season-summary-row"><TrophyFill /><span>Position</span><strong>{form.position || '-'}</strong></div>
              <div className="season-summary-row"><TrophyFill /><span>Amount</span><strong>{form.amount || '-'}</strong></div>
            </div>
          </aside>
        </Form>
        <div className="season-wizard-footer">
          <Button type="button" className="season-btn season-btn-ghost" onClick={() => navigate('/admin/prizes')}><ArrowLeft /> Back</Button>
          <Button type="button" className="season-btn season-btn-primary" onClick={handleUpdate}>Luu thay doi</Button>
        </div>
      </div>
      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
