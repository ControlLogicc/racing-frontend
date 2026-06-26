import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { ArrowLeft, ArrowRight, Calendar3, CalendarCheck, FlagFill, LayersFill, TrophyFill } from 'react-bootstrap-icons';
import { raceService } from '../../services/raceService';
import { meetingService } from '../../services/meetingService';
import { raceConditionService } from '../../services/raceConditionService';
import { userService } from '../../services/userService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';
import './season-wizard.css';

const EMPTY_FORM = { meetingId: '', conditionId: '', name: '', raceNo: '', raceTime: '', registrationOpenAt: '', registrationCloseAt: '', staffId: '', refereeId: '' };
const STEPS = [
  { id: 1, label: 'Season', icon: <CalendarCheck /> },
  { id: 2, label: 'Race Meeting', icon: <Calendar3 /> },
  { id: 3, label: 'Races', icon: <FlagFill /> },
  { id: 4, label: 'Prize Structure', icon: <TrophyFill /> },
];

export default function CreateRacePage() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [refereeList, setRefereeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({ defaultValues: EMPTY_FORM });
  const watchedMeetingId = watch('meetingId');
  const watchedConditionId = watch('conditionId');
  const watchedName = watch('name');
  const watchedRaceTime = watch('raceTime');

  useEffect(() => {
    Promise.all([
      meetingService.getAll(),
      raceConditionService.getAll(),
      userService.getStaff(),
      userService.getReferees(),
    ])
      .then(([m, c, staff, referees]) => { setMeetings(m); setConditions(c); setStaffList(staff); setRefereeList(referees); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được dữ liệu tạo race.')))
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data) => {
    try {
      await raceService.create({
        ...data,
        meetingId: Number(data.meetingId),
        conditionId: data.conditionId ? Number(data.conditionId) : undefined,
        raceNo: data.raceNo ? Number(data.raceNo) : undefined,
      });
      setToast({ message: 'Tạo race thành công.', variant: 'success' });
      reset(EMPTY_FORM);
      navigate('/admin/prizes/create');
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tạo race thất bại.'), variant: 'danger' });
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const selectedMeeting = meetings.find((m) => m.id === Number(watchedMeetingId));
  const selectedCondition = conditions.find((c) => c.id === Number(watchedConditionId));

  return (
    <div className="season-admin-page">
      <div className="season-wizard-shell">
        <div className="season-stepper" aria-label="Race setup steps">
          {STEPS.map((step, index) => (
            <div className={`season-step ${step.id === 3 ? 'active' : ''}`} key={step.id}>
              <div className="season-step-node"><span className="season-step-number">{step.id}</span><span className="season-step-icon">{step.icon}</span></div>
              <span className="season-step-label">{step.label}</span>
              {index < STEPS.length - 1 && <span className="season-step-line" />}
            </div>
          ))}
        </div>

        <Form className="season-wizard-grid" noValidate>
          <section className="season-panel season-form-panel">
            <div className="season-panel-heading">
              <h2>Race Information</h2>
              <p>Create a race under a meeting and assign officials.</p>
            </div>

            <Form.Group className="season-field">
              <Form.Label>Meeting <span>*</span></Form.Label>
              <Form.Select {...register('meetingId', { required: 'Chọn meeting' })} isInvalid={!!errors.meetingId}>
                <option value="">-- Chọn meeting --</option>
                {meetings.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.meetingId?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="season-field">
              <Form.Label>Condition</Form.Label>
              <Form.Select {...register('conditionId')}>
                <option value="">-- Chọn condition --</option>
                {conditions.map((c) => <option key={c.id} value={c.id}>{c.conditionName} ({c.distance}m)</option>)}
              </Form.Select>
            </Form.Group>

            <div className="season-form-duo">
              <Form.Group className="season-field">
                <Form.Label>Race No</Form.Label>
                <Form.Control type="number" {...register('raceNo')} min="1" placeholder="1" />
              </Form.Group>
              <Form.Group className="season-field">
                <Form.Label>Race Name <span>*</span></Form.Label>
                <Form.Control {...register('name', { required: 'Tên race là bắt buộc' })} isInvalid={!!errors.name} placeholder="Saigon Cup Race 1" />
                <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
              </Form.Group>
            </div>

            <Form.Group className="season-field">
              <Form.Label>Race Time <span>*</span></Form.Label>
              <Form.Control type="datetime-local" {...register('raceTime', { required: 'Giờ đua là bắt buộc' })} isInvalid={!!errors.raceTime} />
              <Form.Control.Feedback type="invalid">{errors.raceTime?.message}</Form.Control.Feedback>
            </Form.Group>

            <div className="season-form-duo">
              <Form.Group className="season-field">
                <Form.Label>Registration Open <span>*</span></Form.Label>
                <Form.Control type="datetime-local" {...register('registrationOpenAt', { 
                  required: 'Ngày mở đăng ký là bắt buộc',
                  validate: (val, formValues) => {
                    if (formValues.raceTime && new Date(val) >= new Date(formValues.raceTime)) return 'Phải mở trước giờ đua';
                    return true;
                  }
                })} isInvalid={!!errors.registrationOpenAt} />
                <Form.Control.Feedback type="invalid">{errors.registrationOpenAt?.message}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="season-field">
                <Form.Label>Registration Close <span>*</span></Form.Label>
                <Form.Control type="datetime-local" {...register('registrationCloseAt', { 
                  required: 'Thời hạn đăng ký là bắt buộc',
                  validate: (val, formValues) => {
                    if (formValues.raceTime && new Date(val) >= new Date(formValues.raceTime)) return 'Phải đóng trước giờ đua';
                    if (formValues.registrationOpenAt && new Date(val) <= new Date(formValues.registrationOpenAt)) return 'Phải đóng sau khi mở';
                    return true;
                  }
                })} isInvalid={!!errors.registrationCloseAt} />
                <Form.Control.Feedback type="invalid">{errors.registrationCloseAt?.message}</Form.Control.Feedback>
              </Form.Group>
            </div>

            <div className="season-form-duo">
              <Form.Group className="season-field">
                <Form.Label>Staff</Form.Label>
                <Form.Select {...register('staffId')}><option value="">-- Chọn staff --</option>{staffList.map((s) => <option key={s.staffId} value={s.staffId}>{s.fullName}</option>)}</Form.Select>
              </Form.Group>
              <Form.Group className="season-field">
                <Form.Label>Referee</Form.Label>
                <Form.Select {...register('refereeId')}><option value="">-- Chọn referee --</option>{refereeList.map((r) => <option key={r.refereeId} value={r.refereeId}>{r.fullName}</option>)}</Form.Select>
              </Form.Group>
            </div>
          </section>

          <aside className="season-panel season-summary-panel">
            <FlagFill className="season-summary-icon" />
            <h3>Race Summary</h3>
            <div className="season-summary-list">
              <div className="season-summary-row"><FlagFill /><span>Race</span><strong>{watchedName || 'Saigon Cup Race 1'}</strong></div>
              <div className="season-summary-row"><Calendar3 /><span>Meeting</span><strong>{selectedMeeting?.name || '-'}</strong></div>
              <div className="season-summary-row"><LayersFill /><span>Condition</span><strong>{selectedCondition?.conditionName || '-'}</strong></div>
              <div className="season-summary-row"><CalendarCheck /><span>Time</span><strong>{watchedRaceTime ? watchedRaceTime.replace('T', ' ') : '-'}</strong></div>
            </div>
          </aside>
        </Form>

        <div className="season-wizard-footer">
          <Button type="button" className="season-btn season-btn-ghost" onClick={() => navigate('/admin/races')}>
            <ArrowLeft /> Back
          </Button>
          <div className="season-footer-actions">
            <Button type="button" className="season-btn season-btn-primary" onClick={handleSubmit(onSubmit)} disabled={meetings.length === 0}>
              Next Step <ArrowRight />
            </Button>
          </div>
        </div>
      </div>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
