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

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: { name: '', age: '', breed: '', gender: 'M', healthNote: '' },
  });

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
      await horseService.create({
        horseName: data.name.trim(),
        color: data.breed.trim(),
        age: Number(data.age),
        gender: data.gender || 'M',
        healthNote: data.healthNote?.trim() || '',
      });
      setToast({ message: `"${data.name}" đã được thêm vào chuồng ngựa.`, variant: 'success' });
      reset();
      setIsAdding(false);
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Thêm ngựa thất bại.'), variant: 'danger' });
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
          {isAdding ? '✕ Huỷ' : '+ Thêm ngựa'}
        </Button>
      </div>

      {/* Add form — collapsible */}
      {isAdding && (
        <div className="lux-form-panel mb-4">
          <div className="owner-section-label mb-3"><h5>Đăng ký ngựa mới</h5></div>
          <Form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Row className="g-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Tên ngựa <span style={{ color: '#e55' }}>*</span></Form.Label>
                  <Form.Control
                    placeholder="Thần Mã, Phi Long..."
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
                    placeholder="Thoroughbred..."
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
                    placeholder="4"
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
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Giới tính <span style={{ color: '#e55' }}>*</span></Form.Label>
                  <Form.Select {...register('gender', { required: 'Giới tính là bắt buộc' })} isInvalid={!!errors.gender}>
                    <option value="M">Đực (M)</option>
                    <option value="F">Cái (F)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Ghi chú sức khoẻ (tuỳ chọn)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Nhập ghi chú sức khoẻ..."
                    {...register('healthNote')}
                  />
                </Form.Group>
              </Col>
              <Col md={2} className="mt-3">
                <Button type="submit" className="btn-gold-sm w-100" style={{ padding: '9px' }}>
                  Thêm ngựa
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
