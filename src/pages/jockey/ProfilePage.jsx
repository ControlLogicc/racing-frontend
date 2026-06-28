import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { jockeyService } from '../../services/jockeyService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';
import '../owner/owner-theme.css';

export default function JockeyProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const load = () => {
    jockeyService.getProfile()
      .then((data) => {
        setProfile(data);
        reset({
          weight: data.weight || '',
          experienceYears: data.experienceYears || '',
        });
      })
      .catch((err) => {
        // If backend returns 404 Not Found for profile, it means profile isn't created yet.
        // We shouldn't block the UI, just leave it empty so they can submit (PUT).
        if (err.response?.status === 404) {
          setProfile(null); // Explicitly null
        } else {
          setError(getApiErrorMessage(err, 'Không tải được hồ sơ.'));
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const updated = await jockeyService.updateProfile({
        weight: Number(data.weight),
        experienceYears: Number(data.experienceYears),
      });
      setProfile(updated);
      setToast({ message: 'Cập nhật hồ sơ thành công.', variant: 'success' });
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cập nhật thất bại.'), variant: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="page-header mb-4 smooth-hover">
        <div>
          <h2>Hồ sơ cá nhân</h2>
          <p style={{ margin: 0, marginTop: 4 }}>Cập nhật cân nặng và kinh nghiệm để chủ ngựa dễ dàng tìm thấy bạn.</p>
        </div>
      </div>

      <div className="lux-form-panel smooth-hover">
        <Form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Row className="g-4">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Họ và tên (Đọc từ tài khoản)</Form.Label>
                <Form.Control value={profile?.fullName || 'N/A'} disabled className="smooth-hover" />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Cân nặng (kg) <span style={{ color: '#e55' }}>*</span></Form.Label>
                <Form.Control
                  type="number"
                  placeholder="VD: 52"
                  className="smooth-hover"
                  {...register('weight', {
                    required: 'Cân nặng là bắt buộc',
                    min: { value: 30, message: 'Cân nặng tối thiểu 30kg' },
                    max: { value: 100, message: 'Cân nặng tối đa 100kg' },
                  })}
                  isInvalid={!!errors.weight}
                />
                <Form.Control.Feedback type="invalid">{errors.weight?.message}</Form.Control.Feedback>
                <Form.Text>Cân nặng thực tế ảnh hưởng tới pre-check trước race.</Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Số năm kinh nghiệm</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="VD: 3"
                  className="smooth-hover"
                  {...register('experienceYears', {
                    min: { value: 0, message: 'Kinh nghiệm không được âm' },
                  })}
                  isInvalid={!!errors.experienceYears}
                />
                <Form.Control.Feedback type="invalid">{errors.experienceYears?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={12} className="d-flex justify-content-end mt-4">
              <Button type="submit" className="btn-gold smooth-hover" style={{ padding: '0.7rem 2.5rem' }} disabled={submitting}>
                {submitting ? <Spinner size="sm" animation="border" className="me-2" /> : 'Lưu hồ sơ'}
              </Button>
            </Col>
          </Row>
        </Form>
      </div>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
