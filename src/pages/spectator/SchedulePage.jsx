import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Calendar3,
  Clock,
  FlagFill,
  GeoAltFill,
  Rulers,
  StarFill,
  TrophyFill,
} from 'react-bootstrap-icons';
import { raceService } from '../../services/raceService';
import { meetingService } from '../../services/meetingService';
import { getApiErrorMessage } from '../../utils/apiError';
import { RACE_STATUS, STATUS_LABEL } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import './spectator-theme.css';

const STATUS_TONE = {
  SCHEDULED: 'gold',
  OPEN_FOR_ENTRY: 'emerald',
  CLOSED_FOR_ENTRY: 'orange',
  RUNNING: 'red',
  RESULT_PENDING: 'purple',
  OFFICIAL: 'emerald',
  CANCELLED: 'muted',
};

const meetingKey = (id) => String(id ?? 'other');

function fetchSchedule() {
  return Promise.all([raceService.getPublic(), meetingService.getPublic()])
    .then(([raceData, meetingData]) => {
      const visibleRaces = (raceData || [])
        .filter((race) => String(race.status).toUpperCase() !== RACE_STATUS.DRAFT)
        .sort((a, b) => new Date(a.raceTime || 0) - new Date(b.raceTime || 0));
      const safeMeetings = meetingData || [];
      const firstMeetingWithRace = safeMeetings.find((meeting) =>
        visibleRaces.some((race) => meetingKey(race.meetingId) === meetingKey(meeting.id))
      );

      return {
        visibleRaces,
        safeMeetings,
        initialMeetingKey: firstMeetingWithRace
          ? meetingKey(firstMeetingWithRace.id)
          : visibleRaces[0]
            ? meetingKey(visibleRaces[0].meetingId)
            : null,
      };
    });
}

