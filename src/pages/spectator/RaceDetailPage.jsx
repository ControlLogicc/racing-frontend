import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Calendar3,
  FlagFill,
  GeoAltFill,
  PersonFill,
  Rulers,
  ShieldCheck,
  Speedometer2,
  StarFill,
  StopwatchFill,
  TrophyFill,
} from 'react-bootstrap-icons';
import { raceService } from '../../services/raceService';
import { entryService } from '../../services/entryService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { STATUS_LABEL } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import './spectator-theme.css';

const RACE_STATUS_TONE = {
  SCHEDULED: 'gold',
  OPEN_FOR_ENTRY: 'emerald',
  CLOSED_FOR_ENTRY: 'orange',
  RUNNING: 'red',
  RESULT_PENDING: 'purple',
  OFFICIAL: 'emerald',
  CANCELLED: 'muted',
};

const ENTRY_STATUS_TONE = {
  DECLARED: 'gold',
  PASSED: 'emerald',
  FAILED: 'red',
  WITHDRAWN: 'muted',
};

function StatusPill({ status, entry = false }) {
  const normalizedStatus = String(status || '').toUpperCase();
  const tone = (entry ? ENTRY_STATUS_TONE : RACE_STATUS_TONE)[normalizedStatus] || 'muted';

  return (
    <span className={`race-detail-status race-detail-status--${tone}`}>
      <span className="race-detail-status-dot" />
      {STATUS_LABEL[normalizedStatus] || status || 'Chưa cập nhật'}
    </span>
  );
}

function formatClass(value) {
  if (!value) return 'Không giới hạn';
  return String(value).toLowerCase().startsWith('class') ? value : `Class ${value}`;
}

