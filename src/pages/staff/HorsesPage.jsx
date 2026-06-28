import { useEffect, useState } from 'react';
import { Modal, Button, Form, Badge } from 'react-bootstrap';
import { CheckCircleFill, XCircleFill, ClockFill } from 'react-bootstrap-icons';
import { horseService } from '../../services/horseService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';
import './staff-theme.css';

/* ─── Status badge ─────────────────────────────────────────────────────────── */
function HorseStatusBadge({ status }) {
  const s = (status || '').toUpperCase();
  if (s === 'ACTIVE')   return <Badge bg="success">ACTIVE</Badge>;
  if (s === 'FAIL')     return <Badge bg="danger">FAIL — chờ duyệt</Badge>;
  if (s === 'INJURED')  return <Badge bg="warning" text="dark">INJURED</Badge>;
  if (s === 'RETIRED')  return <Badge bg="secondary">RETIRED</Badge>;
  if (s === 'SUSPENDED') return <Badge bg="dark">SUSPENDED</Badge>;
  return <Badge bg="secondary">{s || '—'}</Badge>;
}

/* ─── Approve Modal ────────────────────────────────────────────────────────── */
function ApproveModal({ horse, onClose, onConfirm, saving }) {
  const [useOverride, setUseOverride] = useState(false);
  const [approvedScore, setApprovedScore] = useState('');
  const [approvedClass, setApprovedClass] = useState('');

  if (!horse) return null;

  const handleSubmit = () => {
    const payload = {};
    if (useOverride) {
      if (approvedScore !== '') payload.approvedScore = Number(approvedScore);
      if (approvedClass !== '') payload.approvedClass = Number(approvedClass);
    }
    onConfirm(horse.id, payload);
  };

  return (
    <Modal show centered onHide={onClose}>
      <Modal.Header closeButton style={{ background: '#1a1a2e', borderBottom: '1px solid #2a2a4a' }}>
        <Modal.Title style={{ color: '#D4AF37', fontSize: 17 }}>
          <CheckCircleFill className="me-2 text-success" />
          Duyệt ngựa: <span style={{ color: '#fff' }}>{horse.name}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: '#12122b', color: '#ccc' }}>
        {/* Thông tin owner khai báo */}
        <div
          style={{
            background: '#1e1e3a',
            border: '1px solid #2a2a4a',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 13, color: '#aaa', marginBottom: 6 }}>Thông tin chủ ngựa khai báo</div>
          <div className="d-flex gap-4">
            <div>
              <div style={{ fontSize: 11, color: '#888' }}>Rating (Claimed)</div>
              <div style={{ color: '#D4AF37', fontWeight: 700, fontSize: 18 }}>
                {horse.claimedScore ?? '—'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#888' }}>Class (Claimed)</div>
              <div style={{ color: '#D4AF37', fontWeight: 700, fontSize: 18 }}>
                {horse.claimedClass ?? '—'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#888' }}>Chủ ngựa</div>
              <div style={{ color: '#fff', fontWeight: 600 }}>{horse.ownerName}</div>
            </div>
          </div>
        </div>

        {/* Override toggle */}
        <Form.Check
          type="switch"
          id="override-switch"
          label={<span style={{ color: '#ddd', fontSize: 14 }}>Nhập score/class khác (override)</span>}
          checked={useOverride}
          onChange={(e) => setUseOverride(e.target.checked)}
          className="mb-3"
        />

        {useOverride && (
          <div className="row g-2">
            <div className="col-6">
              <Form.Label style={{ fontSize: 13, color: '#aaa' }}>Approved Score</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder={`Mặc định: ${horse.claimedScore ?? '?'}`}
                value={approvedScore}
                onChange={(e) => setApprovedScore(e.target.value)}
                style={{ background: '#1a1a2e', color: '#fff', border: '1px solid #3a3a5a' }}
              />
            </div>
            <div className="col-6">
              <Form.Label style={{ fontSize: 13, color: '#aaa' }}>Approved Class (1–5)</Form.Label>
              <Form.Select
                value={approvedClass}
                onChange={(e) => setApprovedClass(e.target.value)}
                style={{ background: '#1a1a2e', color: '#fff', border: '1px solid #3a3a5a' }}
              >
                <option value="">Mặc định: {horse.claimedClass ?? '?'}</option>
                {[1, 2, 3, 4, 5].map((c) => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </Form.Select>
            </div>
          </div>
        )}

        {!useOverride && (
          <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
            Nếu không override, hệ thống sẽ dùng đúng score/class chủ ngựa đã khai báo.
          </p>
        )}
      </Modal.Body>
      <Modal.Footer style={{ background: '#1a1a2e', borderTop: '1px solid #2a2a4a' }}>
        <Button variant="outline-secondary" onClick={onClose} disabled={saving}>
          Huỷ
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={saving}
          style={{ background: '#22c55e', border: 'none', fontWeight: 600 }}
        >
          {saving ? 'Đang xử lý…' : '✓ Xác nhận duyệt'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

/* ─── Main Page ────────────────────────────────────────────────────────────── */
export default function StaffHorsesPage() {
  const [horses, setHorses]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [toast, setToast]         = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [detailHorse, setDetailHorse]     = useState(null);
  const [overrideScore, setOverrideScore] = useState('');
  const [overrideClass, setOverrideClass] = useState('');
  const [saving, setSaving]       = useState(false);

  const scoreToClass = (score) => {
    const s = Number(score);
    if (s >= 80) return 1;
    if (s >= 60) return 2;
    if (s >= 40) return 3;
    if (s >= 20) return 4;
    return 5;
  };

  const openDetail = (h) => {
    setDetailHorse(h);
    setOverrideScore('');
    setOverrideClass('');
  };

  const load = () => {
    setLoading(true);
    setError('');
    horseService.staffGetPending()
      .then(setHorses)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách ngựa chờ duyệt.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  /* ── Approve ── */
  const handleApproveConfirm = (horseId, payload) => {
    setSaving(true);
    horseService.verifyRating(horseId, 'APPROVE', payload)
      .then(() => {
        setToast({ message: 'Đã duyệt ngựa thành công → status: ACTIVE', variant: 'success' });
        setApproveTarget(null);
        load();
      })
      .catch((err) => setToast({ message: 'Lỗi: ' + getApiErrorMessage(err), variant: 'danger' }))
      .finally(() => setSaving(false));
  };

  /* ── Reject ── */
  const handleReject = (horse) => {
    if (!window.confirm(`Từ chối ngựa "${horse.name}" — chủ ngựa sẽ phải nộp lại rating. Xác nhận?`)) return;
    horseService.verifyRating(horse.id, 'REJECT')
      .then(() => {
        setToast({ message: `Đã từ chối ngựa "${horse.name}"`, variant: 'warning' });
        load();
      })
      .catch((err) => setToast({ message: 'Lỗi: ' + getApiErrorMessage(err), variant: 'danger' }));
  };

  return (
    <div className="staff-theme-wrapper p-3">
      {/* Header */}
      <div className="page-header mb-4 d-flex justify-content-between align-items-end">
        <div>
          <h2 className="staff-header-title">
            <ClockFill className="me-2" style={{ color: '#D4AF37' }} />
            Duyệt ngựa chờ xác minh
          </h2>
          <p className="staff-subtitle mb-0">
            Ngựa đã thi đấu trước đó — chủ ngựa khai báo rating, Staff xác nhận hoặc override.
          </p>
        </div>
        <button
          className="btn btn-sm"
          style={{ background: '#1e1e3a', color: '#D4AF37', border: '1px solid #D4AF37' }}
          onClick={load}
          disabled={loading}
        >
          ↻ Tải lại
        </button>
      </div>

      {/* Badge tổng số */}
      {!loading && !error && (
        <div className="mb-3">
          <span
            style={{
              background: horses.length > 0 ? '#7c3aed22' : '#1e1e3a',
              border: `1px solid ${horses.length > 0 ? '#7c3aed' : '#2a2a4a'}`,
              color: horses.length > 0 ? '#a78bfa' : '#888',
              borderRadius: 20,
              padding: '4px 14px',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {horses.length} ngựa đang chờ duyệt
          </span>
        </div>
      )}

      {loading && <Loading />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && horses.length === 0 && (
        <EmptyState message="Không có ngựa nào đang chờ duyệt. Tất cả đã được xác minh!" />
      )}

      {!loading && !error && horses.length > 0 && (
        <div className="staff-card" style={{ overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="staff-table mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tên ngựa</th>
                  <th>Chủ ngựa</th>
                  <th>Tuổi / Giới</th>
                  <th style={{ color: '#D4AF37' }}>Rating Claimed</th>
                  <th style={{ color: '#D4AF37' }}>Class Claimed</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'center' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {horses.map((h, i) => (
                  <tr key={h.id} className="align-middle">
                    <td style={{ color: '#666', fontSize: 12 }}>{h.id}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#fff' }}>{h.name}</span>
                      {h.breed && (
                        <div style={{ fontSize: 11, color: '#888' }}>{h.breed}</div>
                      )}
                    </td>
                    <td style={{ color: '#c4b5fd' }}>{h.ownerName || '—'}</td>
                    <td style={{ fontSize: 13 }}>
                      {h.age} tuổi &nbsp;·&nbsp;
                      <span style={{ color: h.gender === 'M' ? '#60a5fa' : '#f472b6' }}>
                        {h.gender === 'M' ? '♂' : '♀'}
                      </span>
                    </td>

                    {/* ─── Rating Claimed (nổi bật) ─────────────────── */}
                    <td>
                      {h.claimedScore != null ? (
                        <span
                          style={{
                            background: '#7c3aed22',
                            border: '1px solid #7c3aed',
                            borderRadius: 6,
                            padding: '3px 10px',
                            color: '#c4b5fd',
                            fontWeight: 700,
                            fontSize: 15,
                          }}
                        >
                          {Number(h.claimedScore).toFixed(1)}
                        </span>
                      ) : (
                        <span style={{ color: '#555' }}>—</span>
                      )}
                    </td>

                    {/* ─── Class Claimed ────────────────────────────── */}
                    <td>
                      {h.claimedClass != null ? (
                        <span
                          style={{
                            background: '#164e6322',
                            border: '1px solid #0891b2',
                            borderRadius: 6,
                            padding: '3px 10px',
                            color: '#67e8f9',
                            fontWeight: 600,
                          }}
                        >
                          Class {h.claimedClass}
                        </span>
                      ) : (
                        <span style={{ color: '#555' }}>—</span>
                      )}
                    </td>

                    <td><HorseStatusBadge status={h.status} /></td>

                    {/* ─── Action buttons ───────────────────────────── */}
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <button
                        className="btn btn-sm me-1"
                        title="Chi tiết"
                        style={{ background: '#1e293b', border: '1px solid #475569', color: '#94a3b8', fontWeight: 600, fontSize: 13 }}
                        onClick={() => openDetail(h)}
                      >
                        Chi tiết
                      </button>
                      <button
                        className="btn btn-sm me-1"
                        title="Duyệt ngựa"
                        style={{ background: '#15803d22', border: '1px solid #22c55e', color: '#22c55e', fontWeight: 600, fontSize: 13 }}
                        onClick={() => setApproveTarget(h)}
                      >
                        <CheckCircleFill className="me-1" />
                        Duyệt
                      </button>
                      <button
                        className="btn btn-sm"
                        title="Từ chối"
                        style={{ background: '#7f1d1d22', border: '1px solid #ef4444', color: '#ef4444', fontWeight: 600, fontSize: 13 }}
                        onClick={() => handleReject(h)}
                      >
                        <XCircleFill className="me-1" />
                        Từ chối
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Modal show={!!detailHorse} onHide={() => setDetailHorse(null)} centered>
        <Modal.Header closeButton style={{ background: '#1a1a2e', borderBottom: '1px solid #2a2a4a' }}>
          <Modal.Title style={{ color: '#D4AF37', fontSize: 17 }}>
            Chi tiết ngựa — {detailHorse?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#0f172a', color: '#cbd5e1' }}>
          {detailHorse && (
            <div className="d-flex flex-column gap-4">
              {/* Thông tin cơ bản */}
              <div className="row g-3">
                {[
                  { label: 'Chủ ngựa', value: detailHorse.ownerName || '—', col: 6, color: '#c4b5fd' },
                  { label: 'Trạng thái', value: null, col: 6, badge: true },
                  { label: 'Tuổi', value: detailHorse.age ?? '—', col: 3 },
                  { label: 'Giới tính', value: detailHorse.gender === 'M' ? '♂ Đực' : detailHorse.gender === 'F' ? '♀ Cái' : detailHorse.gender || '—', col: 3, color: detailHorse.gender === 'M' ? '#60a5fa' : '#f472b6' },
                  { label: 'Màu lông', value: detailHorse.color || detailHorse.breed || '—', col: 3 },
                  { label: 'Loại đăng ký', value: detailHorse.registrationType || '—', col: 6 },
                ].map(({ label, value, col, color, badge }) => (
                  <div key={label} className={`col-${col}`}>
                    <div style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
                    {badge ? <HorseStatusBadge status={detailHorse.status} /> : <div style={{ color: color || '#e2e8f0', fontWeight: 500, marginTop: 2 }}>{value}</div>}
                  </div>
                ))}
              </div>

              {/* So sánh rating: claimed vs hiện tại */}
              <div style={{ background: '#1e293b', borderRadius: 8, padding: '12px 16px', border: '1px solid #334155' }}>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>So sánh Rating / Class</div>
                <div className="row g-3">
                  <div className="col-6">
                    <div style={{ fontSize: 11, color: '#64748b' }}>Owner khai báo</div>
                    <div style={{ color: '#c4b5fd', fontWeight: 700, fontSize: 22 }}>{detailHorse.claimedScore ?? '—'}</div>
                    <div style={{ color: '#67e8f9', fontSize: 13 }}>{detailHorse.claimedClass != null ? `Class ${detailHorse.claimedClass}` : '—'}</div>
                  </div>
                  <div className="col-6">
                    <div style={{ fontSize: 11, color: '#64748b' }}>Rating hiện tại trong hệ thống</div>
                    <div style={{ color: '#D4AF37', fontWeight: 700, fontSize: 22 }}>{detailHorse.currentScore ?? '—'}</div>
                    <div style={{ color: '#D4AF37', fontSize: 13 }}>{detailHorse.horseClass != null ? `Class ${detailHorse.horseClass}` : '—'}</div>
                  </div>
                </div>
              </div>

              {/* Override section */}
              <div style={{ background: '#1e1e3a', borderRadius: 8, padding: '12px 16px', border: '1px solid #3a3a5a' }}>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Override Rating (nếu khai báo sai)
                </div>
                <div className="row g-2">
                  <div className="col-6">
                    <Form.Label style={{ fontSize: 12, color: '#aaa' }}>Rating thực tế</Form.Label>
                    <input
                      type="number" step="0.01" min="0" max="145"
                      className="form-control"
                      placeholder={`Claimed: ${detailHorse.claimedScore ?? '?'}`}
                      value={overrideScore}
                      onChange={(e) => setOverrideScore(e.target.value)}
                      style={{ background: '#1e293b', color: '#f1f5f9', border: '1px solid #475569', fontSize: 13 }}
                    />
                  </div>
                  <div className="col-6">
                    <Form.Label style={{ fontSize: 12, color: '#aaa' }}>Class (tự tính)</Form.Label>
                    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 6, padding: '0.5rem 0.75rem', fontSize: 13, color: '#fbbf24', fontWeight: 700, minHeight: 38, display: 'flex', alignItems: 'center' }}>
                      {overrideScore !== ''
                        ? `Class ${scoreToClass(overrideScore)}`
                        : `Class ${detailHorse.claimedClass ?? scoreToClass(detailHorse.claimedScore ?? 0)}`}
                    </div>
                  </div>
                </div>
                {overrideScore !== '' && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#fbbf24' }}>
                    ⚠️ Sẽ duyệt với rating = <strong>{overrideScore}</strong>, class = <strong>Class {scoreToClass(overrideScore)}</strong>
                  </div>
                )}
              </div>

              {detailHorse.evidenceLink && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Link Bằng chứng</div>
                  <a href={detailHorse.evidenceLink} target="_blank" rel="noopener noreferrer"
                    style={{ color: '#60a5fa', fontSize: 13, wordBreak: 'break-all' }}>
                    {detailHorse.evidenceLink}
                  </a>
                </div>
              )}

              {detailHorse.healthNote && (
                <div>
                  <div style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Ghi chú sức khoẻ</div>
                  <div style={{
                    color: '#fbbf24', marginTop: 4, fontSize: 13,
                    background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)',
                    borderRadius: 6, padding: '8px 12px',
                    wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: 1.6,
                  }}>
                    {detailHorse.healthNote}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ background: '#1a1a2e', borderTop: '1px solid #2a2a4a' }}>
          <Button variant="link" style={{ color: '#64748b', textDecoration: 'none' }} onClick={() => setDetailHorse(null)} disabled={saving}>
            Đóng
          </Button>
          <button
            className="btn btn-sm"
            style={{ background: '#7f1d1d22', border: '1px solid #ef4444', color: '#ef4444', fontWeight: 600 }}
            disabled={saving}
            onClick={() => { handleReject(detailHorse); setDetailHorse(null); }}
          >
            <XCircleFill className="me-1" /> Từ chối
          </button>
          <button
            className="btn btn-sm"
            style={{ background: '#15803d22', border: '1px solid #22c55e', color: '#22c55e', fontWeight: 600 }}
            disabled={saving}
            onClick={() => {
              const payload = {};
              if (overrideScore !== '') {
                payload.approvedScore = Number(overrideScore);
                payload.approvedClass = scoreToClass(overrideScore);
              }
              handleApproveConfirm(detailHorse.id, payload);
              setDetailHorse(null);
            }}
          >
            <CheckCircleFill className="me-1" /> {saving ? 'Đang xử lý…' : 'Duyệt'}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Approve Modal */}
      <ApproveModal
        horse={approveTarget}
        onClose={() => setApproveTarget(null)}
        onConfirm={handleApproveConfirm}
        saving={saving}
      />

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
