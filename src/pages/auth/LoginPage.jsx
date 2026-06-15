import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { HOME_ROUTE_BY_ROLE } from '../../constants/roles';
import './auth-theme.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [apiError, setApiError] = useState('');
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
      // response shape: { token, user: { user_id, full_name, role } }
      const data = await authService.login(values);
      login(data.user, data.token);

      const target = HOME_ROUTE_BY_ROLE[data.user.role] || '/';
      navigate(target, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 401
          ? 'Email hoặc mật khẩu không đúng.'
          : 'Đăng nhập thất bại. Vui lòng thử lại.');
      setApiError(msg);
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
            Chưa có tài khoản? <a href="/register" className="lux-link">Đăng ký</a>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}