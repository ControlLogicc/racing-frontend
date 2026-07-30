import { useEffect, useState, useMemo } from 'react';
import { Form, Modal, Badge, Row, Col } from 'react-bootstrap';
import { refereeReportService } from '../../services/refereeReportService';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import './staff-theme.css';

const TYPE_BADGE = {
  PRE_RACE: 'info',
  VIOLATION: 'warning',
  DECISION: 'danger',
};
const TYPE_LABEL = {
  PRE_RACE: 'Trước đua',
  VIOLATION: 'Vi phạm',
  DECISION: 'Quyết định',
};
const DECISION_LABEL = {
  warning: 'Cảnh cáo',
  no_action: 'Không xử lý',
  dnf: 'Không hoàn thành',
  scratched: 'Rút khỏi cuộc đua',
  disqualified: 'Loại khỏi giải',
  penalized: 'Bị phạt',
};

export default function StaffReportsPage() {
  const [reports, setReports] = useState([]);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailRow, setDetailRow] = useState(null);
  const [filterRace, setFilterRace] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const assignedRaces = await raceService.getAssignedToStaff();
      setRaces(assignedRaces);
      const reportSets = await Promise.all(
        assignedRaces.map((r) => refereeReportService.getByRace(r.id))
      );
      setReports(reportSets.flat());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không tải được báo cáo.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let rows = [...reports];
    if (filterRace) rows = rows.filter((r) => r.raceId === Number(filterRace));
    return rows;
  }, [reports, filterRace]);

  const columns = [
    { key: 'raceName', label: 'Race' },
    { key: 'refereeName', label: 'Referee' },
    {
      key: 'reportType',
      label: 'Loại báo cáo',
      render: (r) => {
        const normalized = String(r.reportType || '').toUpperCase();
        return (
          <Badge bg={TYPE_BADGE[normalized] ?? 'secondary'}>
            {TYPE_LABEL[normalized] ?? r.reportType}
          </Badge>
        );
      },
    },
    {
      key: 'description',
      label: 'Mô tả',
      render: (r) => (
        <span style={{ color: '#ccc', fontSize: 13 }}>
          {r.description?.length > 60 ? r.description.slice(0, 60) + '…' : r.description}
        </span>
      ),
    },
    {
      key: 'decision',
      label: 'Quyết định',
      render: (r) => r.decision
        ? <span style={{ color: '#ffc107', fontSize: 12 }}>{DECISION_LABEL[String(r.decision).toLowerCase()] ?? r.decision}</span>
        : <span style={{ color: '#666' }}>—</span>,
    },
    { key: 'createdAt', label: 'Ngày tạo', render: (r) => formatDate(r.createdAt) },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <button className="staff-btn-outline" style={{ padding: '5px 14px', fontSize: 13 }} onClick={() => setDetailRow(r)}>
          Chi tiết
        </button>
      ),
    },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="staff-theme-wrapper p-3">
      <div className="staff-card mb-4 p-4">
        <h4 className="mb-1" style={{ color: '#D4AF37', fontWeight: 700 }}>Báo cáo Referee</h4>
        <p className="mb-0" style={{ color: '#9ca3af', fontSize: 13 }}>
          Xem báo cáo vi phạm/quyết định của referee cho các race bạn phụ trách.
        </p>
      </div>

      <div className="staff-card mb-4 p-3">
        <Row className="g-3 align-items-end">
          <Col md={4}>
            <Form.Group>
              <Form.Label style={{ color: '#D4AF37', fontSize: 13 }}>Race</Form.Label>
              <Form.Select value={filterRace} onChange={(e) => setFilterRace(e.target.value)}>
                <option value="">Tất cả race</option>
                {races.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="Không có báo cáo nào phù hợp." />
      ) : (
        <div className="staff-card p-3">
          <DataTable columns={columns} rows={filtered} rowClassName={() => 'align-middle'} />
        </div>
      )}

      <Modal show={!!detailRow} onHide={() => setDetailRow(null)} centered size="lg">
        <Modal.Header closeButton style={{ background: '#1a1a2e', borderColor: '#D4AF37' }}>
          <Modal.Title style={{ color: '#D4AF37' }}>Chi tiết báo cáo</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#1a1a2e', color: '#e0d6b0' }}>
          {detailRow && (
            <div className="d-flex flex-column gap-3">
              <Row>
                <Col sm={6}>
                  <div style={{ color: '#888', fontSize: 12 }}>Race</div>
                  <div style={{ color: '#D4AF37', fontWeight: 600 }}>{detailRow.raceName}</div>
                </Col>
                <Col sm={6}>
                  <div style={{ color: '#888', fontSize: 12 }}>Referee</div>
                  <div>{detailRow.refereeName}</div>
                </Col>
              </Row>
              <Row>
                <Col sm={6}>
                  <div style={{ color: '#888', fontSize: 12 }}>Loại báo cáo</div>
                  <Badge bg={TYPE_BADGE[detailRow.reportType] ?? 'secondary'} style={{ fontSize: 13 }}>
                    {TYPE_LABEL[detailRow.reportType] ?? detailRow.reportType}
                  </Badge>
                </Col>
                <Col sm={6}>
                  <div style={{ color: '#888', fontSize: 12 }}>Ngày tạo</div>
                  <div style={{ color: '#ccc' }}>{formatDate(detailRow.createdAt)}</div>
                </Col>
              </Row>
              {detailRow.entryId && (
                <Row>
                  <Col sm={12}>
                    <div style={{ color: '#888', fontSize: 12 }}>Entry bị báo cáo</div>
                    <div style={{ color: '#e0d6b0' }}>
                      Ngựa: {detailRow.horseName ?? `Entry #${detailRow.entryId}`}
                      {detailRow.jockeyName ? ` — Jockey: ${detailRow.jockeyName}` : ''}
                    </div>
                  </Col>
                </Row>
              )}
              <div>
                <div style={{ color: '#888', fontSize: 12, marginBottom: 6 }}>Nội dung báo cáo</div>
                <div style={{ background: '#0d0d1a', border: '1px solid #333', borderRadius: 6, padding: '12px 16px', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {detailRow.description || '—'}
                </div>
              </div>
              {detailRow.penalty && (
                <div>
                  <div style={{ color: '#ffc107', fontSize: 12, marginBottom: 6 }}>Hình phạt</div>
                  <div style={{ background: '#0d0d1a', border: '1px solid #333', borderRadius: 6, padding: '12px 16px', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {detailRow.penalty}
                  </div>
                </div>
              )}
              {detailRow.decision && (
                <div>
                  <div style={{ color: '#4caf50', fontSize: 12, marginBottom: 6 }}>Quyết định</div>
                  <div style={{ background: '#0d0d1a', border: '1px solid #333', borderRadius: 6, padding: '12px 16px', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {DECISION_LABEL[String(detailRow.decision).toLowerCase()] ?? detailRow.decision}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
