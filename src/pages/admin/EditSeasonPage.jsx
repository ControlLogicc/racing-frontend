import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
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

export default function EditSeasonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', status: 'open' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    seasonService.getAll()
      .then((list) => {
        const found = list.find((s) => s.id === Number(id));
        if (found) {
          setForm({ name: found.name, startDate: found.startDate ?? '', endDate: found.endDate ?? '', status: found.status ?? 'open' });
        } else {
          setError('Không tìm thấy season.');
        }
      })
      .catch(() => setError('Không tải được dữ liệu.'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.startDate || !form.endDate) {
      setToast({ message: 'Vui lòng điền đủ thông tin.', variant: 'danger' });
      return;
    }
    if (form.startDate >= form.endDate) {
      setToast({ message: 'Ngày kết thúc phải sau ngày bắt đầu.', variant: 'danger' });
      return;
    }
    setSubmitting(true);
    try {
      await seasonService.update(Number(id), form);
      setToast({ message: 'Cập nhật season thành công!', variant: 'success' });
      setTimeout(() => navigate('/admin/seasons'), 1200);
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cập nhật thất bại.'), variant: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={() => navigate('/admin/seasons')} />;

  return (
    <div>
      <div className="page-header d-flex align-items-center gap-3">
        <button className="btn-outline-gold-sm" style={{ padding: '5px 12px' }} onClick={() => navigate('/admin/seasons')}>
          ← Quay lại
        </button>
        <h2 style={{ margin: 0 }}>Chỉnh sửa Season</h2>
      </div>

      <Row className="g-4">
        {/* Left: form */}
        <Col lg={7}>
          <div className="dash-card">
            <h5 style={{ color: '#D4AF37', marginBottom: 4 }}>Season Information</h5>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Cập nhật thông tin mùa giải.</p>

            <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3" noValidate>
              <Form.Group>
                <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>
                  Season Name <span style={{ color: '#e05555' }}>*</span>
                </Form.Label>
                <Form.Control value={form.name} onChange={set('name')} required />
              </Form.Group>

              <Row className="g-3">
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>
                      Start Date <span style={{ color: '#e05555' }}>*</span>
                    </Form.Label>
                    <Form.Control type="date" value={form.startDate} onChange={set('startDate')} required />
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group>
                    <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>
                      End Date <span style={{ color: '#e05555' }}>*</span>
                    </Form.Label>
                    <Form.Control type="date" value={form.endDate} onChange={set('endDate')} required />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group>
                <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>Trạng thái</Form.Label>
                <Form.Select value={form.status} onChange={set('status')}>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </Form.Select>
              </Form.Group>

              <div className="d-flex justify-content-between mt-2">
                <Button variant="outline-secondary" onClick={() => navigate('/admin/seasons')}>Huỷ</Button>
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
              <div style={{ fontSize: 36, marginBottom: 8 }}>📅</div>
              <div style={{ color: '#D4AF37', fontWeight: 700, fontSize: 16 }}>Season Summary</div>
            </div>
            <SummaryRow icon="📋" label="Season Name" value={form.name} />
            <SummaryRow icon="📅" label="Start Date" value={form.startDate} />
            <SummaryRow icon="📅" label="End Date" value={form.endDate} />
            <SummaryRow icon="🔖" label="Trạng thái" value={form.status === 'open' ? 'Open' : 'Closed'} />
          </div>
        </Col>
      </Row>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
