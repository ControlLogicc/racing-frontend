import { useEffect, useState } from 'react';
import { Modal, Badge, Spinner } from 'react-bootstrap';
import { Calendar3, GeoAltFill, TrophyFill } from 'react-bootstrap-icons';
import { raceService } from '../../services/raceService';
import { prizeService } from '../../services/prizeService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import '../../pages/owner/owner-theme.css';

export default function RaceDetailModal({ show, onHide, raceId }) {
  const [race, setRace] = useState(null);
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (show && raceId) {
      setLoading(true);
      setError('');
      Promise.all([
        raceService.getPublicById(raceId),
        prizeService.getPublicAll().catch(() => [])
      ])
        .then(([raceData, allPrizes]) => {
          setRace(raceData);
          setPrizes(allPrizes.filter(p => String(p.raceId) === String(raceId)));
        })
        .catch(err => setError(getApiErrorMessage(err, 'Không tải được chi tiết giải đua.')))
        .finally(() => setLoading(false));
    } else {
      setRace(null);
      setPrizes([]);
    }
  }, [show, raceId]);

  const selectedPrizes = prizes.sort((a, b) => Number(a.position) - Number(b.position));
  const totalPrize = selectedPrizes.reduce((sum, prize) => sum + Number(prize.amount || 0), 0);
  const formatPrizeAmount = (amount) => amount != null ? `${Number(amount).toLocaleString('vi-VN')} đ` : '—';

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="lux-modal-content smooth-hover">
      <Modal.Header closeButton className="lux-modal-header border-bottom-0">
        <Modal.Title className="lux-modal-title">
          Chi tiết giải đua
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="lux-modal-body pt-0 pb-4">
        {loading ? (
          <div className="text-center py-4"><Spinner animation="border" variant="warning" /></div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : !race ? (
          <div className="text-center py-4" style={{ color: '#9a8f73' }}>Không tìm thấy thông tin giải đua.</div>
        ) : (
          <div className="jockey-race-detail-panel" style={{ background: 'rgba(212, 175, 55, 0.06)', border: '1px solid rgba(212, 175, 55, 0.24)', borderRadius: 8, padding: '14px 16px' }}>
            <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
              <div>
                <div style={{ color: '#D4AF37', fontWeight: 800, fontSize: 17 }}>
                  {race.name || race.raceName}
                </div>
                <div style={{ color: '#8f856b', fontSize: 12, marginTop: 2 }}>
                  {race.meetingName || 'Meeting chưa cập nhật'}
                </div>
              </div>
              <Badge className="jockey-race-status-badge" style={{ background: 'rgba(34,197,94,0.16)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.35)' }}>
                {race.status || 'OPEN_FOR_ENTRY'}
              </Badge>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-12 col-sm-6">
                <div style={{ color: '#9ca3af', fontSize: 12 }}>Race time</div>
                <div style={{ color: '#fff', fontWeight: 600 }}>
                  <Calendar3 className="me-2" />
                  {race.raceTime || race.scheduledTime ? formatDate(race.raceTime || race.scheduledTime) : 'Chưa có lịch'}
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div style={{ color: '#9ca3af', fontSize: 12 }}>Racecourse</div>
                <div style={{ color: '#fff', fontWeight: 600 }}>
                  <GeoAltFill className="me-2" />
                  {race.racecourseName || 'Chưa cập nhật'}
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div style={{ color: '#9ca3af', fontSize: 12 }}>Distance</div>
                <div style={{ color: '#fff', fontWeight: 600 }}>
                  {race.distance ? `${race.distance}m` : 'Chưa cập nhật'}
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
                      style={{ background: 'rgba(0,0,0,0.18)', borderRadius: 6, padding: '8px 10px', color: '#e5e7eb', fontSize: 13 }}
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
      </Modal.Body>
    </Modal>
  );
}
