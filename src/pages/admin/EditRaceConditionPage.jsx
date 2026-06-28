import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Dropdown } from 'react-bootstrap';
import { ArrowLeft, LayersFill } from 'react-bootstrap-icons';
import { raceConditionService } from '../../services/raceConditionService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';
import './season-wizard.css';

const TRACK_TYPES = ['turf', 'dirt', 'synthetic'];
const CLASS_OPTIONS = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
const EMPTY_FORM = { conditionName: '', distance: '', trackType: 'turf', minEntries: '', maxEntries: '', classRequirement: '' };

export default function EditRaceConditionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    raceConditionService.getAll()
      .then((rows) => {
        const row = rows.find((item) => String(item.id) === String(id) || String(item.conditionId) === String(id));
        if (!row) throw new Error('Condition not found.');
        setForm({
          conditionName: row.conditionName ?? '',
          distance: String(row.distance ?? ''),
          trackType: row.trackType ?? 'turf',
          minEntries: String(row.minEntries ?? ''),
          maxEntries: String(row.maxEntries ?? ''),
          classRequirement: row.classRequirement ?? '',
        });
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Khong tai duoc condition.')))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!form.conditionName.trim() || !form.distance) {
      setToast({ message: 'Vui long nhap ten condition va cu ly.', variant: 'warning' });
      return;
    }
    try {
      await raceConditionService.update(id, {
        conditionName: form.conditionName.trim(),
        distance: Number(form.distance),
        trackType: form.trackType,
        minEntries: form.minEntries ? Number(form.minEntries) : null,
        maxEntries: form.maxEntries ? Number(form.maxEntries) : null,
        classRequirement: form.classRequirement || null,
      });
      setToast({ message: 'Cap nhat condition thanh cong.', variant: 'success' });
      navigate('/admin/race-conditions');
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cap nhat condition that bai.'), variant: 'danger' });
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
              <h2>Edit Condition</h2>
              <p>Update distance, track type, entry limits and class requirement.</p>
            </div>
            <Form.Group className="season-field">
              <Form.Label>Condition Name <span>*</span></Form.Label>
              <Form.Control value={form.conditionName} onChange={(e) => setForm({ ...form, conditionName: e.target.value })} required />
            </Form.Group>
            <Form.Group className="season-field">
              <Form.Label>Distance (m) <span>*</span></Form.Label>
              <Form.Control type="number" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} required min="100" />
            </Form.Group>
            <Form.Group className="season-field">
              <Form.Label>Track Type</Form.Label>
              <Form.Select value={form.trackType} onChange={(e) => setForm({ ...form, trackType: e.target.value })}>
                {TRACK_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </Form.Select>
            </Form.Group>
            <div className="season-form-duo">
              <Form.Group className="season-field">
                <Form.Label>Min Entries</Form.Label>
                <Form.Control type="number" value={form.minEntries} onChange={(e) => setForm({ ...form, minEntries: e.target.value })} min="8" max="14" />
              </Form.Group>
              <Form.Group className="season-field">
                <Form.Label>Max Entries</Form.Label>
                <Form.Control type="number" value={form.maxEntries} onChange={(e) => setForm({ ...form, maxEntries: e.target.value })} min="8" max="14" />
              </Form.Group>
            </div>
            <Form.Group className="season-field">
              <Form.Label>Class Requirement</Form.Label>
              <Dropdown className="condition-class-dropdown" drop="down">
                <Dropdown.Toggle type="button" className="condition-class-toggle">
                  {form.classRequirement || '-- Chon class --'}
                </Dropdown.Toggle>
                <Dropdown.Menu className="condition-class-menu" popperConfig={{ modifiers: [{ name: 'flip', enabled: false }] }}>
                  {CLASS_OPTIONS.map((option) => (
                    <Dropdown.Item key={option} active={form.classRequirement === option} onClick={() => setForm({ ...form, classRequirement: option })}>
                      {option}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Form.Group>
          </section>
          <aside className="season-panel season-summary-panel">
            <LayersFill className="season-summary-icon" />
            <h3>Condition Summary</h3>
            <div className="season-summary-list">
              <div className="season-summary-row"><LayersFill /><span>Name</span><strong>{form.conditionName || '-'}</strong></div>
              <div className="season-summary-row"><LayersFill /><span>Distance</span><strong>{form.distance ? `${form.distance}m` : '-'}</strong></div>
              <div className="season-summary-row"><LayersFill /><span>Class</span><strong>{form.classRequirement || '-'}</strong></div>
            </div>
          </aside>
        </Form>
        <div className="season-wizard-footer">
          <Button type="button" className="season-btn season-btn-ghost" onClick={() => navigate('/admin/race-conditions')}><ArrowLeft /> Back</Button>
          <Button type="button" className="season-btn season-btn-primary" onClick={handleUpdate}>Luu thay doi</Button>
        </div>
      </div>
      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