function formatMeetingDate(value) {
  if (!value) return 'Chưa cập nhật ngày';
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function formatRaceTime(value) {
  if (!value) return '--:--';
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

function RaceStatusChip({ status }) {
  const tone = STATUS_TONE[status] || 'muted';

  return (
    <span className={`schedule-status schedule-status--${tone}`}>
      <span className="schedule-status-dot" />
      {STATUS_LABEL[status] || status}
    </span>
  );
}

function CountdownBadge({ raceTime }) {
  const [countdown, setCountdown] = useState({ text: '', soon: false });

  useEffect(() => {
    const update = () => {
      const diff = new Date(raceTime).getTime() - Date.now();

      if (!Number.isFinite(diff) || diff <= 0) {
        setCountdown({ text: 'Đã bắt đầu', soon: true });
        return;
      }

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      const text = hours > 0
        ? `Còn ${hours} giờ ${minutes} phút`
        : minutes > 0
          ? `Còn ${minutes} phút ${seconds} giây`
          : `Còn ${seconds} giây`;

      setCountdown({ text, soon: diff < 30 * 60 * 1000 });
    };

    update();
    const intervalId = setInterval(update, 1000);
    return () => clearInterval(intervalId);
  }, [raceTime]);

  return (
    <span className={`schedule-countdown ${countdown.soon ? 'schedule-countdown--soon' : ''}`}>
      <Clock size={12} />
      {countdown.text}
    </span>
  );
}

export default function SpectatorSchedulePage() {
  const navigate = useNavigate();
  const [races, setRaces] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeMeetingKey, setActiveMeetingKey] = useState(null);

  const load = () => {
    setLoading(true);
    setError('');

    fetchSchedule()
      .then(({ visibleRaces, safeMeetings, initialMeetingKey }) => {
        setRaces(visibleRaces);
        setMeetings(safeMeetings);
        setActiveMeetingKey(initialMeetingKey);
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được lịch đua.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let alive = true;

    fetchSchedule()
      .then(({ visibleRaces, safeMeetings, initialMeetingKey }) => {
        if (!alive) return;
        setRaces(visibleRaces);
        setMeetings(safeMeetings);
        setActiveMeetingKey(initialMeetingKey);
      })
      .catch((err) => {
        if (alive) setError(getApiErrorMessage(err, 'Không tải được lịch đua.'));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => { alive = false; };
  }, []);

  const meetingMap = useMemo(
    () => new Map(meetings.map((meeting) => [meetingKey(meeting.id), meeting])),
    [meetings]
  );

  const racesByMeeting = useMemo(() => races.reduce((groups, race) => {
    const key = meetingKey(race.meetingId);
    if (!groups[key]) groups[key] = [];
    groups[key].push(race);
    return groups;
  }, {}), [races]);

  const meetingKeys = useMemo(() => Object.keys(racesByMeeting), [racesByMeeting]);
  const activeRaces = racesByMeeting[activeMeetingKey] || [];
  const activeMeeting = meetingMap.get(activeMeetingKey);
  const runningCount = races.filter((race) => race.status === RACE_STATUS.RUNNING).length;
  const upcomingCount = races.filter((race) =>
    [RACE_STATUS.SCHEDULED, RACE_STATUS.OPEN_FOR_ENTRY, RACE_STATUS.CLOSED_FOR_ENTRY].includes(race.status)
  ).length;

  if (loading) {
    return <div className="spectator-context schedule-state"><Loading /></div>;
  }

  if (error) {
    return (
      <div className="spectator-context schedule-state">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="spectator-context schedule-page">
      <div className="schedule-shell">
        <section className="schedule-hero">
          <div className="schedule-hero-glow" />
          <div className="schedule-hero-content">
            <span className="schedule-eyebrow">
              <FlagFill size={12} /> FPT Racing · Lịch thi đấu
            </span>
            <h1>Lịch đua hôm nay</h1>
            <p>
              Theo dõi thời gian xuất phát, trạng thái và thông tin chi tiết của từng cuộc đua.
            </p>
          </div>

          <div className="schedule-stats" aria-label="Thống kê lịch đua">
            <div className="schedule-stat">
              <span className="schedule-stat-icon"><Calendar3 /></span>
              <div>
                <strong>{meetingKeys.length}</strong>
                <span>Ngày đua</span>
              </div>
            </div>
            <div className="schedule-stat">
              <span className="schedule-stat-icon"><FlagFill /></span>
              <div>
                <strong>{races.length}</strong>
                <span>Cuộc đua</span>
              </div>
            </div>
            <div className="schedule-stat">
              <span className="schedule-stat-icon"><Clock /></span>
              <div>
                <strong>{runningCount || upcomingCount}</strong>
                <span>{runningCount ? 'Đang diễn ra' : 'Sắp diễn ra'}</span>
              </div>
            </div>
          </div>
        </section>

        {meetingKeys.length === 0 ? (
          <div className="schedule-empty-panel">
            <EmptyState message="Chưa có cuộc đua nào được công bố." />
          </div>
        ) : (
          <section className="schedule-board">
            <div className="schedule-tabs" role="tablist" aria-label="Chọn ngày đua">
              {meetingKeys.map((key) => {
                const meeting = meetingMap.get(key);
                const isActive = key === activeMeetingKey;

                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`schedule-tab ${isActive ? 'schedule-tab--active' : ''}`}
                    onClick={() => setActiveMeetingKey(key)}
                  >
                    <span>{meeting?.name || 'Cuộc đua khác'}</span>
                    <small>{(racesByMeeting[key] || []).length} chặng</small>
                  </button>
                );
              })}
            </div>

            <div className="schedule-meeting-bar">
              <div className="schedule-meeting-title">
                <span className="schedule-meeting-pin"><GeoAltFill /></span>
                <div>
                  <strong>{activeMeeting?.name || 'Lịch đua mở rộng'}</strong>
                  <span>{activeMeeting?.racecourseName || 'FPT Racing Arena'}</span>
                </div>
              </div>
              <div className="schedule-meeting-meta">
                <span><Calendar3 /> {formatMeetingDate(activeMeeting?.date)}</span>
                <span><FlagFill /> {activeRaces.length} cuộc đua</span>
              </div>
            </div>

            <div className="schedule-race-list">
              {activeRaces.length === 0 ? (
                <div className="schedule-empty-panel">
                  <EmptyState message="Không có cuộc đua nào trong ngày đua này." />
                </div>
              ) : activeRaces.map((race, index) => {
                const isOfficial = race.status === RACE_STATUS.OFFICIAL;
                const isRunning = race.status === RACE_STATUS.RUNNING;
                const isCancelled = race.status === RACE_STATUS.CANCELLED;

                return (
                  <article
                    key={race.id}
                    className={`schedule-race-card ${isRunning ? 'schedule-race-card--live' : ''} ${isCancelled ? 'schedule-race-card--cancelled' : ''}`}
                    onClick={() => navigate(`/spectator/race/${race.id}`)}
                  >
                    <div className="schedule-race-number">
                      <span>Race</span>
                      <strong>{String(race.raceNo || index + 1).padStart(2, '0')}</strong>
                    </div>

                    <div className="schedule-race-main">
                      <div className="schedule-race-heading">
                        <div>
                          <span className="schedule-race-kicker">
                            {isRunning ? '● LIVE NOW' : `CHẶNG ${String(race.raceNo || index + 1).padStart(2, '0')}`}
                          </span>
                          <h2>{race.name}</h2>
                        </div>
                        <div className="schedule-race-time">
                          <span>Xuất phát</span>
                          <strong>{formatRaceTime(race.raceTime)}</strong>
                        </div>
                      </div>

                      <div className="schedule-race-details">
                        {race.distance && <span><Rulers /> {race.distance}m</span>}
                        {race.trackType && <span><FlagFill /> {race.trackType}</span>}
                        {race.classRequirement && <span><StarFill /> Class {race.classRequirement}</span>}
                      </div>

                      <div className="schedule-race-footer">
                        <div className="schedule-race-state">
                          <RaceStatusChip status={race.status} />
                          {race.raceTime && ![RACE_STATUS.RUNNING, RACE_STATUS.OFFICIAL, RACE_STATUS.CANCELLED].includes(race.status) && (
                            <CountdownBadge raceTime={race.raceTime} />
                          )}
                        </div>

                        <div className="schedule-race-actions" onClick={(event) => event.stopPropagation()}>
                          {isOfficial && (
                            <button
                              type="button"
                              className="schedule-result-btn"
                              onClick={() => navigate(`/spectator/results/${race.id}`)}
                            >
                              <TrophyFill /> Kết quả
                            </button>
                          )}
                          <button
                            type="button"
                            className="schedule-detail-btn"
                            onClick={() => navigate(`/spectator/race/${race.id}`)}
                          >
                            Chi tiết <ArrowRight />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
