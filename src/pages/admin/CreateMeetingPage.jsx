import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { ArrowLeft, ArrowRight, Calendar3, CalendarCheck, FlagFill, LayersFill, TrophyFill } from 'react-bootstrap-icons';
import { meetingService } from '../../services/meetingService';
import { seasonService } from '../../services/seasonService';
import { racecourseService } from '../../services/racecourseService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';
import './season-wizard.css';

const EMPTY_FORM = { seasonId: '', name: '', racecourseId: '', date: '' };
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

export default function CreateMeetingPage() {
  const navigate = useNavigate();
  const [seasons, setSeasons] = useState([]);
  const [racecourses, setRacecourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({ defaultValues: EMPTY_FORM });

  const watchedSeasonId = watch('seasonId');
  const watchedName = watch('name');
  const watchedRacecourseId = watch('racecourseId');
  const watchedDate = watch('date');

  useEffect(() => {
    Promise.all([seasonService.getAll(), racecourseService.getAll().catch(() => [])])
      .then(([s, rc]) => { setSeasons(s); setRacecourses(rc); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được dữ liệu tạo meeting.')))
      .finally(() => setLoading(false));
  }, []);

  const validateDateWithinSeason = (dateValue, seasonId) => {
    if (!seasonId || !dateValue) return true;
    const season = seasons.find((s) => s.id === Number(seasonId));
    if (!season) return true;
    const meetingDate = new Date(dateValue);
    const seasonStart = new Date(season.startDate);
    seasonStart.setHours(0, 0, 0, 0);
    const seasonEnd = new Date(season.endDate);
    seasonEnd.setHours(23, 59, 59, 999);
    if (meetingDate < seasonStart || meetingDate > seasonEnd) {
      return `Ngày meeting phải nằm trong season (${new Date(season.startDate).toLocaleDateString('vi-VN')} - ${new Date(season.endDate).toLocaleDateString('vi-VN')})`;
    }
    return true;
  };

  const onSubmit = async (data) => {
    try {
      await meetingService.create({
        ...data,
        seasonId: Number(data.seasonId),
        racecourseId: data.racecourseId ? Number(data.racecourseId) : undefined,
      });
      setToast({ message: 'Tạo meeting thành công.', variant: 'success' });
      reset(EMPTY_FORM);
      navigate('/admin/races/create');
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tạo meeting thất bại.'), variant: 'danger' });
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const selectedSeason = seasons.find((s) => s.id === Number(watchedSeasonId));
  const selectedRacecourse = racecourses.find((rc) => rc.racecourseId === Number(watchedRacecourseId));

  return (
    <div className="season-admin-page">
      <div className="season-wizard-shell">
        <div className="season-stepper" aria-label="Meeting setup steps">
          {STEPS.map((step, index) => (
            <div className={`season-step ${step.id === 2 ? 'active' : ''}`} key={step.id}>
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
              <h2>Meeting Information</h2>
              <p>Create a race meeting inside an active season.</p>
            </div>

            <Form.Group className="season-field">
              <Form.Label>Season <span>*</span></Form.Label>
              <Form.Select {...register('seasonId', { required: 'Chọn season' })} isInvalid={!!errors.seasonId}>
                <option value="">-- Chọn season --</option>
                {seasons.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.seasonId?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="season-field">
              <Form.Label>Meeting Name <span>*</span></Form.Label>
              <Form.Control {...register('name', { required: 'Tên meeting là bắt buộc' })} isInvalid={!!errors.name} placeholder="Saigon Cup Meeting" />
              <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="season-field">
              <Form.Label>Racecourse</Form.Label>
              <Form.Select {...register('racecourseId')}>
                <option value="">-- Chọn đường đua --</option>
                {racecourses.map((rc) => (
                  <option key={rc.racecourseId} value={rc.racecourseId}>
                    {rc.racecourseName}{rc.location ? ` - ${rc.location}` : ''}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="season-field">
              <Form.Label>Meeting Date <span>*</span></Form.Label>
              <Form.Control
                type="date"
                {...register('date', {
                  required: 'Ngày là bắt buộc',
                  validate: (value) => validateDateWithinSeason(value, watchedSeasonId),
                })}
                isInvalid={!!errors.date}
              />
              <Form.Control.Feedback type="invalid">{errors.date?.message}</Form.Control.Feedback>
            </Form.Group>
          </section>

          <aside className="season-panel season-summary-panel">
            <Calendar3 className="season-summary-icon" />
            <h3>Meeting Summary</h3>
            <div className="season-summary-list">
              <div className="season-summary-row"><Calendar3 /><span>Meeting</span><strong>{watchedName || 'Saigon Cup Meeting'}</strong></div>
              <div className="season-summary-row"><CalendarCheck /><span>Season</span><strong>{selectedSeason?.name || '-'}</strong></div>
              <div className="season-summary-row"><LayersFill /><span>Racecourse</span><strong>{selectedRacecourse?.racecourseName || '-'}</strong></div>
              <div className="season-summary-row"><Calendar3 /><span>Date</span><strong>{formatSummaryDate(watchedDate)}</strong></div>
            </div>
          </aside>
        </Form>

        <div className="season-wizard-footer">
          <Button type="button" className="season-btn season-btn-ghost" onClick={() => navigate('/admin/meetings')}>
            <ArrowLeft /> Back
          </Button>
          <div className="season-footer-actions">
            <Button type="button" className="season-btn season-btn-primary" onClick={handleSubmit(onSubmit)} disabled={seasons.length === 0}>
              Next Step <ArrowRight />
            </Button>
          </div>
        </div>
      </div>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
