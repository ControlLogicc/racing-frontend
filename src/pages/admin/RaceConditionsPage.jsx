import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { raceConditionService } from '../../services/raceConditionService';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import Toaster from '../../components/common/Toaster';

const TRACK_TYPES = ['turf', 'dirt', 'synthetic'];

const EMPTY_FORM = {
  conditionName: '',
  distance: '',
  trackType: 'turf',
  minEntries: '',
  maxEntries: '',
  classRequirement: '',
};

export default function RaceConditionsPage() {
  const navigate = useNavigate();
  const [races, setRaces] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [selectedRaceId, setSelectedRaceId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    raceService.getAll()
      .then(setRaces)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách race.')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedRaceId) { setConditions([]); return; }
    raceConditionService.getByRace(Number(selectedRaceId))
      .then(setConditions)
      .catch((err) => setToast({ message: getApiErrorMessage(err, 'Không tải được condition.'), variant: 'danger' }));
  }, [selectedRaceId]);

  const refetch = () => {
    if (!selectedRaceId) return;
    raceConditionService.getByRace(Number(selectedRaceId))
      .then(setConditions)
      .catch((err) => setToast({ message: getApiErrorMessage(err, 'Không tải được condition.'), variant: 'danger' }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await raceConditionService.create({
        ...form,
        raceId: Number(selectedRaceId),
        distance: Number(form.distance),
        minEntries: Number(form.minEntries),
        maxEntries: Number(form.maxEntries),
      });
      setToast({ message: 'Tạo condition thành công.', variant: 'success' });
      setForm(EMPTY_FORM);
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tạo condition thất bại.'), variant: 'danger' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xoá condition này?')) return;
    try {
      await raceConditionService.remove(id);
      setToast({ message: 'Đã xoá condition.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Xoá thất bại.'), variant: 'danger' });
    }
  };

  const columns = [
    { key: 'conditionName', label: 'Tên condition' },
    { key: 'distance', label: 'Cự ly (m)' },
    { key: 'trackType', label: 'Loại đường đua' },
    { key: 'minEntries', label: 'Số ngựa tối thiểu' },
    { key: 'maxEntries', label: 'Số ngựa tối đa' },
    { key: 'classRequirement', label: 'Hạng yêu cầu' },
    {
      key: 'actions',
      label: 'Hành động',
      render: (row) => (
        <div className="d-flex gap-2">
          <button className="btn-gold-sm" onClick={() => navigate(`/admin/race-conditions/edit/${row.id}`)}>Sửa</button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}>Xoá</button>
        </div>
      ),
    },
  ];

  const selectedRaceName = races.find((r) => r.id === Number(selectedRaceId))?.name ?? '';
  const hasCondition = conditions.length > 0;

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <div className="page-header"><h2>Quản lý Race Condition</h2></div>

      <div className="dash-card mb-4">
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Chọn Race</Form.Label>
          <Form.Select
            value={selectedRaceId}
            onChange={(e) => setSelectedRaceId(e.target.value)}
            style={{ maxWidth: 320 }}
          >
            <option value="">-- Chọn race để xem / tạo condition --</option>
            {races.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>

      {!selectedRaceId && (
        <EmptyState message="Chọn một race để xem hoặc tạo condition." />
      )}

      {selectedRaceId && (
        <>
          {hasCondition ? (
            <>
              <h5 style={{ color: '#D4AF37' }} className="mb-3">
                Condition của <strong>{selectedRaceName}</strong>
              </h5>
              <DataTable columns={columns} rows={conditions} />
            </>
          ) : (
            <>
              <h5 style={{ color: '#D4AF37' }} className="mb-3">
                Tạo condition cho <strong>{selectedRaceName}</strong>
              </h5>
              <Form onSubmit={handleCreate} className="dash-card d-flex flex-wrap gap-3 align-items-end">
                <Form.Group>
                  <Form.Label style={{ color: '#D4AF37' }}>Tên condition</Form.Label>
                  <Form.Control
                    value={form.conditionName}
                    onChange={(e) => setForm({ ...form, conditionName: e.target.value })}
                    placeholder="VD: 1800m Turf Class 1"
                    required
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label style={{ color: '#D4AF37' }}>Cự ly (m)</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.distance}
                    onChange={(e) => setForm({ ...form, distance: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label style={{ color: '#D4AF37' }}>Loại đường đua</Form.Label>
                  <Form.Select value={form.trackType} onChange={(e) => setForm({ ...form, trackType: e.target.value })}>
                    {TRACK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Label style={{ color: '#D4AF37' }}>Số ngựa tối thiểu</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.minEntries}
                    onChange={(e) => setForm({ ...form, minEntries: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label style={{ color: '#D4AF37' }}>Số ngựa tối đa</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.maxEntries}
                    onChange={(e) => setForm({ ...form, maxEntries: e.target.value })}
                    required
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label style={{ color: '#D4AF37' }}>Hạng yêu cầu</Form.Label>
                  <Form.Control
                    value={form.classRequirement}
                    onChange={(e) => setForm({ ...form, classRequirement: e.target.value })}
                    placeholder="VD: Class 1-2"
                    required
                  />
                </Form.Group>
                <Button type="submit" className="btn-gold-sm" style={{ padding: '8px 20px' }}>
                  Tạo Condition
                </Button>
              </Form>
            </>
          )}
        </>
      )}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
