import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Modal, Badge, Row, Col } from 'react-bootstrap';
import { newsService } from '../../services/newsService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Toaster from '../../components/common/Toaster';
import ImageDropzone from '../../components/common/ImageDropzone';
import './season-wizard.css';

const PAGE_SIZE = 10;
const STATUS_BADGE = { draft: 'secondary', published: 'success', hidden: 'warning', deleted: 'danger' };
const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'deleted', label: 'Deleted' },
];

export default function AdminNewsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1); // 1-indexed cho Pagination component
  const [filterStatus, setFilterStatus] = useState('');
  const [editRow, setEditRow] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [actioningId, setActioningId] = useState(null);

  const {
    register: regEdit,
    handleSubmit: submitEdit,
    formState: { errors: editErrors },
    reset: resetEdit,
    watch: watchEdit,
    setValue: setValueEdit,
  } = useForm();

  const watchEditThumbnail = watchEdit('thumbnailUrl');

  const load = () => {
    setLoading(true);
    setError('');
    newsService.getAdminAll(filterStatus, page - 1, PAGE_SIZE)
      .then((res) => { setItems(res.items); setTotalElements(res.totalElements); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách tin tức.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = () => load();

  const handleFilterChange = (e) => { setFilterStatus(e.target.value); setPage(1); };

  useEffect(() => {
    if (editRow) {
      resetEdit({
        title: editRow.title || '',
        summary: editRow.summary || '',
        content: editRow.content || '',
        thumbnailUrl: editRow.thumbnailUrl || '',
        externalLink: editRow.externalLink || '',
        publishDate: editRow.publishDate ? editRow.publishDate.slice(0, 16) : '',
      });
    }
  }, [editRow, resetEdit]);

  const onUpdate = async (data) => {
    setSavingEdit(true);
    try {
      await newsService.update(editRow.id, {
        title: data.title.trim(),
        summary: data.summary?.trim() || undefined,
        content: data.content?.trim() || undefined,
        thumbnailUrl: data.thumbnailUrl?.trim() || undefined,
        externalLink: data.externalLink?.trim() || undefined,
        publishDate: data.publishDate ? new Date(data.publishDate).toISOString() : undefined,
      });
      setToast({ message: 'Đã cập nhật tin tức.', variant: 'success' });
      setEditRow(null);
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cập nhật thất bại.'), variant: 'danger' });
    } finally {
      setSavingEdit(false);
    }
  };

  const runAction = async (id, fn, successMsg, failMsg) => {
    setActioningId(id);
    try {
      await fn(id);
      setToast({ message: successMsg, variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, failMsg), variant: 'danger' });
    } finally {
      setActioningId(null);
    }
  };

  const handlePublish = (row) => runAction(row.id, newsService.publish, 'Đã công khai tin tức.', 'Công khai thất bại.');
  const handleHide = (row) => runAction(row.id, newsService.hide, 'Đã ẩn tin tức.', 'Ẩn thất bại.');
  const handleDelete = (row) => {
    if (!window.confirm(`Xoá tin tức "${row.title}"?`)) return;
    runAction(row.id, newsService.remove, 'Đã xoá tin tức.', 'Xoá thất bại.');
  };

  const columns = [
    { key: 'title', label: 'Tiêu đề', render: (row) => <span style={{ fontWeight: 600, color: '#f0e8d0' }}>{row.title}</span> },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row) => <Badge bg={STATUS_BADGE[row.status] ?? 'secondary'}>{row.status?.toUpperCase()}</Badge>,
    },
    { key: 'publishDate', label: 'Ngày đăng', render: (row) => formatDate(row.publishDate) },
    {
      key: 'actions',
      label: 'Hành động',
      render: (row) => (
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn-gold-sm" onClick={() => setEditRow(row)}>Sửa</button>
          {row.status !== 'published' && row.status !== 'deleted' && (
            <button className="btn btn-sm btn-outline-success" disabled={actioningId === row.id} onClick={() => handlePublish(row)}>Công khai</button>
          )}
          {row.status === 'published' && (
            <button className="btn btn-sm btn-outline-warning" disabled={actioningId === row.id} onClick={() => handleHide(row)}>Ẩn</button>
          )}
          {row.status !== 'deleted' && (
            <button className="btn btn-sm btn-outline-danger" disabled={actioningId === row.id} onClick={() => handleDelete(row)}>Xoá</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="season-admin-page">
      <section className="season-list-section">
        <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h2>Quản lý Tin tức</h2>
          <Button className="season-create-toggle" onClick={() => navigate('/admin/news/create')}>
            + Tạo tin tức
          </Button>
        </div>

        <Row className="g-3 align-items-end mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label style={{ fontSize: 13 }}>Lọc theo trạng thái</Form.Label>
              <Form.Select value={filterStatus} onChange={handleFilterChange}>
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {loading && <Loading />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && items.length === 0 && <EmptyState message="Chưa có tin tức nào." />}
        {!loading && !error && items.length > 0 && (
          <>
            <DataTable columns={columns} rows={items} rowKey="id" />
            <Pagination page={page} pageSize={PAGE_SIZE} total={totalElements} onPageChange={setPage} />
          </>
        )}
      </section>

      {/* Modal sửa tin tức */}
      <Modal show={!!editRow} onHide={() => setEditRow(null)} centered size="lg">
        <Modal.Header closeButton style={{ background: '#1a1a2e', borderColor: '#333' }}>
          <Modal.Title style={{ color: '#D4AF37' }}>Sửa tin tức</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#1a1a2e' }}>
          <Form onSubmit={submitEdit(onUpdate)} className="d-flex flex-column gap-3" noValidate>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Tiêu đề</Form.Label>
              <Form.Control
                {...regEdit('title', { required: 'Tiêu đề là bắt buộc', maxLength: { value: 255, message: 'Tối đa 255 ký tự' } })}
                isInvalid={!!editErrors.title}
              />
              <Form.Control.Feedback type="invalid">{editErrors.title?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Tóm tắt</Form.Label>
              <Form.Control as="textarea" rows={2} maxLength={1000} {...regEdit('summary')} />
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Nội dung</Form.Label>
              <Form.Control as="textarea" rows={5} {...regEdit('content')} />
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Ảnh thumbnail</Form.Label>
              <div className="d-flex align-items-center gap-2">
                <ImageDropzone
                  size={44}
                  value={watchEditThumbnail}
                  onUploaded={(url) => setValueEdit('thumbnailUrl', url, { shouldDirty: true })}
                  onError={(msg) => setToast({ message: msg, variant: 'danger' })}
                />
                <Form.Control {...regEdit('thumbnailUrl')} placeholder="hoặc dán URL ảnh..." />
              </div>
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Link ngoài</Form.Label>
              <Form.Control
                {...regEdit('externalLink', {
                  pattern: { value: /^(https?:\/\/\S+)?$/, message: 'Link phải là URL http(s) hợp lệ' },
                })}
                isInvalid={!!editErrors.externalLink}
              />
              <Form.Control.Feedback type="invalid">{editErrors.externalLink?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Ngày đăng</Form.Label>
              <Form.Control type="datetime-local" {...regEdit('publishDate')} />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2 mt-2">
              <Button variant="secondary" onClick={() => setEditRow(null)}>Huỷ</Button>
              <Button type="submit" className="btn-gold-sm" disabled={savingEdit}>{savingEdit ? 'Đang lưu...' : 'Lưu'}</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
