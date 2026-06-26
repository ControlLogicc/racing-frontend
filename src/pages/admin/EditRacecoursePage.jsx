import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { ArrowLeft, MapFill } from 'react-bootstrap-icons';
import { racecourseService } from '../../services/racecourseService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';
import './season-wizard.css';

const SURFACE_TYPES = ['turf', 'dirt', 'synthetic', 'all-weather'];
const EMPTY_FORM = { name: '', location: '', surfaceType: 'turf', capacity: '' };

export default function EditRacecoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    racecourseService.getById(id)
      .then((row) => setForm({
        name: row.racecourseName ?? row.name ?? '',
        location: row.location ?? '',
        surfaceType: row.surfaceType ?? 'turf',
        capacity: String(row.capacity ?? ''),
      }))
      .catch((err) => setError(getApiErrorMessage(err, 'Khong tai duoc duong dua.')))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await racecourseService.update(id, form);
      setToast({ message: 'Cap nhat duong dua thanh cong.', variant: 'success' });
      navigate('/admin/racecourses');
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cap nhat duong dua that bai.'), variant: 'danger' });
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
              <h2>Edit Racecourse</h2>
              <p>Update racecourse profile.</p>
            </div>
            <Form.Group className="season-field">
              <Form.Label>Racecourse Name <span>*</span></Form.Label>
              <Form.Control value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Form.Group>
            <Form.Group className="season-field">
              <Form.Label>Location</Form.Label>
              <Form.Control value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </Form.Group>
            <Form.Group className="season-field">
              <Form.Label>Surface Type</Form.Label>
              <Form.Select value={form.surfaceType} onChange={(e) => setForm({ ...form, surfaceType: e.target.value })}>
                {SURFACE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="season-field">
              <Form.Label>Capacity</Form.Label>
              <Form.Control type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} min="0" />
            </Form.Group>
          </section>
          <aside className="season-panel season-summary-panel">
            <MapFill className="season-summary-icon" />
            <h3>Racecourse Summary</h3>
            <div className="season-summary-list">
              <div className="season-summary-row"><MapFill /><span>Name</span><strong>{form.name || '-'}</strong></div>
              <div className="season-summary-row"><MapFill /><span>Surface</span><strong>{form.surfaceType}</strong></div>
              <div className="season-summary-row"><MapFill /><span>Capacity</span><strong>{form.capacity || '-'}</strong></div>
            </div>
          </aside>
        </Form>
        <div className="season-wizard-footer">
          <Button type="button" className="season-btn season-btn-ghost" onClick={() => navigate('/admin/racecourses')}><ArrowLeft /> Back</Button>
          <Button type="button" className="season-btn season-btn-primary" onClick={handleUpdate}>Luu thay doi</Button>
        </div>
      </div>
      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
