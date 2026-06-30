import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { raceService } from '../../services/raceService';
import { prizeService } from '../../services/prizeService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import './owner-theme.css';

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ color: '#6a6250', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, flexShrink: 0, marginRight: 12 }}>{label}</span>
      <span style={{ color: '#f0e8d0', fontWeight: 600, textAlign: 'right' }}>{value || '—'}</span>
    </div>
  );
}

export default function OwnerOpenRacesPage() {
  const navigate = useNavigate();
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailRace, setDetailRace] = useState(null);
  const [prizes, setPrizes] = useState([]);

  const load = () => {
    raceService.getOpen()
      .then(setRaces)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách race.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openDetail = (r) => {
    setDetailRace(r);
    setPrizes([]);
    prizeService.getByRace(r.id).then(setPrizes).catch(() => setPrizes([]));
  };

  const refetch = () => { setLoading(true); setError(''); load(); };

  const columns = [
    { key: 'name', label: 'Tên race', render: (r) => <span style={{ fontWeight: 700, color: '#f0e8d0' }}>{r.name}</span> },
    { key: 'meetingName', label: 'Meeting' },
    { key: 'distance', label: 'Cự ly', render: (r) => <span style={{ color: '#D4AF37', fontWeight: 600 }}>{r.distance ?? '—'}m</span> },
    { key: 'trackType', label: 'Loại đường đua', render: (r) => <span style={{ color: '#c8bea0' }}>{r.trackType || '—'}</span> },
    { key: 'classRequirement', label: 'Yêu cầu Class', render: (r) => <span style={{ color: '#c8bea0', fontWeight: 600 }}>{r.classRequirement ? (String(r.classRequirement).startsWith('Class') ? r.classRequirement : `Class ${r.classRequirement}`) : 'Không giới hạn'}</span> },
    { key: 'entries', label: 'Số ngựa (Min–Max)', render: (r) => r.minEntries != null && r.maxEntries != null ? <span style={{ color: '#c8bea0' }}>{r.minEntries} – {r.maxEntries}</span> : <span style={{ color: '#5a5040' }}>—</span> },
    { key: 'raceTime', label: 'Ngày đua', render: (r) => formatDate(r.raceTime) },
    { key: 'status', label: 'Trạng thái', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: '',
      render: (r) => (
        <div className="d-flex gap-2">
          <button className="btn-outline-gold" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => openDetail(r)}>
            Chi tiết
          </button>
          <button className="btn-gold btn-gold-sm" onClick={() => navigate(`/owner/register?raceId=${r.id}`)}>
            Tham gia đua
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="owner-context">
      <div className="page-header mb-4">
        <div>
          <h2>Races đang mở</h2>
          <p style={{ margin: 0, marginTop: 4 }}>Chọn race và đăng ký ngựa của bạn tham dự</p>
        </div>
        {races.length > 0 && (
          <div style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 10, padding: '8px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#D4AF37', lineHeight: 1 }}>{races.length}</div>
            <div style={{ fontSize: '0.68rem', color: '#6a5a40', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 2 }}>Race mở</div>
          </div>
        )}
      </div>

      <div className="lux-panel">
        {races.length === 0 ? (
          <EmptyState message="Hiện không có race nào đang mở để đăng ký." />
        ) : (
          <DataTable columns={columns} rows={races} />
        )}
      </div>

      {/* Modal chi tiết race */}
      <Modal show={!!detailRace} onHide={() => setDetailRace(null)} centered size="lg">
        <Modal.Header closeButton style={{ background: '#1a1510', borderColor: 'rgba(212,175,55,0.2)' }}>
          <Modal.Title style={{ color: '#D4AF37', fontWeight: 800 }}>
            🏁 {detailRace?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#110f0a', color: '#c8bea0', padding: '1.5rem' }}>
          {detailRace && (
            <div className="row g-4">
              {/* Thông tin chung */}
              <div className="col-12 col-md-6">
                <div style={{ fontSize: 11, color: '#5a5040', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 8 }}>Thông tin race</div>
                <DetailRow label="Meeting" value={detailRace.meetingName} />
                <DetailRow label="Cự ly" value={detailRace.distance ? `${detailRace.distance} m` : null} />
                <DetailRow label="Loại đường đua" value={detailRace.trackType} />
                <DetailRow label="Yêu cầu Class" value={detailRace.classRequirement ? (String(detailRace.classRequirement).startsWith('Class') ? detailRace.classRequirement : `Class ${detailRace.classRequirement}`) : 'Không giới hạn'} />
                <DetailRow label="Số ngựa Min" value={detailRace.minEntries != null ? `${detailRace.minEntries} con` : null} />
                <DetailRow label="Số ngựa Max" value={detailRace.maxEntries != null ? `${detailRace.maxEntries} con` : null} />
              </div>

              {/* Thời gian */}
              <div className="col-12 col-md-6">
                <div style={{ fontSize: 11, color: '#5a5040', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 8 }}>Thời gian</div>
                <DetailRow label="Giờ đua" value={formatDate(detailRace.raceTime)} />
                <DetailRow label="Mở đăng ký" value={formatDate(detailRace.registrationOpenAt)} />
                <DetailRow label="Đóng đăng ký" value={formatDate(detailRace.registrationCloseAt)} />
                <div style={{ marginTop: 16 }}>
                  <StatusBadge status={detailRace.status} />
                </div>
              </div>

              {/* Giải thưởng */}
              {prizes.length > 0 && (
                <div className="col-12">
                  <div style={{ fontSize: 11, color: '#5a5040', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 10 }}>💰 Cơ cấu giải thưởng</div>
                  <div className="row g-2">
                    {[...new Map(prizes.map((p) => [p.position, p])).values()].sort((a, b) => a.position - b.position).map((p, idx) => (
                      <div className="col-6 col-md-4" key={p.id ?? p.position}>
                        <div style={{ background: idx === 0 ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${idx === 0 ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: idx === 0 ? '#D4AF37' : '#6a6250', fontWeight: 700, fontSize: 13 }}>Hạng {p.position}</span>
                          <span style={{ color: '#f0e8d0', fontWeight: 700 }}>{p.amount != null ? `₫${Number(p.amount).toLocaleString('vi-VN')}` : '—'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ background: '#1a1510', borderColor: 'rgba(212,175,55,0.2)', gap: 12 }}>
          <button className="btn-outline-gold" onClick={() => setDetailRace(null)}>Đóng</button>
          <button className="btn-gold" onClick={() => { setDetailRace(null); navigate(`/owner/register?raceId=${detailRace.id}`); }}>
            Tham gia đua →
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
