import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { raceService } from '../../services/raceService';
import { entryService } from '../../services/entryService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';
import './spectator-theme.css';

export default function SpectatorRaceDetailPage() {
  const { raceId } = useParams();
  const navigate = useNavigate();
  const [race, setRace] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      raceService.getPublicById(raceId),
      entryService.getByRace(Number(raceId)),
    ])
      .then(([r, e]) => { setRace(r); setEntries(e); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được thông tin race.')))
      .finally(() => setLoading(false));
  }, [raceId]);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const confirmed = entries.filter((e) => e.status !== 'REMOVED');

  return (
    <div className="spectator-container">
      {/* Back */}
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#D4AF37', cursor: 'pointer', marginBottom: 16, fontSize: 14 }}>
        ← Quay lại
      </button>

      {/* Race header */}
      <div className="spectator-hero mb-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ color: '#D4AF37', fontWeight: 800, marginBottom: 4 }}>🏁 {race?.name}</h2>
            <p style={{ color: '#8a7a60', margin: 0 }}>{race?.meetingName} · {formatDate(race?.raceTime)}</p>
          </div>
          <StatusBadge status={race?.status} />
        </div>
      </div>

      {/* Race info */}
      <div className="spectator-grid-2 mb-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[
          { label: 'Cự ly', value: race?.distance ? `${race.distance} m` : '—' },
          { label: 'Loại đường đua', value: race?.trackType || '—' },
          { label: 'Yêu cầu Class', value: race?.classRequirement ? (String(race.classRequirement).startsWith('Class') ? race.classRequirement : `Class ${race.classRequirement}`) : 'Không giới hạn' },
          { label: 'Số ngựa', value: race?.minEntries != null ? `${race.minEntries} – ${race.maxEntries}` : '—' },
        ].map((item) => (
          <div key={item.label} className="spectator-card" style={{ padding: '14px 20px' }}>
            <div style={{ fontSize: 11, color: '#6a5a40', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{item.label}</div>
            <div style={{ color: '#f0e8d0', fontWeight: 700 }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Entry list */}
      <div className="spectator-card">
        <h5 style={{ color: '#D4AF37', fontWeight: 700, marginBottom: 16 }}>
          Danh sách tham dự
          <span style={{ marginLeft: 8, fontSize: 13, color: '#6a5a40', fontWeight: 400 }}>({confirmed.length} ngựa)</span>
        </h5>

        {confirmed.length === 0 ? (
          <EmptyState message="Chưa có ngựa nào xác nhận tham dự." />
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
                  {['Số cổng', 'Ngựa', 'Jockey', 'Handicap', 'Trạng thái'].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', fontSize: 11, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...confirmed].sort((a, b) => (a.gateNumber ?? 999) - (b.gateNumber ?? 999)).map((e) => (
                  <tr key={e.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 14px', color: '#D4AF37', fontWeight: 700, fontSize: 18 }}>
                      {e.gateNumber ?? '—'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ color: '#f0e8d0', fontWeight: 700 }}>🐎 {e.horseName}</div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#c8bea0' }}>{e.jockeyName || '—'}</td>
                    <td style={{ padding: '12px 14px', color: '#aaa' }}>{e.handicapWeight != null ? `${e.handicapWeight} kg` : '—'}</td>
                    <td style={{ padding: '12px 14px' }}><StatusBadge status={e.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Link xem kết quả nếu race đã kết thúc */}
      {['OFFICIAL', 'RESULT_PENDING'].includes(race?.status) && (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button
            className="btn-gold"
            onClick={() => navigate(`/spectator/results/${raceId}`)}
            style={{ padding: '10px 32px', fontSize: 15 }}
          >
            Xem kết quả đua →
          </button>
        </div>
      )}
    </div>
  );
}
