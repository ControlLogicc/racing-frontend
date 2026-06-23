import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Button } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { resultService } from '../../services/resultService';
import { entryService } from '../../services/entryService';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import { canEnterResult } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';
import RaceResultTable from '../../components/shared/RaceResultTable';

export default function RefereeResultsPage() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [entries, setEntries] = useState([]);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: { entryId: '', position: '', finishTime: '' },
  });

  const load = () => {
    Promise.all([
      resultService.getAll(),
      entryService.getForReferee(user?.userId),
      raceService.getAssignedToReferee(user?.userId),
    ])
      .then(([res, ent, r]) => { setResults(res); setEntries(ent); setRaces(r); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được dữ liệu kết quả.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  // Chỉ entry thuộc race COMPLETED, chưa có kết quả (Mục 15 CLAUDE.md)
  const enterableEntries = entries.filter((e) => {
    const race = races.find((r) => r.id === e.raceId);
    const alreadyHasResult = results.some((res) => res.entryId === e.id);
    return race && canEnterResult(race.status) && !alreadyHasResult;
  });

  const onSubmit = async (data) => {
    const entry = enterableEntries.find((en) => en.id === Number(data.entryId));
    if (!entry) return;
    try {
      await resultService.create({
        raceId: entry.raceId,
        raceName: entry.raceName,
        entryId: entry.id,
        horseName: entry.horseName,
        jockeyName: entry.jockeyName,
        position: Number(data.position),
        finishTime: data.finishTime,
      });
      setToast({ message: 'Nhập kết quả thành công.', variant: 'success' });
      reset();
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Nhập kết quả thất bại.'), variant: 'danger' });
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <div className="page-header"><h2>Nhập kết quả đua</h2></div>

      {enterableEntries.length === 0 ? (
        <EmptyState message="Không có entry nào thuộc race đã COMPLETED đang chờ nhập kết quả." />
      ) : (
        <Form onSubmit={handleSubmit(onSubmit)} className="dash-card d-flex flex-wrap gap-3 align-items-start mb-4" noValidate>
          <Form.Group>
            <Form.Label style={{ color: '#D4AF37' }}>Entry</Form.Label>
            <Form.Select
              {...register('entryId', { required: 'Chọn entry' })}
              isInvalid={!!errors.entryId}
            >
              <option value="">-- Chọn entry --</option>
              {enterableEntries.map((en) => (
                <option key={en.id} value={en.id}>{en.raceName} — {en.horseName} ({en.jockeyName})</option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.entryId?.message}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label style={{ color: '#D4AF37' }}>Vị trí</Form.Label>
            <Form.Control
              type="number"
              {...register('position', {
                required: 'Vị trí là bắt buộc',
                min: { value: 1, message: 'Vị trí phải lớn hơn 0' },
              })}
              isInvalid={!!errors.position}
            />
            <Form.Control.Feedback type="invalid">{errors.position?.message}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label style={{ color: '#D4AF37' }}>Thời gian về đích</Form.Label>
            <Form.Control
              placeholder="01:12.45"
              {...register('finishTime', { required: 'Thời gian là bắt buộc' })}
              isInvalid={!!errors.finishTime}
            />
            <Form.Control.Feedback type="invalid">{errors.finishTime?.message}</Form.Control.Feedback>
          </Form.Group>
          <Button type="submit" className="btn-gold-sm" style={{ padding: '8px 20px', marginTop: '32px' }}>
            Nhập kết quả
          </Button>
        </Form>
      )}

      {results.length === 0 ? <EmptyState message="Chưa có kết quả nào." /> : <RaceResultTable rows={results} showRaceName />}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
