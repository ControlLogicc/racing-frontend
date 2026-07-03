import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { HOME_ROUTE_BY_ROLE } from '../../constants/roles';
import './auth-theme.css';
import { getApiErrorMessage } from '../../utils/apiError';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  const [apiError, setApiError] = useState(
    searchParams.get('banned') === '1' ? 'Tài khoản của bạn đã bị khoá. Vui lòng liên hệ quản trị viên.' : ''
  );
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '', password: '' } });

  const onSubmit = async (values) => {
    setApiError('');
    setSubmitting(true);
    try {
      const data = await authService.login(values);
      const payloadUser = data.user || data;
      
      // Backend trả về flat object: { token, userId, fullName, email, role: "OWNER" }
      const user = {
        userId: payloadUser.userId ?? payloadUser.user_id,
        fullName: payloadUser.fullName ?? payloadUser.full_name,
        email: payloadUser.email,
        role: payloadUser.role.toLowerCase(), // Đổi sang chữ thường để map đúng đường dẫn
        ownerId: payloadUser.ownerId,
        jockeyId: payloadUser.jockeyId,
        staffId: payloadUser.staffId,
        refereeId: payloadUser.refereeId,
      };

      login(user, data.token);

      const target = HOME_ROUTE_BY_ROLE[user.role] || '/';
      navigate(target, { replace: true });
    } catch (err) {
  setApiError(getApiErrorMessage(err, 'Đăng nhập thất bại. Vui lòng thử lại.'));
} finally {
  setSubmitting(false);
}
  };

  return (
    <Container fluid className="lux-auth">
      <Card className="lux-card" style={{ maxWidth: 440 }}>
        <Card.Body>
          <div className="lux-title">
            <h3>Đăng nhập</h3>
            <div className="lux-subtitle">FPT Horse Racing Management</div>
          </div>

          {apiError && <Alert variant="danger">{apiError}</Alert>}

          <Form noValidate onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3" controlId="login-email">
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

            <Form.Group className="mb-4" controlId="login-password">
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

            <Button type="submit" className="lux-btn-gold w-100" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner as="span" size="sm" animation="border" className="me-2" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </Form>

          <p className="text-center mt-3 mb-0" style={{ color: '#9a8f73' }}>
            Chưa có tài khoản? <Link to="/register" className="lux-link">Đăng ký</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}
