import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { horseService } from '../../services/horseService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';
import ImageDropzone from '../../components/common/ImageDropzone';
import Pagination from '../../components/common/Pagination';
import HorseProfileCard from '../../components/shared/HorseProfileCard';
import './owner-theme.css';

const PAGE_SIZE = 9;
const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'fail', label: 'Chờ duyệt rating' },
  { value: 'injured', label: 'Chấn thương' },
  { value: 'retired', label: 'Đã nghỉ hưu' },
  { value: 'suspended', label: 'Tạm ngưng' },
];

export default function OwnerHorsesPage() {
  const { user } = useAuth();
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: '', age: '', breed: '', color: '', gender: 'M', healthNote: '',
      registrationType: 'NEW', claimedScore: '', evidenceLink: '',
      pedigree: '', trainerName: '', stableName: '', imageUrl: '', dateOfBirth: ''
    },
  });

  const watchRegistrationType = watch('registrationType');
  const watchClaimedScore = watch('claimedScore');
  const watchImageUrl = watch('imageUrl');

  const scoreToClass = (score) => {
    const s = Number(score);
    if (s >= 80) return 1;
    if (s >= 60) return 2;
    if (s >= 40) return 3;
    if (s >= 20) return 4;
    return 5;
  };

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
        breed: data.breed.trim(),
        color: data.color?.trim() || '',
        pedigree: data.pedigree?.trim() || '',
        trainerName: data.trainerName?.trim() || '',
        stableName: data.stableName?.trim() || '',
        imageUrl: data.imageUrl?.trim() || '',
        dateOfBirth: data.dateOfBirth || null,
        age: Number(data.age),
        gender: data.gender,
        healthNote: data.healthNote?.trim() || '',
        registrationType: data.registrationType,
        claimedScore: data.claimedScore || undefined,
        claimedClass: data.registrationType === 'PREVIOUSLY_REGISTERED' ? scoreToClass(data.claimedScore) : undefined,
        evidenceLink: data.registrationType === 'PREVIOUSLY_REGISTERED' ? data.evidenceLink?.trim() : undefined,
      });
      setToast({ message: `"${data.name}" đã được đăng ký thành công.`, variant: 'success' });
      reset();
      setIsAdding(false);
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Đăng ký ngựa thất bại.'), variant: 'danger' });
    }
  };

  const filteredHorses = useMemo(() => horses.filter((h) => {
    const matchSearch = !search || (h.name || '').toLowerCase().includes(search.trim().toLowerCase());
    const matchClass = !filterClass || String(h.horseClass ?? 5) === filterClass;
    const matchStatus = !filterStatus || String(h.status || '').toLowerCase() === filterStatus;
    return matchSearch && matchClass && matchStatus;
  }), [horses, search, filterClass, filterStatus]);

  const pageHorses = filteredHorses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (setter) => (e) => { setter(e.target.value); setPage(1); };

  return (
    <div className="owner-context">
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
                  <Form.Label>Giống ngựa <span style={{ color: '#e55' }}>*</span></Form.Label>
                  <Form.Control
                    placeholder="VD: Thoroughbred..."
                    {...register('breed', { required: 'Giống ngựa là bắt buộc' })}
                    isInvalid={!!errors.breed}
                  />
                  <Form.Control.Feedback type="invalid">{errors.breed?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Màu sắc</Form.Label>
                  <Form.Control
                    placeholder="VD: Nâu, Đen..."
                    {...register('color')}
                  />
                  <Form.Text className="text-muted">Để trống sẽ dùng theo Giống ngựa.</Form.Text>
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
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Giới tính <span style={{ color: '#e55' }}>*</span></Form.Label>
                  <Form.Select {...register('gender', { required: 'Giới tính là bắt buộc' })} isInvalid={!!errors.gender}>
                    <option value="M">Đực (Male)</option>
                    <option value="F">Cái (Female)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Ngày sinh</Form.Label>
                  <Form.Control
                    type="date"
                    {...register('dateOfBirth')}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Huyết thống (Pedigree)</Form.Label>
                  <Form.Control
                    placeholder="VD: Sire x Dam"
                    {...register('pedigree')}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Huấn luyện viên</Form.Label>
                  <Form.Control
                    placeholder="VD: John Doe"
                    {...register('trainerName')}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Trang trại (Stable)</Form.Label>
                  <Form.Control
                    placeholder="VD: Golden Stable"
                    {...register('stableName')}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Ảnh ngựa</Form.Label>
                  <div className="d-flex align-items-center gap-2">
                    <ImageDropzone
                      size={44}
                      value={watchImageUrl}
                      onUploaded={(url) => setValue('imageUrl', url, { shouldDirty: true })}
                      onError={(msg) => setToast({ message: msg, variant: 'danger' })}
                    />
                    <Form.Control
                      placeholder="hoặc dán URL ảnh..."
                      {...register('imageUrl')}
                    />
                  </div>
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
                      <Form.Label>Hạng khai báo (tự tính)</Form.Label>
                      <div style={{ background: '#1a1f2e', border: '1px solid #2d3748', borderRadius: 6, padding: '0.5rem 0.75rem', color: '#fbbf24', fontWeight: 700, fontSize: 15, minHeight: 38, display: 'flex', alignItems: 'center' }}>
                        {watchClaimedScore ? `Class ${scoreToClass(watchClaimedScore)}` : 'Nhập điểm để xem class'}
                      </div>
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

      {/* Tìm kiếm / lọc */}
      {!loading && !error && horses.length > 0 && (
        <div className="lux-panel mb-3">
          <Row className="g-3 align-items-end">
            <Col md={5}>
              <Form.Group>
                <Form.Label style={{ fontSize: 13 }}>Tìm theo tên ngựa</Form.Label>
                <Form.Control
                  placeholder="VD: Thần Mã..."
                  value={search}
                  onChange={handleFilterChange(setSearch)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label style={{ fontSize: 13 }}>Hạng (Class)</Form.Label>
                <Form.Select value={filterClass} onChange={handleFilterChange(setFilterClass)}>
                  <option value="">Tất cả hạng</option>
                  {[1, 2, 3, 4, 5].map((c) => <option key={c} value={c}>Class {c}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label style={{ fontSize: 13 }}>Trạng thái</Form.Label>
                <Form.Select value={filterStatus} onChange={handleFilterChange(setFilterStatus)}>
                  {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </div>
      )}

      {/* Horse grid */}
      {loading && <Loading />}
      {!loading && error && <ErrorState message={error} onRetry={refetch} />}
      {!loading && !error && horses.length === 0 && (
        <EmptyState message="Bạn chưa có ngựa nào trong chuồng." />
      )}
      {!loading && !error && horses.length > 0 && filteredHorses.length === 0 && (
        <EmptyState message="Không tìm thấy ngựa nào khớp bộ lọc." />
      )}
      {!loading && !error && filteredHorses.length > 0 && (
        <>
          <div className="owner-section-label">
            <h5>{filteredHorses.length} con ngựa</h5>
          </div>
          <div className="row g-3">
            {pageHorses.map((h) => (
              <div className="col-12 col-sm-6 col-xl-4" key={h.id}>
                <HorseProfileCard horse={h} showHistory />
              </div>
            ))}
          </div>
          <Pagination page={page} pageSize={PAGE_SIZE} total={filteredHorses.length} onPageChange={setPage} />
        </>
      )}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
