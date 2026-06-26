import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { ArrowLeft, GeoAltFill, MapFill, PeopleFill, SignpostSplitFill } from 'react-bootstrap-icons';
import { racecourseService } from '../../services/racecourseService';
import { getApiErrorMessage } from '../../utils/apiError';
import Toaster from '../../components/common/Toaster';
import './season-wizard.css';

const SURFACE_TYPES = ['turf', 'dirt', 'synthetic', 'all-weather'];
const EMPTY_FORM = { name: '', location: '', surfaceType: 'turf', capacity: '' };

export default function CreateRacecoursePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await racecourseService.create(form);
      setToast({ message: 'Tạo đường đua thành công.', variant: 'success' });
      setForm(EMPTY_FORM);
      navigate('/admin/racecourses');
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tạo đường đua thất bại.'), variant: 'danger' });
    }
  };

  return (
    <div className="season-admin-page">
      <div className="season-wizard-shell">
        <Form className="season-wizard-grid" noValidate onSubmit={handleCreate}>
          <section className="season-panel season-form-panel">
            <div className="season-panel-heading">
              <h2>Racecourse Information</h2>
              <p>Create a racecourse before assigning it to race meetings.</p>
            </div>

            <Form.Group className="season-field">
              <Form.Label>Racecourse Name <span>*</span></Form.Label>
              <Form.Control
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Saigon Racing Track"
                required
              />
            </Form.Group>

            <Form.Group className="season-field">
              <Form.Label>Location</Form.Label>
              <Form.Control
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Ho Chi Minh City"
              />
            </Form.Group>

            <Form.Group className="season-field">
              <Form.Label>Surface Type</Form.Label>
              <Form.Select value={form.surfaceType} onChange={(e) => setForm({ ...form, surfaceType: e.target.value })}>
                {SURFACE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </Form.Select>
            </Form.Group>

            <Form.Group className="season-field">
              <Form.Label>Capacity</Form.Label>
              <Form.Control
                type="number"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                min="0"
                placeholder="10000"
              />
            </Form.Group>
          </section>

          <aside className="season-panel season-summary-panel">
            <MapFill className="season-summary-icon" />
            <h3>Racecourse Summary</h3>
            <div className="season-summary-list">
              <div className="season-summary-row"><SignpostSplitFill /><span>Name</span><strong>{form.name || 'Saigon Racing Track'}</strong></div>
              <div className="season-summary-row"><GeoAltFill /><span>Location</span><strong>{form.location || '-'}</strong></div>
              <div className="season-summary-row"><MapFill /><span>Surface</span><strong>{form.surfaceType}</strong></div>
              <div className="season-summary-row"><PeopleFill /><span>Capacity</span><strong>{form.capacity || '-'}</strong></div>
            </div>
          </aside>
        </Form>

        <div className="season-wizard-footer">
          <Button type="button" className="season-btn season-btn-ghost" onClick={() => navigate('/admin/racecourses')}>
            <ArrowLeft /> Back
          </Button>
          <div className="season-footer-actions">
            <Button type="button" className="season-btn season-btn-primary" onClick={handleCreate}>
              Tạo Đường Đua
            </Button>
          </div>
        </div>
      </div>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
