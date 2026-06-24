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

// Backend reportType values
const REPORT_TYPES = [
  { value: 'PRE_RACE', label: 'Trước đua' },
  { value: 'VIOLATION', label: 'Vi phạm' },
  { value: 'DECISION', label: 'Quyết định' },
];

const TYPE_BADGE = { PRE_RACE: 'info', VIOLATION: 'warning', DECISION: 'primary' };

const EMPTY_FORM = {
  raceId: '',
  reportType: 'PRE_RACE',
  content: '',
  violations: '',
  decisions: '',
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

  const load = async () => {
    try {
<<<<<<< HEAD
      const assignedRaces = await raceService.getAssignedToReferee(user);
=======
      const assignedRaces = await raceService.getAssignedToReferee(user?.userId);
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
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

<<<<<<< HEAD
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
=======
>>>>>>> ef81019384e86003e17c9af4d49e16c3df82e2d8
  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.raceId || !form.content.trim()) return;
    setSubmitting(true);
    try {
      await refereeReportService.create({
        raceId: Number(form.raceId),
        reportType: form.reportType,
        content: form.content,
        violations: form.violations || null,
        decisions: form.decisions || null,
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
      key: 'reportType',
      label: 'Loại báo cáo',
      render: (r) => (
        <Badge bg={TYPE_BADGE[r.reportType] ?? 'secondary'}>
          {REPORT_TYPES.find((t) => t.value === r.reportType)?.label ?? r.reportType}
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
      <div className="page-header"><h2>Báo cáo đua</h2></div>

      <Form onSubmit={handleCreate} className="dash-card mb-4">
        <div className="d-flex flex-wrap gap-3 align-items-end">
          <Form.Group>
            <Form.Label style={{ color: '#D4AF37' }}>Race</Form.Label>
            <Form.Select value={form.raceId} onChange={set('raceId')} required style={{ minWidth: 180 }}>
              <option value="">-- Chọn race --</option>
              {races.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label style={{ color: '#D4AF37' }}>Loại báo cáo</Form.Label>
            <Form.Select value={form.reportType} onChange={set('reportType')} style={{ minWidth: 160 }}>
              {REPORT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>

        <div className="d-flex flex-wrap gap-3 mt-3">
          <Form.Group style={{ flex: 2, minWidth: 220 }}>
            <Form.Label style={{ color: '#D4AF37' }}>Nội dung <span style={{ color: '#e55' }}>*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={form.content}
              onChange={set('content')}
              required
              placeholder="Mô tả tình huống / nội dung báo cáo..."
            />
          </Form.Group>

          <Form.Group style={{ flex: 1, minWidth: 180 }}>
            <Form.Label style={{ color: '#D4AF37' }}>Vi phạm (nếu có)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={form.violations}
              onChange={set('violations')}
              placeholder="Mô tả vi phạm..."
            />
          </Form.Group>

          <Form.Group style={{ flex: 1, minWidth: 180 }}>
            <Form.Label style={{ color: '#D4AF37' }}>Quyết định (nếu có)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={form.decisions}
              onChange={set('decisions')}
              placeholder="Nội dung quyết định..."
            />
          </Form.Group>
        </div>

        <div className="mt-3">
          <Button type="submit" className="btn-gold-sm" style={{ padding: '8px 24px' }} disabled={submitting || !form.raceId}>
            {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
          </Button>
        </div>
      </Form>

      {reports.length === 0
        ? <EmptyState message="Chưa có báo cáo nào." />
        : <DataTable columns={columns} rows={reports} />}

      <Toaster toast={toast} onClose={() => setToast(null)} />

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
                  <div style={{ color: '#888', fontSize: 12 }}>Loại báo cáo</div>
                  <Badge bg={TYPE_BADGE[detailRow.reportType] ?? 'secondary'} style={{ fontSize: 13 }}>
                    {REPORT_TYPES.find((t) => t.value === detailRow.reportType)?.label ?? detailRow.reportType}
                  </Badge>
                </Col>
                <Col sm={6}>
                  <div style={{ color: '#888', fontSize: 12 }}>Referee</div>
                  <div style={{ color: '#ccc' }}>{detailRow.refereeName ?? '—'}</div>
                </Col>
              </Row>
              <div>
                <div style={{ color: '#888', fontSize: 12, marginBottom: 6 }}>Nội dung</div>
                <div style={{ background: '#0d0d1a', border: '1px solid #333', borderRadius: 6, padding: '12px 16px', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  {detailRow.content}
                </div>
              </div>
              {detailRow.violations && (
                <div>
                  <div style={{ color: '#888', fontSize: 12, marginBottom: 6 }}>Vi phạm</div>
                  <div style={{ background: '#0d0d1a', border: '1px solid #444', borderRadius: 6, padding: '12px 16px', whiteSpace: 'pre-wrap' }}>
                    {detailRow.violations}
                  </div>
                </div>
              )}
              {detailRow.decisions && (
                <div>
                  <div style={{ color: '#888', fontSize: 12, marginBottom: 6 }}>Quyết định</div>
                  <div style={{ background: '#0d0d1a', border: '1px solid #444', borderRadius: 6, padding: '12px 16px', whiteSpace: 'pre-wrap' }}>
                    {detailRow.decisions}
                  </div>
                </div>
              )}
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
