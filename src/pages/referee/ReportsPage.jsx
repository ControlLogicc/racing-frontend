
import { useEffect, useState } from 'react';
import { Form, Button, Modal, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { refereeReportService } from '../../services/refereeReportService';
import { raceService } from '../../services/raceService';
import { entryService } from '../../services/entryService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import Toaster from '../../components/common/Toaster';
import './referee-theme.css'; // Import Cyber Theme

// 4 loại chuẩn theo spec BE — nhưng enum RefereeReportType.java hiện tại (PRE_RACE, VIOLATION, DECISION)
// CHƯA được cập nhật để nhận result_confirmation/race_review/pre_race_check (sẽ bị 400 "Invalid report type").
// Chỉ show "violation" trong dropdown tới khi BE cập nhật enum; 3 loại còn lại giữ lại comment để bật lại nhanh.
const REPORT_TYPES = [
  { value: 'violation', label: 'Báo cáo vi phạm' },
  // { value: 'result_confirmation', label: 'Xác nhận kết quả' },   // chờ BE thêm RESULT_CONFIRMATION vào enum
  // { value: 'race_review', label: 'Rà soát cuộc đua' },           // chờ BE thêm RACE_REVIEW vào enum
  // { value: 'pre_race_check', label: 'Kiểm tra trước đua' },      // chờ BE đổi PRE_RACE → PRE_RACE_CHECK
];

const TYPE_BADGE = { pre_race_check: 'info', violation: 'danger', result_confirmation: 'warning', race_review: 'secondary' };

// Value CHUẨN theo BE (đúng 5 giá trị, không thêm/bớt) — gửi sai value (vd label tiếng Việt) sẽ gây lỗi.
const DECISION_OPTIONS = [
  { value: '', label: '-- Không có quyết định --' },
  { value: 'warning', label: 'Cảnh cáo' },
  { value: 'no_action', label: 'Không xử lý' },
  { value: 'dnf', label: 'Không hoàn thành' },
  { value: 'scratched', label: 'Rút khỏi cuộc đua' },
  { value: 'disqualified', label: 'Loại khỏi giải' },
];

// Không phải cứ có report là ban/disqualified — chỉ 3 quyết định dưới đây mới đụng tới entry/result/standings,
// mỗi loại tác động khác nhau (xem note tương ứng). Cảnh cáo/Phạt/Xác nhận... chỉ lưu report, không đổi gì khác.
const DECISION_IMPACT_NOTE = {
  dnf: 'Entry sẽ được đánh dấu là KHÔNG HOÀN THÀNH — thứ tự kết quả sẽ được cập nhật lại.',
  scratched: 'Entry sẽ bị RÚT KHỎI GIẢI — nếu race đã có kết quả, thứ tự sẽ được cập nhật lại.',
  disqualified: 'Entry sẽ bị LOẠI KHỎI GIẢI — thứ tự kết quả sẽ được dồn lại.',
};

// Nhãn tiếng Việt cho entryStatus, dùng để hiển thị trong dropdown Entry và các nơi khác thay vì giá trị enum tiếng Anh thô.
// Dùng en.rawStatus (giá trị gốc từ BE, chưa bị entryService gộp nhóm) để giữ đúng ý nghĩa disqualified/penalized/dnf/scratched.
const ENTRY_STATUS_LABEL = {
  disqualified: 'bị loại',
  penalized: 'bị phạt',
  dnf: 'không hoàn thành',
  scratched: 'đã rút',
};
// Các trạng thái coi như "đã xử lý xong" — không nên áp thêm quyết định ảnh hưởng tới entry/kết quả lần nữa.
const TERMINAL_ENTRY_STATUSES = new Set(['disqualified', 'dnf', 'scratched']);
const hasStandingsImpact = (decision) =>
  Object.prototype.hasOwnProperty.call(DECISION_IMPACT_NOTE, String(decision || '').trim().toLowerCase().replace(' ', '_'));

// BE chỉ nhận đúng 5 giá trị (ALLOWED_DECISIONS). Report cũ có thể trả về "penalized" (giá trị lưu DB nội bộ,
// không phải giá trị API hợp lệ) nếu entryStatus của entry đã bị đổi khác dnf/scratched sau khi report được tạo —
// gửi thẳng giá trị đó lên lại khi Sửa report sẽ bị BE trả 400. Validate lại trước khi gửi.
const ALLOWED_DECISION_VALUES = new Set(DECISION_OPTIONS.map((d) => d.value).filter(Boolean));
const sanitizeDecision = (decision) => (ALLOWED_DECISION_VALUES.has(decision) ? decision : null);

// DB report_status chỉ nhận draft/submitted/closed — KHÔNG nhận pending/resolved (CHECK constraint).
const DEFAULT_REPORT_STATUS = 'submitted';

const EMPTY_FORM = {
  raceId: '',
  entryId: '',
  reportType: 'violation',
  description: '',
  decision: '',
  penalty: '',
  reportStatus: DEFAULT_REPORT_STATUS,
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
  const [editRow, setEditRow] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [raceEntries, setRaceEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  const loadEntries = (raceId) => {
    if (!raceId) { setRaceEntries([]); return; }
    setLoadingEntries(true);
    entryService.getByRace(Number(raceId))
      .then(setRaceEntries)
      .catch(() => setRaceEntries([]))
      .finally(() => setLoadingEntries(false));
  };

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

  const openEdit = (r) => { setEditRow(r); setEditDescription(r.description || ''); };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      await refereeReportService.update(editRow.id, {
        ...editRow,
        description: editDescription,
        decision: sanitizeDecision(editRow.decision),
      });
      setToast({ message: 'Đã cập nhật báo cáo.', variant: 'success' });
      setEditRow(null);
      refetch();
    } catch { setToast({ message: 'Lưu thất bại.', variant: 'danger' }); }
    finally { setSavingEdit(false); }
  };

  const set = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value, ...(field === 'raceId' ? { entryId: '' } : {}) }));
    if (field === 'raceId') loadEntries(value);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.raceId || !form.description.trim()) return;
    if (hasStandingsImpact(form.decision) && !form.entryId) {
      setToast({ message: 'Quyết định này cần chọn Entry cụ thể để áp dụng.', variant: 'warning' });
      return;
    }
    if (hasStandingsImpact(form.decision) && form.entryId) {
      const selectedEntry = raceEntries.find((en) => String(en.id) === String(form.entryId));
      if (selectedEntry && TERMINAL_ENTRY_STATUSES.has(selectedEntry.rawStatus)) {
        setToast({
          message: `Entry này đã ${ENTRY_STATUS_LABEL[selectedEntry.rawStatus] ?? 'được xử lý'} trước đó — không thể áp thêm quyết định ảnh hưởng tới kết quả.`,
          variant: 'warning',
        });
        return;
      }
    }
    setSubmitting(true);
    try {
      await refereeReportService.create({
        raceId: Number(form.raceId),
        entryId: form.entryId ? Number(form.entryId) : null,
        reportType: form.reportType,
        description: form.description,
        decision: form.decision || null,
        penalty: form.penalty || null,
        reportStatus: form.reportStatus || DEFAULT_REPORT_STATUS,
      });
      setToast({
        message: hasStandingsImpact(form.decision)
          ? 'Đã gửi báo cáo — entry/kết quả đã được cập nhật.'
          : 'Đã gửi báo cáo.',
        variant: 'success',
      });
      // Reload lại danh sách entry của race để cập nhật entryStatus mới nhất (vd: scratched/disqualified)
      loadEntries(form.raceId);
      setForm((prev) => ({ ...EMPTY_FORM, raceId: prev.raceId }));
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
      render: (r) => {
        // BE trả reportType uppercase (enum.name()) dù FE gửi lowercase — so sánh không phân biệt hoa/thường.
        const normalized = String(r.reportType || '').toLowerCase();
        return (
          <span className={`cyber-badge cyber-badge-${TYPE_BADGE[normalized] ?? 'secondary'}`}>
            {REPORT_TYPES.find((t) => t.value === normalized)?.label ?? r.reportType}
          </span>
        );
      },
    },
    {
      key: 'description',
      label: 'Mô tả',
      render: (r) => (
        <span style={{ color: '#cbd5e1', fontSize: 13 }}>
          {r.description?.length > 60 ? r.description.slice(0, 60) + '…' : r.description}
        </span>
      ),
    },
    { key: 'createdAt', label: 'Ngày tạo', render: (r) => <span style={{ color: '#c8bea0', fontFamily: 'monospace' }}>{formatDate(r.createdAt)}</span> },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div className="d-flex gap-2">
          <Button className="btn-cyber btn-cyber-sm" onClick={() => setDetailRow(r)}>Chi tiết</Button>
          <Button className="btn-cyber btn-cyber-sm" onClick={() => openEdit(r)}>Sửa</Button>
        </div>
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
            <Form.Label className="cyber-form-label">Entry (Tùy chọn)</Form.Label>
            <Form.Select
              className="cyber-input"
              value={form.entryId}
              onChange={set('entryId')}
              disabled={!form.raceId || loadingEntries}
            >
              <option value="">
                {!form.raceId ? '-- Chọn race trước --' : loadingEntries ? 'Đang tải entry...' : '-- Không gắn entry --'}
              </option>
              {raceEntries
                .filter((en) => !TERMINAL_ENTRY_STATUSES.has(en.rawStatus))
                .map((en) => (
                  <option key={en.id} value={en.id}>
                    {en.horseName}{en.jockeyName ? ` — ${en.jockeyName}` : ''}
                  </option>
                ))}
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
            <Form.Label className="cyber-form-label">Mô tả (Description) <span className="text-danger">*</span></Form.Label>
            <Form.Control
              className="cyber-input"
              as="textarea"
              rows={3}
              value={form.description}
              onChange={set('description')}
              required
              placeholder="Mô tả chi tiết tình huống..."
            />
          </Form.Group>

          <Form.Group style={{ flex: 1, minWidth: 200 }}>
            <Form.Label className="cyber-form-label text-warning">Hình phạt (Penalty)</Form.Label>
            <Form.Control
              className="cyber-input"
              as="textarea"
              rows={3}
              value={form.penalty}
              onChange={set('penalty')}
              placeholder="Hình phạt..."
            />
          </Form.Group>

          <Form.Group style={{ flex: 1, minWidth: 200 }}>
            <Form.Label className="cyber-form-label text-info">Quyết định (Decision)</Form.Label>
            <Form.Select className="cyber-input" value={form.decision} onChange={set('decision')}>
              {DECISION_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </Form.Select>
            {DECISION_IMPACT_NOTE[form.decision] && (
              <Form.Text className="text-danger">⚠️ {DECISION_IMPACT_NOTE[form.decision]}</Form.Text>
            )}
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
                  {(() => {
                    const normalized = String(detailRow.reportType || '').toLowerCase();
                    return (
                      <span className={`cyber-badge cyber-badge-${TYPE_BADGE[normalized] ?? 'secondary'}`}>
                        {REPORT_TYPES.find((t) => t.value === normalized)?.label ?? detailRow.reportType}
                      </span>
                    );
                  })()}
                </Col>
                <Col sm={6}>
                  <div className="cyber-form-label">Referee</div>
                  <div className="text-info">{detailRow.refereeName ?? '—'}</div>
                </Col>
              </Row>
              <div>
                <div className="cyber-form-label mb-2">Mô tả</div>
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '4px', padding: '16px', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  {detailRow.description}
                </div>
              </div>
              {detailRow.penalty && (
                <div>
                  <div className="cyber-form-label text-warning mb-2">Hình phạt</div>
                  <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '4px', padding: '16px', whiteSpace: 'pre-wrap' }}>
                    {detailRow.penalty}
                  </div>
                </div>
              )}
              {detailRow.decision && (
                <div>
                  <div className="cyber-form-label text-danger mb-2">Quyết định</div>
                  <div style={{ background: 'rgba(255, 51, 102, 0.05)', border: '1px solid rgba(255, 51, 102, 0.3)', borderRadius: '4px', padding: '16px', whiteSpace: 'pre-wrap' }}>
                    {DECISION_OPTIONS.find((d) => d.value === String(detailRow.decision).toLowerCase())?.label
                      ?? (String(detailRow.decision).toLowerCase() === 'penalized' ? 'Bị phạt' : detailRow.decision)}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="link" style={{ color: '#64748b', textDecoration: 'none' }} onClick={() => setDetailRow(null)}>ĐÓNG</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal sửa báo cáo */}
      <Modal show={!!editRow} onHide={() => setEditRow(null)} centered>
        <Modal.Header closeButton style={{ background: '#0a0f1a', borderColor: 'rgba(0,200,255,0.2)' }}>
          <Modal.Title style={{ color: '#00e5ff', fontSize: '1rem' }}>Sửa báo cáo</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#0a0f1a' }}>
          <Form.Label style={{ color: '#00c8ff', fontSize: 12, textTransform: 'uppercase' }}>Mô tả</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            className="cyber-input"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}

/>
        </Modal.Body>
        <Modal.Footer style={{ background: '#0a0f1a', borderColor: 'rgba(0,200,255,0.2)' }}>
          <Button className="btn-cyber btn-cyber-sm" onClick={() => setEditRow(null)}>Hủy</Button>
          <Button className="btn-cyber btn-cyber-danger btn-cyber-sm" onClick={handleSaveEdit} disabled={savingEdit}>
            {savingEdit ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
