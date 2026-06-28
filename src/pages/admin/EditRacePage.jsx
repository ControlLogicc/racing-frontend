import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { ArrowLeft, FlagFill } from 'react-bootstrap-icons';
import { raceService } from '../../services/raceService';
import { meetingService } from '../../services/meetingService';
import { raceConditionService } from '../../services/raceConditionService';
import { userService } from '../../services/userService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';
import './season-wizard.css';

export default function EditRacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [refereeList, setRefereeList] = useState([]);
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  const watchedName = watch('name');
  const watchedMeetingId = watch('meetingId');
  const watchedConditionId = watch('conditionId');

  useEffect(() => {
    Promise.all([
      raceService.getById ? raceService.getById(id) : raceService.getAll().then((rows) => rows.find((row) => String(row.id) === String(id))),
      meetingService.getAll(),
      raceConditionService.getAll(),
      userService.getStaff().catch(() => []),
      userService.getReferees().catch(() => []),
    ])
      .then(([row, meetingRows, conditionRows, staffRows, refereeRows]) => {
        if (!row) throw new Error('Race not found.');
        setOriginal(row);
        setMeetings(meetingRows);
        setConditions(conditionRows);
        setStaffList(staffRows);
        setRefereeList(refereeRows);
        reset({
          meetingId: String(row.meetingId ?? ''),
          conditionId: String(row.conditionId ?? ''),
          name: row.name ?? '',
          raceNo: String(row.raceNo ?? ''),
          raceTime: row.raceTime ? row.raceTime.slice(0, 16) : '',
          registrationOpenAt: row.registrationOpenAt ? row.registrationOpenAt.slice(0, 16) : '',
          registrationCloseAt: row.registrationCloseAt ? row.registrationCloseAt.slice(0, 16) : '',
          staffId: row.staffId ? String(row.staffId) : '',
          refereeId: row.refereeId ? String(row.refereeId) : '',
        });
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Khong tai duoc race.')))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const onSubmit = async (data) => {
    try {
      await raceService.update(id, {
        ...data,
        meetingId: Number(data.meetingId),
        conditionId: data.conditionId ? Number(data.conditionId) : undefined,
        raceNo: data.raceNo ? Number(data.raceNo) : undefined,
        status: original?.status,
      });
      setToast({ message: 'Cap nhat race thanh cong.', variant: 'success' });
      navigate('/admin/races');
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cap nhat race that bai.'), variant: 'danger' });
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const selectedMeeting = meetings.find((meeting) => Number(meeting.id) === Number(watchedMeetingId));
  const selectedCondition = conditions.find((condition) => Number(condition.id) === Number(watchedConditionId));

  return (
    <div className="season-admin-page">
      <div className="season-wizard-shell">
        <Form className="season-wizard-grid" noValidate>
          <section className="season-panel season-form-panel">
            <div className="season-panel-heading">
              <h2>Edit Race</h2>
              <p>Update race timing, assignment and registration window.</p>
            </div>
            <Form.Group className="season-field">
              <Form.Label>Meeting <span>*</span></Form.Label>
              <Form.Select {...register('meetingId', { required: 'Chon meeting' })} isInvalid={!!errors.meetingId}>
                <option value="">-- Chon meeting --</option>
                {meetings.map((meeting) => <option key={meeting.id} value={meeting.id}>{meeting.name}</option>)}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.meetingId?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="season-field">
              <Form.Label>Condition</Form.Label>
              <Form.Select {...register('conditionId')}>
                <option value="">-- Chon condition --</option>
                {conditions.map((condition) => <option key={condition.id} value={condition.id}>{condition.conditionName} ({condition.distance}m)</option>)}
              </Form.Select>
            </Form.Group>
            <div className="season-form-duo">
              <Form.Group className="season-field">
                <Form.Label>Race No</Form.Label>
                <Form.Control type="number" {...register('raceNo')} min="1" />
              </Form.Group>
              <Form.Group className="season-field">
                <Form.Label>Race Name <span>*</span></Form.Label>
                <Form.Control {...register('name', { required: 'Ten race la bat buoc' })} isInvalid={!!errors.name} />
                <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
              </Form.Group>
            </div>
            <Form.Group className="season-field">
              <Form.Label>Race Time <span>*</span></Form.Label>
              <Form.Control type="datetime-local" {...register('raceTime', { required: 'Gio dua la bat buoc' })} isInvalid={!!errors.raceTime} />
              <Form.Control.Feedback type="invalid">{errors.raceTime?.message}</Form.Control.Feedback>
            </Form.Group>
            <div className="season-form-duo">
              <Form.Group className="season-field">
                <Form.Label>Registration Open <span>*</span></Form.Label>
                <Form.Control type="datetime-local" {...register('registrationOpenAt', { required: 'Ngay mo dang ky la bat buoc' })} isInvalid={!!errors.registrationOpenAt} />
                <Form.Control.Feedback type="invalid">{errors.registrationOpenAt?.message}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="season-field">
                <Form.Label>Registration Close <span>*</span></Form.Label>
                <Form.Control type="datetime-local" {...register('registrationCloseAt', { required: 'Ngay dong dang ky la bat buoc' })} isInvalid={!!errors.registrationCloseAt} />
                <Form.Control.Feedback type="invalid">{errors.registrationCloseAt?.message}</Form.Control.Feedback>
              </Form.Group>
            </div>
            <div className="season-form-duo">
              <Form.Group className="season-field">
                <Form.Label>Staff</Form.Label>
                <Form.Select {...register('staffId')}><option value="">-- Chon staff --</option>{staffList.map((staff) => <option key={staff.staffId} value={staff.staffId}>{staff.fullName}</option>)}</Form.Select>
              </Form.Group>
              <Form.Group className="season-field">
                <Form.Label>Referee</Form.Label>
                <Form.Select {...register('refereeId')}><option value="">-- Chon referee --</option>{refereeList.map((referee) => <option key={referee.refereeId} value={referee.refereeId}>{referee.fullName}</option>)}</Form.Select>
              </Form.Group>
            </div>
          </section>
          <aside className="season-panel season-summary-panel">
            <FlagFill className="season-summary-icon" />
            <h3>Race Summary</h3>
            <div className="season-summary-list">
              <div className="season-summary-row"><FlagFill /><span>Race</span><strong>{watchedName || '-'}</strong></div>
              <div className="season-summary-row"><FlagFill /><span>Meeting</span><strong>{selectedMeeting?.name || '-'}</strong></div>
              <div className="season-summary-row"><FlagFill /><span>Condition</span><strong>{selectedCondition?.conditionName || '-'}</strong></div>
            </div>
          </aside>
        </Form>
        <div className="season-wizard-footer">
          <Button type="button" className="season-btn season-btn-ghost" onClick={() => navigate('/admin/races')}><ArrowLeft /> Back</Button>
          <Button type="button" className="season-btn season-btn-primary" onClick={handleSubmit(onSubmit)}>Luu thay doi</Button>
        </div>
      </div>
      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
