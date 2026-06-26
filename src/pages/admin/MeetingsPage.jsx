import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Modal } from 'react-bootstrap';
import { meetingService } from '../../services/meetingService';
import { seasonService } from '../../services/seasonService';
import { racecourseService } from '../../services/racecourseService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Toaster from '../../components/common/Toaster';
import './season-wizard.css';

const PAGE_SIZE = 10;

export default function MeetingsPage() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [racecourses, setRacecourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [editRow, setEditRow] = useState(null);

  const {
    register: regEdit,
    handleSubmit: submitEdit,
    formState: { errors: editErrors },
    reset: resetEdit,
    watch: watchEdit,
  } = useForm();

  const watchedEditSeasonId = watchEdit('seasonId');

  const load = () => {
    Promise.all([meetingService.getAll(), seasonService.getAll(), racecourseService.getAll().catch(() => [])])
      .then(([m, s, rc]) => { setMeetings(m); setSeasons(s); setRacecourses(rc); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách meeting.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (editRow) {
      resetEdit({
        seasonId: editRow.seasonId ? String(editRow.seasonId) : '',
        name: editRow.name ?? '',
        racecourseId: editRow.racecourseId ? String(editRow.racecourseId) : '',
        date: editRow.date ? editRow.date.slice(0, 10) : '',
      });
    }
  }, [editRow, resetEdit]);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const validateDateWithinSeason = (dateValue, seasonId) => {
    if (!seasonId || !dateValue) return true;
    const season = seasons.find((s) => s.id === Number(seasonId));
    if (!season) return true;

    const meetingDate = new Date(dateValue);
    const seasonStart = new Date(season.startDate);
    seasonStart.setHours(0, 0, 0, 0);
    const seasonEnd = new Date(season.endDate);
    seasonEnd.setHours(23, 59, 59, 999);

    if (meetingDate < seasonStart || meetingDate > seasonEnd) {
      const startDateStr = new Date(season.startDate).toLocaleDateString('vi-VN');
      const endDateStr = new Date(season.endDate).toLocaleDateString('vi-VN');
      return `Ngày meeting phải nằm trong khoảng của season (${startDateStr} - ${endDateStr})`;
    }
    return true;
  };

  const onUpdate = async (data) => {
    try {
      await meetingService.update(editRow.id, {
        ...data,
        seasonId: Number(data.seasonId),
        racecourseId: data.racecourseId ? Number(data.racecourseId) : editRow.racecourseId,
      });
      setToast({ message: 'Cập nhật meeting thành công.', variant: 'success' });
      setEditRow(null);
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cập nhật thất bại.'), variant: 'danger' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xoá meeting này?')) return;
    try {
      await meetingService.remove(id);
      setToast({ message: 'Đã xoá meeting.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Xoá thất bại.'), variant: 'danger' });
    }
  };

  const seasonName = (id) => seasons.find((s) => s.id === id)?.name ?? id;

  const columns = [
    { key: 'name', label: 'Tên meeting' },
    { key: 'seasonId', label: 'Season', render: (r) => seasonName(r.seasonId) },
    { key: 'racecourseName', label: 'Đường đua', render: (r) => r.racecourseName || '-' },
    { key: 'date', label: 'Ngày', render: (r) => formatDate(r.date) },
    {
      key: 'actions',
      label: 'Hành động',
      render: (row) => (
        <div className="d-flex gap-2">
          <button className="btn-gold-sm" onClick={() => navigate(`/admin/meetings/${row.id}/edit`)}>Sửa</button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}>Xoá</button>
        </div>
      ),
    },
  ];
  const pageRows = meetings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="season-admin-page">
      <section className="season-list-section">
        <div className="page-header">
          <h2>Danh sách Meeting</h2>
          <Button className="season-create-toggle" onClick={() => navigate('/admin/meetings/create')}>
            + Tạo Meeting
          </Button>
        </div>

        {loading && <Loading />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && meetings.length === 0 && <EmptyState message="Chưa có meeting nào." />}
        {!loading && !error && meetings.length > 0 && (
          <>
            <DataTable columns={columns} rows={pageRows} />
            <Pagination page={page} pageSize={PAGE_SIZE} total={meetings.length} onPageChange={setPage} />
          </>
        )}
      </section>

      <Modal show={!!editRow} onHide={() => setEditRow(null)} centered>
        <Modal.Header closeButton style={{ background: '#1a1a2e', borderColor: '#333' }}>
          <Modal.Title style={{ color: '#D4AF37' }}>Sửa Meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#1a1a2e' }}>
          <Form onSubmit={submitEdit(onUpdate)} className="d-flex flex-column gap-3" noValidate>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Season</Form.Label>
              <Form.Select {...regEdit('seasonId', { required: 'Chọn season' })} isInvalid={!!editErrors.seasonId}>
                <option value="">-- Chọn season --</option>
                {seasons.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{editErrors.seasonId?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Tên meeting</Form.Label>
              <Form.Control {...regEdit('name', { required: 'Tên meeting là bắt buộc' })} isInvalid={!!editErrors.name} />
              <Form.Control.Feedback type="invalid">{editErrors.name?.message}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Đường đua</Form.Label>
              <Form.Select {...regEdit('racecourseId')}>
                <option value="">-- Chọn đường đua --</option>
                {racecourses.map((rc) => (
                  <option key={rc.racecourseId} value={rc.racecourseId}>
                    {rc.racecourseName}{rc.location ? ` - ${rc.location}` : ''}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37' }}>Ngày</Form.Label>
              <Form.Control
                type="date"
                {...regEdit('date', {
                  required: 'Ngày là bắt buộc',
                  validate: (value) => validateDateWithinSeason(value, watchedEditSeasonId),
                })}
                isInvalid={!!editErrors.date}
              />
              <Form.Control.Feedback type="invalid">{editErrors.date?.message}</Form.Control.Feedback>
            </Form.Group>
            <div className="d-flex justify-content-end gap-2 mt-2">
              <Button variant="secondary" onClick={() => setEditRow(null)}>Huỷ</Button>
              <Button type="submit" className="btn-gold-sm">Lưu</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
