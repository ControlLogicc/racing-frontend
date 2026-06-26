import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { jockeyService } from '../../services/jockeyService';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';
import { Link } from 'react-router-dom';
import { Calendar3, GeoAltFill, PlusCircleFill, Search } from 'react-bootstrap-icons';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import '../owner/owner-theme.css';

function RegisterRaceModal({ show, onHide, onSuccess }) {
  const [availableRaces, setAvailableRaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedRaceId, setSelectedRaceId] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (show) {
      setLoading(true);
      setError('');
      jockeyService.getAvailableRaces()
        .then(setAvailableRaces)
        .catch(err => setError(getApiErrorMessage(err, 'Lỗi khi tải danh sách giải đua.')))
        .finally(() => setLoading(false));
    } else {
      setSelectedRaceId('');
      setNote('');
    }
  }, [show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedRaceId) return;
    
    setSubmitting(true);
    jockeyService.registerForRace({ raceId: Number(selectedRaceId), note })
      .then(() => {
        Toaster.success('Đăng ký thành công!');
        onSuccess();
        onHide();
      })
      .catch(err => {
        Toaster.error(getApiErrorMessage(err, 'Đăng ký thất bại.'));
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
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const load = () => {
    Promise.all([
      jockeyService.getMyRaceRegistrations(),
      raceService.getPublic(),
    ])
      .then(([regs, rList]) => {
        setRegistrations(regs);
        setRaces(rList);
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được lịch đua.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => {
    setLoading(true);
    setError('');
    load();
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

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

      {registrations.length === 0 ? (
        <EmptyState message="Bạn chưa có lịch đua nào sắp tới." />
      ) : (
        <div className="row g-4">
          {registrations.map((reg) => {
            const race = races.find(r => r.id === reg.raceId) || {};
            return (
              <div className="col-12 col-md-6 col-lg-4" key={reg.id || reg.raceRegistrationId}>
                <div className="dash-card h-100 d-flex flex-column smooth-hover" style={{ borderTop: '3px solid #D4AF37' }}>
                  <div className="mb-3">
                    <h5 style={{ color: '#D4AF37', marginBottom: '8px' }}>{race.name || race.raceName || 'Race #'+reg.raceId}</h5>
                    <div className="d-flex align-items-center mb-2" style={{ color: '#aaa', fontSize: '0.85rem' }}>
                      <Calendar3 className="me-2" />
                      {race.raceTime || race.scheduledTime ? formatDate(race.raceTime || race.scheduledTime) : 'Chưa có lịch'}
                    </div>
                    <div className="d-flex align-items-center" style={{ color: '#aaa', fontSize: '0.85rem' }}>
                      <GeoAltFill className="me-2" />
                      {race.distance || race.distanceMeters ? `${race.distance || race.distanceMeters}m` : '—'}
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <span style={{ fontSize: '0.85rem', color: '#777' }}>Trạng thái đăng ký:</span>
                      <span className="badge" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37', border: '1px solid #D4AF37' }}>
                        {reg.status || 'PENDING'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <RegisterRaceModal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        onSuccess={load}
      />
    </div>
  );
}
