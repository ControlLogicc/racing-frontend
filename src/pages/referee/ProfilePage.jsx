import { useEffect, useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { LockFill } from 'react-bootstrap-icons';
import { refereeProfileService } from '../../services/refereeProfileService';
import { userService } from '../../services/userService';
import { getApiErrorMessage } from '../../utils/apiError';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../../components/common/Loading';
import Toaster from '../../components/common/Toaster';

function SummaryRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="d-flex justify-content-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{label}</span>
      <span style={{ color: '#e0dbd0', fontSize: 13, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14, marginTop: 4 }}>
      {children}
    </div>
  );
}

function ReadonlyField({ label, value }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ color: '#D4AF37', fontSize: 13, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
        <LockFill size={10} style={{ opacity: 0.45 }} />
        {label}
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: '8px 12px', color: value ? '#9a9285' : 'rgba(255,255,255,0.2)', fontSize: 14 }}>
        {value || '—'}
      </div>
    </div>
  );
}

export default function RefereeProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    refereeProfileService.getByUser(user.id)
      .then((p) => {
        setProfile(p);
        setForm({ fullName: user.fullName ?? '', email: user.email ?? '', phone: user.phone ?? '' });
      })
      .catch(() => setToast({ message: 'Không tải được hồ sơ.', variant: 'danger' }))
      .finally(() => setLoading(false));
  }, [user.id]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email) {
      setToast({ message: 'Họ tên và email là bắt buộc.', variant: 'danger' });
      return;
    }
    setSubmitting(true);
    try {
      const updatedUser = await userService.updateMe(user.id, {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
      });
      updateUser(updatedUser);
      setToast({ message: 'Cập nhật thông tin thành công!', variant: 'success' });
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cập nhật thất bại.'), variant: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="page-header">
        <h2>Hồ sơ cá nhân</h2>
      </div>

      <Row className="g-4">
        <Col lg={7}>
          <div className="dash-card d-flex flex-column gap-4">
            <div>
              <SectionTitle>Thông tin cá nhân</SectionTitle>
              <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3" noValidate>
                <Form.Group>
                  <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>
                    Họ và tên <span style={{ color: '#e05555' }}>*</span>
                  </Form.Label>
                  <Form.Control value={form.fullName} onChange={set('fullName')} required />
                </Form.Group>

                <Row className="g-3">
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>
                        Email <span style={{ color: '#e05555' }}>*</span>
                      </Form.Label>
                      <Form.Control type="email" value={form.email} onChange={set('email')} required />
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>Số điện thoại</Form.Label>
                      <Form.Control value={form.phone} onChange={set('phone')} placeholder="09xxxxxxxx" />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end mt-1">
                  <Button type="submit" className="btn-gold-sm" style={{ padding: '8px 28px' }} disabled={submitting}>
                    {submitting ? 'Đang lưu...' : '✓ Lưu thông tin'}
                  </Button>
                </div>
              </Form>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20 }}>
              <SectionTitle>Thông tin Referee</SectionTitle>
              <ReadonlyField label="Mã chứng chỉ hành nghề" value={profile?.licenseNo} />
            </div>
          </div>
        </Col>

        <Col lg={5}>
          <div className="dash-card h-100">
            <SectionTitle>Hồ sơ hiện tại</SectionTitle>
            <SummaryRow label="Họ và tên" value={form.fullName} />
            <SummaryRow label="Email" value={form.email} />
            <SummaryRow label="Số điện thoại" value={form.phone} />
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '12px 0' }} />
            <SummaryRow label="Mã chứng chỉ" value={profile?.licenseNo} />
          </div>
        </Col>
      </Row>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
