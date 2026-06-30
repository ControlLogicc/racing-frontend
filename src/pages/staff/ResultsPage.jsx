import { useEffect, useState } from 'react';
import { Badge, Button } from 'react-bootstrap';
import { resultService } from '../../services/resultService';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { RACE_STATUS, STATUS_LABEL, STATUS_BADGE_VARIANT } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';

const GOLD = '#D4AF37';
const CARD_STYLE = { backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#f5f5f5' };
const HEADER_STYLE = { backgroundColor: 'transparent', borderBottom: `1px solid ${GOLD}` };

function groupByRace(results) {
  const map = {};
  results.forEach((r) => {
    if (!map[r.raceId]) map[r.raceId] = { raceId: r.raceId, raceName: r.raceName, rows: [] };
    map[r.raceId].rows.push(r);
  });
  return Object.values(map);
}

export default function StaffResultsPage() {
  const [results, setResults] = useState([]);
  const [assignedRaces, setAssignedRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([
      resultService.getAll(),
      raceService.getAssignedToStaff(),
    ])
      .then(([allResults, staffRaces]) => {
        const assignedIds = new Set(staffRaces.map((race) => Number(race.id)));
        setAssignedRaces(staffRaces);
        setResults(allResults.filter((result) => assignedIds.has(Number(result.raceId))));
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được kết quả.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Công bố chính thức: set race status → OFFICIAL
  const handlePublish = async (raceId) => {
    try {
      await raceService.setStatus(raceId, RACE_STATUS.OFFICIAL);
      setToast({ message: 'Kết quả đã được công bố chính thức!', variant: 'success' });
      load();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Công bố thất bại.'), variant: 'danger' });
    }
  };

  // Tính điểm lại sau khi có kết quả
  const handleRecalculate = async (raceId) => {
    try {
      await resultService.recalculate(raceId);
      setToast({ message: 'Đã tính lại điểm/giải thưởng.', variant: 'success' });
      load();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tính lại thất bại.'), variant: 'danger' });
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const groups = groupByRace(results);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ color: GOLD }}>Kết quả & Công bố</h2>
          <p className="mb-0" style={{ fontSize: '0.9rem', color: '#c8bea0' }}>
            Xem kết quả referee đã nhập, tính lại giải thưởng, rồi công bố chính thức.
          </p>
        </div>
      </div>

      {groups.length === 0 ? (
        <EmptyState message="Chưa có kết quả nào được referee nộp." />
      ) : (
        groups.map((group) => {
          const resultStatus = group.rows[0]?.resultStatus;
          const race = assignedRaces.find((item) => Number(item.id) === Number(group.raceId));
          const isPublished = race?.status === RACE_STATUS.OFFICIAL;

          return (
            <div key={group.raceId} className="card shadow-sm mb-4" style={CARD_STYLE}>
              <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2" style={HEADER_STYLE}>
                <div className="d-flex align-items-center gap-3">
                  <h5 className="mb-0" style={{ color: GOLD }}>{group.raceName}</h5>
                  {resultStatus && (
                    <Badge bg={STATUS_BADGE_VARIANT[resultStatus] || 'secondary'}>
                      {STATUS_LABEL[resultStatus] || resultStatus}
                    </Badge>
                  )}
                </div>
                <div className="d-flex gap-2">
                  {isPublished ? (
                    <Button size="sm" variant="outline-warning" onClick={() => handleRecalculate(group.raceId)}>
                      Tính lại giải thưởng
                    </Button>
                  ) : (
                    <Button size="sm" variant="success" onClick={() => handlePublish(group.raceId)}>
                      Công bố chính thức
                    </Button>
                  )}
                  {isPublished && (
                    <span style={{ color: '#198754', fontSize: '0.875rem', fontWeight: 600 }}>
                      ✓ Đã công bố
                    </span>
                  )}
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th style={{ color: GOLD, borderColor: '#333' }}>Hạng</th>
                      <th style={{ color: GOLD, borderColor: '#333' }}>Ngựa</th>
                      <th style={{ color: GOLD, borderColor: '#333' }}>Jockey</th>
                      <th style={{ color: GOLD, borderColor: '#333' }}>Thời gian</th>
                      <th style={{ color: GOLD, borderColor: '#333' }}>Giải thưởng</th>
                      <th style={{ color: GOLD, borderColor: '#333' }}>Ngày nhập</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows
                      .slice()
                      .sort((a, b) => a.position - b.position)
                      .map((row) => (
                        <tr key={row.id}>
                          <td style={{ borderColor: '#2a2a2a' }}>
                            <span className="fw-bold" style={{ color: GOLD }}>#{row.position}</span>
                          </td>
                          <td style={{ borderColor: '#2a2a2a' }}>{row.horseName}</td>
                          <td style={{ borderColor: '#2a2a2a', color: '#a0a0a0' }}>{row.jockeyName}</td>
                          <td style={{ borderColor: '#2a2a2a' }}>{row.finishTime}</td>
                          <td style={{ borderColor: '#2a2a2a', color: '#4caf50' }}>
                            {row.prizeAmount != null ? row.prizeAmount.toLocaleString('vi-VN') + 'đ' : '—'}
                          </td>
                          <td style={{ borderColor: '#2a2a2a', color: '#a0a0a0', whiteSpace: 'nowrap' }}>
                            {formatDate(row.createdAt)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
