import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { meetingService } from '../../services/meetingService';
import { seasonService } from '../../services/seasonService';
import { getApiErrorMessage } from '../../utils/apiError';
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

export default function EditMeetingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ seasonId: '', name: '', racecourse: '', date: '' });
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([meetingService.getAll(), seasonService.getAll()])
      .then(([meetings, s]) => {
        const found = meetings.find((m) => m.id === Number(id));
        if (found) {
          setForm({
            seasonId: String(found.seasonId ?? ''),
            name: found.name ?? '',
            racecourse: found.racecourse ?? '',
            date: found.date ? found.date.slice(0, 10) : '',
          });
        } else {
          setError('Không tìm thấy meeting.');
        }
        setSeasons(s);
      })
      .catch(() => setError('Không tải được dữ liệu.'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.seasonId || !form.name || !form.racecourse || !form.date) {
      setToast({ message: 'Vui lòng điền đủ thông tin.', variant: 'danger' });
      return;
    }
    setSubmitting(true);
    try {
      await meetingService.update(Number(id), { ...form, seasonId: Number(form.seasonId) });
      setToast({ message: 'Cập nhật meeting thành công!', variant: 'success' });
      setTimeout(() => navigate('/admin/meetings'), 1200);
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cập nhật thất bại.'), variant: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSeason = seasons.find((s) => s.id === Number(form.seasonId));

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={() => navigate('/admin/meetings')} />;

  return (
    <div>
      <div className="page-header d-flex align-items-center gap-3">
        <button className="btn-outline-gold-sm" style={{ padding: '5px 12px' }} onClick={() => navigate('/admin/meetings')}>
          ← Quay lại
        </button>
        <h2 style={{ margin: 0 }}>Chỉnh sửa Meeting</h2>
      </div>

      <Row className="g-4">
        {/* Left: form */}
        <Col lg={7}>
          <div className="dash-card">
            <h5 style={{ color: '#D4AF37', marginBottom: 4 }}>Meeting Information</h5>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Cập nhật thông tin race meeting.</p>

            <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3" noValidate>
              <Form.Group>
                <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>
                  Season <span style={{ color: '#e05555' }}>*</span>
                </Form.Label>
                <Form.Select value={form.seasonId} onChange={set('seasonId')} required>
                  <option value="">-- Chọn season --</option>
                  {seasons.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Form.Select>
              </Form.Group>

              <Form.Group>
                <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>
                  Tên meeting <span style={{ color: '#e05555' }}>*</span>
                </Form.Label>
                <Form.Control value={form.name} onChange={set('name')} required />
              </Form.Group>

              <Form.Group>
                <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>
                  Địa điểm <span style={{ color: '#e05555' }}>*</span>
                </Form.Label>
                <Form.Control value={form.racecourse} onChange={set('racecourse')} required />
              </Form.Group>

              <Form.Group>
                <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>
                  Ngày tổ chức <span style={{ color: '#e05555' }}>*</span>
                </Form.Label>
                <Form.Control type="date" value={form.date} onChange={set('date')} required />
              </Form.Group>

              <div className="d-flex justify-content-between mt-2">
                <Button variant="outline-secondary" onClick={() => navigate('/admin/meetings')}>Huỷ</Button>
                <Button type="submit" className="btn-gold-sm" style={{ padding: '8px 28px' }} disabled={submitting}>
                  {submitting ? 'Đang lưu...' : '✓ Lưu thay đổi'}
                </Button>
              </div>
            </Form>
          </div>
        </Col>

        {/* Right: summary */}
        <Col lg={5}>
          <div className="dash-card h-100">
            <div className="text-center mb-4">
              <div style={{ fontSize: 36, marginBottom: 8 }}>🏟️</div>
              <div style={{ color: '#D4AF37', fontWeight: 700, fontSize: 16 }}>Meeting Summary</div>
            </div>
            <SummaryRow icon="📅" label="Season" value={selectedSeason?.name} />
            <SummaryRow icon="🏟️" label="Tên meeting" value={form.name} />
            <SummaryRow icon="📍" label="Địa điểm" value={form.racecourse} />
            <SummaryRow icon="🕐" label="Ngày" value={form.date} />
          </div>
        </Col>
      </Row>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
