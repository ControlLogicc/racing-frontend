import { useEffect, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
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
  const [results, setResults] = useState([]);
  const [entries, setEntries] = useState([]);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ entryId: '', position: '', finishTime: '' });

  const load = () => {
    Promise.all([resultService.getAll(), entryService.getAll(), raceService.getAll()])
      .then(([res, ent, r]) => { setResults(res); setEntries(ent); setRaces(r); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được dữ liệu kết quả.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const refetch = () => {
    setLoading(true);
    setError('');
    load();
  };

  // Chỉ entry thuộc race COMPLETED, chưa có kết quả mới được nhập (Mục 15 CLAUDE.md)
  const enterableEntries = entries.filter((e) => {
    const race = races.find((r) => r.id === e.raceId);
    const alreadyHasResult = results.some((res) => res.entryId === e.id);
    return race && canEnterResult(race.status) && !alreadyHasResult;
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    const entry = enterableEntries.find((en) => en.id === Number(form.entryId));
    if (!entry) return;
    try {
      await resultService.create({
        raceId: entry.raceId,
        raceName: entry.raceName,
        entryId: entry.id,
        horseName: entry.horseName,
        jockeyName: entry.jockeyName,
        position: Number(form.position),
        finishTime: form.finishTime,
      });
      setToast({ message: 'Nhập kết quả thành công.', variant: 'success' });
      setForm({ entryId: '', position: '', finishTime: '' });
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
        <Form onSubmit={handleCreate} className="dash-card d-flex flex-wrap gap-3 align-items-end mb-4">
          <Form.Group>
            <Form.Label style={{ color: '#D4AF37' }}>Entry</Form.Label>
            <Form.Select value={form.entryId} onChange={(e) => setForm({ ...form, entryId: e.target.value })} required>
              <option value="">-- Chọn entry --</option>
              {enterableEntries.map((en) => (
                <option key={en.id} value={en.id}>{en.raceName} — {en.horseName} ({en.jockeyName})</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label style={{ color: '#D4AF37' }}>Vị trí</Form.Label>
            <Form.Control type="number" min="1" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} required />
          </Form.Group>
          <Form.Group>
            <Form.Label style={{ color: '#D4AF37' }}>Thời gian về đích</Form.Label>
            <Form.Control placeholder="01:12.45" value={form.finishTime} onChange={(e) => setForm({ ...form, finishTime: e.target.value })} required />
          </Form.Group>
          <Button type="submit" className="btn-gold-sm" style={{ padding: '8px 20px' }}>Nhập kết quả</Button>
        </Form>
      )}

      {results.length === 0 ? <EmptyState message="Chưa có kết quả nào." /> : <RaceResultTable rows={results} />}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
