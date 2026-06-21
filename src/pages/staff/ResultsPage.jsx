import { useEffect, useState } from 'react';
import { Badge, Button, Modal, Form } from 'react-bootstrap';
import { resultService } from '../../services/resultService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import {
  RACE_RESULT_STATUS,
  STATUS_LABEL,
  STATUS_BADGE_VARIANT,
  canPublishResult,
} from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';

const GOLD = '#D4AF37';
const CARD_STYLE = { backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#f5f5f5' };
const HEADER_STYLE = { backgroundColor: 'transparent', borderBottom: `1px solid ${GOLD}` };

// Nhóm kết quả theo raceId
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [editTarget, setEditTarget] = useState(null); // { id, position, finishTime }

  const load = () => {
    setLoading(true);
    setError('');
    resultService
      .getAll()
      .then(setResults)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được kết quả.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Chốt kết quả: REVIEWED_BY_REFEREE → FINAL_EDITED_BY_STAFF
  const handleConfirm = async (raceId) => {
    try {
      await resultService.setRaceStatus(raceId, RACE_RESULT_STATUS.FINAL_EDITED_BY_STAFF);
      setToast({ message: 'Đã chốt kết quả. Sẵn sàng công bố.', variant: 'success' });
      load();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Chốt kết quả thất bại.'), variant: 'danger' });
    }
  };

  // Công bố: FINAL_EDITED_BY_STAFF → PUBLISHED
  const handlePublish = async (raceId) => {
    try {
      await resultService.setRaceStatus(raceId, RACE_RESULT_STATUS.PUBLISHED);
      setToast({ message: 'Kết quả đã được công bố!', variant: 'success' });
      load();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Công bố thất bại.'), variant: 'danger' });
    }
  };

  // Lưu chỉnh sửa 1 dòng → tự chuyển race sang FINAL_EDITED_BY_STAFF
  const handleEditSave = async () => {
    try {
      await resultService.update(editTarget.id, {
        position: Number(editTarget.position),
        finishTime: editTarget.finishTime,
      });
      setToast({ message: 'Đã cập nhật kết quả.', variant: 'success' });
      setEditTarget(null);
      load();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cập nhật thất bại.'), variant: 'danger' });
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const groups = groupByRace(results);

  // Lấy resultStatus của 1 group (tất cả rows cùng race cùng status)
  const groupStatus = (group) => group.rows[0]?.resultStatus ?? null;

  return (
    <div>
      <div className="page-header">
        <h2 style={{ color: GOLD }}>Kết quả & Công bố</h2>
        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
          Xem kết quả referee đã nhập, chỉnh sửa nếu cần, rồi công bố chính thức.
        </p>
      </div>

      {groups.length === 0 ? (
        <EmptyState message="Chưa có kết quả nào được referee nộp." />
      ) : (
        groups.map((group) => {
          const status = groupStatus(group);
          const isReviewed = status === RACE_RESULT_STATUS.REVIEWED_BY_REFEREE;
          const canPublish = canPublishResult(status);
          const isPublished = status === RACE_RESULT_STATUS.PUBLISHED;

          return (
            <div key={group.raceId} className="card shadow-sm mb-4" style={CARD_STYLE}>
              {/* Header nhóm race */}
              <div
                className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2"
                style={HEADER_STYLE}
              >
                <div className="d-flex align-items-center gap-3">
                  <h5 className="mb-0" style={{ color: GOLD }}>{group.raceName}</h5>
                  <Badge bg={STATUS_BADGE_VARIANT[status] || 'secondary'}>
                    {STATUS_LABEL[status] || status}
                  </Badge>
                </div>

                <div className="d-flex gap-2">
                  {/* Chốt — chỉ hiện khi REVIEWED_BY_REFEREE */}
                  {isReviewed && (
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => handleConfirm(group.raceId)}
                    >
                      Chốt kết quả
                    </Button>
                  )}
                  {/* Công bố — chỉ hiện khi FINAL_EDITED_BY_STAFF */}
                  {canPublish && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handlePublish(group.raceId)}
                    >
                      Công bố
                    </Button>
                  )}
                  {isPublished && (
                    <span style={{ color: '#198754', fontSize: '0.875rem', fontWeight: 600 }}>
                      ✓ Đã công bố
                    </span>
                  )}
                </div>
              </div>

              {/* Bảng kết quả của race */}
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th style={{ color: GOLD, borderColor: '#333' }}>Hạng</th>
                      <th style={{ color: GOLD, borderColor: '#333' }}>Ngựa</th>
                      <th style={{ color: GOLD, borderColor: '#333' }}>Jockey</th>
                      <th style={{ color: GOLD, borderColor: '#333' }}>Thời gian</th>
                      <th style={{ color: GOLD, borderColor: '#333' }}>Ngày nhập</th>
                      {!isPublished && (
                        <th style={{ color: GOLD, borderColor: '#333' }}>Chỉnh sửa</th>
                      )}
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
                          <td style={{ borderColor: '#2a2a2a', color: '#a0a0a0', whiteSpace: 'nowrap' }}>
                            {formatDate(row.createdAt)}
                          </td>
                          {!isPublished && (
                            <td style={{ borderColor: '#2a2a2a' }}>
                              <Button
                                size="sm"
                                style={{
                                  fontSize: '12px',
                                  borderColor: GOLD,
                                  color: GOLD,
                                  backgroundColor: 'transparent',
                                }}
                                onClick={() =>
                                  setEditTarget({
                                    id: row.id,
                                    position: row.position,
                                    finishTime: row.finishTime,
                                    horseName: row.horseName,
                                  })
                                }
                              >
                                Sửa
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}

      {/* Modal chỉnh sửa kết quả */}
      <Modal
        show={!!editTarget}
        onHide={() => setEditTarget(null)}
        centered
        contentClassName="bg-dark text-light"
      >
        <Modal.Header
          closeButton
          closeVariant="white"
          style={{ borderBottom: `1px solid ${GOLD}` }}
        >
          <Modal.Title style={{ color: GOLD }}>
            Sửa kết quả — {editTarget?.horseName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: GOLD }}>Hạng</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={editTarget?.position ?? ''}
              onChange={(e) => setEditTarget((prev) => ({ ...prev, position: e.target.value }))}
              style={{ backgroundColor: '#2a2a2a', color: '#f5f5f5', borderColor: '#444' }}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label style={{ color: GOLD }}>Thời gian về đích</Form.Label>
            <Form.Control
              placeholder="01:12.45"
              value={editTarget?.finishTime ?? ''}
              onChange={(e) => setEditTarget((prev) => ({ ...prev, finishTime: e.target.value }))}
              style={{ backgroundColor: '#2a2a2a', color: '#f5f5f5', borderColor: '#444' }}
            />
          </Form.Group>
          <p className="text-muted mt-2" style={{ fontSize: '0.8rem' }}>
            Lưu sẽ tự động chuyển trạng thái sang "Staff đã chỉnh".
          </p>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #333' }}>
          <Button variant="secondary" onClick={() => setEditTarget(null)}>Huỷ</Button>
          <Button
            style={{ backgroundColor: GOLD, borderColor: GOLD, color: '#111' }}
            onClick={handleEditSave}
          >
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
