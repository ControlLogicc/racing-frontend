import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Dropdown } from 'react-bootstrap';
import { ArrowLeft, Calendar3, FlagFill, LayersFill, TrophyFill } from 'react-bootstrap-icons';
import { raceConditionService } from '../../services/raceConditionService';
import { getApiErrorMessage } from '../../utils/apiError';
import Toaster from '../../components/common/Toaster';
import './season-wizard.css';

const TRACK_TYPES = ['turf', 'dirt', 'synthetic'];
const CLASS_OPTIONS = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
const EMPTY_FORM = { conditionName: '', distance: '', trackType: 'turf', minEntries: '', maxEntries: '', classRequirement: '' };

export default function CreateRaceConditionPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await raceConditionService.create({
        conditionName: form.conditionName,
        distance: Number(form.distance),
        trackType: form.trackType,
        minEntries: form.minEntries ? Number(form.minEntries) : null,
        maxEntries: form.maxEntries ? Number(form.maxEntries) : null,
        classRequirement: form.classRequirement || null,
      });
      setToast({ message: 'Tạo condition thành công.', variant: 'success' });
      setForm(EMPTY_FORM);
      navigate('/admin/race-conditions');
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tạo condition thất bại.'), variant: 'danger' });
    }
  };

  return (
    <div className="season-admin-page">
      <div className="season-wizard-shell">
        <Form className="season-wizard-grid" noValidate onSubmit={handleCreate}>
          <section className="season-panel season-form-panel">
            <div className="season-panel-heading">
              <h2>Condition Information</h2>
              <p>Define distance, track type, entry limits and class requirement.</p>
            </div>

            <Form.Group className="season-field">
              <Form.Label>Condition Name <span>*</span></Form.Label>
              <Form.Control value={form.conditionName} onChange={(e) => setForm({ ...form, conditionName: e.target.value })} placeholder="1800m Turf Class 1" required />
            </Form.Group>
            <Form.Group className="season-field">
              <Form.Label>Distance (m) <span>*</span></Form.Label>
              <Form.Control type="number" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} required min="100" />
            </Form.Group>
            <Form.Group className="season-field">
              <Form.Label>Track Type</Form.Label>
              <Form.Select value={form.trackType} onChange={(e) => setForm({ ...form, trackType: e.target.value })}>
                {TRACK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
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
                  {form.classRequirement || '-- Chọn class --'}
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
              <div className="season-summary-row"><LayersFill /><span>Name</span><strong>{form.conditionName || '1800m Turf Class 1'}</strong></div>
              <div className="season-summary-row"><FlagFill /><span>Distance</span><strong>{form.distance ? `${form.distance}m` : '-'}</strong></div>
              <div className="season-summary-row"><Calendar3 /><span>Track</span><strong>{form.trackType}</strong></div>
              <div className="season-summary-row"><TrophyFill /><span>Class</span><strong>{form.classRequirement || '-'}</strong></div>
            </div>
          </aside>
        </Form>

        <div className="season-wizard-footer">
          <Button type="button" className="season-btn season-btn-ghost" onClick={() => navigate('/admin/race-conditions')}>
            <ArrowLeft /> Back
          </Button>
          <div className="season-footer-actions">
            <Button type="submit" className="season-btn season-btn-primary" onClick={handleCreate}>
              Tạo Condition
            </Button>
          </div>
        </div>
      </div>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
