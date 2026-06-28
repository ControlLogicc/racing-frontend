import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { raceService } from '../../services/raceService';
import { meetingService } from '../../services/meetingService';
import { getApiErrorMessage } from '../../utils/apiError';
import { RACE_STATUS, STATUS_LABEL } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import './spectator-theme.css';

const STATUS_COLOR = {
  SCHEDULED:       { bg: 'rgba(212,175,55,0.08)', text: '#c8a84b', dot: '#D4AF37' },
  OPEN_FOR_ENTRY:  { bg: 'rgba(76,175,125,0.12)', text: '#4caf7d', dot: '#4caf7d' },
  CLOSED_FOR_ENTRY:{ bg: 'rgba(251,146,60,0.12)', text: '#fb923c', dot: '#f97316' },
  RUNNING:         { bg: 'rgba(239,68,68,0.12)', text: '#f87171', dot: '#ef4444' },
  RESULT_PENDING:  { bg: 'rgba(167,139,250,0.12)', text: '#a78bfa', dot: '#8b5cf6' },
  OFFICIAL:        { bg: 'rgba(76,175,125,0.12)', text: '#4caf7d', dot: '#4caf7d' },
  CANCELLED:       { bg: 'rgba(107,114,128,0.1)', text: '#6b7280', dot: '#4b5563' },
};

function RaceStatusChip({ status }) {
  const c = STATUS_COLOR[status] || { bg: '#1e293b', text: '#94a3b8', dot: '#64748b' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: c.bg, color: c.text,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: 0.8,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0,
        boxShadow: status === 'RUNNING' ? `0 0 6px ${c.dot}` : 'none',
        animation: status === 'RUNNING' ? 'pulse 1.2s infinite' : 'none',
      }} />
      {STATUS_LABEL[status] || status}
    </span>
  );
}

