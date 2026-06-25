import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { raceService } from '../../services/raceService';
import { entryService } from '../../services/entryService';
import { refereeReportService } from '../../services/refereeReportService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { canEnterResult, RACE_ENTRY_STATUS, RACE_STATUS, STATUS_LABEL, STATUS_BADGE_VARIANT } from '../../constants/status';
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
    primary: '#0d6efd',
    success: '#198754',
    warning: '#D4AF37',
    danger: '#dc3545',
    info: '#0dcaf0',
  };

  return (
    <div className="card h-100 shadow-sm" style={{ ...CARD_STYLE, borderLeft: `4px solid ${border[accent] || GOLD}` }}>
      <div className="card-body">
        <h6 className="text-uppercase mb-2" style={{ color: '#a0a0a0', fontSize: 12, letterSpacing: 1 }}>
          {label}
        </h6>
        <h2 className="display-6 fw-bold mb-1" style={{ color: GOLD }}>{value}</h2>
        {hint && <small className="text-muted">{hint}</small>}
      </div>
    </div>
  );
}

function ResultBadge({ resultStatus }) {
  if (!resultStatus) return <Badge bg="secondary">Chưa có</Badge>;
  return <Badge bg={STATUS_BADGE_VARIANT[resultStatus] || 'secondary'}>{STATUS_LABEL[resultStatus] || resultStatus}</Badge>;
}

const normalizeReportType = (report) => {
  if (report.reportType) return report.reportType;
  if (report.violationType && report.violationType !== 'none') return 'VIOLATION';
  if (report.decision && report.decision !== 'no_action') return 'DECISION';
  return 'PRE_RACE';
};

export default function RefereeDashboard() {
  const { user } = useAuth();
  const name = user?.fullName || 'Referee';

  const [races, setRaces] = useState([]);
  const [entries, setEntries] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([
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

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={load} />;

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
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm" style={CARD_STYLE}>
            <div className="card-header d-flex justify-content-between align-items-center" style={HEADER_STYLE}>
              <h5 className="mb-0" style={{ color: GOLD }}>Race được phân công</h5>
              <Link to="/referee/checks">
                <Button size="sm" style={{ borderColor: GOLD, color: GOLD, backgroundColor: 'transparent' }}>
                  Kiểm tra entry
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
            </div>
          </div>
        </div>
      </div>

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
      </div>
    </div>
  );
}
