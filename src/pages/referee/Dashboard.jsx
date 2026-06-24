<<<<<<< HEAD
import { useEffect, useMemo, useState } from 'react';
=======
import { useEffect, useState } from 'react';
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
import { Link } from 'react-router-dom';
import { Badge, Button } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { raceService } from '../../services/raceService';
<<<<<<< HEAD
import { entryService } from '../../services/entryService';
import { refereeReportService } from '../../services/refereeReportService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { canEnterResult, RACE_ENTRY_STATUS, RACE_STATUS, STATUS_LABEL, STATUS_BADGE_VARIANT } from '../../constants/status';
=======
import { refereeReportService } from '../../services/refereeReportService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import {
  RACE_STATUS,
  RACE_RESULT_STATUS,
  STATUS_LABEL,
  STATUS_BADGE_VARIANT,
} from '../../constants/status';
import {
  VIOLATION_LABEL,
  DECISION_LABEL,
  DECISION_BADGE,
} from '../../mocks/mockRefereeReports';
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';

const GOLD = '#D4AF37';
<<<<<<< HEAD
=======

>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
const CARD_STYLE = {
  backgroundColor: '#1a1a1a',
  color: '#f5f5f5',
  border: '1px solid #333',
};
<<<<<<< HEAD
=======

>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
const HEADER_STYLE = {
  backgroundColor: 'transparent',
  borderBottom: `1px solid ${GOLD}`,
};

<<<<<<< HEAD
const REPORT_TYPE_LABEL = {
  PRE_RACE: 'Trước đua',
  VIOLATION: 'Vi phạm',
  DECISION: 'Quyết định',
};
const REPORT_TYPE_BADGE = {
  PRE_RACE: 'info',
  VIOLATION: 'warning',
  DECISION: 'primary',
};

