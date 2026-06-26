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
import './referee-theme.css'; // Import Cyber Theme

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
      entryService.getForReferee(user),
      raceService.getAssignedToReferee(user),
    ])
      .then(([res, ent, r]) => { setResults(res); setEntries(ent); setRaces(r); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được dữ liệu kết quả.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  // Chỉ entry thuộc race RESULT_PENDING, chưa có kết quả.
  const enterableEntries = entries.filter((e) => {
    const race = races.find((r) => r.id === e.raceId);
    const alreadyHasResult = results.some((res) => res.entryId === e.id);
    return race && canEnterResult(race.status) && !alreadyHasResult;
  });

  const onSubmit = async (data) => {
    const entry = enterableEntries.find((en) => en.id === Number(data.entryId));
    if (!entry) return;
    try {
      await resultService.createForRace(entry.raceId, {
        entryId: entry.id,
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
    <div className="referee-context">
      <div className="referee-hero d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>RACE RESULTS INPUT</h2>
          <p className="mb-0">
            &gt; SYSTEM: RECORDING OFFICIAL RACE POSITIONS AND TIMES
          </p>
        </div>
      </div>

      {enterableEntries.length === 0 ? (
        <EmptyState message="Không có entry nào thuộc race RESULT_PENDING đang chờ nhập kết quả." />
      ) : (
        <div className="cyber-panel mb-4">
          <h5 className="mb-4 text-info fw-bold" style={{ letterSpacing: '1px' }}>DATA ENTRY TERMINAL</h5>
          <Form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-wrap gap-4 align-items-end" noValidate>
            <Form.Group style={{ minWidth: '300px', flex: 1 }}>
              <Form.Label className="cyber-form-label">Entry</Form.Label>
              <Form.Select
                className="cyber-input"
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
            
            <Form.Group style={{ width: '120px' }}>
              <Form.Label className="cyber-form-label text-warning">Vị trí (Hạng)</Form.Label>
              <Form.Control
                className="cyber-input"
                type="number"
                {...register('position', {
                  required: 'Vị trí là bắt buộc',
                  min: { value: 1, message: 'Vị trí phải lớn hơn 0' },
                })}
                isInvalid={!!errors.position}
              />
              <Form.Control.Feedback type="invalid">{errors.position?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group style={{ width: '180px' }}>
              <Form.Label className="cyber-form-label text-warning">Thời gian</Form.Label>
              <Form.Control
                className="cyber-input"
                placeholder="00:01:10.250"
                {...register('finishTime', { required: 'Thời gian là bắt buộc' })}
                isInvalid={!!errors.finishTime}
              />
              <Form.Control.Feedback type="invalid">{errors.finishTime?.message}</Form.Control.Feedback>
            </Form.Group>

            <Button type="submit" className="btn-cyber btn-cyber-danger">
              LƯU KẾT QUẢ
            </Button>
          </Form>
        </div>
      )}

      <div className="cyber-panel">
        <h5 className="mb-4 text-info fw-bold" style={{ letterSpacing: '1px' }}>RECORDED RESULTS LOG</h5>
        {results.length === 0 ? <EmptyState message="Chưa có kết quả nào được ghi nhận." /> : (
          /* Wrap the shared table inside a div to apply context styles if needed */
          <div className="table-responsive">
            <RaceResultTable rows={results} showRaceName />
          </div>
        )}
      </div>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
