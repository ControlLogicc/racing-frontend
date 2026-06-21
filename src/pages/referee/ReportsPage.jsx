import { useEffect, useState } from 'react';
import { Form, Button, Badge, Modal, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { refereeReportService } from '../../services/refereeReportService';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import Toaster from '../../components/common/Toaster';
import {
  VIOLATION_TYPE,
  VIOLATION_LABEL,
  DECISION,
  DECISION_LABEL,
  DECISION_BADGE,
} from '../../mocks/mockRefereeReports';

const EMPTY_FORM = {
  raceId: '',
  violationType: VIOLATION_TYPE.NONE,
  decision: DECISION.NO_ACTION,
  content: '',
};

export default function RefereeReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [detailRow, setDetailRow] = useState(null);

  const load = () => {
    Promise.all([refereeReportService.getAll(), raceService.getAll()])
      .then(([rep, r]) => { setReports(rep); setRaces(r); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được báo cáo.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    const race = races.find((r) => r.id === Number(form.raceId));
    if (!race) return;
    setSubmitting(true);
    try {
      await refereeReportService.create({
        raceId: race.id,
        raceName: race.name,
        refereeId: user.userId,
        refereeName: user.fullName,
        violationType: form.violationType,
        decision: form.decision,
        content: form.content,
      });
      setToast({ message: 'Đã gửi báo cáo.', variant: 'success' });
      setForm(EMPTY_FORM);
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Gửi báo cáo thất bại.'), variant: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'raceName', label: 'Race' },
    {
      key: 'violationType',
      label: 'Loại vi phạm',
      render: (r) => (
        <Badge
          bg={r.violationType === VIOLATION_TYPE.NONE ? 'secondary' : 'warning'}
          text={r.violationType === VIOLATION_TYPE.NONE ? undefined : 'dark'}
        >
          {VIOLATION_LABEL[r.violationType] ?? r.violationType}
        </Badge>
      ),
    },
    {
      key: 'decision',
      label: 'Quyết định',
      render: (r) => (
        <Badge bg={DECISION_BADGE[r.decision] ?? 'secondary'}>
          {DECISION_LABEL[r.decision] ?? r.decision}
        </Badge>
      ),
    },
    {
      key: 'content',
      label: 'Nội dung',
      render: (r) => (
        <span style={{ color: '#ccc', fontSize: 13 }}>
          {r.content?.length > 60 ? r.content.slice(0, 60) + '…' : r.content}
        </span>
      ),
    },
    { key: 'createdAt', label: 'Ngày tạo', render: (r) => formatDate(r.createdAt) },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <button className="btn-outline-gold-sm" onClick={() => setDetailRow(r)}>Chi tiết</button>
      ),
    },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <div className="page-header"><h2>Báo cáo vi phạm</h2></div>

      <Form onSubmit={handleCreate} className="dash-card mb-4">
        <div className="d-flex flex-wrap gap-3 align-items-end">
          <Form.Group>
            <Form.Label style={{ color: '#D4AF37' }}>Race</Form.Label>
            <Form.Select value={form.raceId} onChange={set('raceId')} required style={{ minWidth: 160 }}>
              <option value="">-- Chọn race --</option>
              {races.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label style={{ color: '#D4AF37' }}>Loại vi phạm</Form.Label>
            <Form.Select value={form.violationType} onChange={set('violationType')} style={{ minWidth: 160 }}>
              {Object.entries(VIOLATION_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label style={{ color: '#D4AF37' }}>Quyết định</Form.Label>
            <Form.Select value={form.decision} onChange={set('decision')} style={{ minWidth: 160 }}>
              {Object.entries(DECISION_LABEL).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group style={{ flex: 1, minWidth: 220 }}>
            <Form.Label style={{ color: '#D4AF37' }}>Nội dung</Form.Label>
            <Form.Control
              as="textarea"
              rows={1}
              value={form.content}
              onChange={set('content')}
              required
              placeholder="Mô tả chi tiết vi phạm..."
            />
          </Form.Group>

          <Button type="submit" className="btn-gold-sm" style={{ padding: '8px 20px' }} disabled={submitting}>
            {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
          </Button>
        </div>
      </Form>

      {reports.length === 0
        ? <EmptyState message="Chưa có báo cáo nào." />
        : <DataTable columns={columns} rows={reports} />}

      <Toaster toast={toast} onClose={() => setToast(null)} />

      {/* Detail Modal */}
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
                  <div style={{ color: '#888', fontSize: 12 }}>Ngày tạo</div>
                  <div style={{ color: '#ccc' }}>{formatDate(detailRow.createdAt)}</div>
                </Col>
              </Row>
              <Row>
                <Col sm={6}>
                  <div style={{ color: '#888', fontSize: 12 }}>Loại vi phạm</div>
                  <Badge
                    bg={detailRow.violationType === VIOLATION_TYPE.NONE ? 'secondary' : 'warning'}
                    text={detailRow.violationType === VIOLATION_TYPE.NONE ? undefined : 'dark'}
                    style={{ fontSize: 13 }}
                  >
                    {VIOLATION_LABEL[detailRow.violationType] ?? detailRow.violationType}
                  </Badge>
                </Col>
                <Col sm={6}>
                  <div style={{ color: '#888', fontSize: 12 }}>Quyết định</div>
                  <Badge bg={DECISION_BADGE[detailRow.decision] ?? 'secondary'} style={{ fontSize: 13 }}>
                    {DECISION_LABEL[detailRow.decision] ?? detailRow.decision}
                  </Badge>
                </Col>
              </Row>
              <div>
                <div style={{ color: '#888', fontSize: 12, marginBottom: 6 }}>Nội dung báo cáo</div>
                <div
                  style={{
                    background: '#0d0d1a',
                    border: '1px solid #333',
                    borderRadius: 6,
                    padding: '12px 16px',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {detailRow.content}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ background: '#1a1a2e', borderColor: '#333' }}>
          <Button variant="outline-secondary" onClick={() => setDetailRow(null)}>Đóng</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
