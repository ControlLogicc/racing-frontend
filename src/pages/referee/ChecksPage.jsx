import { useEffect, useMemo, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { entryService } from '../../services/entryService';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import { RACE_ENTRY_STATUS } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/common/StatusBadge';
import Toaster from '../../components/common/Toaster';
import './referee-theme.css'; // Import Cyber Theme

const CHECKABLE_STATUSES = new Set([
  RACE_ENTRY_STATUS.DECLARED,
  RACE_ENTRY_STATUS.PASSED,
  RACE_ENTRY_STATUS.FAILED,
  RACE_ENTRY_STATUS.WITHDRAWN, // entry bị BE tự động scratch vì overweight — vẫn phải hiện để referee thấy và có thể check lại
]);

const getWeightStatus = (actualWeight, leadWeight, handicapWeight) => {
  if (!actualWeight || !handicapWeight) return 'PENDING';
  const carried = Number(actualWeight) + Number(leadWeight || 0);
  const handicap = Number(handicapWeight);
  if (carried < handicap) return 'FAILED';            // không đủ chì hoặc thiếu cân
  if (carried > handicap + 0.5) return 'OVERWEIGHT';  // vượt quá 0.5kg, phải công bố
  return 'PASSED';
};

const getCarriedWeight = (actualWeight, leadWeight) => {
  if (!actualWeight) return null;
  return Number(actualWeight) + Number(leadWeight || 0);
};

const formatWeight = (weight) => (
  weight === null || weight === undefined || weight === '' ? '—' : `${Number(weight).toFixed(1)} kg`
);

const WEIGHT_BADGE = {
  PENDING: 'secondary',
  PASSED: 'success',
  OVERWEIGHT: 'warning',
  FAILED: 'danger',
};

const WEIGHT_LABEL = {
  PENDING: 'Chưa cân',
  PASSED: 'Đạt',
  OVERWEIGHT: 'Overweight',
  FAILED: 'Không đạt',
};

export default function RefereeChecksPage() {
  const { user } = useAuth();
  const [races, setRaces] = useState([]);
  const [entries, setEntries] = useState([]);
  const [selectedRaceId, setSelectedRaceId] = useState('');
  const [weightRow, setWeightRow] = useState(null);
  const [handicapWeight, setHandicapWeight] = useState('');
  const [actualWeight, setActualWeight] = useState('');
  const [leadWeight, setLeadWeight] = useState('');
  const [preCheckNote, setPreCheckNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([
      raceService.getAssignedToReferee(user),
      entryService.getForReferee(user),
    ])
      .then(([raceData, entryData]) => {
        setRaces(raceData);
        setEntries(entryData);
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được danh sách kiểm tra.')))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const raceMap = useMemo(
    () => new Map(races.map((race) => [Number(race.id), race])),
    [races]
  );

  const visibleEntries = useMemo(() => {
    const base = selectedRaceId
      ? entries.filter((entry) => Number(entry.raceId) === Number(selectedRaceId))
      : entries;
    return base
      .filter((entry) => CHECKABLE_STATUSES.has(entry.status) || !entry.status)
      .sort((a, b) => (a.raceName || '').localeCompare(b.raceName || '') || (a.gateNumber ?? 999) - (b.gateNumber ?? 999));
  }, [entries, selectedRaceId]);

  const stats = {
    total: visibleEntries.length,
    pending: visibleEntries.filter((entry) => !entry.actualWeight).length,
    failed: visibleEntries.filter((entry) => entry.actualWeight && getWeightStatus(entry.actualWeight, entry.leadWeight, entry.handicapWeight) === 'FAILED').length,
    scratched: visibleEntries.filter((entry) => entry.status === RACE_ENTRY_STATUS.WITHDRAWN).length,
    ready: visibleEntries.filter((entry) => ['PASSED', 'OVERWEIGHT'].includes(getWeightStatus(entry.actualWeight, entry.leadWeight, entry.handicapWeight))).length,
  };

  const refetch = () => load();
  const modalCarriedWeight = getCarriedWeight(actualWeight, leadWeight);

  const openWeight = (entry) => {
    setWeightRow(entry);
    setHandicapWeight(entry.handicapWeight ? String(entry.handicapWeight) : '');
    setActualWeight(entry.actualWeight ? String(entry.actualWeight) : '');
    setLeadWeight(entry.leadWeight != null ? String(entry.leadWeight) : '0');
    setPreCheckNote(entry.preCheckNote || '');
  };

  const handleSaveWeight = async (e) => {
    e.preventDefault();
    if (!weightRow || !handicapWeight || !actualWeight) return;

    const savedLead = Number(leadWeight || 0);
    const savedActual = Number(actualWeight);
    const savedHandicap = Number(handicapWeight);
    const savedCarried = Number(modalCarriedWeight);
    const status = getWeightStatus(actualWeight, leadWeight, handicapWeight);

    setSaving(true);
    try {
      const updatedEntry = await entryService.preCheck(weightRow.id, {
        handicapWeight: savedHandicap,
        actualWeight: savedActual,
        leadWeight: savedLead,
        carriedWeight: savedCarried,
        weightCheckStatus: status,
        note: preCheckNote,
      });
      // Cập nhật local state bằng dữ liệu trả về từ backend (chứa weightCheckStatus và entryStatus)
      setEntries((prev) => prev.map((en) =>
        en.id === weightRow.id
          ? { ...en, ...updatedEntry }
          : en
      ));
      setToast({ message: 'Đã lưu kiểm tra cân nặng.', variant: 'success' });
      setWeightRow(null);
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Lưu cân nặng thất bại.'), variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="referee-context">
      <div className="referee-hero d-flex justify-content-between align-items-center">
        <div>
          <h2>EQUIPMENT & WEIGHT CHECK</h2>
          <p className="mb-0">
            &gt; SYSTEM: VERIFYING ENTRY COMPLIANCE BEFORE RACE
          </p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="cyber-stat-card accent-primary">
            <h6 className="stat-label">Entry Cần Check</h6>
            <h2 className="stat-value">{stats.total}</h2>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="cyber-stat-card accent-warning">
            <h6 className="stat-label">Chưa Cân</h6>
            <h2 className="stat-value text-warning">{stats.pending}</h2>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="cyber-stat-card accent-danger">
            <h6 className="stat-label">Không Đạt</h6>
            <h2 className="stat-value text-danger">{stats.failed}</h2>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="cyber-stat-card accent-danger">
            <h6 className="stat-label">Đã Loại (Overweight)</h6>
            <h2 className="stat-value text-danger">{stats.scratched}</h2>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="cyber-stat-card accent-success">
            <h6 className="stat-label">Sẵn Sàng</h6>
            <h2 className="stat-value">{stats.ready}</h2>
          </div>
        </div>
      </div>

      <div className="cyber-panel mb-4">
        <Form.Group style={{ maxWidth: 400 }}>
          <Form.Label className="cyber-form-label">Bộ Lọc Race</Form.Label>
          <Form.Select className="cyber-input" value={selectedRaceId} onChange={(e) => setSelectedRaceId(e.target.value)}>
            <option value="">-- Hiển thị tất cả race --</option>
            {races.map((race) => (
              <option key={race.id} value={race.id}>
                {race.name} ({race.meetingName || 'Không có meeting'})
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>

      <div className="cyber-panel">
        <h5 className="mb-4 text-info fw-bold" style={{ letterSpacing: '1px' }}>ENTRY LIST</h5>
        {visibleEntries.length === 0 ? (
          <EmptyState message="Không có entry nào cần kiểm tra lúc này." />
        ) : (
          <div className="table-responsive">
            <table className="table-cyber w-100">
              <thead>
                <tr>
                  <th>Race</th>
                  <th>Entry</th>
                  <th>Cổng</th>
                  <th>Handicap</th>
                  <th>Lead Weight</th>
                  <th>Carried Weight</th>
                  <th>Cân thực tế</th>
                  <th>Check cân</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {visibleEntries.map((entry) => {
                  const weightStatus = getWeightStatus(entry.actualWeight, entry.leadWeight, entry.handicapWeight);
                  const race = raceMap.get(Number(entry.raceId));
                  return (
                    <tr key={entry.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{entry.raceName || race?.name || `Race #${entry.raceId}`}</div>
                        <small className="text-muted">{formatDate(entry.scheduledTime || race?.raceTime)}</small>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{entry.horseName}</div>
                        <small className="text-info">{entry.jockeyName || 'Chưa có jockey'}</small>
                        {entry.status === RACE_ENTRY_STATUS.WITHDRAWN && entry.preCheckNote && (
                          <div className="small text-danger mt-1">{entry.preCheckNote}</div>
                        )}
                      </td>
                      <td className="fw-bold">{entry.gateNumber || entry.drawNumber || '—'}</td>
                      <td>{formatWeight(entry.handicapWeight)}</td>
                      <td>{formatWeight(entry.leadWeight)}</td>
                      <td>{formatWeight(entry.carriedWeight ?? getCarriedWeight(entry.actualWeight, entry.leadWeight))}</td>
                      <td>{formatWeight(entry.actualWeight)}</td>
                      <td><span className={`cyber-badge cyber-badge-${WEIGHT_BADGE[weightStatus]}`}>{WEIGHT_LABEL[weightStatus]}</span></td>
                      <td><StatusBadge status={
                        entry.status === RACE_ENTRY_STATUS.WITHDRAWN
                          ? RACE_ENTRY_STATUS.WITHDRAWN
                          : !entry.actualWeight
                            ? (entry.status || RACE_ENTRY_STATUS.DECLARED)
                            : weightStatus === 'FAILED' ? RACE_ENTRY_STATUS.FAILED : RACE_ENTRY_STATUS.PASSED
                      } /></td>
                      <td>
                        <Button className="btn-cyber btn-cyber-sm" onClick={() => openWeight(entry)}>Check Cân</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal show={!!weightRow} onHide={() => setWeightRow(null)} centered className="cyber-modal">
        <Modal.Header closeButton>
          <Modal.Title>KIỂM TRA CÂN NẶNG</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#0f172a', color: '#cbd5e1' }}>
          {weightRow && (
            <Form onSubmit={handleSaveWeight} className="d-flex flex-column gap-3">
              <div className="mb-2">
                <div className="cyber-form-label mb-1">ĐỐI TƯỢNG KIỂM TRA</div>
                <strong className="fs-5 text-white">{weightRow.horseName}</strong>
                <div className="text-info">{weightRow.raceName}</div>
              </div>
              <Form.Group>
                <Form.Label className="cyber-form-label">Handicap weight (kg)</Form.Label>
                <Form.Control
                  className="cyber-input"
                  type="number"
                  min="0"
                  step="0.1"
                  value={handicapWeight}
                  onChange={(e) => setHandicapWeight(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label className="cyber-form-label text-warning">Cân thực tế của jockey (kg)</Form.Label>
                <Form.Control
                  className="cyber-input"
                  type="number"
                  min="0"
                  step="0.1"
                  value={actualWeight}
                  onChange={(e) => setActualWeight(e.target.value)}
                  required
                  autoFocus
                />
              </Form.Group>
              <div className="row g-3">
                <div className="col-6">
                  <Form.Group>
                    <Form.Label className="cyber-form-label">Lead cần thiết (tự tính)</Form.Label>
                    <Form.Control
                      className="cyber-input"
                      type="number"
                      value={handicapWeight && actualWeight
                        ? Math.max(Number(handicapWeight) - Number(actualWeight), 0).toFixed(1)
                        : '0.0'}
                      readOnly
                      style={{ opacity: 0.6, cursor: 'not-allowed' }}
                    />
                  </Form.Group>
                </div>
                <div className="col-6">
                  <Form.Group>
                    <Form.Label className="cyber-form-label text-warning">Chì thực tế mang theo (kg)</Form.Label>
                    <Form.Control
                      className="cyber-input"
                      type="number"
                      min="0"
                      step="0.1"
                      value={leadWeight}
                      onChange={(e) => setLeadWeight(e.target.value)}
                    />
                  </Form.Group>
                </div>
              </div>
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <div className="cyber-weight-preview">
                    <span>Carried Weight</span>
                    <strong>{formatWeight(modalCarriedWeight)}</strong>
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <div className="cyber-weight-preview">
                    <span>Kết quả</span>
                    <strong style={{ color: getWeightStatus(actualWeight, leadWeight, handicapWeight) === 'PASSED' ? '#10b981' : getWeightStatus(actualWeight, leadWeight, handicapWeight) === 'OVERWEIGHT' ? '#f59e0b' : '#ef4444' }}>
                      {WEIGHT_LABEL[getWeightStatus(actualWeight, leadWeight, handicapWeight)]}
                    </strong>
                  </div>
                </div>
              </div>
              <Form.Group>
                <Form.Label className="cyber-form-label">Ghi chú (Tùy chọn)</Form.Label>
                <Form.Control
                  className="cyber-input"
                  as="textarea"
                  rows={2}
                  maxLength={500}
                  value={preCheckNote}
                  onChange={(e) => setPreCheckNote(e.target.value)}
                  placeholder="Nhập ghi chú hoặc biên bản nếu có..."
                />
              </Form.Group>
              <div className="d-flex justify-content-end gap-3 mt-3">
                <Button variant="link" style={{ color: '#64748b', textDecoration: 'none' }} onClick={() => setWeightRow(null)}>HỦY BỎ</Button>
                <Button type="submit" className="btn-cyber btn-cyber-primary" disabled={saving}>
                  {saving ? 'ĐANG XỬ LÝ...' : 'LƯU HỒ SƠ KIỂM TRA'}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
