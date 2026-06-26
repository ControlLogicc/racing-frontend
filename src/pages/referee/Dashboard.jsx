import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
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
import './referee-theme.css'; // Import the new theme

const REPORT_TYPE_LABEL = {
  PRE_RACE: 'Trước đua',
  VIOLATION: 'Vi phạm',
  DECISION: 'Quyết định',
};
const REPORT_TYPE_BADGE = {
  PRE_RACE: 'info',
  VIOLATION: 'danger',
  DECISION: 'warning',
};

function StatCard({ label, value, hint, accent }) {
  return (
    <div className={`cyber-stat-card accent-${accent}`}>
      <h6 className="stat-label">{label}</h6>
      <h2 className="stat-value">{value}</h2>
      {hint && <small className="stat-hint">{hint}</small>}
    </div>
  );
}

function ResultBadge({ resultStatus }) {
  if (!resultStatus) return <span className="cyber-badge cyber-badge-secondary">Chưa có</span>;
  const variant = STATUS_BADGE_VARIANT[resultStatus] || 'secondary';
  return <span className={`cyber-badge cyber-badge-${variant}`}>{STATUS_LABEL[resultStatus] || resultStatus}</span>;
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
    <div className="referee-context">
      <div className="referee-hero d-flex justify-content-between align-items-center">
        <div>
          <h2>SYSTEM ONLINE: {name}</h2>
          <p className="mb-0">
            &gt; SYSTEM STATUS: MONITORING RACES & ENTRIES...
          </p>
        </div>
        <Link to="/referee/checks">
          <Button className="btn-cyber btn-cyber-primary">MỞ TRÌNH KIỂM TRA</Button>
        </Link>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard label="Race Phân Công" value={races.length} hint="Tổng số race phụ trách" accent="primary" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard label="Cần Kiểm Tra" value={entriesNeedCheck.length} hint={`${readyEntries.length} entry đã ĐẠT`} accent="warning" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard label="Chờ Kết Quả" value={pendingResultRaces.length} hint="Race cần nhập kết quả ngay" accent="danger" />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard label="Báo Cáo Vi Phạm" value={reports.length} hint={`${runningOrReviewRaces.length} race đang giám sát`} accent="success" />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-8">
          <div className="cyber-panel">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0 text-info fw-bold" style={{ letterSpacing: '1px' }}>RACES ASSIGNED</h5>
              <Link to="/referee/checks">
                <Button className="btn-cyber btn-cyber-sm">Kiểm Tra Entry</Button>
              </Link>
            </div>

            {races.length === 0 ? (
              <EmptyState message="Không có race nào được phân công." />
            ) : (
              <div className="table-responsive">
                <table className="table-cyber w-100">
                  <thead>
                    <tr>
                      <th>Race</th>
                      <th>Meeting</th>
                      <th>Thời gian</th>
                      <th>Trạng thái</th>
                      <th>Kết quả</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {races.map((race) => (
                      <tr key={race.id}>
                        <td><strong className="text-white">{race.name}</strong></td>
                        <td>{race.meetingName || '—'}</td>
                        <td>{formatDate(race.raceTime)}</td>
                        <td><StatusBadge status={race.status} /></td>
                        <td><ResultBadge resultStatus={race.resultStatus} /></td>
                        <td>
                          <div className="d-flex gap-2 flex-wrap">
                            <Link to="/referee/checks"><Button className="btn-cyber btn-cyber-sm">Check</Button></Link>
                            {canEnterResult(race.status) && !race.resultStatus && (
                              <Link to="/referee/results"><Button className="btn-cyber btn-cyber-danger btn-cyber-sm">Nhập KQ</Button></Link>
                            )}
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
          <div className="cyber-panel h-100">
            <h5 className="mb-4 text-info fw-bold" style={{ letterSpacing: '1px' }}>REPORT STATUS</h5>
            <div className="mb-4">
              {Object.entries(REPORT_TYPE_LABEL).map(([type, label]) => (
                <div key={type} className="d-flex justify-content-between align-items-center mb-3">
                  <span className={`cyber-badge cyber-badge-${REPORT_TYPE_BADGE[type]}`}>{label}</span>
                  <span className="fs-5 fw-bold text-white">{reportsByType[type] || 0}</span>
                </div>
              ))}
            </div>
            <hr style={{ borderColor: 'rgba(0, 229, 255, 0.2)' }} />
            <div className="d-grid gap-3 mt-4">
              <Link to="/referee/reports" className="btn-cyber btn-cyber-danger text-center text-decoration-none">NỘP BÁO CÁO MỚI</Link>
              <Link to="/referee/results" className="btn-cyber text-center text-decoration-none">NHẬP KẾT QUẢ ĐUA</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="cyber-panel">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0 text-info fw-bold" style={{ letterSpacing: '1px' }}>RECENT REPORTS</h5>
          <Link to="/referee/reports">
            <Button className="btn-cyber btn-cyber-sm">Xem tất cả</Button>
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <EmptyState message="Hệ thống chưa ghi nhận báo cáo nào." />
        ) : (
          <div className="table-responsive">
            <table className="table-cyber w-100">
              <thead>
                <tr>
                  <th>Race</th>
                  <th>Loại</th>
                  <th>Nội dung</th>
                  <th>Ngày nộp</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report) => {
                  const type = normalizeReportType(report);
                  return (
                    <tr key={report.id}>
                      <td><strong className="text-white">{report.raceName || `Race #${report.raceId}`}</strong></td>
                      <td>
                        <span className={`cyber-badge cyber-badge-${REPORT_TYPE_BADGE[type] || 'secondary'}`}>
                          {REPORT_TYPE_LABEL[type] || type}
                        </span>
                      </td>
                      <td style={{ maxWidth: 420 }}>
                        <span className="text-truncate d-block" title={report.content}>{report.content}</span>
                      </td>
                      <td className="text-nowrap">
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
