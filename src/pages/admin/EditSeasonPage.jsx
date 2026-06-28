import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { ArrowLeft, CheckCircleFill } from 'react-bootstrap-icons';
import { seasonService } from '../../services/seasonService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';
import './season-wizard.css';

export default function EditSeasonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  const watchedName = watch('name');
  const watchedStartDate = watch('startDate');
  const watchedEndDate = watch('endDate');

  useEffect(() => {
    const load = async () => {
      try {
        const row = seasonService.getById
          ? await seasonService.getById(id)
          : (await seasonService.getAll()).find((item) => String(item.id) === String(id));
        if (!row) throw new Error('Season not found.');
        reset({
          name: row.name ?? '',
          startDate: row.startDate ? row.startDate.slice(0, 10) : '',
          endDate: row.endDate ? row.endDate.slice(0, 10) : '',
          status: String(row.status ?? 'active').toLowerCase(),
        });
      } catch (err) {
        setError(getApiErrorMessage(err, 'Khong tai duoc season.'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, reset]);

  const onSubmit = async (data) => {
    try {
      await seasonService.update(id, data);
      setToast({ message: 'Cap nhat season thanh cong.', variant: 'success' });
      navigate('/admin/seasons');
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cap nhat season that bai.'), variant: 'danger' });
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="season-admin-page">
      <div className="season-wizard-shell">
        <Form className="season-wizard-grid" noValidate>
          <section className="season-panel season-form-panel">
            <div className="season-panel-heading">
              <h2>Edit Season</h2>
              <p>Update season information.</p>
            </div>

            <Form.Group className="season-field">
              <Form.Label>Season Name <span>*</span></Form.Label>
              <Form.Control {...register('name', { required: 'Ten season la bat buoc' })} isInvalid={!!errors.name} />
              <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="season-field">
              <Form.Label>Start Date <span>*</span></Form.Label>
              <Form.Control type="date" {...register('startDate', { required: 'Ngay bat dau la bat buoc' })} isInvalid={!!errors.startDate} />
              <Form.Control.Feedback type="invalid">{errors.startDate?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="season-field">
              <Form.Label>End Date <span>*</span></Form.Label>
              <Form.Control type="date" {...register('endDate', { required: 'Ngay ket thuc la bat buoc' })} isInvalid={!!errors.endDate} />
              <Form.Control.Feedback type="invalid">{errors.endDate?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="season-field">
              <Form.Label>Status</Form.Label>
              <Form.Select {...register('status')}>
                <option value="active">active</option>
                <option value="draft">draft</option>
                <option value="closed">closed</option>
              </Form.Select>
            </Form.Group>
          </section>

          <aside className="season-panel season-summary-panel">
            <CheckCircleFill className="season-summary-icon" />
            <h3>Season Summary</h3>
            <div className="season-summary-list">
              <div className="season-summary-row"><CheckCircleFill /><span>Name</span><strong>{watchedName || '-'}</strong></div>
              <div className="season-summary-row"><CheckCircleFill /><span>Start</span><strong>{watchedStartDate || '-'}</strong></div>
              <div className="season-summary-row"><CheckCircleFill /><span>End</span><strong>{watchedEndDate || '-'}</strong></div>
            </div>
          </aside>
        </Form>
        <div className="season-wizard-footer">
          <Button type="button" className="season-btn season-btn-ghost" onClick={() => navigate('/admin/seasons')}><ArrowLeft /> Back</Button>
          <Button type="button" className="season-btn season-btn-primary" onClick={handleSubmit(onSubmit)}>Luu thay doi</Button>
        </div>
      </div>
      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
