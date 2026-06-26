import { useEffect, useState } from 'react';
import { Form, Button, Modal, Row, Col } from 'react-bootstrap';
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
import './referee-theme.css'; // Import Cyber Theme

// Backend reportType values
const REPORT_TYPES = [
  { value: 'PRE_RACE', label: 'Trước đua' },
  { value: 'VIOLATION', label: 'Vi phạm' },
  { value: 'DECISION', label: 'Quyết định' },
];

const TYPE_BADGE = { PRE_RACE: 'info', VIOLATION: 'danger', DECISION: 'warning' };

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
      const assignedRaces = await raceService.getAssignedToReferee(user);
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

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
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
    { key: 'raceName', label: 'Race', render: (r) => <strong className="text-white">{r.raceName}</strong> },
    {
      key: 'reportType',
      label: 'Loại báo cáo',
      render: (r) => (
        <span className={`cyber-badge cyber-badge-${TYPE_BADGE[r.reportType] ?? 'secondary'}`}>
          {REPORT_TYPES.find((t) => t.value === r.reportType)?.label ?? r.reportType}
        </span>
      ),
    },
    {
      key: 'content',
      label: 'Nội dung',
      render: (r) => (
        <span style={{ color: '#cbd5e1', fontSize: 13 }}>
          {r.content?.length > 60 ? r.content.slice(0, 60) + '…' : r.content}
        </span>
      ),
    },
    { key: 'createdAt', label: 'Ngày tạo', render: (r) => <span className="text-muted font-monospace">{formatDate(r.createdAt)}</span> },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <Button className="btn-cyber btn-cyber-sm" onClick={() => setDetailRow(r)}>Chi tiết</Button>
      ),
    },
  ];

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="referee-context">
      <div className="referee-hero mb-4">
        <h2>INCIDENT REPORTS</h2>
        <p className="mb-0">&gt; SYSTEM: LOGGING RACE VIOLATIONS AND DECISIONS</p>
      </div>

      <Form onSubmit={handleCreate} className="cyber-panel mb-4 border-danger border-opacity-25" style={{ boxShadow: '0 8px 32px rgba(255, 51, 102, 0.05)' }}>
        <h5 className="mb-4 fw-bold" style={{ color: '#ff3366', letterSpacing: '1px' }}>TẠO BÁO CÁO MỚI</h5>
        
        <div className="d-flex flex-wrap gap-4 align-items-end mb-4">
          <Form.Group style={{ flex: 1, minWidth: 250 }}>
            <Form.Label className="cyber-form-label">Race</Form.Label>
            <Form.Select className="cyber-input" value={form.raceId} onChange={set('raceId')} required>
              <option value="">-- Chọn race --</option>
              {races.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Form.Select>
          </Form.Group>

          <Form.Group style={{ flex: 1, minWidth: 200 }}>
            <Form.Label className="cyber-form-label">Loại báo cáo</Form.Label>
            <Form.Select className="cyber-input" value={form.reportType} onChange={set('reportType')}>
              {REPORT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>

        <div className="d-flex flex-wrap gap-4">
          <Form.Group style={{ flex: 2, minWidth: 250 }}>
            <Form.Label className="cyber-form-label">Nội dung <span className="text-danger">*</span></Form.Label>
            <Form.Control
              className="cyber-input"
              as="textarea"
              rows={3}
              value={form.content}
              onChange={set('content')}
              required
              placeholder="Mô tả chi tiết tình huống..."
            />
          </Form.Group>

          <Form.Group style={{ flex: 1, minWidth: 200 }}>
            <Form.Label className="cyber-form-label text-warning">Vi phạm (nếu có)</Form.Label>
            <Form.Control
              className="cyber-input"
              as="textarea"
              rows={3}
              value={form.violations}
              onChange={set('violations')}
              placeholder="Luật vi phạm..."
            />
          </Form.Group>

          <Form.Group style={{ flex: 1, minWidth: 200 }}>
            <Form.Label className="cyber-form-label text-info">Quyết định (nếu có)</Form.Label>
            <Form.Control
              className="cyber-input"
              as="textarea"
              rows={3}
              value={form.decisions}
              onChange={set('decisions')}
              placeholder="Kết luận của trọng tài..."
            />
          </Form.Group>
        </div>

        <div className="mt-4 text-end">
          <Button type="submit" className="btn-cyber btn-cyber-danger px-4 py-2" disabled={submitting || !form.raceId}>
            {submitting ? 'ĐANG GỬI...' : 'NỘP BÁO CÁO'}
          </Button>
        </div>
      </Form>

      <div className="cyber-panel">
        <h5 className="mb-4 text-info fw-bold" style={{ letterSpacing: '1px' }}>REPORT HISTORY</h5>
        {reports.length === 0 ? (
          <EmptyState message="Chưa có báo cáo nào được ghi nhận." />
        ) : (
          <div className="table-responsive">
            <DataTable columns={columns} rows={reports} />
          </div>
        )}
      </div>

      <Toaster toast={toast} onClose={() => setToast(null)} />

      <Modal show={!!detailRow} onHide={() => setDetailRow(null)} centered size="lg" className="cyber-modal">
        <Modal.Header closeButton>
          <Modal.Title>CHI TIẾT BÁO CÁO</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#0f172a', color: '#cbd5e1' }}>
          {detailRow && (
            <div className="d-flex flex-column gap-4">
              <Row>
                <Col sm={6}>
                  <div className="cyber-form-label">Race</div>
                  <div className="fs-5 text-white">{detailRow.raceName}</div>
                </Col>
                <Col sm={6}>
                  <div className="cyber-form-label">Ngày tạo</div>
                  <div className="text-info font-monospace">{formatDate(detailRow.createdAt)}</div>
                </Col>
              </Row>
              <Row>
                <Col sm={6}>
                  <div className="cyber-form-label">Loại báo cáo</div>
                  <span className={`cyber-badge cyber-badge-${TYPE_BADGE[detailRow.reportType] ?? 'secondary'}`}>
                    {REPORT_TYPES.find((t) => t.value === detailRow.reportType)?.label ?? detailRow.reportType}
                  </span>
                </Col>
                <Col sm={6}>
                  <div className="cyber-form-label">Referee</div>
                  <div className="text-info">{detailRow.refereeName ?? '—'}</div>
                </Col>
              </Row>
              <div>
                <div className="cyber-form-label mb-2">Nội dung</div>
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '4px', padding: '16px', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  {detailRow.content}
                </div>
              </div>
              {detailRow.violations && (
                <div>
                  <div className="cyber-form-label text-warning mb-2">Vi phạm</div>
                  <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '4px', padding: '16px', whiteSpace: 'pre-wrap' }}>
                    {detailRow.violations}
                  </div>
                </div>
              )}
              {detailRow.decisions && (
                <div>
                  <div className="cyber-form-label text-danger mb-2">Quyết định</div>
                  <div style={{ background: 'rgba(255, 51, 102, 0.05)', border: '1px solid rgba(255, 51, 102, 0.3)', borderRadius: '4px', padding: '16px', whiteSpace: 'pre-wrap' }}>
                    {detailRow.decisions}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="link" className="text-muted text-decoration-none" onClick={() => setDetailRow(null)}>ĐÓNG</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
