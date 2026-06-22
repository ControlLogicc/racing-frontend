import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { raceService } from '../../services/raceService';
import { meetingService } from '../../services/meetingService';
import { getApiErrorMessage } from '../../utils/apiError';
import { RACE_STATUS } from '../../constants/status';
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';

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

const STATUS_LABEL = {
  [RACE_STATUS.UPCOMING]: 'Sắp diễn ra',
  [RACE_STATUS.ONGOING]: 'Đang diễn ra',
  [RACE_STATUS.COMPLETED]: 'Đã hoàn thành',
};

export default function EditRacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ meetingId: '', name: '', distance: '', raceTime: '', status: RACE_STATUS.UPCOMING });
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([raceService.getAll(), meetingService.getAll()])
      .then(([races, m]) => {
        const found = races.find((r) => r.id === Number(id));
        if (found) {
          setForm({
            meetingId: String(found.meetingId ?? ''),
            name: found.name ?? '',
            distance: String(found.distance ?? ''),
            raceTime: found.raceTime ? found.raceTime.slice(0, 16) : '',
            status: found.status ?? RACE_STATUS.UPCOMING,
          });
        } else {
          setError('Không tìm thấy race.');
        }
        setMeetings(m);
      })
      .catch(() => setError('Không tải được dữ liệu.'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.meetingId || !form.name || !form.distance || !form.raceTime) {
      setToast({ message: 'Vui lòng điền đủ thông tin.', variant: 'danger' });
      return;
    }
    setSubmitting(true);
    try {
      await raceService.update(Number(id), {
        ...form,
        meetingId: Number(form.meetingId),
        distance: Number(form.distance),
      });
      setToast({ message: 'Cập nhật race thành công!', variant: 'success' });
      setTimeout(() => navigate('/admin/races'), 1200);
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cập nhật thất bại.'), variant: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMeeting = meetings.find((m) => m.id === Number(form.meetingId));

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={() => navigate('/admin/races')} />;

  return (
    <div>
      <div className="page-header d-flex align-items-center gap-3">
        <button className="btn-outline-gold-sm" style={{ padding: '5px 12px' }} onClick={() => navigate('/admin/races')}>
          ← Quay lại
        </button>
        <h2 style={{ margin: 0 }}>Chỉnh sửa Race</h2>
      </div>

      <Row className="g-4">
        <Col lg={7}>
          <div className="dash-card">
            <h5 style={{ color: '#D4AF37', marginBottom: 4 }}>Race Information</h5>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Cập nhật thông tin race.</p>

            <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3" noValidate>
              <Form.Group>
                <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>
                  Meeting <span style={{ color: '#e05555' }}>*</span>
                </Form.Label>
                <Form.Select value={form.meetingId} onChange={set('meetingId')} required>
                  <option value="">-- Chọn meeting --</option>
                  {meetings.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </Form.Select>
              </Form.Group>

              <Form.Group>
                <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>
                  Tên race <span style={{ color: '#e05555' }}>*</span>
                </Form.Label>
                <Form.Control value={form.name} onChange={set('name')} required />
              </Form.Group>

              <Row className="g-3">
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>
                      Cự ly (m) <span style={{ color: '#e05555' }}>*</span>
                    </Form.Label>
                    <Form.Control type="number" value={form.distance} onChange={set('distance')} required />
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>
                      Giờ đua <span style={{ color: '#e05555' }}>*</span>
                    </Form.Label>
                    <Form.Control type="datetime-local" value={form.raceTime} onChange={set('raceTime')} required />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group>
                <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>Trạng thái</Form.Label>
                <Form.Select value={form.status} onChange={set('status')}>
                  {Object.values(RACE_STATUS).map((s) => (
                    <option key={s} value={s}>{STATUS_LABEL[s] ?? s}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <div className="d-flex justify-content-between mt-2">
                <Button variant="outline-secondary" onClick={() => navigate('/admin/races')}>Huỷ</Button>
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
              <div style={{ fontSize: 36, marginBottom: 8 }}>🏁</div>
              <div style={{ color: '#D4AF37', fontWeight: 700, fontSize: 16 }}>Race Summary</div>
            </div>
            <SummaryRow icon="🏟️" label="Meeting" value={selectedMeeting?.name} />
            <SummaryRow icon="🏁" label="Tên race" value={form.name} />
            <SummaryRow icon="📐" label="Cự ly" value={form.distance ? `${form.distance}m` : null} />
            <SummaryRow icon="🕐" label="Giờ đua" value={form.raceTime} />
            <SummaryRow icon="🔖" label="Trạng thái" value={STATUS_LABEL[form.status] ?? form.status} />
          </div>
        </Col>
      </Row>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
