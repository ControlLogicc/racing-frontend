import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Modal, Button, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { horseService } from '../../services/horseService';
import { resultService } from '../../services/resultService';
import { seasonService } from '../../services/seasonService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { RACE_RESULT_STATUS } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Toaster from '../../components/common/Toaster';
import './owner-theme.css';

const PAGE_SIZE = 10;
const POSITION_MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };

function getClassInfo(rating) {
  if (rating >= 85) return { label: 'Class 1', css: 'horse-class-1' };
  if (rating >= 80) return { label: 'Class 2', css: 'horse-class-2' };
  if (rating >= 60) return { label: 'Class 3', css: 'horse-class-3' };
  if (rating >= 40) return { label: 'Class 4', css: 'horse-class-other' };
  return { label: 'Class 5', css: 'horse-class-other' };
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="lux-stat-card" style={{ flex: 1, minWidth: 130 }}>
      <div className="lux-stat-icon" style={{ fontSize: 18 }}>{icon}</div>
      <div className="lux-stat-value" style={{ fontSize: '1.8rem', color: color ?? '#D4AF37' }}>{value}</div>
      <div className="lux-stat-label">{label}</div>
    </div>
  );
}

export default function HorseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [horse, setHorse] = useState(null);
  const [results, setResults] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [seasonFilter, setSeasonFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    Promise.all([
      horseService.getById(Number(id)),
      resultService.getByHorse(Number(id)),
      seasonService.getAll(),
    ])
      .then(([h, r, s]) => {
        setHorse(h);
        setResults(r.filter(
          (res) => res.resultStatus === RACE_RESULT_STATUS.PUBLISHED
            || res.resultStatus === RACE_RESULT_STATUS.FINAL_EDITED_BY_STAFF
        ));
        setSeasons(s);
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được dữ liệu.')))
      .finally(() => setLoading(false));
  }, [id]);

  const filtered = useMemo(() => {
    if (!seasonFilter) return results;
    return results.filter((r) => String(r.seasonId) === seasonFilter);
  }, [results, seasonFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const stats = useMemo(() => ({
    wins: filtered.filter((r) => r.position === 1).length,
    top3: filtered.filter((r) => r.position <= 3).length,
    totalPrize: filtered.reduce((sum, r) => sum + (r.prize ?? 0), 0),
    races: filtered.length,
  }), [filtered]);

  const columns = [
    { key: 'raceName', label: 'Race' },
    { key: 'raceDate', label: 'Ngày đua', render: (r) => formatDate(r.raceDate) },
    { key: 'seasonName', label: 'Season' },
    {
      key: 'position',
      label: 'Vị trí',
      render: (r) => (
        <span style={{ fontWeight: 700, color: r.position === 1 ? '#D4AF37' : r.position <= 3 ? '#cd8c4a' : '#c8bea0' }}>
          {POSITION_MEDAL[r.position] ?? `#${r.position}`}
          {r.position > 3 ? ` ${r.position}` : ''}
        </span>
      ),
    },
    {
      key: 'prize',
      label: 'Giải thưởng',
      render: (r) => (
        <span style={{ color: r.prize ? '#4caf7d' : '#555', fontWeight: 600 }}>
          {r.prize ? `₫${r.prize.toLocaleString()}` : '—'}
        </span>
      ),
    },
    { key: 'finishTime', label: 'Thời gian' },
    { key: 'jockeyName', label: 'Jockey' },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!horse) return <ErrorState message="Không tìm thấy ngựa." />;

  const handleEditOpen = () => {
    reset({
      name: horse.name,
      breed: horse.breed,
      age: horse.age,
      gender: horse.gender,
      healthNote: horse.healthNote,
      status: horse.status,
    });
    setShowEdit(true);
  };

  const handleEditSubmit = async (data) => {
    try {
      const updated = await horseService.update(horse.id, data);
      setHorse(updated);
      setToast({ message: 'Cập nhật thông tin ngựa thành công', variant: 'success' });
      setShowEdit(false);
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cập nhật thất bại'), variant: 'danger' });
    }
  };

  const handleDelete = async () => {
    try {
      await horseService.remove(horse.id);
      navigate('/owner/horses');
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Xoá ngựa thất bại'), variant: 'danger' });
      setShowDelete(false);
    }
  };

  const cls = horse.rating != null ? getClassInfo(horse.rating) : null;
  const ratingPct = Math.min(100, horse.rating ?? 0);

  return (
    <div>
      {/* ── Back + Hero ──────────────────────────────────────── */}
      <div className="owner-hero mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button
            onClick={() => navigate('/owner/horses')}
            style={{
              background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)',
              color: '#D4AF37', borderRadius: 8, padding: '6px 14px', fontSize: 13,
              cursor: 'pointer', fontWeight: 600,
            }}
          >
            ← Chuồng ngựa
          </button>
          <div className="d-flex gap-2">
            <button className="btn-outline-gold-sm" onClick={handleEditOpen}>
              Sửa thông tin
            </button>
            <button className="btn-outline-gold-sm" style={{ color: '#e55', borderColor: '#e55' }} onClick={() => setShowDelete(true)}>
              Xoá ngựa
            </button>
          </div>
        </div>

        <div className="d-flex align-items-center gap-4 flex-wrap">
          {/* Avatar */}
          <div style={{
            width: 88, height: 88, flexShrink: 0,
            background: 'linear-gradient(135deg,rgba(212,175,55,.2),rgba(212,175,55,.05))',
            border: '2px solid rgba(212,175,55,.3)', borderRadius: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42,
          }}>
            🐎
          </div>

          {/* Info */}
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-3 flex-wrap mb-1">
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f0e8d0', letterSpacing: -0.5 }}>
                {horse.name}
              </div>
              {cls && <span className={`horse-class-badge ${cls.css}`}>{cls.label}</span>}
              {horse.ratingVerified === false && horse.registrationType === 'PREVIOUSLY_REGISTERED' && (
                <span style={{ fontSize: '0.75rem', background: 'rgba(238,85,85,0.15)', color: '#ff6b6b', padding: '4px 8px', borderRadius: 6, fontWeight: 'bold' }}>
                  Đang chờ duyệt điểm
                </span>
              )}
            </div>
            <div style={{ color: '#6a6250', fontSize: '0.88rem', marginBottom: 14 }}>
              {horse.breed} &nbsp;·&nbsp; {horse.age} tuổi
            </div>

            {/* Rating bar */}
            <div style={{ maxWidth: 280 }}>
              <div className="horse-rating-label" style={{ marginBottom: 6 }}>
                <span style={{ fontSize: '0.78rem', color: '#5a5040', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Performance Rating
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#D4AF37' }}>
                  {horse.rating ?? '—'}
                </span>
              </div>
              <div className="horse-rating-track" style={{ height: 6, borderRadius: 4 }}>
                <div
                  className="horse-rating-fill"
                  style={{ width: `${ratingPct}%`, height: '100%', borderRadius: 4 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────────── */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        <StatCard icon="🥇" label="Chiến thắng" value={stats.wins} color="#D4AF37" />
        <StatCard icon="🏅" label="Top 3 lần" value={stats.top3} color="#cd8c4a" />
        <StatCard icon="💰" label="Tổng thưởng" value={`₫${(stats.totalPrize / 1e6).toFixed(0)}M`} color="#4caf7d" />
        <StatCard icon="🏁" label="Số lần đua" value={stats.races} color="#9a8a6a" />
      </div>

      {/* ── Race history ─────────────────────────────────────── */}
      <div className="lux-panel">
        <div className="d-flex align-items-center justify-content-between gap-3 mb-4 flex-wrap">
          <div className="owner-section-label" style={{ marginBottom: 0, flex: 1 }}>
            <h5>Lịch sử thi đấu</h5>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Form.Select
              value={seasonFilter}
              onChange={(e) => { setSeasonFilter(e.target.value); setPage(1); }}
              style={{ maxWidth: 200, fontSize: '0.82rem' }}
            >
              <option value="">Tất cả season</option>
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Form.Select>
            {seasonFilter && (
              <button
                onClick={() => { setSeasonFilter(''); setPage(1); }}
                className="btn-outline-gold-sm"
              >
                ✕ Xoá
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState message="Ngựa này chưa có kết quả nào được công bố." />
        ) : (
          <>
            <DataTable columns={columns} rows={paginated} />
            <div className="mt-3">
              <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton style={{ background: '#1c1812', borderBottom: '1px solid #332b1f' }}>
          <Modal.Title style={{ color: '#D4AF37' }}>Cập nhật thông tin ngựa</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(handleEditSubmit)}>
          <Modal.Body style={{ background: '#1c1812' }}>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label style={{ color: '#c8bea0' }}>Tên ngựa <span style={{ color: '#e55' }}>*</span></Form.Label>
                  <Form.Control
                    {...register('name', { required: 'Tên ngựa là bắt buộc' })}
                    isInvalid={!!errors.name}
                    style={{ background: '#2a2418', color: '#f0e8d0', border: '1px solid #3d3424' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ color: '#c8bea0' }}>Tuổi <span style={{ color: '#e55' }}>*</span></Form.Label>
                  <Form.Control
                    type="number"
                    {...register('age', { required: 'Bắt buộc' })}
                    isInvalid={!!errors.age}
                    style={{ background: '#2a2418', color: '#f0e8d0', border: '1px solid #3d3424' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ color: '#c8bea0' }}>Giới tính</Form.Label>
                  <Form.Select {...register('gender')} style={{ background: '#2a2418', color: '#f0e8d0', border: '1px solid #3d3424' }}>
                    <option value="M">Đực</option>
                    <option value="F">Cái</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ color: '#c8bea0' }}>Màu/Giống <span style={{ color: '#e55' }}>*</span></Form.Label>
                  <Form.Control
                    {...register('breed', { required: 'Bắt buộc' })}
                    isInvalid={!!errors.breed}
                    style={{ background: '#2a2418', color: '#f0e8d0', border: '1px solid #3d3424' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={{ color: '#c8bea0' }}>Trạng thái</Form.Label>
                  <Form.Select {...register('status')} style={{ background: '#2a2418', color: '#f0e8d0', border: '1px solid #3d3424' }}>
                    <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                    <option value="INJURED">Chấn thương (INJURED)</option>
                    <option value="RETIRED">Nghỉ hưu (RETIRED)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label style={{ color: '#c8bea0' }}>Ghi chú sức khoẻ</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    {...register('healthNote')}
                    style={{ background: '#2a2418', color: '#f0e8d0', border: '1px solid #3d3424' }}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Button variant="link" style={{ color: '#64748b', textDecoration: 'none' }} onClick={() => setShowEdit(false)}>Hủy</Button>
          <Button type="submit" className="btn-gold">Lưu thay đổi</Button>
        </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
        <Modal.Header closeButton style={{ background: '#1c1812', borderBottom: '1px solid #332b1f' }}>
          <Modal.Title style={{ color: '#e55' }}>Xác nhận xoá ngựa</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#1c1812', color: '#c8bea0' }}>
          Bạn có chắc chắn muốn xoá ngựa <strong>{horse.name}</strong> không? Hành động này không thể hoàn tác và sẽ xoá các lịch sử liên quan.
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Button variant="link" style={{ color: '#64748b', textDecoration: 'none' }} onClick={() => setShowDelete(false)}>Hủy</Button>
          <Button variant="danger" className="btn-danger-lux" onClick={handleDelete}>Vâng, Xoá</Button>
        </Modal.Footer>
      </Modal>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
