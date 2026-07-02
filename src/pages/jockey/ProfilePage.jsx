import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { jockeyService } from '../../services/jockeyService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';
import ImageDropzone from '../../components/common/ImageDropzone';
import '../owner/owner-theme.css';

export default function JockeyProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm();
  const watchImageUrl = watch('imageUrl');

  const load = () => {
    jockeyService.getProfile()
      .then((data) => {
        setProfile(data);
        reset({
          weight: data.weight || '',
          experienceYears: data.experienceYears || '',
          height: data.height || '',
          nationality: data.nationality || '',
          licenseNumber: data.licenseNumber || '',
          achievements: data.achievements || '',
          imageUrl: data.imageUrl || '',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.substring(0, 10) : '',
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
        height: data.height ? Number(data.height) : null,
        nationality: data.nationality,
        licenseNumber: data.licenseNumber,
        achievements: data.achievements,
        imageUrl: data.imageUrl,
        dateOfBirth: data.dateOfBirth,
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

            <Col md={6}>
              <Form.Group>
                <Form.Label>Chiều cao (cm)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="VD: 170"
                  className="smooth-hover"
                  {...register('height', {
                    min: { value: 100, message: 'Chiều cao không hợp lệ' },
                    max: { value: 250, message: 'Chiều cao không hợp lệ' }
                  })}
                  isInvalid={!!errors.height}
                />
                <Form.Control.Feedback type="invalid">{errors.height?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Quốc tịch</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="VD: VN"
                  className="smooth-hover"
                  {...register('nationality')}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Ngày sinh</Form.Label>
                <Form.Control
                  type="date"
                  className="smooth-hover"
                  {...register('dateOfBirth')}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Số giấy phép (License Number)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="VD: L-12345"
                  className="smooth-hover"
                  {...register('licenseNumber')}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>Ảnh đại diện</Form.Label>
                <div className="d-flex align-items-center gap-3">
                  <ImageDropzone
                    size={64}
                    rounded
                    value={watchImageUrl}
                    onUploaded={(url) => setValue('imageUrl', url, { shouldDirty: true })}
                    onError={(msg) => setToast({ message: msg, variant: 'danger' })}
                  />
                  <Form.Control
                    type="text"
                    placeholder="hoặc dán URL ảnh..."
                    className="smooth-hover"
                    {...register('imageUrl')}
                  />
                </div>
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>Thành tích nổi bật</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Vô địch giải đấu X, hạng 2 giải Y..."
                  className="smooth-hover"
                  {...register('achievements')}
                />
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
