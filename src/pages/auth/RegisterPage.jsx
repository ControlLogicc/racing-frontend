import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { authService } from '../../services/authService';
import { ROLES, SELF_REGISTER_ROLES } from '../../constants/roles';
import { useAuth } from '../../hooks/useAuth';
import { HOME_ROUTE_BY_ROLE } from '../../constants/roles';
import './auth-theme.css';
import { getApiErrorMessage } from '../../utils/apiError';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{9,11}$/;

const ROLE_LABEL = {
  [ROLES.OWNER]: 'Chủ ngựa (Owner)',
  [ROLES.JOCKEY]: 'Nài ngựa (Jockey)',
  [ROLES.SPECTATOR]: 'Khán giả (Spectator)',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      password: '',
      role: ROLES.OWNER,
    },
  });

  const onSubmit = async (values) => {
    setApiError('');
    setSubmitting(true);
    try {
      // Đóng gói lại payload cho khớp với DTO của Spring Boot
      const payload = {
        fullName: values.full_name,       // Đổi snake_case -> camelCase
        email: values.email,
        phone: values.phone,
        password: values.password,
        role: values.role.toUpperCase(),  // Java Enum bắt buộc phải IN HOA
      };

      // EXCEPTION #4: gửi raw password (BE tự hash), KHÔNG dùng password_hash ở FE
      const data = await authService.register(payload);
      setSuccess(true);
      // Đăng nhập tự động sau khi đăng ký thành công
      setTimeout(() => {
        // Map dữ liệu response để đưa vào context
        const user = {
          userId: data.userId,
          fullName: data.fullName,
          email: data.email,
          role: data.role.toLowerCase(), // FE đang dùng role chữ thường để map route
        };
        
        login(user, data.token); // Lưu token và thông tin user vào Context/LocalStorage
        const target = HOME_ROUTE_BY_ROLE[user.role] || '/';
        navigate(target, { replace: true }); // Chuyển thẳng về trang chủ của Role đó
      }, 1500);
    } catch (err) {
  setApiError(getApiErrorMessage(err, 'Đăng ký thất bại. Vui lòng thử lại.'));
} finally {
  setSubmitting(false);
}
  };

  return (
    <Container fluid className="lux-auth">
      <Card className="lux-card" style={{ maxWidth: 480 }}>
        <Card.Body>
          <div className="lux-title">
            <h3>Đăng ký</h3>
            <div className="lux-subtitle">Tạo tài khoản FPT Horse Racing</div>
          </div>

          {success && (
            <Alert variant="success">
              Đăng ký thành công! Đang chuyển sang trang đăng nhập...
            </Alert>
          )}
          {apiError && <Alert variant="danger">{apiError}</Alert>}

          <Form noValidate onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3" controlId="reg-fullname">
              <Form.Label>Họ tên</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nguyễn Văn A"
                isInvalid={!!errors.full_name}
                {...register('full_name', {
                  required: 'Vui lòng nhập họ tên',
                  minLength: { value: 2, message: 'Họ tên quá ngắn' },
                })}
              />
              <Form.Control.Feedback type="invalid">
                {errors.full_name?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="reg-email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="you@example.com"
                isInvalid={!!errors.email}
                {...register('email', {
                  required: 'Vui lòng nhập email',
                  pattern: { value: EMAIL_REGEX, message: 'Email không hợp lệ' },
                })}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="reg-phone">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                type="tel"
                placeholder="0901234567"
                isInvalid={!!errors.phone}
                {...register('phone', {
                  required: 'Vui lòng nhập số điện thoại',
                  pattern: { value: PHONE_REGEX, message: 'Số điện thoại 9–11 chữ số' },
                })}
              />
              <Form.Control.Feedback type="invalid">
                {errors.phone?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="reg-password">
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                isInvalid={!!errors.password}
                {...register('password', {
                  required: 'Vui lòng nhập mật khẩu',
                  minLength: { value: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
                })}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4" controlId="reg-role">
              <Form.Label>Vai trò</Form.Label>
              <Form.Select
                isInvalid={!!errors.role}
                {...register('role', { required: 'Vui lòng chọn vai trò' })}
              >
                {SELF_REGISTER_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.role?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Button
              type="submit"
              className="lux-btn-gold w-100"
              disabled={submitting || success}
            >
              {submitting ? (
                <>
                  <Spinner as="span" size="sm" animation="border" className="me-2" />
                  Đang đăng ký...
                </>
              ) : (
                'Đăng ký'
              )}
            </Button>
          </Form>

          <p className="text-center mt-3 mb-0" style={{ color: '#9a8f73' }}>
            Đã có tài khoản? <Link to="/login" className="lux-link">Đăng nhập</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}