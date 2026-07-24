import { useEffect, useMemo, useState } from 'react';
import { jockeyService } from '../../services/jockeyService';
import { prizeService } from '../../services/prizeService';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';
import Pagination from '../../components/common/Pagination';
import RaceDetailModal from '../../components/common/RaceDetailModal';
import { Calendar3, GeoAltFill, PlusCircleFill, Search, CheckCircleFill, TrophyFill, InfoCircleFill } from 'react-bootstrap-icons';
import { Modal, Button, Form, Spinner, Badge } from 'react-bootstrap';
import '../owner/owner-theme.css';

const PAGE_SIZE = 9;

function RegisterRaceModal({ show, onHide, onSuccess }) {
  const [availableRaces, setAvailableRaces] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedRaceId, setSelectedRaceId] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (show) {
      setLoading(true);
      setError('');
      Promise.all([
        jockeyService.getAvailableRaces(),
        prizeService.getPublicAll().catch(() => []),
      ])
        .then(([raceData, prizeData]) => {
          setAvailableRaces(raceData);
          setPrizes(prizeData);
        })
        .catch(err => setError(getApiErrorMessage(err, 'Lỗi khi tải danh sách giải đua.')))
        .finally(() => setLoading(false));
    } else {
      setSelectedRaceId('');
      setNote('');
      setPrizes([]);
    }
  }, [show]);

  const selectedRace = availableRaces.find((race) => String(race.id || race.raceId) === String(selectedRaceId));
  const selectedPrizes = prizes
    .filter((prize) => String(prize.raceId) === String(selectedRaceId))
    .sort((a, b) => Number(a.position) - Number(b.position));
  const totalPrize = selectedPrizes.reduce((sum, prize) => sum + Number(prize.amount || 0), 0);
  const formatPrizeAmount = (amount) => amount != null ? `${Number(amount).toLocaleString('vi-VN')} đ` : '—';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedRaceId) return;

    setSubmitting(true);
    jockeyService.registerForRace({ raceId: Number(selectedRaceId), note })
      .then(() => {
        onSuccess({ message: 'Đăng ký race thành công!', variant: 'success' });
        onHide();
      })
      .catch(err => {
        setError(getApiErrorMessage(err, 'Đăng ký thất bại.'));
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="lux-modal-content smooth-hover">
      <Modal.Header closeButton className="lux-modal-header border-bottom-0">
        <Modal.Title className="lux-modal-title">
          Đăng ký giải đấu mới
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="lux-modal-body pt-0">
        {loading ? (
          <div className="text-center py-4"><Spinner animation="border" variant="warning" /></div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : availableRaces.length === 0 ? (
          <div className="text-center py-4" style={{ color: '#9a8f73' }}>
            <Search size={32} className="mb-2 opacity-50" />
            <p>Hiện tại không có giải đua nào đang mở đăng ký.</p>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="lux-label">Chọn giải đấu</Form.Label>
              <Form.Select 
                className="lux-input smooth-hover" 
                value={selectedRaceId} 
                onChange={(e) => setSelectedRaceId(e.target.value)}
                required
              >
                <option value="">-- Vui lòng chọn --</option>
                {availableRaces.map(race => (
                  <option key={race.id || race.raceId} value={race.id || race.raceId}>
                    {race.name || race.raceName} - {race.raceTime ? formatDate(race.raceTime) : 'Chưa có lịch'}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {selectedRace && (
              <div
                key={selectedRaceId}
                className="jockey-race-detail-panel mb-4"
                style={{
                  background: 'rgba(212, 175, 55, 0.06)',
                  border: '1px solid rgba(212, 175, 55, 0.24)',
                  borderRadius: 8,
                  padding: '14px 16px',
                }}
              >
                <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                  <div>
                    <div style={{ color: '#D4AF37', fontWeight: 800, fontSize: 17 }}>
                      {selectedRace.name || selectedRace.raceName}
                    </div>
                    <div style={{ color: '#8f856b', fontSize: 12, marginTop: 2 }}>
                      {selectedRace.meetingName || 'Meeting chưa cập nhật'}
                    </div>
                  </div>
                  <Badge className="jockey-race-status-badge" style={{ background: 'rgba(34,197,94,0.16)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.35)' }}>
                    {selectedRace.status || 'OPEN_FOR_ENTRY'}
                  </Badge>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-12 col-sm-6">
                    <div style={{ color: '#9ca3af', fontSize: 12 }}>Race time</div>
                    <div style={{ color: '#fff', fontWeight: 600 }}>
                      <Calendar3 className="me-2" />
                      {selectedRace.raceTime ? formatDate(selectedRace.raceTime) : 'Chưa có lịch'}
                    </div>
                  </div>
                  <div className="col-12 col-sm-6">
                    <div style={{ color: '#9ca3af', fontSize: 12 }}>Racecourse</div>
                    <div style={{ color: '#fff', fontWeight: 600 }}>
                      <GeoAltFill className="me-2" />
                      {selectedRace.racecourseName || 'Chưa cập nhật'}
                    </div>
                  </div>
                  <div className="col-12 col-sm-6">
                    <div style={{ color: '#9ca3af', fontSize: 12 }}>Distance</div>
                    <div style={{ color: '#fff', fontWeight: 600 }}>
                      {selectedRace.distance ? `${selectedRace.distance}m` : 'Chưa cập nhật'}
                    </div>
                  </div>
                  <div className="col-12 col-sm-6">
                    <div style={{ color: '#9ca3af', fontSize: 12 }}>Prize pool</div>
                    <div className="jockey-prize-pool" style={{ color: '#fff', fontWeight: 600 }}>
                      <TrophyFill className="me-2" />
                      {selectedPrizes.length ? formatPrizeAmount(totalPrize) : 'Chưa có cơ cấu'}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12 }}>
                  <div style={{ color: '#D4AF37', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                    Prize structure
                  </div>
                  {selectedPrizes.length ? (
                    <div className="d-flex flex-column gap-2">
                      {selectedPrizes.map((prize) => (
                        <div
                          key={prize.id || prize.prizeId || prize.position}
                          className="jockey-prize-row"
                          style={{
                            background: 'rgba(0,0,0,0.18)',
                            borderRadius: 6,
                            padding: '8px 10px',
                            color: '#e5e7eb',
                            fontSize: 13,
                          }}
                        >
                          <span>#{prize.position}</span>
                          <strong style={{ color: '#86efac' }}>{formatPrizeAmount(prize.amount)}</strong>
                          <span style={{ color: '#9ca3af' }}>{prize.score ?? 0} điểm</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#8f856b', fontSize: 13 }}>
                      Race này chưa có cơ cấu giải thưởng được công bố.
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <Form.Group className="mb-4">
              <Form.Label className="lux-label">Ghi chú (Tùy chọn)</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                className="lux-input smooth-hover" 
                placeholder="Nhập lời nhắn gửi ban tổ chức..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Form.Group>

            <div className="d-flex gap-2 justify-content-end mt-4">
              <Button variant="secondary" onClick={onHide} className="px-4" style={{ background: '#333', border: 'none' }}>
                Hủy
              </Button>
              <Button type="submit" disabled={!selectedRaceId || submitting} className="lux-btn-gold px-4">
                {submitting ? <Spinner size="sm" animation="border" /> : 'Xác nhận Đăng ký'}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default function JockeyRacesPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [detailRaceId, setDetailRaceId] = useState(null);

  const load = () => {
    setLoading(true);
    setError('');
    jockeyService.getMyRaceRegistrations()
      .then(setRegistrations)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được lịch đua.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const statusOptions = useMemo(
    () => [...new Set(registrations.map((r) => r.status).filter(Boolean))].sort(),
    [registrations]
  );

  const filteredRegistrations = useMemo(() => registrations.filter((r) => {
    const term = search.trim().toLowerCase();
    const matchSearch = !term || (r.raceName || '').toLowerCase().includes(term);
    const matchStatus = !filterStatus || r.status === filterStatus;
    return matchSearch && matchStatus;
  }), [registrations, search, filterStatus]);

  const pageRegistrations = filteredRegistrations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (setter) => (e) => { setter(e.target.value); setPage(1); };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <div className="page-header mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3 smooth-hover">
        <div>
          <h2>Lịch đua của tôi</h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Danh sách các chặng đua bạn đã đăng ký và chuẩn bị tham gia.
          </p>
        </div>
        <Button className="lux-btn-gold d-flex align-items-center" onClick={() => setShowModal(true)}>
          <PlusCircleFill className="me-2" /> Đăng ký giải đấu mới
        </Button>
      </div>
      {toast && <Toaster toast={toast} onClose={() => setToast(null)} />}

      {registrations.length > 0 && (
        <div className="dash-card mb-4">
          <div className="row g-3 align-items-end">
            <div className="col-md-7">
              <Form.Group>
                <Form.Label style={{ fontSize: 13 }}>Tìm theo tên race</Form.Label>
                <Form.Control
                  className="lux-input smooth-hover"
                  placeholder="VD: Phú Thọ Grand Cup..."
                  value={search}
                  onChange={handleFilterChange(setSearch)}
                />
              </Form.Group>
            </div>
            <div className="col-md-5">
              <Form.Group>
                <Form.Label style={{ fontSize: 13 }}>Trạng thái</Form.Label>
                <Form.Select className="lux-input smooth-hover" value={filterStatus} onChange={handleFilterChange(setFilterStatus)}>
                  <option value="">Tất cả</option>
                  {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </Form.Select>
              </Form.Group>
            </div>
          </div>
        </div>
      )}

      {registrations.length === 0 ? (
        <EmptyState message="Bạn chưa đăng ký giải đua nào." />
      ) : filteredRegistrations.length === 0 ? (
        <EmptyState message="Không tìm thấy chặng đua nào khớp bộ lọc." />
      ) : (
        <div className="row g-4">
          {pageRegistrations.map((reg) => {
            const statusColor = reg.status === 'REGISTERED' ? '#22c55e'
              : reg.status === 'WITHDRAWN' ? '#ef4444' : '#D4AF37';
            return (
              <div className="col-12 col-md-6 col-lg-4" key={reg.id || reg.raceId}>
                <div className="dash-card h-100 d-flex flex-column smooth-hover" style={{ borderTop: `3px solid ${statusColor}` }}>
                  <div className="mb-3">
                    <h5 style={{ color: '#D4AF37', marginBottom: '8px' }}>
                      {reg.raceName || 'Race #' + reg.raceId}
                    </h5>
                    <div className="d-flex align-items-center mb-2" style={{ color: '#aaa', fontSize: '0.85rem' }}>
                      <Calendar3 className="me-2" />
                      {reg.scheduledTime ? formatDate(reg.scheduledTime) : 'Chưa có lịch'}
                    </div>
                    {reg.note && (
                      <div style={{ color: '#888', fontSize: '0.8rem', fontStyle: 'italic', marginTop: 4 }}>
                        📝 {reg.note}
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span style={{ fontSize: '0.85rem', color: '#777' }}>Trạng thái:</span>
                      <Badge style={{
                        background: statusColor + '22',
                        color: statusColor,
                        border: `1px solid ${statusColor}`,
                        fontWeight: 600
                      }}>
                        {reg.status === 'REGISTERED' && <CheckCircleFill className="me-1" />}
                        {reg.status || 'REGISTERED'}
                      </Badge>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <Button 
                        variant="link" 
                        className="p-0 text-decoration-none" 
                        style={{ color: '#60a5fa', fontSize: '0.85rem' }}
                        onClick={() => setDetailRaceId(reg.raceId)}
                      >
                        <InfoCircleFill className="me-1" /> Chi tiết
                      </Button>
                      {reg.registeredAt && (
                        <div style={{ fontSize: '0.75rem', color: '#555' }}>
                          Đăng ký lúc: {formatDate(reg.registeredAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={page} pageSize={PAGE_SIZE} total={filteredRegistrations.length} onPageChange={setPage} />

      <RegisterRaceModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSuccess={(t) => { setToast(t); load(); }}
      />
      <RaceDetailModal 
        show={!!detailRaceId} 
        onHide={() => setDetailRaceId(null)} 
        raceId={detailRaceId} 
      />
    </div>
  );
}
