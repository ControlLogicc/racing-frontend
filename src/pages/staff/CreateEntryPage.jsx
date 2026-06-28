import { useEffect, useState } from 'react';
import { entryService } from '../../services/entryService';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';
import { CheckCircleFill, XCircleFill, PersonFill, Trophy, FlagFill } from 'react-bootstrap-icons';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';

// ─── Confirm Entry Modal ──────────────────────────────────────────────────────
function CreateEntryModal({ candidate, onHide, onSuccess }) {
  const [handicapWeight, setHandicapWeight] = useState('');
  const [gateNumber, setGateNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    entryService.create({
      invitationId: candidate.invitationId,
      ...(handicapWeight ? { handicapWeight: parseFloat(handicapWeight) } : {}),
      ...(gateNumber ? { gateNumber: parseInt(gateNumber) } : {}),
    })
      .then(() => {
        onSuccess({ message: `Đã tạo Race Entry cho ${candidate.horseName} — ${candidate.jockeyName}!`, variant: 'success' });
        onHide();
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Tạo entry thất bại.')))
      .finally(() => setSubmitting(false));
  };

  if (!candidate) return null;

  return (
    <Modal show onHide={onHide} centered>
      <Modal.Header closeButton style={{ background: '#1a1a1a', borderBottom: '1px solid #2a2a2a' }}>
        <Modal.Title style={{ color: '#D4AF37', fontSize: '1.1rem' }}>
          🏁 Xác nhận tạo Race Entry
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: '#1a1a1a', color: '#ccc' }}>
        {/* Summary */}
        <div style={{
          background: 'rgba(212,175,55,0.06)',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: 10, padding: '14px 18px', marginBottom: 20
        }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Race</div>
              <div style={{ color: '#f0e8d0', fontWeight: 700 }}>{candidate.raceName}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Ngựa</div>
              <div style={{ color: '#D4AF37', fontWeight: 700 }}>🐎 {candidate.horseName}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Owner</div>
              <div style={{ color: '#c8bea0' }}>{candidate.ownerName}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Jockey</div>
              <div style={{ color: '#22c55e', fontWeight: 600 }}>
                <PersonFill className="me-1" />{candidate.jockeyName}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#ef4444', fontSize: '0.88rem' }}>
            ⚠️ {error}
          </div>
        )}

        <Form onSubmit={handleSubmit}>
          <div style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 8, padding: '10px 14px', fontSize: '0.85rem', color: '#94a3b8' }}>
            Handicap weight sẽ tự tính từ rating ngựa. Số cổng sẽ được bốc thăm sau.
          </div>

          <div className="d-flex gap-2 justify-content-end mt-4">
            <Button variant="secondary" onClick={onHide} style={{ background: '#333', border: 'none' }}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              style={{ background: '#D4AF37', border: 'none', color: '#111', fontWeight: 700, borderRadius: 8 }}
            >
              {submitting ? <Spinner size="sm" animation="border" className="me-2" /> : <CheckCircleFill className="me-2" />}
              Xác nhận tạo Entry
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function StaffCreateEntryPage() {
  const [races, setRaces] = useState([]);
  const [selectedRaceId, setSelectedRaceId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loadingRaces, setLoadingRaces] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [confirmCandidate, setConfirmCandidate] = useState(null);

  // Load races assigned to this staff
  useEffect(() => {
    raceService.getAssignedToStaff()
      .then(setRaces)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách race.')))
      .finally(() => setLoadingRaces(false));
  }, []);

  // Load candidates when race selected
  useEffect(() => {
    if (!selectedRaceId) { setCandidates([]); return; }
    setLoadingCandidates(true);
    entryService.getCandidates(Number(selectedRaceId))
      .then(setCandidates)
      .catch(() => setCandidates([]))
      .finally(() => setLoadingCandidates(false));
  }, [selectedRaceId]);

  const refetchCandidates = () => {
    if (!selectedRaceId) return;
    setLoadingCandidates(true);
    entryService.getCandidates(Number(selectedRaceId))
      .then(setCandidates)
      .catch(() => setCandidates([]))
      .finally(() => setLoadingCandidates(false));
  };

  if (loadingRaces) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const readyCandidates = candidates.filter((c) => c.canCreateEntry);
  const blockedCandidates = candidates.filter((c) => !c.canCreateEntry);

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(0,0,0,0))',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: 14, padding: '20px 28px', marginBottom: 28
      }}>
        <div className="d-flex align-items-center gap-3">
          <FlagFill size={28} style={{ color: '#D4AF37' }} />
          <div>
            <h2 style={{ color: '#f0e8d0', margin: 0, fontWeight: 800 }}>Tạo Race Entry</h2>
            <p style={{ margin: 0, marginTop: 4, color: '#7a6a50', fontSize: '0.9rem' }}>
              Xác nhận cặp <strong style={{ color: '#D4AF37' }}>Ngựa + Jockey</strong> đã được owner chốt để đưa vào Race Entry
            </p>
          </div>
        </div>
      </div>

      {/* Race selector */}
      <div style={{
        background: '#111', border: '1px solid #2a2a2a',
        borderRadius: 10, padding: '16px 20px', marginBottom: 24
      }}>
        <label style={{ color: '#D4AF37', fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          Chọn Race để xem danh sách
        </label>
        <select
          className="form-select"
          value={selectedRaceId}
          onChange={(e) => setSelectedRaceId(e.target.value)}
          style={{ background: '#1a1a1a', border: '1px solid #333', color: '#eee', borderRadius: 8, maxWidth: 450 }}
        >
          <option value="">-- Chọn race được phân công --</option>
          {races.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name || r.raceName} {r.scheduledTime ? `— ${formatDate(r.scheduledTime)}` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {!selectedRaceId ? (
        <EmptyState message="Chọn một race để xem danh sách Owner đã có Jockey sẵn sàng." />
      ) : loadingCandidates ? (
        <div className="text-center py-5">
          <Spinner animation="border" style={{ color: '#D4AF37' }} />
          <div style={{ color: '#888', marginTop: 12 }}>Đang tải danh sách...</div>
        </div>
      ) : candidates.length === 0 ? (
        <EmptyState message="Chưa có cặp Ngựa–Jockey nào sẵn sàng cho race này. Owner cần mời và Jockey cần chấp nhận trước." />
      ) : (
        <>
          {/* Ready candidates */}
          {readyCandidates.length > 0 && (
            <>
              <div className="d-flex align-items-center gap-2 mb-3">
                <CheckCircleFill style={{ color: '#22c55e' }} />
                <h5 style={{ color: '#22c55e', margin: 0 }}>Sẵn sàng tạo Entry ({readyCandidates.length})</h5>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {readyCandidates.map((c) => (
                  <div key={c.invitationId} style={{
                    background: 'rgba(34,197,94,0.04)',
                    border: '1px solid rgba(34,197,94,0.25)',
                    borderRadius: 12, padding: '16px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', flex: 1 }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: 1 }}>Ngựa</div>
                        <div style={{ color: '#D4AF37', fontWeight: 700, fontSize: '1rem' }}>🐎 {c.horseName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#7a6a50' }}>Owner: {c.ownerName}</div>
                      </div>
                      <div style={{ borderLeft: '1px solid #2a2a2a', paddingLeft: 24 }}>
                        <div style={{ fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: 1 }}>Jockey</div>
                        <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '1rem' }}>
                          <PersonFill className="me-1" />{c.jockeyName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#22c55e', opacity: 0.7 }}>✓ Đã chấp nhận lời mời</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setConfirmCandidate(c)}
                      style={{
                        background: '#D4AF37', border: 'none', color: '#111',
                        fontWeight: 700, borderRadius: 8, padding: '9px 22px',
                        cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap',
                        display: 'flex', alignItems: 'center', gap: 6
                      }}
                    >
                      <Trophy size={15} />
                      Tạo Entry
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Blocked candidates */}
          {blockedCandidates.length > 0 && (
            <>
              <div className="d-flex align-items-center gap-2 mb-3">
                <XCircleFill style={{ color: '#ef4444' }} />
                <h5 style={{ color: '#9a9a9a', margin: 0 }}>Chưa đủ điều kiện ({blockedCandidates.length})</h5>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {blockedCandidates.map((c) => (
                  <div key={c.invitationId} style={{
                    background: 'rgba(239,68,68,0.03)',
                    border: '1px solid rgba(239,68,68,0.15)',
                    borderRadius: 10, padding: '12px 18px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.7
                  }}>
                    <div>
                      <span style={{ color: '#D4AF37' }}>🐎 {c.horseName}</span>
                      <span style={{ color: '#555', margin: '0 8px' }}>+</span>
                      <span style={{ color: '#9a9a9a' }}>{c.jockeyName}</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#ef4444' }}>
                      ⚠️ {c.reason}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Confirm modal */}
      {confirmCandidate && (
        <CreateEntryModal
          candidate={confirmCandidate}
          onHide={() => setConfirmCandidate(null)}
          onSuccess={(t) => {
            setToast(t);
            setConfirmCandidate(null);
            refetchCandidates();
          }}
        />
      )}

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
