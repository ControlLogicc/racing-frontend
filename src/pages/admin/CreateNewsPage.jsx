import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { ArrowLeft, Newspaper } from 'react-bootstrap-icons';
import { newsService } from '../../services/newsService';
import { getApiErrorMessage } from '../../utils/apiError';
import Toaster from '../../components/common/Toaster';
import ImageDropzone from '../../components/common/ImageDropzone';
import './season-wizard.css';

const EMPTY_FORM = {
  title: '', summary: '', content: '', thumbnailUrl: '', externalLink: '',
  publishDate: '', status: 'published',
};

export default function CreateNewsPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({ defaultValues: EMPTY_FORM });

  const watchedTitle = watch('title');
  const watchedThumbnail = watch('thumbnailUrl');
  const watchedStatus = watch('status');

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await newsService.create({
        title: data.title.trim(),
        summary: data.summary?.trim() || undefined,
        content: data.content?.trim() || undefined,
        thumbnailUrl: data.thumbnailUrl?.trim() || undefined,
        externalLink: data.externalLink?.trim() || undefined,
        publishDate: data.publishDate ? new Date(data.publishDate).toISOString() : undefined,
        status: data.status,
      });
      setToast({ message: 'Đã tạo tin tức thành công.', variant: 'success' });
      reset(EMPTY_FORM);
      navigate('/admin/news');
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tạo tin tức thất bại.'), variant: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="season-admin-page">
      <div className="season-wizard-shell">
        <Form className="season-wizard-grid" noValidate onSubmit={handleSubmit(onSubmit)}>
          <section className="season-panel season-form-panel">
            <div className="season-panel-heading">
              <h2>Tạo tin tức mới</h2>
              <p>Đăng tin tức, thông báo hiển thị công khai cho mọi người xem.</p>
            </div>

            <Form.Group className="season-field">
              <Form.Label>Tiêu đề <span>*</span></Form.Label>
              <Form.Control
                placeholder="VD: Mở đăng ký mùa giải Summer 2026..."
                {...register('title', { required: 'Tiêu đề là bắt buộc', maxLength: { value: 255, message: 'Tối đa 255 ký tự' } })}
                isInvalid={!!errors.title}
              />
              <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="season-field">
              <Form.Label>Tóm tắt</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                maxLength={1000}
                placeholder="Tóm tắt ngắn hiện ở danh sách tin tức..."
                {...register('summary')}
              />
            </Form.Group>

            <Form.Group className="season-field">
              <Form.Label>Nội dung</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                placeholder="Nội dung đầy đủ của bài viết..."
                {...register('content')}
              />
            </Form.Group>

            <Form.Group className="season-field">
              <Form.Label>Ảnh thumbnail</Form.Label>
              <div className="d-flex align-items-center gap-2">
                <ImageDropzone
                  size={44}
                  value={watchedThumbnail}
                  onUploaded={(url) => setValue('thumbnailUrl', url, { shouldDirty: true })}
                  onError={(msg) => setToast({ message: msg, variant: 'danger' })}
                />
                <Form.Control
                  placeholder="hoặc dán URL ảnh..."
                  {...register('thumbnailUrl')}
                />
              </div>
            </Form.Group>

            <Form.Group className="season-field">
              <Form.Label>Link ngoài (tuỳ chọn)</Form.Label>
              <Form.Control
                placeholder="https://..."
                {...register('externalLink', {
                  pattern: { value: /^(https?:\/\/\S+)?$/, message: 'Link phải là URL http(s) hợp lệ' },
                })}
                isInvalid={!!errors.externalLink}
              />
              <Form.Control.Feedback type="invalid">{errors.externalLink?.message}</Form.Control.Feedback>
            </Form.Group>

            <div className="season-form-duo">
              <Form.Group className="season-field">
                <Form.Label>Ngày đăng (để trống = ngay bây giờ)</Form.Label>
                <Form.Control type="datetime-local" {...register('publishDate')} />
              </Form.Group>

              <Form.Group className="season-field">
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select {...register('status')}>
                  <option value="published">Published (Công khai ngay)</option>
                  <option value="draft">Draft (Bản nháp)</option>
                  <option value="hidden">Hidden (Ẩn)</option>
                </Form.Select>
              </Form.Group>
            </div>
          </section>

          <aside className="season-panel season-summary-panel">
            <Newspaper className="season-summary-icon" />
            <h3>Xem trước</h3>
            <div className="season-summary-list">
              <div className="season-summary-row">
                <Newspaper />
                <span>Tiêu đề</span>
                <strong>{watchedTitle || '-'}</strong>
              </div>
              <div className="season-summary-row">
                <Newspaper />
                <span>Trạng thái</span>
                <strong>{watchedStatus}</strong>
              </div>
            </div>
          </aside>
        </Form>

        <div className="season-wizard-footer">
          <Button type="button" className="season-btn season-btn-ghost" onClick={() => navigate('/admin/news')}>
            <ArrowLeft /> Back
          </Button>
          <div className="season-footer-actions">
            <Button type="button" className="season-btn season-btn-primary" disabled={submitting} onClick={handleSubmit(onSubmit)}>
              {submitting ? 'Đang tạo...' : 'Tạo tin tức'}
            </Button>
          </div>
        </div>
      </div>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