function StatCard({ label, value, hint, accent }) {
  const border = {
=======
/* ── Stat card ── */
function StatCard({ label, value, hint, accent }) {
  const BORDER = {
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
    primary: '#0d6efd',
    success: '#198754',
    warning: '#D4AF37',
    danger: '#dc3545',
    info: '#0dcaf0',
  };
<<<<<<< HEAD

  return (
    <div className="card h-100 shadow-sm" style={{ ...CARD_STYLE, borderLeft: `4px solid ${border[accent] || GOLD}` }}>
      <div className="card-body">
        <h6 className="text-uppercase mb-2" style={{ color: '#a0a0a0', fontSize: 12, letterSpacing: 1 }}>
=======
  return (
    <div
      className="card h-100 shadow-sm"
      style={{ ...CARD_STYLE, borderLeft: `4px solid ${BORDER[accent] || GOLD}` }}
    >
      <div className="card-body">
        <h6 className="text-uppercase mb-2" style={{ color: '#a0a0a0', fontSize: '12px', letterSpacing: '1px' }}>
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
          {label}
        </h6>
        <h2 className="display-6 fw-bold mb-1" style={{ color: GOLD }}>{value}</h2>
        {hint && <small className="text-muted">{hint}</small>}
      </div>
    </div>
  );
}

<<<<<<< HEAD
=======
/* ── Result status badge (not in STATUS_BADGE_VARIANT for null) ── */
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
function ResultBadge({ resultStatus }) {
  if (!resultStatus) return <Badge bg="secondary">Chưa có</Badge>;
  return <Badge bg={STATUS_BADGE_VARIANT[resultStatus] || 'secondary'}>{STATUS_LABEL[resultStatus] || resultStatus}</Badge>;
}

<<<<<<< HEAD
const normalizeReportType = (report) => {
  if (report.reportType) return report.reportType;
  if (report.violationType && report.violationType !== 'none') return 'VIOLATION';
  if (report.decision && report.decision !== 'no_action') return 'DECISION';
  return 'PRE_RACE';
};

=======
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
export default function RefereeDashboard() {
  const { user } = useAuth();
  const name = user?.fullName || 'Referee';

  const [races, setRaces] = useState([]);
<<<<<<< HEAD
  const [entries, setEntries] = useState([]);
=======
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([
<<<<<<< HEAD
      raceService.getAssignedToReferee(user),
      entryService.getForReferee(user),
    ])
      .then(async ([raceData, entryData]) => {
        setRaces(raceData);
        setEntries(entryData);
        const reportSets = await Promise.all(
          raceData.map((race) => refereeReportService.getByRace(race.id))
        );
        setReports(reportSets.flat());
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được dữ liệu referee.')))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const activeEntries = useMemo(
    () => entries.filter((entry) => entry.status !== RACE_ENTRY_STATUS.SCRATCHED),
    [entries]
  );

  const entriesNeedCheck = activeEntries.filter((entry) => (
    entry.status === RACE_ENTRY_STATUS.DECLARED
    || !entry.actualWeight
  ));
  const readyEntries = activeEntries.filter((entry) => entry.status === RACE_ENTRY_STATUS.PASSED);
  const pendingResultRaces = races.filter((race) => canEnterResult(race.status) && !race.resultStatus);
  const runningOrReviewRaces = races.filter((race) => (
    race.status === RACE_STATUS.RUNNING || race.status === RACE_STATUS.RESULT_PENDING
  ));

  const reportsByType = reports.reduce((acc, report) => {
    const type = normalizeReportType(report);
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const recentReports = [...reports]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);
=======
      raceService.getAssignedToReferee(user?.userId),
      refereeReportService.getByReferee(user?.userId),
    ])
      .then(([r, rep]) => {
        setRaces(r);
        setReports(rep);
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được dữ liệu.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={load} />;

<<<<<<< HEAD
  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Xin chào, {name}</h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Tổng quan các race được phân công, entry cần kiểm tra và báo cáo đã nộp.
          </p>
        </div>
        <Link to="/referee/checks">
          <Button className="btn-gold-sm" style={{ padding: '8px 18px' }}>Mở trang kiểm tra</Button>
        </Link>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard label="Race được phân công" value={races.length} hint="Theo referee hiện tại" accent="primary" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard label="Entry cần check" value={entriesNeedCheck.length} hint={`${readyEntries.length} entry đã ready`} accent="warning" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard label="Cần nhập kết quả" value={pendingResultRaces.length} hint="Race đã đóng entry, chưa có kết quả" accent="danger" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard label="Báo cáo đã nộp" value={reports.length} hint={`${runningOrReviewRaces.length} race đang chạy/review`} accent="info" />
        </div>
      </div>

      <div className="row g-4 mb-4">
=======
  /* ── Derived stats ── */
  const pendingResultRaces = races.filter(
    (r) => r.status === RACE_STATUS.COMPLETED && !r.resultStatus
  );
  const upcomingRaces = races.filter((r) => r.status !== RACE_STATUS.COMPLETED);
  const violations = reports.filter((r) => r.violationType !== 'none');

  /* ── Decision breakdown ── */
  const decisionCount = reports.reduce((acc, r) => {
    acc[r.decision] = (acc[r.decision] || 0) + 1;
    return acc;
  }, {});

  /* ── Violation breakdown ── */
  const violationCount = violations.reduce((acc, r) => {
    acc[r.violationType] = (acc[r.violationType] || 0) + 1;
    return acc;
  }, {});

  /* ── Recent 5 reports ── */
  const recentReports = [...reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div>
      {/* Header */}
      <h2 className="mb-1" style={{ color: GOLD }}>Xin chào, {name} ⚖️</h2>
      <p className="text-muted mb-4">Tổng quan race được phân công, báo cáo và quyết định xử lý vi phạm.</p>

      {/* Stat cards */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard label="Race được phân công" value={races.length} hint="Tổng cộng" accent="primary" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard label="Cần nhập kết quả" value={pendingResultRaces.length} hint="Race đã hoàn thành, chưa có kết quả" accent="danger" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard label="Báo cáo đã nộp" value={reports.length} hint="Của bạn" accent="info" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard label="Vi phạm ghi nhận" value={violations.length} hint={`Trên ${reports.length} báo cáo`} accent="warning" />
        </div>
      </div>

      {/* Row 2: Assigned races + Decision summary */}
      <div className="row g-4 mb-4">
        {/* Assigned races table */}
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm" style={CARD_STYLE}>
            <div className="card-header d-flex justify-content-between align-items-center" style={HEADER_STYLE}>
              <h5 className="mb-0" style={{ color: GOLD }}>Race được phân công</h5>
<<<<<<< HEAD
              <Link to="/referee/checks">
                <Button size="sm" style={{ borderColor: GOLD, color: GOLD, backgroundColor: 'transparent' }}>
                  Kiểm tra entry
=======
              <Link to="/referee/results">
                <Button size="sm" style={{ borderColor: GOLD, color: GOLD, backgroundColor: 'transparent' }}>
                  Xem tất cả kết quả
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
                </Button>
              </Link>
            </div>

            {races.length === 0 ? (
              <div className="card-body"><EmptyState message="Bạn chưa được phân công race nào." /></div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th style={{ color: GOLD, borderColor: '#333' }}>Race</th>
                      <th style={{ color: GOLD, borderColor: '#333' }}>Meeting</th>
                      <th style={{ color: GOLD, borderColor: '#333' }}>Thời gian</th>
                      <th style={{ color: GOLD, borderColor: '#333' }}>Trạng thái</th>
                      <th style={{ color: GOLD, borderColor: '#333' }}>Kết quả</th>
                      <th style={{ color: GOLD, borderColor: '#333' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {races.map((race) => (
                      <tr key={race.id}>
                        <td style={{ borderColor: '#2a2a2a' }}>{race.name}</td>
<<<<<<< HEAD
                        <td style={{ borderColor: '#2a2a2a', color: '#a0a0a0' }}>{race.meetingName || '—'}</td>
                        <td style={{ borderColor: '#2a2a2a', color: '#a0a0a0' }}>{formatDate(race.raceTime)}</td>
                        <td style={{ borderColor: '#2a2a2a' }}><StatusBadge status={race.status} /></td>
                        <td style={{ borderColor: '#2a2a2a' }}><ResultBadge resultStatus={race.resultStatus} /></td>
                        <td style={{ borderColor: '#2a2a2a' }}>
                          <div className="d-flex gap-2 flex-wrap">
                            <Link to="/referee/checks"><Button size="sm" variant="outline-info">Check</Button></Link>
                            {canEnterResult(race.status) && !race.resultStatus && (
                              <Link to="/referee/results"><Button size="sm" variant="warning">Nhập kết quả</Button></Link>
                            )}
                            <Link to="/referee/reports"><Button size="sm" variant="outline-warning">Báo cáo</Button></Link>
=======
                        <td style={{ borderColor: '#2a2a2a', color: '#a0a0a0' }}>{race.meetingName}</td>
                        <td style={{ borderColor: '#2a2a2a', color: '#a0a0a0' }}>{formatDate(race.raceTime)}</td>
                        <td style={{ borderColor: '#2a2a2a' }}>
                          <StatusBadge status={race.status} />
                        </td>
                        <td style={{ borderColor: '#2a2a2a' }}>
                          <ResultBadge resultStatus={race.resultStatus} />
                        </td>
                        <td style={{ borderColor: '#2a2a2a' }}>
                          <div className="d-flex gap-2 flex-wrap">
                            {race.status === RACE_STATUS.COMPLETED && !race.resultStatus && (
                              <Link to="/referee/results">
                                <Button size="sm" variant="warning" style={{ fontSize: '12px' }}>
                                  Nhập kết quả
                                </Button>
                              </Link>
                            )}
                            <Link to="/referee/reports">
                              <Button
                                size="sm"
                                style={{
                                  fontSize: '12px',
                                  borderColor: GOLD,
                                  color: GOLD,
                                  backgroundColor: 'transparent',
                                }}
                              >
                                Báo cáo
                              </Button>
                            </Link>
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

<<<<<<< HEAD
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm h-100" style={CARD_STYLE}>
            <div className="card-header" style={HEADER_STYLE}>
              <h5 className="mb-0" style={{ color: GOLD }}>Tình trạng báo cáo</h5>
            </div>
            <div className="card-body">
              {Object.entries(REPORT_TYPE_LABEL).map(([type, label]) => (
                <div key={type} className="d-flex justify-content-between align-items-center mb-3">
                  <Badge bg={REPORT_TYPE_BADGE[type]}>{label}</Badge>
                  <span className="fw-bold" style={{ color: GOLD }}>{reportsByType[type] || 0}</span>
                </div>
              ))}
              <hr style={{ borderColor: '#333' }} />
              <div className="d-grid gap-2">
                <Link to="/referee/reports" className="btn btn-outline-warning btn-sm">Nộp báo cáo mới</Link>
                <Link to="/referee/results" className="btn btn-outline-info btn-sm">Nhập kết quả đua</Link>
              </div>
=======
        {/* Decision summary */}
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm h-100" style={CARD_STYLE}>
            <div className="card-header" style={HEADER_STYLE}>
              <h5 className="mb-0" style={{ color: GOLD }}>Tổng kết quyết định</h5>
            </div>
            <div className="card-body">
              {/* Decision breakdown */}
              <p className="mb-2" style={{ color: '#a0a0a0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Theo hình thức xử lý
              </p>
              {Object.keys(DECISION_LABEL).map((key) => (
                <div key={key} className="d-flex justify-content-between align-items-center mb-2">
                  <Badge bg={DECISION_BADGE[key]}>{DECISION_LABEL[key]}</Badge>
                  <span className="fw-bold" style={{ color: GOLD }}>{decisionCount[key] || 0}</span>
                </div>
              ))}

              <hr style={{ borderColor: '#333' }} />

              {/* Violation type breakdown */}
              <p className="mb-2" style={{ color: '#a0a0a0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Theo loại vi phạm
              </p>
              {Object.entries(VIOLATION_LABEL)
                .filter(([key]) => key !== 'none')
                .map(([key, label]) => (
                  <div key={key} className="d-flex justify-content-between align-items-center mb-2">
                    <span style={{ color: '#e0e0e0' }}>{label}</span>
                    <span className="fw-bold" style={{ color: violationCount[key] ? GOLD : '#555' }}>
                      {violationCount[key] || 0}
                    </span>
                  </div>
                ))}
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
            </div>
          </div>
        </div>
      </div>

<<<<<<< HEAD
      <div className="card shadow-sm" style={CARD_STYLE}>
        <div className="card-header d-flex justify-content-between align-items-center" style={HEADER_STYLE}>
          <h5 className="mb-0" style={{ color: GOLD }}>Báo cáo gần đây</h5>
          <Link to="/referee/reports">
            <Button size="sm" style={{ borderColor: GOLD, color: GOLD, backgroundColor: 'transparent' }}>
              Xem tất cả
            </Button>
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <div className="card-body"><EmptyState message="Bạn chưa nộp báo cáo nào." /></div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ color: GOLD, borderColor: '#333' }}>Race</th>
                  <th style={{ color: GOLD, borderColor: '#333' }}>Loại</th>
                  <th style={{ color: GOLD, borderColor: '#333' }}>Nội dung</th>
                  <th style={{ color: GOLD, borderColor: '#333' }}>Ngày nộp</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report) => {
                  const type = normalizeReportType(report);
                  return (
                    <tr key={report.id}>
                      <td style={{ borderColor: '#2a2a2a' }}>{report.raceName || `Race #${report.raceId}`}</td>
                      <td style={{ borderColor: '#2a2a2a' }}>
                        <Badge bg={REPORT_TYPE_BADGE[type] || 'secondary'}>{REPORT_TYPE_LABEL[type] || type}</Badge>
                      </td>
                      <td style={{ borderColor: '#2a2a2a', color: '#c0c0c0', maxWidth: 420 }}>
                        <span className="text-truncate d-block" title={report.content}>{report.content}</span>
                      </td>
                      <td style={{ borderColor: '#2a2a2a', color: '#a0a0a0', whiteSpace: 'nowrap' }}>
                        {formatDate(report.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
=======
      {/* Row 3: Recent reports */}
      <div className="row g-4">
        <div className="col-12">
          <div className="card shadow-sm" style={CARD_STYLE}>
            <div className="card-header d-flex justify-content-between align-items-center" style={HEADER_STYLE}>
              <h5 className="mb-0" style={{ color: GOLD }}>Báo cáo gần đây</h5>
              <Link to="/referee/reports">
                <Button size="sm" style={{ borderColor: GOLD, color: GOLD, backgroundColor: 'transparent' }}>
                  Xem tất cả & Nộp báo cáo mới
                </Button>
              </Link>
            </div>

            {recentReports.length === 0 ? (
              <div className="card-body">
                <EmptyState message="Bạn chưa nộp báo cáo nào." />
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th style={{ color: GOLD, borderColor: '#333' }}>Race</th>
                      <th style={{ color: GOLD, borderColor: '#333' }}>Loại vi phạm</th>
                      <th style={{ color: GOLD, borderColor: '#333' }}>Quyết định</th>
                      <th style={{ color: GOLD, borderColor: '#333' }}>Nội dung</th>
                      <th style={{ color: GOLD, borderColor: '#333' }}>Ngày nộp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentReports.map((rep) => (
                      <tr key={rep.id}>
                        <td style={{ borderColor: '#2a2a2a' }}>{rep.raceName}</td>
                        <td style={{ borderColor: '#2a2a2a' }}>
                          <Badge bg={rep.violationType === 'none' ? 'secondary' : 'danger'}>
                            {VIOLATION_LABEL[rep.violationType] || rep.violationType}
                          </Badge>
                        </td>
                        <td style={{ borderColor: '#2a2a2a' }}>
                          <Badge bg={DECISION_BADGE[rep.decision] || 'secondary'}>
                            {DECISION_LABEL[rep.decision] || rep.decision}
                          </Badge>
                        </td>
                        <td style={{ borderColor: '#2a2a2a', color: '#c0c0c0', maxWidth: '320px' }}>
                          <span className="text-truncate d-block" style={{ maxWidth: '300px' }} title={rep.content}>
                            {rep.content}
                          </span>
                        </td>
                        <td style={{ borderColor: '#2a2a2a', color: '#a0a0a0', whiteSpace: 'nowrap' }}>
                          {formatDate(rep.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
      </div>
    </div>
  );
}
