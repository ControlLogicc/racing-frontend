import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { raceConditionService } from '../../services/raceConditionService';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';

const TRACK_TYPES = ['turf', 'dirt', 'synthetic'];
const CLASS_OPTIONS = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];

function SummaryRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="d-flex justify-content-between align-items-start gap-2 py-2" style={{ borderBottom: '1px solid #2a2a3e' }}>
      <div className="d-flex align-items-center gap-2" style={{ color: '#888', fontSize: 13 }}>
        <span>{icon}</span><span>{label}</span>
      </div>
      <span style={{ color: '#e0d6b0', fontSize: 13, textAlign: 'right', maxWidth: 200 }}>{value}</span>
    </div>
  );
}

export default function EditRaceConditionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    conditionName: '',
    distance: '',
    trackType: '',
    minEntries: '',
    maxEntries: '',
    classRequirement: '',
  });
  const [raceName, setRaceName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([raceConditionService.getAll(), raceService.getAll()])
      .then(([conditions, races]) => {
        const found = conditions.find((c) => c.id === Number(id));
        if (found) {
          setForm({
            conditionName: found.conditionName ?? '',
            distance: String(found.distance ?? ''),
            trackType: found.trackType ?? '',
            minEntries: String(found.minEntries ?? ''),
            maxEntries: String(found.maxEntries ?? ''),
            classRequirement: found.classRequirement ?? '',
          });
          const race = races.find((r) => r.id === found.raceId);
          setRaceName(race?.name ?? `Race #${found.raceId}`);
        } else {
          setError('Không tìm thấy condition.');
        }
      })
      .catch(() => setError('Không tải được dữ liệu.'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.conditionName) {
      setToast({ message: 'Vui lòng nhập tên condition.', variant: 'danger' });
      return;
    }
    setSubmitting(true);
    try {
      await raceConditionService.update(Number(id), {
        ...form,
        distance: form.distance ? Number(form.distance) : undefined,
        minEntries: form.minEntries ? Number(form.minEntries) : undefined,
        maxEntries: form.maxEntries ? Number(form.maxEntries) : undefined,
      });
      setToast({ message: 'Cập nhật condition thành công!', variant: 'success' });
      setTimeout(() => navigate('/admin/race-conditions'), 1200);
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cập nhật thất bại.'), variant: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={() => navigate('/admin/race-conditions')} />;

  return (
    <div>
      <div className="page-header d-flex align-items-center gap-3">
        <button className="btn-outline-gold-sm" style={{ padding: '5px 12px' }} onClick={() => navigate('/admin/race-conditions')}>
          ← Quay lại
        </button>
        <h2 style={{ margin: 0 }}>Chỉnh sửa Race Condition</h2>
      </div>

      <Row className="g-4">
        <Col lg={7}>
          <div className="dash-card">
            <h5 style={{ color: '#D4AF37', marginBottom: 4 }}>Condition Information</h5>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>
              Race: <strong style={{ color: '#D4AF37' }}>{raceName}</strong>
            </p>

            <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3" noValidate>
              <Form.Group>
                <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>
                  Tên condition <span style={{ color: '#e05555' }}>*</span>
                </Form.Label>
                <Form.Control value={form.conditionName} onChange={set('conditionName')} required />
              </Form.Group>

              <Row className="g-3">
                <Col sm={4}>
                  <Form.Group>
                    <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>Cự ly (m)</Form.Label>
                    <Form.Control type="number" value={form.distance} onChange={set('distance')} placeholder="1200" />
                  </Form.Group>
                </Col>
                <Col sm={8}>
                  <Form.Group>
                    <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>Loại track</Form.Label>
                    <Form.Select value={form.trackType} onChange={set('trackType')}>
                      <option value="">-- Chọn --</option>
                      {TRACK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col sm={4}>
                  <Form.Group>
                    <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>Min entries</Form.Label>
                    <Form.Control type="number" value={form.minEntries} onChange={set('minEntries')} placeholder="4" />
                  </Form.Group>
                </Col>
                <Col sm={4}>
                  <Form.Group>
                    <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>Max entries</Form.Label>
                    <Form.Control type="number" value={form.maxEntries} onChange={set('maxEntries')} placeholder="12" />
                  </Form.Group>
                </Col>
                <Col sm={4}>
                  <Form.Group>
                    <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>Class yêu cầu</Form.Label>
                    <Form.Select value={form.classRequirement} onChange={set('classRequirement')}>
                      <option value="">-- Không yêu cầu --</option>
                      {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-between mt-2">
                <Button variant="outline-secondary" onClick={() => navigate('/admin/race-conditions')}>Huỷ</Button>
                <Button type="submit" className="btn-gold-sm" style={{ padding: '8px 28px' }} disabled={submitting}>
                  {submitting ? 'Đang lưu...' : '✓ Lưu thay đổi'}
                </Button>
              </div>
            </Form>
          </div>
        </Col>

        <Col lg={5}>
          <div className="dash-card h-100">
            <div className="text-center mb-4">
              <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
              <div style={{ color: '#D4AF37', fontWeight: 700, fontSize: 16 }}>Condition Summary</div>
            </div>
            <SummaryRow icon="🏁" label="Race" value={raceName} />
            <SummaryRow icon="📋" label="Tên condition" value={form.conditionName} />
            <SummaryRow icon="📐" label="Cự ly" value={form.distance ? `${form.distance}m` : null} />
            <SummaryRow icon="🛤️" label="Loại track" value={form.trackType} />
            <SummaryRow icon="👥" label="Min entries" value={form.minEntries} />
            <SummaryRow icon="👥" label="Max entries" value={form.maxEntries} />
            <SummaryRow icon="🏅" label="Class yêu cầu" value={form.classRequirement} />
          </div>
        </Col>
      </Row>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
