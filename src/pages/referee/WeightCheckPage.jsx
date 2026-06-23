import { useEffect, useState, useMemo } from 'react';
import { Form, Button, Row, Col, Badge, Modal, Table } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { refereeRaceService } from '../../services/refereeRaceService';
import { entryService } from '../../services/entryService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';

const GOLD = '#D4AF37';
const CARD_STYLE = { backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#f5f5f5' };
const HEADER_STYLE = { backgroundColor: 'transparent', borderBottom: `1px solid ${GOLD}` };

// Helper format status
const formatWeightStatus = (status) => {
  switch (status?.toUpperCase()) {
    case 'PASSED':
      return { label: 'ĐẠT KIỂM TRA', color: '#28a745', border: '1px solid #28a745', bg: 'rgba(40, 167, 69, 0.1)' };
    case 'FAILED':
      return { label: 'KHÔNG ĐẠT', color: '#dc3545', border: '1px solid #dc3545', bg: 'rgba(220, 53, 69, 0.1)' };
    case 'OVERWEIGHT_ACCEPTED':
      return { label: 'CHẤP NHẬN QUÁ CÂN', color: '#ffc107', border: '1px solid #ffc107', bg: 'rgba(255, 193, 7, 0.1)' };
    default:
      return { label: 'CHƯA KIỂM TRA', color: '#6c757d', border: '1px solid #6c757d', bg: 'rgba(108, 117, 125, 0.1)' };
  }
};

const formatCheckBadge = (status) => {
  switch (status?.toUpperCase()) {
    case 'PASSED': return <Badge bg="success">Đạt</Badge>;
    case 'FAILED': return <Badge bg="danger">Không đạt</Badge>;
    case 'OVERWEIGHT_ACCEPTED': return <Badge bg="warning" text="dark">Quá cân</Badge>;
    default: return <Badge bg="secondary">---</Badge>;
  }
};

export default function WeightCheckPage() {
  const [races, setRaces] = useState([]);
  const [entries, setEntries] = useState([]);
  const [selectedRaceId, setSelectedRaceId] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, setValue } = useForm();

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch assigned races for referee
      const assignedRaces = await refereeRaceService.getAssignedRaces();
      setRaces(assignedRaces);

      // 2. Fetch entries for all valid races
      const allEntriesPromises = assignedRaces.map(async (race) => {
        try {
          const raceEntries = await refereeRaceService.getAssignedRaceEntries(race.id);
          // Only show confirmed/declared
          const validEntries = raceEntries.filter(e => e.status === 'CONFIRMED' || e.status === 'DECLARED');
          // Attach raceName for display
          return validEntries.map(e => ({ ...e, raceName: race.name }));
        } catch {
          return [];
        }
      });
      const entriesArrays = await Promise.all(allEntriesPromises);
      setEntries(entriesArrays.flat());

    } catch (err) {
      setError(getApiErrorMessage(err, 'Không tải được danh sách giải đua.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Filter logic
  const filteredEntries = useMemo(() => {
    if (selectedRaceId === 'ALL') return entries;
    return entries.filter(e => String(e.raceId) === String(selectedRaceId));
  }, [entries, selectedRaceId]);

  const openModal = (entry) => {
    setSelectedEntry(entry);
    // Pre-fill form
    setValue('actualWeight', entry.actualWeight || entry.handicapWeight || '');
    setValue('weightCheckStatus', entry.weightCheckStatus === 'PENDING' ? '' : entry.weightCheckStatus);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEntry(null);
    reset();
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = {
        actualWeight: Number(data.actualWeight),
        weightCheckStatus: data.weightCheckStatus,
      };
      await entryService.updateWeight(selectedEntry.entryId || selectedEntry.id, payload);
      setToast({ message: 'Đã lưu kết quả kiểm tra cân nặng!', variant: 'success' });
      closeModal();
      loadData(); // refresh table
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Lưu thất bại.'), variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div>
      <h2 style={{ color: GOLD, marginBottom: '20px' }}>Kiểm tra Cân nặng ⚖️</h2>

      {/* Filter Box */}
      <div className="card shadow-sm mb-4" style={{ ...CARD_STYLE, padding: '15px' }}>
        <Row className="align-items-center">
          <Col md={4}>
            <Form.Group>
              <Form.Label style={{ color: GOLD, fontWeight: 'bold' }}>RACE</Form.Label>
              <Form.Select
                value={selectedRaceId}
                onChange={(e) => setSelectedRaceId(e.target.value)}
                style={{ backgroundColor: '#222', color: '#fff', borderColor: '#444' }}
              >
                <option value="ALL">Tất cả race được phân công</option>
                {races.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </div>

      {/* Data Table */}
      <div className="card shadow-sm" style={CARD_STYLE}>
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr>
                <th style={{ color: GOLD, borderColor: '#333', borderBottom: `2px solid ${GOLD}` }}>Race</th>
                <th style={{ color: GOLD, borderColor: '#333', borderBottom: `2px solid ${GOLD}` }}>Entry</th>
                <th style={{ color: GOLD, borderColor: '#333', borderBottom: `2px solid ${GOLD}` }}>Cổng</th>
                <th style={{ color: GOLD, borderColor: '#333', borderBottom: `2px solid ${GOLD}` }}>Handicap</th>
                <th style={{ color: GOLD, borderColor: '#333', borderBottom: `2px solid ${GOLD}` }}>Cân thực tế</th>
                <th style={{ color: GOLD, borderColor: '#333', borderBottom: `2px solid ${GOLD}` }}>Check cân</th>
                <th style={{ color: GOLD, borderColor: '#333', borderBottom: `2px solid ${GOLD}` }}>Trạng thái</th>
                <th style={{ color: GOLD, borderColor: '#333', borderBottom: `2px solid ${GOLD}` }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    Không có entry nào cần kiểm tra.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const statusStyle = formatWeightStatus(entry.weightCheckStatus);
                  return (
                    <tr key={entry.id}>
                      <td style={{ borderColor: '#2a2a2a', fontWeight: 'bold' }}>{entry.raceName}</td>
                      <td style={{ borderColor: '#2a2a2a' }}>{entry.horseName}</td>
                      <td style={{ borderColor: '#2a2a2a' }}>{entry.gateNumber || '—'}</td>
                      <td style={{ borderColor: '#2a2a2a' }}>{entry.handicapWeight ? `${entry.handicapWeight} kg` : '—'}</td>
                      <td style={{ borderColor: '#2a2a2a' }}>{entry.actualWeight ? `${entry.actualWeight} kg` : '—'}</td>
                      <td style={{ borderColor: '#2a2a2a' }}>{formatCheckBadge(entry.weightCheckStatus)}</td>
                      <td style={{ borderColor: '#2a2a2a' }}>
                        <span style={{ 
                          color: statusStyle.color, 
                          border: statusStyle.border,
                          backgroundColor: statusStyle.bg,
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}>
                          {statusStyle.label}
                        </span>
                      </td>
                      <td style={{ borderColor: '#2a2a2a' }}>
                        <Button 
                          size="sm" 
                          variant="warning" 
                          style={{ fontWeight: 'bold', fontSize: '0.8rem', padding: '6px 12px' }}
                          onClick={() => openModal(entry)}
                        >
                          CHECK CÂN
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Check Cân */}
      <Modal show={showModal} onHide={closeModal} centered backdrop="static">
        <Modal.Header closeButton style={{ background: '#1a1a2e', borderColor: '#333' }}>
          <Modal.Title style={{ color: GOLD, fontSize: '1.25rem' }}>
            Check Cân Nặng - {selectedEntry?.horseName}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body style={{ background: '#1a1a2e', color: '#e0d6b0' }}>
            <div className="mb-3">
              <strong>Race:</strong> {selectedEntry?.raceName}
            </div>
            <div className="mb-3">
              <strong>Handicap Weight:</strong> {selectedEntry?.handicapWeight} kg
            </div>
            
            <Form.Group className="mb-4">
              <Form.Label>Cân thực tế (kg) *</Form.Label>
              <Form.Control
                type="number"
                step="0.1"
                min="30"
                {...register('actualWeight', { required: true, min: 30 })}
                style={{ backgroundColor: '#222', color: '#fff', borderColor: '#444' }}
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Trạng thái Check Cân *</Form.Label>
              <Form.Select
                {...register('weightCheckStatus', { required: true })}
                style={{ backgroundColor: '#222', color: '#fff', borderColor: '#444' }}
              >
                <option value="">-- Chọn trạng thái --</option>
                <option value="passed">Đạt (Passed)</option>
                <option value="failed">Không đạt (Failed)</option>
                <option value="overweight_accepted">Chấp nhận quá cân</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer style={{ background: '#1a1a2e', borderColor: '#333' }}>
            <Button variant="secondary" onClick={closeModal} disabled={saving}>Huỷ</Button>
            <Button type="submit" variant="warning" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu kết quả'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
