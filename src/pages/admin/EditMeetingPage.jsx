import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { ArrowLeft, Calendar3 } from 'react-bootstrap-icons';
import { meetingService } from '../../services/meetingService';
import { seasonService } from '../../services/seasonService';
import { racecourseService } from '../../services/racecourseService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';
import './season-wizard.css';

export default function EditMeetingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seasons, setSeasons] = useState([]);
  const [racecourses, setRacecourses] = useState([]);
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  const watchedName = watch('name');
  const watchedSeasonId = watch('seasonId');
  const watchedRacecourseId = watch('racecourseId');

  useEffect(() => {
    Promise.all([
      meetingService.getById ? meetingService.getById(id) : meetingService.getAll().then((rows) => rows.find((row) => String(row.id) === String(id))),
      seasonService.getAll(),
      racecourseService.getAll().catch(() => []),
    ])
      .then(([row, seasonRows, racecourseRows]) => {
        if (!row) throw new Error('Meeting not found.');
        setOriginal(row);
        setSeasons(seasonRows);
        setRacecourses(racecourseRows);
        reset({
          seasonId: row.seasonId ? String(row.seasonId) : '',
          name: row.name ?? '',
          racecourseId: row.racecourseId ? String(row.racecourseId) : '',
          date: row.date ? row.date.slice(0, 10) : '',
        });
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Khong tai duoc meeting.')))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const onSubmit = async (data) => {
    try {
      await meetingService.update(id, {
        ...data,
        seasonId: Number(data.seasonId),
        racecourseId: data.racecourseId ? Number(data.racecourseId) : original?.racecourseId,
      });
      setToast({ message: 'Cap nhat meeting thanh cong.', variant: 'success' });
      navigate('/admin/meetings');
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cap nhat meeting that bai.'), variant: 'danger' });
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const selectedSeason = seasons.find((season) => Number(season.id) === Number(watchedSeasonId));
  const selectedRacecourse = racecourses.find((course) => Number(course.racecourseId) === Number(watchedRacecourseId));

  return (
    <div className="season-admin-page">
      <div className="season-wizard-shell">
        <Form className="season-wizard-grid" noValidate>
          <section className="season-panel season-form-panel">
            <div className="season-panel-heading">
              <h2>Edit Meeting</h2>
              <p>Update meeting schedule and racecourse.</p>
            </div>
            <Form.Group className="season-field">
              <Form.Label>Season <span>*</span></Form.Label>
              <Form.Select {...register('seasonId', { required: 'Chon season' })} isInvalid={!!errors.seasonId}>
                <option value="">-- Chon season --</option>
                {seasons.map((season) => <option key={season.id} value={season.id}>{season.name}</option>)}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.seasonId?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="season-field">
              <Form.Label>Meeting Name <span>*</span></Form.Label>
              <Form.Control {...register('name', { required: 'Ten meeting la bat buoc' })} isInvalid={!!errors.name} />
              <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="season-field">
              <Form.Label>Racecourse</Form.Label>
              <Form.Select {...register('racecourseId')}>
                <option value="">-- Chon duong dua --</option>
                {racecourses.map((course) => (
                  <option key={course.racecourseId} value={course.racecourseId}>{course.racecourseName}{course.location ? ` - ${course.location}` : ''}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="season-field">
              <Form.Label>Meeting Date <span>*</span></Form.Label>
              <Form.Control type="date" {...register('date', { required: 'Ngay la bat buoc' })} isInvalid={!!errors.date} />
              <Form.Control.Feedback type="invalid">{errors.date?.message}</Form.Control.Feedback>
            </Form.Group>
          </section>
          <aside className="season-panel season-summary-panel">
            <Calendar3 className="season-summary-icon" />
            <h3>Meeting Summary</h3>
            <div className="season-summary-list">
              <div className="season-summary-row"><Calendar3 /><span>Meeting</span><strong>{watchedName || '-'}</strong></div>
              <div className="season-summary-row"><Calendar3 /><span>Season</span><strong>{selectedSeason?.name || '-'}</strong></div>
              <div className="season-summary-row"><Calendar3 /><span>Racecourse</span><strong>{selectedRacecourse?.racecourseName || '-'}</strong></div>
            </div>
          </aside>
        </Form>
        <div className="season-wizard-footer">
          <Button type="button" className="season-btn season-btn-ghost" onClick={() => navigate('/admin/meetings')}><ArrowLeft /> Back</Button>
          <Button type="button" className="season-btn season-btn-primary" onClick={handleSubmit(onSubmit)}>Luu thay doi</Button>
        </div>
      </div>
      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
