import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { raceService } from '../../services/raceService';
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
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';

const GOLD = '#D4AF37';

const CARD_STYLE = {
  backgroundColor: '#1a1a1a',
  color: '#f5f5f5',
  border: '1px solid #333',
};

const HEADER_STYLE = {
  backgroundColor: 'transparent',
  borderBottom: `1px solid ${GOLD}`,
};

/* ── Stat card ── */
function StatCard({ label, value, hint, accent }) {
  const BORDER = {
    primary: '#0d6efd',
    success: '#198754',
    warning: '#D4AF37',
    danger: '#dc3545',
    info: '#0dcaf0',
  };
  return (
    <div
      className="card h-100 shadow-sm"
      style={{ ...CARD_STYLE, borderLeft: `4px solid ${BORDER[accent] || GOLD}` }}
    >
      <div className="card-body">
        <h6 className="text-uppercase mb-2" style={{ color: '#a0a0a0', fontSize: '12px', letterSpacing: '1px' }}>
          {label}
        </h6>
        <h2 className="display-6 fw-bold mb-1" style={{ color: GOLD }}>{value}</h2>
        {hint && <small className="text-muted">{hint}</small>}
      </div>
    </div>
  );
}

/* ── Result status badge (not in STATUS_BADGE_VARIANT for null) ── */
function ResultBadge({ resultStatus }) {
  if (!resultStatus) return <Badge bg="secondary">Chưa có</Badge>;
  return <Badge bg={STATUS_BADGE_VARIANT[resultStatus] || 'secondary'}>{STATUS_LABEL[resultStatus] || resultStatus}</Badge>;
}

export default function RefereeDashboard() {
  const { user } = useAuth();
  const name = user?.fullName || 'Referee';

  const [races, setRaces] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([
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

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={load} />;

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
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm" style={CARD_STYLE}>
            <div className="card-header d-flex justify-content-between align-items-center" style={HEADER_STYLE}>
              <h5 className="mb-0" style={{ color: GOLD }}>Race được phân công</h5>
              <Link to="/referee/results">
                <Button size="sm" style={{ borderColor: GOLD, color: GOLD, backgroundColor: 'transparent' }}>
                  Xem tất cả kết quả
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
            </div>
          </div>
        </div>
      </div>

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
      </div>
    </div>
  );
}
