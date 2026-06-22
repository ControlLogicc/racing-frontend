import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { userService } from '../../services/userService';
import { jockeyProfileService } from '../../services/jockeyProfileService';
import { staffProfileService } from '../../services/staffProfileService';
import { refereeProfileService } from '../../services/refereeProfileService';
import { DEPARTMENTS } from '../../mocks/mockStaffProfiles';
import { getApiErrorMessage } from '../../utils/apiError';
import { ROLES } from '../../constants/roles';
import Toaster from '../../components/common/Toaster';
import { useState } from 'react';

const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.STAFF]: 'Staff',
  [ROLES.REFEREE]: 'Referee',
  [ROLES.OWNER]: 'Owner',
  [ROLES.JOCKEY]: 'Jockey',
  [ROLES.SPECTATOR]: 'Spectator',
};

const PROFILE_ROLES = [ROLES.JOCKEY, ROLES.STAFF, ROLES.REFEREE];

function FL({ children, required }) {
  return (
    <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>
      {children}{required && <span style={{ color: '#e05555' }}> *</span>}
    </Form.Label>
  );
}

function SectionDivider({ label }) {
  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, marginTop: 4 }}>
      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
        {label}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, secret }) {
  if (!value) return null;
  return (
    <div className="d-flex justify-content-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{label}</span>
      <span style={{ color: '#e0dbd0', fontSize: 13, fontWeight: 500 }}>
        {secret ? '••••••••' : value}
      </span>
    </div>
  );
}

export default function CreateUserPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      fullName: '', email: '', phone: '', password: '', role: ROLES.SPECTATOR,
      weight: '', experienceYears: '', department: '', licenseNo: '',
    },
  });

  const role = watch('role');
  const form = watch();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const newUser = await userService.create({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
      });

      if (data.role === ROLES.JOCKEY && (data.weight || data.experienceYears)) {
        await jockeyProfileService.create({
          userId: newUser.id,
          weight: data.weight ? Number(data.weight) : undefined,
          experienceYears: data.experienceYears ? Number(data.experienceYears) : undefined,
        });
      }
      if (data.role === ROLES.STAFF && data.department) {
        await staffProfileService.create({ userId: newUser.id, department: data.department });
      }
      if (data.role === ROLES.REFEREE && data.licenseNo) {
        await refereeProfileService.create({ userId: newUser.id, licenseNo: data.licenseNo.trim() });
      }

      setToast({ message: 'Tạo tài khoản thành công!', variant: 'success' });
      setTimeout(() => navigate('/admin/users'), 1200);
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tạo tài khoản thất bại.'), variant: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header d-flex align-items-center gap-3">
        <button className="btn-outline-gold-sm" style={{ padding: '5px 12px' }} onClick={() => navigate('/admin/users')}>
          ← Quay lại
        </button>
        <h2 style={{ margin: 0 }}>Tạo tài khoản mới</h2>
      </div>

      <Row className="g-4">
        <Col lg={7}>
          <div className="dash-card">
            <Form onSubmit={handleSubmit(onSubmit)} className="d-flex flex-column gap-3" noValidate>

              {/* ── Thông tin cơ bản ── */}
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                Thông tin cá nhân
              </div>

              <Form.Group>
                <FL required>Họ và tên</FL>
                <Form.Control
                  {...register('fullName', { required: 'Họ tên là bắt buộc' })}
                  isInvalid={!!errors.fullName}
                />
                <Form.Control.Feedback type="invalid">{errors.fullName?.message}</Form.Control.Feedback>
              </Form.Group>

              <Row className="g-3">
                <Col sm={6}>
                  <Form.Group>
                    <FL required>Email</FL>
                    <Form.Control
                      type="email"
                      {...register('email', {
                        required: 'Email là bắt buộc',
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không hợp lệ' },
                      })}
                      isInvalid={!!errors.email}
                    />
                    <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group>
                    <FL>Số điện thoại</FL>
                    <Form.Control {...register('phone')} placeholder="09xxxxxxxx" />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-3">
                <Col sm={6}>
                  <Form.Group>
                    <FL required>Mật khẩu</FL>
                    <Form.Control
                      type="password"
                      {...register('password', {
                        required: 'Mật khẩu là bắt buộc',
                        minLength: { value: 6, message: 'Tối thiểu 6 ký tự' },
                      })}
                      isInvalid={!!errors.password}
                    />
                    <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col sm={6}>
                  <Form.Group>
                    <FL required>Role</FL>
                    <Form.Select {...register('role', { required: true })}>
                      {Object.values(ROLES).map((r) => (
                        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* ── Jockey profile ── */}
              {role === ROLES.JOCKEY && (
                <>
                  <SectionDivider label="Thông tin Jockey" />
                  <Row className="g-3">
                    <Col sm={6}>
                      <Form.Group>
                        <FL>Cân nặng (kg)</FL>
                        <Form.Control type="number" step="0.01" {...register('weight')} placeholder="55.50" />
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group>
                        <FL>Kinh nghiệm (năm)</FL>
                        <Form.Control type="number" min="0" {...register('experienceYears')} placeholder="5" />
                      </Form.Group>
                    </Col>
                  </Row>
                </>
              )}

              {/* ── Staff profile ── */}
              {role === ROLES.STAFF && (
                <>
                  <SectionDivider label="Thông tin Staff" />
                  <Form.Group>
                    <FL>Phòng ban</FL>
                    <Form.Select {...register('department')}>
                      <option value="">-- Chọn phòng ban --</option>
                      {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </Form.Select>
                  </Form.Group>
                </>
              )}

              {/* ── Referee profile ── */}
              {role === ROLES.REFEREE && (
                <>
                  <SectionDivider label="Thông tin Referee" />
                  <Form.Group>
                    <FL>Mã chứng chỉ hành nghề</FL>
                    <Form.Control {...register('licenseNo')} placeholder="REF-LICENSE-001" />
                    <Form.Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                      Định dạng: REF-LICENSE-XXX
                    </Form.Text>
                  </Form.Group>
                </>
              )}

              <div className="d-flex justify-content-between mt-2">
                <Button variant="outline-secondary" onClick={() => navigate('/admin/users')}>Huỷ</Button>
                <Button type="submit" className="btn-gold-sm" style={{ padding: '8px 28px' }} disabled={submitting}>
                  {submitting ? 'Đang tạo...' : '✓ Tạo tài khoản'}
                </Button>
              </div>
            </Form>
          </div>
        </Col>

        {/* ── Summary ── */}
        <Col lg={5}>
          <div className="dash-card h-100">
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
              Xem trước
            </div>

            <SummaryRow label="Họ và tên" value={form.fullName} />
            <SummaryRow label="Email" value={form.email} />
            <SummaryRow label="Số điện thoại" value={form.phone} />
            <SummaryRow label="Mật khẩu" value={form.password} secret />
            <SummaryRow label="Role" value={ROLE_LABELS[form.role]} />

            {PROFILE_ROLES.includes(role) && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '12px 0' }} />
            )}

            {role === ROLES.JOCKEY && (
              <>
                <SummaryRow label="Cân nặng" value={form.weight ? `${form.weight} kg` : null} />
                <SummaryRow label="Kinh nghiệm" value={form.experienceYears ? `${form.experienceYears} năm` : null} />
              </>
            )}
            {role === ROLES.STAFF && (
              <SummaryRow label="Phòng ban" value={form.department} />
            )}
            {role === ROLES.REFEREE && (
              <SummaryRow label="Mã chứng chỉ" value={form.licenseNo} />
            )}
          </div>
        </Col>
      </Row>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