function CountdownBadge({ raceTime }) {
  const [text, setText] = useState('');
  useEffect(() => {
    const update = () => {
      const diff = new Date(raceTime) - Date.now();
      if (diff <= 0) { setText('Đã bắt đầu'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (h > 0) setText(`${h}g ${m}p`);
      else if (m > 0) setText(`${m}p ${s}s`);
      else setText(`${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [raceTime]);
  const soon = (new Date(raceTime) - Date.now()) < 30 * 60 * 1000;
  return (
    <span style={{ fontSize: 11, fontFamily: 'monospace', color: soon ? '#f87171' : '#64748b', fontWeight: 600 }}>
      {text}
    </span>
  );
}

export default function SpectatorSchedulePage() {
  const navigate = useNavigate();
  const [races, setRaces] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeMeetingId, setActiveMeetingId] = useState(null);

  const load = () => {
    Promise.all([raceService.getPublic(), meetingService.getPublic()])
      .then(([r, m]) => {
        const visible = r.filter((race) => String(race.status).toUpperCase() !== 'DRAFT');
        setRaces(visible);
        setMeetings(m);
        if (m.length > 0) setActiveMeetingId(m[0].id);
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được lịch đua.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const meetingMap = useMemo(() => new Map(meetings.map((m) => [m.id, m])), [meetings]);

  // Group races by meeting
  const byMeeting = useMemo(() => {
    const map = {};
    [...races].sort((a, b) => new Date(a.raceTime || 0) - new Date(b.raceTime || 0)).forEach((r) => {
      const key = r.meetingId ?? 'other';
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }, [races]);

  const meetingIds = useMemo(() => Object.keys(byMeeting).map(Number).filter(Boolean), [byMeeting]);

  const activeRaces = useMemo(() => byMeeting[activeMeetingId] || [], [byMeeting, activeMeetingId]);

  const activeMeeting = meetingMap.get(activeMeetingId);

  if (loading) return <div style={{ padding: 40 }}><Loading /></div>;
  if (error) return <div style={{ padding: 40 }}><ErrorState message={error} onRetry={() => { setLoading(true); setError(''); load(); }} /></div>;

  return (
    <div className="spectator-container" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .hkjc-race-card:hover { background: rgba(212,175,55,0.05) !important; border-color: rgba(212,175,55,0.25) !important; }
        .hkjc-meeting-tab:hover { color: #D4AF37 !important; }
        .hkjc-action-btn:hover { background: rgba(212,175,55,0.2) !important; color:#D4AF37 !important; }
        .hkjc-result-btn:hover { background: rgba(76,175,125,0.25) !important; }
      `}</style>

      {/* Top header bar */}
      <div className="spectator-hero mb-0" style={{ borderRadius: '12px 12px 0 0', padding: '20px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: '#6a5a40', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>FPT Racing · Lịch thi đấu</div>
            <h1 style={{ color: '#D4AF37', fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', margin: 0, fontWeight: 800 }}>
              Race Day Schedule
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#6a5a40', letterSpacing: 1, textTransform: 'uppercase' }}>Tổng số cuộc đua</div>
            <div style={{ fontSize: 32, color: '#D4AF37', fontWeight: 900, lineHeight: 1 }}>{races.length}</div>
          </div>
        </div>
      </div>

      {/* Meeting tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(212,175,55,0.15)', overflowX: 'auto', background: 'rgba(10,10,10,0.6)' }}>
        {meetingIds.map((mid) => {
          const m = meetingMap.get(mid);
          const cnt = (byMeeting[mid] || []).length;
          const isActive = mid === activeMeetingId;
          return (
            <button key={mid}
              className="hkjc-meeting-tab"
              onClick={() => setActiveMeetingId(mid)}
              style={{
                background: 'transparent',
                border: 'none', borderBottom: isActive ? '3px solid #D4AF37' : '3px solid transparent',
                color: isActive ? '#D4AF37' : '#6a5a40',
                padding: '14px 24px', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                fontWeight: isActive ? 700 : 400, fontSize: 13, whiteSpace: 'nowrap',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
              }}>
              {m?.name || `Meeting ${mid}`}
              <span style={{
                background: isActive ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.04)',
                color: isActive ? '#D4AF37' : '#6a5a40',
                borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700,
              }}>{cnt}</span>
            </button>
          );
        })}
        {meetingIds.length === 0 && (
          <div style={{ padding: '14px 24px', color: '#6a5a40', fontSize: 13 }}>Không có meeting nào</div>
        )}
      </div>

      {/* Meeting info strip */}
      {activeMeeting && (
        <div style={{ background: 'rgba(212,175,55,0.04)', padding: '10px 24px', display: 'flex', gap: 24, alignItems: 'center', borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
          <span style={{ fontSize: 12, color: '#6a5a40' }}>
            📍 <strong style={{ color: '#c8bea0' }}>{activeMeeting.name}</strong>
          </span>
          {activeMeeting.date && (
            <span style={{ fontSize: 12, color: '#6a5a40' }}>
              📅 {new Date(activeMeeting.date).toLocaleDateString('vi-VN')}
            </span>
          )}
          <span style={{ fontSize: 12, color: '#6a5a40' }}>
            🏁 {activeRaces.length} cuộc đua
          </span>
        </div>
      )}

      {/* Race list */}
      <div style={{ padding: '12px 0' }}>
        {activeRaces.length === 0 ? (
          <div style={{ padding: 40 }}><EmptyState message="Không có cuộc đua nào trong meeting này." /></div>
        ) : (
          activeRaces.map((r, idx) => {
            const isOfficial = r.status === RACE_STATUS.OFFICIAL;
            const isRunning = r.status === 'RUNNING';
            const isCancelled = r.status === 'CANCELLED';
            return (
              <div key={r.id} className="hkjc-race-card"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 8, marginBottom: 6, marginLeft: 0, marginRight: 0,
                  border: `1px solid ${isRunning ? 'rgba(239,68,68,0.35)' : 'rgba(212,175,55,0.1)'}`,
                  boxShadow: isRunning ? '0 0 16px rgba(239,68,68,0.12)' : 'none',
                  opacity: isCancelled ? 0.45 : 1, overflow: 'hidden', transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                onClick={() => navigate(`/spectator/race/${r.id}`)}
              >
                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                  {/* Race number */}
                  <div style={{
                    minWidth: 68, background: isRunning ? 'rgba(239,68,68,0.1)' : 'rgba(212,175,55,0.05)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '16px 8px', borderRight: '1px solid rgba(212,175,55,0.08)',
                  }}>
                    <div style={{ fontSize: 9, color: '#6a5a40', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Race</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: isRunning ? '#ef4444' : '#D4AF37', lineHeight: 1 }}>
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Main info */}
                  <div style={{ flex: 1, padding: '14px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#f0e8d0', marginBottom: 6 }}>
                          {r.name}
                        </div>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          {r.distance && (
                            <span style={{ fontSize: 12, color: '#6a5a40' }}>
                              📏 <span style={{ color: '#8a7a60' }}>{r.distance}m</span>
                            </span>
                          )}
                          {r.trackType && (
                            <span style={{ fontSize: 12, color: '#6a5a40' }}>
                              🏟 <span style={{ color: '#8a7a60' }}>{r.trackType}</span>
                            </span>
                          )}
                          {r.classRequirement && (
                            <span style={{ fontSize: 12, color: '#6a5a40' }}>
                              ⭐ <span style={{ color: '#8a7a60' }}>Class {r.classRequirement}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#D4AF37', marginBottom: 3, fontFamily: 'monospace' }}>
                          {r.raceTime ? new Date(r.raceTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </div>
                        {r.raceTime && !['RUNNING','OFFICIAL','CANCELLED'].includes(r.status) && (
                          <CountdownBadge raceTime={r.raceTime} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right column: status + actions */}
                  <div style={{
                    minWidth: 200, borderLeft: '1px solid rgba(212,175,55,0.08)',
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
                    justifyContent: 'center', padding: '14px 18px', gap: 8,
                  }}>
                    <RaceStatusChip status={r.status} />
                    <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                      <button className="hkjc-action-btn"
                        onClick={() => navigate(`/spectator/race/${r.id}`)}
                        style={{
                          background: 'rgba(212,175,55,0.08)', color: '#c8a84b',
                          border: '1px solid rgba(212,175,55,0.2)',
                          borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: 700,
                          cursor: 'pointer', letterSpacing: 0.5, transition: 'all 0.2s',
                        }}>
                        Chi tiết →
                      </button>
                      {isOfficial && (
                        <button className="hkjc-result-btn"
                          onClick={() => navigate(`/spectator/results/${r.id}`)}
                          style={{
                            background: 'rgba(76,175,125,0.12)', color: '#4caf7d',
                            border: '1px solid rgba(76,175,125,0.3)',
                            borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: 700,
                            cursor: 'pointer', letterSpacing: 0.5, transition: 'all 0.2s',
                          }}>
                          🏆 Kết quả
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
