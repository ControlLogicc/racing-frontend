import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import {
  ArrowLeft,
  ArrowRight,
  Calendar3,
  CalendarCheck,
  FlagFill,
  TrophyFill,
} from 'react-bootstrap-icons';
import { seasonService } from '../../services/seasonService';
import { getApiErrorMessage } from '../../utils/apiError';
import Toaster from '../../components/common/Toaster';
import './season-wizard.css';

const EMPTY_FORM = { name: '', startDate: '', endDate: '' };

const STEPS = [
  { id: 1, label: 'Season', icon: <CalendarCheck /> },
  { id: 2, label: 'Race Meeting', icon: <Calendar3 /> },
  { id: 3, label: 'Races', icon: <FlagFill /> },
  { id: 4, label: 'Prize Structure', icon: <TrophyFill /> },
];

const formatSummaryDate = (value) => {
  if (!value) return '-';
  const [year, month, day] = value.split('-');
  return `${day} / ${month} / ${year}`;
};

export default function CreateSeasonPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({ defaultValues: EMPTY_FORM });

  const watchedName = watch('name');
  const watchedStartDate = watch('startDate');
  const watchedEndDate = watch('endDate');

  const createSeason = async (data, status, goNext = false) => {
    try {
      await seasonService.create({ ...data, status });
      setToast({ message: status === 'draft' ? 'Đã lưu season nháp.' : 'Tạo season thành công.', variant: 'success' });
      reset(EMPTY_FORM);
      if (goNext) {
        navigate('/admin/meetings/create');
      } else {
        navigate('/admin/seasons');
      }
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tạo season thất bại.'), variant: 'danger' });
    }
  };

  const onCreateNext = (data) => createSeason(data, 'active', true);

  return (
    <div className="season-admin-page">
      <div className="season-wizard-shell">
        <div className="season-stepper" aria-label="Season setup steps">
          {STEPS.map((step, index) => (
            <div className={`season-step ${step.id === 1 ? 'active' : ''}`} key={step.id}>
              <div className="season-step-node">
                <span className="season-step-number">{step.id}</span>
                <span className="season-step-icon">{step.icon}</span>
              </div>
              <span className="season-step-label">{step.label}</span>
              {index < STEPS.length - 1 && <span className="season-step-line" />}
            </div>
          ))}
        </div>

        <Form className="season-wizard-grid" noValidate>
          <section className="season-panel season-form-panel">
            <div className="season-panel-heading">
              <h2>Season Information</h2>
              <p>Create a new season to organize race meetings and races.</p>
            </div>

            <Form.Group className="season-field">
              <Form.Label>Season Name <span>*</span></Form.Label>
              <Form.Control
                placeholder="2025/2026 Racing Season"
                {...register('name', { required: 'Tên mùa giải là bắt buộc' })}
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="season-field">
              <Form.Label>Start Date <span>*</span></Form.Label>
              <Form.Control
                type="date"
                {...register('startDate', { required: 'Ngày bắt đầu là bắt buộc' })}
                isInvalid={!!errors.startDate}
              />
              <Form.Control.Feedback type="invalid">{errors.startDate?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="season-field">
              <Form.Label>End Date <span>*</span></Form.Label>
              <Form.Control
                type="date"
                {...register('endDate', {
                  required: 'Ngày kết thúc là bắt buộc',
                  validate: (value) => (
                    !watchedStartDate || !value || value >= watchedStartDate || 'Ngày kết thúc phải sau ngày bắt đầu'
                  ),
                })}
                isInvalid={!!errors.endDate}
              />
              <Form.Control.Feedback type="invalid">{errors.endDate?.message}</Form.Control.Feedback>
            </Form.Group>
          </section>

          <aside className="season-panel season-summary-panel">
            <CalendarCheck className="season-summary-icon" />
            <h3>Season Summary</h3>
            <div className="season-summary-list">
              <div className="season-summary-row">
                <Calendar3 />
                <span>Season Name</span>
                <strong>{watchedName || '2025/2026 Racing Season'}</strong>
              </div>
              <div className="season-summary-row">
                <Calendar3 />
                <span>Start Date</span>
                <strong>{formatSummaryDate(watchedStartDate)}</strong>
              </div>
              <div className="season-summary-row">
                <Calendar3 />
                <span>End Date</span>
                <strong>{formatSummaryDate(watchedEndDate)}</strong>
              </div>
            </div>
          </aside>
        </Form>

        <div className="season-wizard-footer">
          <Button type="button" className="season-btn season-btn-ghost" onClick={() => navigate('/admin/seasons')}>
            <ArrowLeft /> Back
          </Button>
          <div className="season-footer-actions">
            <Button type="button" className="season-btn season-btn-primary" onClick={handleSubmit(onCreateNext)}>
              Next Step <ArrowRight />
            </Button>
          </div>
        </div>
      </div>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
