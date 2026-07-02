import { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { registrationService } from '../../services/registrationService';
import { horseService } from '../../services/horseService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { RACE_REGISTRATION_STATUS } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Pagination from '../../components/common/Pagination';
import RegistrationTable from '../../components/shared/RegistrationTable';
import StatusBadge from '../../components/common/StatusBadge';
import Toaster from '../../components/common/Toaster';
import './staff-theme.css';

const PAGE_SIZE = 10;

export default function StaffRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [filterRace, setFilterRace] = useState('');
  const [toast, setToast] = useState(null);
  const [horseDetail, setHorseDetail] = useState(null);
  const [horseLoading, setHorseLoading] = useState(false);
  const [selectedReg, setSelectedReg] = useState(null);

  const load = () => {
    registrationService
      .getAll()
      .then(setRegistrations)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách đăng ký.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const handleApprove = async (reg) => {
    try {
      await registrationService.approve(reg.id);
      setToast({ message: `Đã duyệt đăng ký của ${reg.horseName}.`, variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Duyệt thất bại.'), variant: 'danger' });
    }
  };

  const handleReject = async (reg) => {
    try {
      await registrationService.reject(reg.id);
      setToast({ message: `Đã từ chối đăng ký của ${reg.horseName}.`, variant: 'warning' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Từ chối thất bại.'), variant: 'danger' });
    }
  };

  const openHorseDetail = async (reg) => {
    setSelectedReg(reg);
    setHorseDetail(null);
    setHorseLoading(true);
    try {
      const horse = await horseService.adminGetById(reg.horseId);
      setHorseDetail(horse);
    } catch {
      setHorseDetail({ error: true });
    } finally {
      setHorseLoading(false);
    }
  };

  const pending = registrations.filter((r) =>
    r.status === RACE_REGISTRATION_STATUS.PENDING_REVIEW || r.status === 'PENDING_REVIEW' || r.status === 'PENDING'
  ).length;

  const raceOptions = [...new Map(registrations.map((r) => [r.raceId ?? r.raceName, r])).values()]
    .map((r) => ({ id: r.raceId, name: r.raceName }));

  const filtered = filterRace
    ? registrations.filter((r) => String(r.raceId) === filterRace || r.raceName === filterRace)
    : [];

  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Inject nút "Chi tiết ngựa" vào mỗi row
  const rowsWithAction = pageRows.map((r) => ({
    ...r,
    _onViewHorse: () => openHorseDetail(r),
  }));

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="staff-theme-wrapper p-3">
      {/* Header */}
      <div className="staff-card mb-4 p-4">
        <h4 className="mb-1" style={{ color: '#D4AF37', fontWeight: 700 }}>
          Đăng ký Race
          {pending > 0 && (
            <span className="badge ms-2" style={{ backgroundColor: '#f0a500', color: '#111', fontSize: '0.75rem' }}>
              {pending} chờ duyệt
            </span>
          )}
        </h4>
        <p className="mb-0" style={{ color: '#9ca3af', fontSize: 13 }}>
          Danh sách đăng ký race từ owner. Xem chi tiết ngựa để kiểm tra thông tin trước khi race bắt đầu.
        </p>
      </div>

      {/* Filter race */}
      <div className="staff-card mb-3 p-3">
        <div className="d-flex align-items-center gap-3">
          <label style={{ color: '#D4AF37', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>Chọn cuộc đua:</label>
          <select
            className="form-select"
            value={filterRace}
            onChange={(e) => { setFilterRace(e.target.value); setPage(1); }}
            style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid #475569', maxWidth: 320 }}
          >
            <option value="">-- Chọn race để xem đăng ký --</option>
            {raceOptions.map((r) => (
              <option key={r.id ?? r.name} value={r.id ?? r.name}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      {!filterRace ? (
        <EmptyState message="Hãy chọn cuộc đua để xem danh sách đăng ký." />
      ) : filtered.length === 0 ? (
        <EmptyState message="Chưa có đăng ký nào cho cuộc đua này." />
      ) : (
        <>
          <div className="staff-card">
            <div className="p-0">
              <div className="table-responsive">
                <table className="staff-table mb-0">
                  <thead>
                    <tr>
                      <th>Race</th>
                      <th>Ngựa</th>
                      <th>Ngày nộp</th>
                      <th>Trạng thái</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((r) => (
                      <tr key={r.id}>
                        <td style={{ color: '#fff', fontWeight: 600 }}>{r.raceName}</td>
                        <td style={{ color: '#fff' }}>{r.horseName}</td>
                        <td style={{ color: '#aaa', whiteSpace: 'nowrap' }}>{formatDate(r.submittedAt)}</td>
                        <td><StatusBadge status={r.status} /></td>
                        <td>
                          <div className="d-flex gap-2 flex-wrap">
                            <Button size="sm" className="staff-btn-outline" onClick={() => openHorseDetail(r)}>
                              Chi tiết ngựa
                            </Button>
                            {(r.status === 'PENDING_REVIEW' || r.status === 'PENDING' || r.status === 'SUBMITTED') && (
                              <>
                                <Button size="sm"
                                  style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid #34d399', color: '#34d399', fontWeight: 600, fontSize: 12 }}
                                  onClick={() => handleApprove(r)}>
                                  ✓ Duyệt
                                </Button>
                                <Button size="sm"
                                  style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid #ef4444', color: '#ef4444', fontWeight: 600, fontSize: 12 }}
                                  onClick={() => handleReject(r)}>
                                  ✕ Từ chối
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
        </>
      )}

      {/* Modal chi tiết ngựa */}
      <Modal show={!!selectedReg} onHide={() => setSelectedReg(null)} centered>
        <Modal.Header closeButton style={{ background: '#1e293b', borderColor: 'rgba(212,175,55,0.2)' }}>
          <Modal.Title style={{ color: '#D4AF37' }}>Chi tiết ngựa — {selectedReg?.horseName}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#0f172a', color: '#cbd5e1' }}>
          {horseLoading && <Loading />}
          {!horseLoading && horseDetail?.error && (
            <p style={{ color: '#e57373' }}>Không tải được thông tin ngựa.</p>
          )}
          {!horseLoading && horseDetail && !horseDetail.error && (
            <div className="d-flex flex-column gap-2">
              <div className="text-center mb-2">
                <div style={{
                  width: 72, height: 72, borderRadius: 16, margin: '0 auto 8px',
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))',
                  border: '2px solid rgba(212,175,55,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, overflow: 'hidden',
                }}>
                  {horseDetail.imageUrl ? (
                    <img
                      src={horseDetail.imageUrl}
                      alt={horseDetail.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = ''; }}
                    />
                  ) : null}
                  <span style={{ display: horseDetail.imageUrl ? 'none' : '' }}>🐎</span>
                </div>
              </div>
              <div className="row g-3">
                <div className="col-6">
                  <div style={{ color: '#94a3b8', fontSize: 12, textTransform: 'uppercase' }}>Tên ngựa</div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{horseDetail.name || horseDetail.horseName || selectedReg.horseName}</div>
                </div>
                <div className="col-6">
                  <div style={{ color: '#94a3b8', fontSize: 12, textTransform: 'uppercase' }}>Trạng thái</div>
                  <StatusBadge status={horseDetail.status} />
                </div>
                <div className="col-6">
                  <div style={{ color: '#94a3b8', fontSize: 12, textTransform: 'uppercase' }}>Tuổi</div>
                  <div>{horseDetail.age ?? '—'}</div>
                </div>
                <div className="col-6">
                  <div style={{ color: '#94a3b8', fontSize: 12, textTransform: 'uppercase' }}>Giới tính</div>
                  <div>{horseDetail.gender ?? '—'}</div>
                </div>
                <div className="col-6">
                  <div style={{ color: '#94a3b8', fontSize: 12, textTransform: 'uppercase' }}>Giống / Màu lông</div>
                  <div>{[horseDetail.breed, horseDetail.color].filter(Boolean).join(' / ') || '—'}</div>
                </div>
                <div className="col-6">
                  <div style={{ color: '#94a3b8', fontSize: 12, textTransform: 'uppercase' }}>Class</div>
                  <div>{horseDetail.horseClass ?? horseDetail.class ?? '—'}</div>
                </div>
                <div className="col-6">
                  <div style={{ color: '#94a3b8', fontSize: 12, textTransform: 'uppercase' }}>Rating hiện tại</div>
                  <div style={{ color: '#D4AF37', fontWeight: 700 }}>{horseDetail.currentScore ?? horseDetail.rating ?? '—'}</div>
                </div>
                <div className="col-6">
                  <div style={{ color: '#94a3b8', fontSize: 12, textTransform: 'uppercase' }}>Owner</div>
                  <div>{horseDetail.ownerName ?? selectedReg.ownerName ?? '—'}</div>
                </div>
                {horseDetail.dateOfBirth && (
                  <div className="col-6">
                    <div style={{ color: '#94a3b8', fontSize: 12, textTransform: 'uppercase' }}>Ngày sinh</div>
                    <div>{horseDetail.dateOfBirth}</div>
                  </div>
                )}
                {horseDetail.pedigree && (
                  <div className="col-6">
                    <div style={{ color: '#94a3b8', fontSize: 12, textTransform: 'uppercase' }}>Huyết thống</div>
                    <div>{horseDetail.pedigree}</div>
                  </div>
                )}
                {horseDetail.trainerName && (
                  <div className="col-6">
                    <div style={{ color: '#94a3b8', fontSize: 12, textTransform: 'uppercase' }}>Huấn luyện viên</div>
                    <div>{horseDetail.trainerName}</div>
                  </div>
                )}
                {horseDetail.stableName && (
                  <div className="col-6">
                    <div style={{ color: '#94a3b8', fontSize: 12, textTransform: 'uppercase' }}>Trang trại</div>
                    <div>{horseDetail.stableName}</div>
                  </div>
                )}
                {horseDetail.healthNote && (
                  <div className="col-12">
                    <div style={{ color: '#94a3b8', fontSize: 12, textTransform: 'uppercase' }}>Ghi chú sức khoẻ</div>
                    <div style={{ color: '#fbbf24' }}>{horseDetail.healthNote}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ background: '#1e293b', borderColor: 'rgba(212,175,55,0.2)' }}>
          <Button variant="link" style={{ color: '#94a3b8', textDecoration: 'none' }} onClick={() => setSelectedReg(null)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
