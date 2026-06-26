import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { horseService } from '../../services/horseService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';
import HorseProfileCard from '../../components/shared/HorseProfileCard';
import './owner-theme.css';

export default function OwnerHorsesPage() {
  const { user } = useAuth();
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({
    defaultValues: { 
      name: '', age: '', breed: '', gender: 'M', healthNote: '',
      registrationType: 'NEW', claimedScore: '', claimedClass: '5', evidenceLink: ''
    },
  });

  const watchRegistrationType = watch('registrationType');

  const load = () => {
    horseService
      .getByOwner()
      .then((h) => setHorses(h.filter((horse) => !horse.ownerId || Number(horse.ownerId) === Number(user.userId))))
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách ngựa.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const onSubmit = async (data) => {
    try {
      let finalHealthNote = data.healthNote?.trim() || '';
      if (data.registrationType === 'PREVIOUSLY_REGISTERED' && data.evidenceLink?.trim()) {
        finalHealthNote += `\n[Link Bằng Chứng]: ${data.evidenceLink.trim()}`;
      }

      await horseService.create({
        name: data.name.trim(),
        breed: data.breed.trim(),
        age: Number(data.age),
        gender: data.gender,
        healthNote: finalHealthNote.trim(),
        registrationType: data.registrationType,
        claimedScore: data.claimedScore,
        claimedClass: data.claimedClass,
      });
      setToast({ message: `"${data.name}" đã được đăng ký thành công.`, variant: 'success' });
      reset();
      setIsAdding(false);
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Đăng ký ngựa thất bại.'), variant: 'danger' });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header mb-4">
        <h2>Ngựa của tôi</h2>
        <Button
          className="btn-gold-sm"
          style={{ padding: '8px 20px' }}
          onClick={() => setIsAdding((v) => !v)}
        >
          {isAdding ? '✕ Huỷ' : '+ Đăng ký ngựa'}
        </Button>
      </div>

      {/* Add form — collapsible */}
      {isAdding && (
        <div className="lux-panel mb-4">
          <div className="owner-section-label mb-3"><h5>Đăng ký ngựa mới</h5></div>
          <Form onSubmit={handleSubmit(onSubmit)} noValidate>
            
            <div className="mb-4 p-3" style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px' }}>
              <Form.Label style={{ color: '#D4AF37', fontWeight: 'bold' }}>Loại đăng ký <span style={{ color: '#e55' }}>*</span></Form.Label>
              <div className="d-flex gap-4 mt-2">
                <Form.Check 
                  type="radio" 
                  id="reg-new" 
                  label="Ngựa chưa thi đấu (Tự động Class 5)" 
                  value="NEW" 
                  {...register('registrationType')} 
                />
                <Form.Check 
                  type="radio" 
                  id="reg-prev" 
                  label="Ngựa đã có thành tích (Cần duyệt)" 
                  value="PREVIOUSLY_REGISTERED" 
                  {...register('registrationType')} 
                />
              </div>
            </div>

            <Row className="g-4">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Tên ngựa <span style={{ color: '#e55' }}>*</span></Form.Label>
                  <Form.Control
                    placeholder="VD: Thần Mã..."
                    {...register('name', { required: 'Tên ngựa là bắt buộc' })}
                    isInvalid={!!errors.name}
                  />
                  <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Màu/Giống <span style={{ color: '#e55' }}>*</span></Form.Label>
                  <Form.Control
                    placeholder="VD: Thoroughbred..."
                    {...register('breed', { required: 'Màu/giống ngựa là bắt buộc' })}
                    isInvalid={!!errors.breed}
                  />
                  <Form.Control.Feedback type="invalid">{errors.breed?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Tuổi <span style={{ color: '#e55' }}>*</span></Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="VD: 4"
                    {...register('age', {
                      required: 'Tuổi là bắt buộc',
                      min: { value: 1, message: 'Tuổi từ 1-30' },
                      max: { value: 30, message: 'Tuổi tối đa 30' },
                    })}
                    isInvalid={!!errors.age}
                  />
                  <Form.Control.Feedback type="invalid">{errors.age?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Giới tính <span style={{ color: '#e55' }}>*</span></Form.Label>
                  <Form.Select {...register('gender', { required: 'Giới tính là bắt buộc' })} isInvalid={!!errors.gender}>
                    <option value="M">Đực (Male)</option>
                    <option value="F">Cái (Female)</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {watchRegistrationType === 'PREVIOUSLY_REGISTERED' && (
                <>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Điểm số khai báo <span style={{ color: '#e55' }}>*</span></Form.Label>
                      <Form.Control
                        type="number"
                        step="0.1"
                        placeholder="VD: 35.5"
                        {...register('claimedScore', { 
                          required: watchRegistrationType === 'PREVIOUSLY_REGISTERED' ? 'Bắt buộc nhập điểm khai báo' : false,
                          min: { value: 0, message: 'Điểm không hợp lệ' }
                        })}
                        isInvalid={!!errors.claimedScore}
                      />
                      <Form.Control.Feedback type="invalid">{errors.claimedScore?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Hạng khai báo <span style={{ color: '#e55' }}>*</span></Form.Label>
                      <Form.Select {...register('claimedClass')}>
                        <option value="5">Class 5</option>
                        <option value="4">Class 4</option>
                        <option value="3">Class 3</option>
                        <option value="2">Class 2</option>
                        <option value="1">Class 1</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Link Bằng chứng (Google Drive / OneDrive) <span style={{ color: '#e55' }}>*</span></Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Dán link thư mục hoặc file tài liệu, hình ảnh chứng minh thành tích..."
                        {...register('evidenceLink', { 
                          required: watchRegistrationType === 'PREVIOUSLY_REGISTERED' ? 'Bắt buộc cung cấp link bằng chứng' : false 
                        })}
                        isInvalid={!!errors.evidenceLink}
                      />
                      <Form.Control.Feedback type="invalid">{errors.evidenceLink?.message}</Form.Control.Feedback>
                      <Form.Text className="text-muted">Link bằng chứng sẽ được gửi cho Ban Trọng tài (Referee) để xét duyệt.</Form.Text>
                    </Form.Group>
                  </Col>
                </>
              )}

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Ghi chú sức khoẻ (Tuỳ chọn)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Tình trạng tiêm chủng, chấn thương cũ..."
                    {...register('healthNote')}
                  />
                </Form.Group>
              </Col>
              
              <Col md={12} className="d-flex justify-content-end mt-2">
                <Button type="button" className="btn-ghost me-3" onClick={() => setIsAdding(false)}>
                  Hủy bỏ
                </Button>
                <Button type="submit" className="btn-gold" style={{ padding: '0.6rem 2.5rem' }}>
                  {watchRegistrationType === 'PREVIOUSLY_REGISTERED' ? 'Gửi duyệt đăng ký' : '✓ Đăng ký ngựa'}
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      )}

      {/* Horse grid */}
      {loading && <Loading />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && horses.length === 0 && (
        <EmptyState message="Bạn chưa có ngựa nào trong chuồng." />
      )}
      {!loading && !error && horses.length > 0 && (
        <>
          <div className="owner-section-label">
            <h5>{horses.length} con ngựa</h5>
          </div>
          <div className="row g-3">
            {horses.map((h) => (
              <div className="col-12 col-sm-6 col-xl-4" key={h.id}>
                <HorseProfileCard horse={h} showHistory />
              </div>
            ))}
          </div>
        </>
      )}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
