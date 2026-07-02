import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { ArrowLeft, EnvelopeFill, PersonBadgeFill, PersonFill, TelephoneFill } from 'react-bootstrap-icons';
import { userService } from '../../services/userService';
import { ROLES } from '../../constants/roles';
import { getApiErrorMessage } from '../../utils/apiError';
import Toaster from '../../components/common/Toaster';
import ImageDropzone from '../../components/common/ImageDropzone';
import './season-wizard.css';

const EMPTY_FORM = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  role: ROLES.SPECTATOR,
  staffCode: '',
  department: '',
  licenseNo: '',
  weight: '',
  experienceYears: '',
  height: '',
  nationality: '',
  jockeyLicenseNumber: '',
  achievements: '',
  imageUrl: '',
  dateOfBirth: '',
};

const ROLE_OPTIONS = Object.values(ROLES);

const roleLabel = (role) => role ? role.toUpperCase() : '-';

export default function CreateUserPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    defaultValues: EMPTY_FORM,
    shouldUnregister: true,
  });

  const selectedRole = watch('role');
  const watchedName = watch('fullName');
  const watchedEmail = watch('email');
  const watchedPhone = watch('phone');
  const watchImageUrl = watch('imageUrl');

  const onSubmit = async (data) => {
    try {
      await userService.create(data);
      setToast({ message: 'Tạo tài khoản thành công.', variant: 'success' });
      reset(EMPTY_FORM);
      navigate('/admin/users');
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tạo tài khoản thất bại.'), variant: 'danger' });
    }
  };

  return (
    <div className="season-admin-page">
      <div className="season-wizard-shell">
        <Form className="season-wizard-grid" noValidate onSubmit={handleSubmit(onSubmit)}>
          <section className="season-panel season-form-panel">
            <div className="season-panel-heading">
              <h2>Tạo tài khoản mới</h2>
              <p>Khởi tạo user và profile theo từng role trong hệ thống.</p>
            </div>

            <Form.Group className="season-field">
              <Form.Label>Họ tên <span>*</span></Form.Label>
              <Form.Control
                {...register('fullName', { required: 'Họ tên là bắt buộc' })}
                isInvalid={!!errors.fullName}
                placeholder="Nguyễn Văn A"
              />
              <Form.Control.Feedback type="invalid">{errors.fullName?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="season-field">
              <Form.Label>Email <span>*</span></Form.Label>
              <Form.Control
                type="email"
                {...register('email', {
                  required: 'Email là bắt buộc',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không hợp lệ' },
                })}
                isInvalid={!!errors.email}
                placeholder="user@example.com"
              />
              <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="season-field">
              <Form.Label>Mật khẩu <span>*</span></Form.Label>
              <Form.Control
                type="password"
                {...register('password', {
                  required: 'Mật khẩu là bắt buộc',
                  minLength: { value: 6, message: 'Mật khẩu ít nhất 6 ký tự' },
                })}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
            </Form.Group>

            <div className="season-form-duo">
              <Form.Group className="season-field">
                <Form.Label>Số điện thoại</Form.Label>
                <Form.Control type="tel" {...register('phone')} placeholder="0901234567" />
              </Form.Group>

              <Form.Group className="season-field">
                <Form.Label>Role <span>*</span></Form.Label>
                <Form.Select {...register('role', { required: true })}>
                  {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
                </Form.Select>
              </Form.Group>
            </div>

            {selectedRole === ROLES.STAFF && (
              <div className="season-form-duo">
                <Form.Group className="season-field">
                  <Form.Label>Mã nhân viên <span>*</span></Form.Label>
                  <Form.Control
                    {...register('staffCode', { required: 'Mã nhân viên là bắt buộc' })}
                    isInvalid={!!errors.staffCode}
                    placeholder="STF-123"
                  />
                  <Form.Control.Feedback type="invalid">{errors.staffCode?.message}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="season-field">
                  <Form.Label>Phòng ban <span>*</span></Form.Label>
                  <Form.Control
                    {...register('department', { required: 'Phòng ban là bắt buộc' })}
                    isInvalid={!!errors.department}
                    placeholder="Operations"
                  />
                  <Form.Control.Feedback type="invalid">{errors.department?.message}</Form.Control.Feedback>
                </Form.Group>
              </div>
            )}

            {selectedRole === ROLES.REFEREE && (
              <Form.Group className="season-field">
                <Form.Label>Số giấy phép trọng tài <span>*</span></Form.Label>
                <Form.Control
                  {...register('licenseNo', { required: 'Số giấy phép là bắt buộc' })}
                  isInvalid={!!errors.licenseNo}
                  placeholder="LIC-12345"
                />
                <Form.Control.Feedback type="invalid">{errors.licenseNo?.message}</Form.Control.Feedback>
              </Form.Group>
            )}

            {selectedRole === ROLES.JOCKEY && (
              <div className="season-form-duo">
                <Form.Group className="season-field">
                  <Form.Label>Cân nặng (kg) <span>*</span></Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    {...register('weight', {
                      required: 'Cân nặng là bắt buộc',
                      min: { value: 30, message: 'Cân nặng phải từ 30kg đến 80kg' },
                      max: { value: 80, message: 'Cân nặng phải từ 30kg đến 80kg' },
                    })}
                    isInvalid={!!errors.weight}
                    placeholder="52.5"
                  />
                  <Form.Control.Feedback type="invalid">{errors.weight?.message}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="season-field">
                  <Form.Label>Số năm kinh nghiệm <span>*</span></Form.Label>
                  <Form.Control
                    type="number"
                    {...register('experienceYears', {
                      required: 'Kinh nghiệm là bắt buộc',
                      min: { value: 0, message: 'Số năm kinh nghiệm không thể âm' },
                    })}
                    isInvalid={!!errors.experienceYears}
                    placeholder="5"
                  />
                  <Form.Control.Feedback type="invalid">{errors.experienceYears?.message}</Form.Control.Feedback>
                </Form.Group>
              </div>
            )}

            {selectedRole === ROLES.JOCKEY && (
              <>
                <div className="season-form-duo">
                  <Form.Group className="season-field">
                    <Form.Label>Chiều cao (cm)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      {...register('height', {
                        min: { value: 1, message: 'Chiều cao không hợp lệ' },
                      })}
                      isInvalid={!!errors.height}
                      placeholder="170"
                    />
                    <Form.Control.Feedback type="invalid">{errors.height?.message}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="season-field">
                    <Form.Label>Quốc tịch</Form.Label>
                    <Form.Control {...register('nationality')} placeholder="VN" />
                  </Form.Group>
                </div>

                <div className="season-form-duo">
                  <Form.Group className="season-field">
                    <Form.Label>Số giấy phép Jockey</Form.Label>
                    <Form.Control {...register('jockeyLicenseNumber')} placeholder="L-12345" />
                  </Form.Group>

                  <Form.Group className="season-field">
                    <Form.Label>Ngày sinh</Form.Label>
                    <Form.Control type="date" {...register('dateOfBirth')} />
                  </Form.Group>
                </div>

                <Form.Group className="season-field">
                  <Form.Label>Ảnh đại diện</Form.Label>
                  <div className="d-flex align-items-center gap-3">
                    <ImageDropzone
                      size={48}
                      rounded
                      value={watchImageUrl}
                      onUploaded={(url) => setValue('imageUrl', url, { shouldDirty: true })}
                      onError={(msg) => setToast({ message: msg, variant: 'danger' })}
                    />
                    <Form.Control {...register('imageUrl')} placeholder="hoặc dán URL ảnh..." />
                  </div>
                </Form.Group>

                <Form.Group className="season-field">
                  <Form.Label>Thành tích nổi bật</Form.Label>
                  <Form.Control as="textarea" rows={2} {...register('achievements')} placeholder="Vô địch giải đấu X..." />
                </Form.Group>
              </>
            )}
          </section>

          <aside className="season-panel season-summary-panel">
            <PersonBadgeFill className="season-summary-icon" />
            <h3>User Summary</h3>
            <div className="season-summary-list">
              <div className="season-summary-row"><PersonFill /><span>Họ tên</span><strong>{watchedName || '-'}</strong></div>
              <div className="season-summary-row"><EnvelopeFill /><span>Email</span><strong>{watchedEmail || '-'}</strong></div>
              <div className="season-summary-row"><TelephoneFill /><span>Điện thoại</span><strong>{watchedPhone || '-'}</strong></div>
              <div className="season-summary-row"><PersonBadgeFill /><span>Role</span><strong>{roleLabel(selectedRole)}</strong></div>
            </div>
          </aside>

        </Form>

        <div className="season-wizard-footer">
          <Button type="button" className="season-btn season-btn-ghost" onClick={() => navigate('/admin/users')}>
            <ArrowLeft /> Back
          </Button>
          <div className="season-footer-actions">
            <Button type="button" className="season-btn season-btn-primary" onClick={handleSubmit(onSubmit)}>
              Tạo tài khoản
            </Button>
          </div>
        </div>
      </div>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
