import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jockeyService } from '../../services/jockeyService';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';
import { Calendar3, GeoAltFill, PlusCircleFill } from 'react-bootstrap-icons';
import '../owner/owner-theme.css';

export default function JockeyRacesPage() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
            Danh sách các giải đua bạn đã đăng ký ứng tuyển.
          </p>
        </div>
        <button className="btn-gold d-flex align-items-center" onClick={() => navigate('/jockey/register-race')}>
          <PlusCircleFill className="me-2" /> Đăng ký giải đấu mới
        </button>
      </div>

      {registrations.length === 0 ? (
        <EmptyState message="Bạn chưa đăng ký ứng tuyển giải đua nào." />
      ) : (
        <div className="row g-4">
          {registrations.map((reg) => {
            const race = races.find(r => r.id === (reg.raceId ?? reg.race_id)) || {};
            return (
              <div className="col-12 col-md-6 col-lg-4" key={reg.id || reg.jockeyRaceRegistrationId}>
                <div className="dash-card h-100 d-flex flex-column smooth-hover" style={{ borderTop: '3px solid #D4AF37' }}>
                  <div className="mb-3">
                    <h5 style={{ color: '#D4AF37', marginBottom: '8px' }}>{reg.raceName || race.name || race.raceName || 'Race #'+reg.raceId}</h5>
                    <div className="d-flex align-items-center mb-2" style={{ color: '#aaa', fontSize: '0.85rem' }}>
                      <Calendar3 className="me-2" />
                      {race.raceTime || race.scheduledTime ? formatDate(race.raceTime || race.scheduledTime) : 'Chưa có lịch'}
                    </div>
                    <div className="d-flex align-items-center" style={{ color: '#aaa', fontSize: '0.85rem' }}>
                      <GeoAltFill className="me-2" />
                      {race.distance || race.distanceMeters ? `${race.distance || race.distanceMeters}m` : '—'}
                    </div>
                  </div>
                  
                  {reg.note && (
                    <div style={{ fontSize: '0.82rem', color: '#8a7a60', marginBottom: 12, fontStyle: 'italic' }}>
                      📝 {reg.note}
                    </div>
                  )}

                  <div className="mt-auto pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <span style={{ fontSize: '0.85rem', color: '#777' }}>Trạng thái:</span>
                      <StatusBadge status={reg.registrationStatus || reg.status || 'PENDING'} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

