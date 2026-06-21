import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Button } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { horseService } from '../../services/horseService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';
import HorseProfileCard from '../../components/shared/HorseProfileCard';

export default function OwnerHorsesPage() {
  const { user } = useAuth();
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: { name: '', age: '', breed: '' },
  });

  const load = () => {
    horseService
      .getByOwner(user.userId)
      .then(setHorses)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách ngựa.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const onSubmit = async (data) => {
    try {
      await horseService.create({
        ...data,
        age: Number(data.age),
        ownerId: user.userId,
        ownerName: user.fullName,
      });
      setToast({ message: 'Thêm ngựa thành công.', variant: 'success' });
      reset();
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Thêm ngựa thất bại.'), variant: 'danger' });
    }
  };

  return (
    <div>
      <div className="page-header"><h2>Ngựa của tôi</h2></div>

      <Form onSubmit={handleSubmit(onSubmit)} className="dash-card d-flex flex-wrap gap-3 align-items-start mb-4">
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Tên ngựa</Form.Label>
          <Form.Control
            {...register('name', { required: 'Tên ngựa là bắt buộc' })}
            isInvalid={!!errors.name}
          />
          <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Tuổi</Form.Label>
          <Form.Control
            type="number"
            {...register('age', { required: 'Tuổi là bắt buộc', min: { value: 1, message: 'Tuổi phải lớn hơn 0' } })}
            isInvalid={!!errors.age}
          />
          <Form.Control.Feedback type="invalid">{errors.age?.message}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group>
          <Form.Label style={{ color: '#D4AF37' }}>Giống</Form.Label>
          <Form.Control
            {...register('breed', { required: 'Giống ngựa là bắt buộc' })}
            isInvalid={!!errors.breed}
          />
          <Form.Control.Feedback type="invalid">{errors.breed?.message}</Form.Control.Feedback>
        </Form.Group>
        <Button type="submit" className="btn-gold-sm" style={{ padding: '8px 20px', marginTop: '32px' }}>
          Thêm ngựa
        </Button>
      </Form>

      {loading && <Loading />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && horses.length === 0 && <EmptyState message="Bạn chưa có ngựa nào." />}
      {!loading && !error && horses.length > 0 && (
        <div className="row g-4">
          {horses.map((h) => (
            <div className="col-12 col-sm-6 col-lg-4" key={h.id}>
              <HorseProfileCard horse={h} showHistory />
            </div>
          ))}
        </div>
      )}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