function formatRaceTime(value) {
  if (!value) return '--:--';
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

export default function SpectatorRaceDetailPage() {
  const { raceId } = useParams();
  const navigate = useNavigate();
  const [race, setRace] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;

    Promise.all([
      raceService.getPublicById(raceId),
      entryService.getPublicByRace(Number(raceId)).catch(() => []),
    ])
      .then(([raceData, entryData]) => {
        if (!alive) return;
        setRace(raceData);
        setEntries(entryData || []);
      })
      .catch((err) => {
        if (alive) setError(getApiErrorMessage(err, 'Không tải được thông tin cuộc đua.'));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => { alive = false; };
  }, [raceId]);

  if (loading) {
    return <div className="spectator-context race-detail-state"><Loading /></div>;
  }

  if (error) {
    return (
      <div className="spectator-context race-detail-state">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const confirmedEntries = entries
    .filter((entry) => !['REMOVED', 'SCRATCHED', 'WITHDRAWN'].includes(String(entry.status).toUpperCase()))
    .sort((a, b) => (a.gateNumber ?? 999) - (b.gateNumber ?? 999));
  const passedEntries = confirmedEntries.filter((entry) => String(entry.status).toUpperCase() === 'PASSED').length;
  const canViewResult = ['OFFICIAL', 'RESULT_PENDING'].includes(race?.status);

  const raceFacts = [
    { icon: <Rulers />, label: 'Cự ly', value: race?.distance ? `${race.distance} m` : 'Chưa cập nhật' },
    { icon: <FlagFill />, label: 'Mặt đường', value: race?.trackType || 'Chưa cập nhật' },
    { icon: <StarFill />, label: 'Hạng thi đấu', value: formatClass(race?.classRequirement) },
    {
      icon: <PersonFill />,
      label: 'Quy mô',
      value: race?.minEntries != null ? `${race.minEntries} – ${race.maxEntries} ngựa` : 'Chưa cập nhật',
    },
  ];

  return (
    <div className="spectator-context race-detail-page">
      <main className="race-detail-shell">
        <button type="button" className="race-detail-back" onClick={() => navigate(-1)}>
          <ArrowLeft /> Quay lại lịch đua
        </button>

        <section className="race-detail-hero">
          <div className="race-detail-hero-glow" />
          <div className="race-detail-hero-copy">
            <div className="race-detail-eyebrow">
              <span><FlagFill /> Race {String(race?.raceNo || raceId).padStart(2, '0')}</span>
              <StatusPill status={race?.status} />
            </div>
            <h1>{race?.name || 'Chi tiết cuộc đua'}</h1>
            <div className="race-detail-meta">
              <span><TrophyFill /> {race?.meetingName || 'FPT Racing Meeting'}</span>
              <span><Calendar3 /> {formatDate(race?.raceTime)}</span>
              <span><GeoAltFill /> {race?.racecourseName || 'FPT Racing Arena'}</span>
            </div>
          </div>

          <div className="race-detail-start-time">
              <span className="race-detail-clock-icon"><StopwatchFill /></span>
            <div>
              <small>Giờ xuất phát</small>
              <strong>{formatRaceTime(race?.raceTime)}</strong>
              <span>{race?.status === 'RUNNING' ? 'Đang diễn ra' : 'Giờ địa phương'}</span>
            </div>
          </div>
        </section>

        <section className="race-detail-facts" aria-label="Thông số cuộc đua">
          {raceFacts.map((fact) => (
            <article key={fact.label} className="race-detail-fact">
              <span className="race-detail-fact-icon">{fact.icon}</span>
              <div>
                <small>{fact.label}</small>
                <strong>{fact.value}</strong>
              </div>
            </article>
          ))}
        </section>

        <section className="race-detail-entries">
          <header className="race-detail-section-header">
            <div>
              <span className="race-detail-section-kicker"><FlagFill /> Race card</span>
              <h2>Danh sách ngựa tham dự</h2>
              <p>Đội hình tranh tài chính thức của cuộc đua.</p>
            </div>
            <div className="race-detail-entry-stats">
              <div>
                <strong>{confirmedEntries.length}</strong>
                <span>Ngựa tham dự</span>
              </div>
              <div>
                <strong>{passedEntries}</strong>
                <span>Đạt kiểm tra</span>
              </div>
            </div>
          </header>

          {confirmedEntries.length === 0 ? (
            <div className="race-detail-empty">
              <EmptyState message="Chưa có ngựa nào xác nhận tham dự." />
            </div>
          ) : (
            <div className="race-detail-table-wrap">
              <table className="race-detail-table">
                <thead>
                  <tr>
                    <th>Số cổng</th>
                    <th>Ngựa đua</th>
                    <th>Jockey</th>
                    <th>Handicap</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {confirmedEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td data-label="Số cổng">
                        <span className="race-detail-gate">{entry.gateNumber ?? '—'}</span>
                      </td>
                      <td data-label="Ngựa đua">
                        <div className="race-detail-horse">
                          <span className="race-detail-horse-icon">♞</span>
                          <div>
                            <strong>{entry.horseName || 'Chưa cập nhật'}</strong>
                            <small>{entry.horseClass ? formatClass(entry.horseClass) : 'Race entry'}</small>
                          </div>
                        </div>
                      </td>
                      <td data-label="Jockey">
                        <span className="race-detail-jockey"><PersonFill /> {entry.jockeyName || 'Chưa phân công'}</span>
                      </td>
                      <td data-label="Handicap">
                        <span className="race-detail-weight">
                          <Speedometer2 /> {entry.handicapWeight != null ? `${entry.handicapWeight} kg` : '—'}
                        </span>
                      </td>
                      <td data-label="Trạng thái"><StatusPill status={entry.status} entry /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {canViewResult && (
          <section className="race-detail-result-cta">
            <div className="race-detail-result-icon"><ShieldCheck /></div>
            <div>
              <span>Kết quả cuộc đua đã sẵn sàng</span>
              <strong>Xem thứ hạng và thành tích chính thức</strong>
            </div>
            <button type="button" onClick={() => navigate(`/race-results/${raceId}`)}>
              Xem kết quả <ArrowRight />
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
