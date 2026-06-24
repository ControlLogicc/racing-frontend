import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Form, Modal } from 'react-bootstrap';
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

const GOLD = '#D4AF37';
const CHECKABLE_STATUSES = new Set([
  RACE_ENTRY_STATUS.DECLARED,
  RACE_ENTRY_STATUS.PASSED,
  RACE_ENTRY_STATUS.FAILED,
]);

const getWeightStatus = (actualWeight, handicapWeight) => {
  if (!actualWeight || !handicapWeight) return 'PENDING';
  const diff = Math.abs(Number(actualWeight) - Number(handicapWeight));
  if (diff <= 0.5) return 'PASSED';
  if (diff <= 1) return 'REVIEW';
  return 'FAILED';
};

const WEIGHT_BADGE = {
  PENDING: 'secondary',
  PASSED: 'success',
  REVIEW: 'warning',
  FAILED: 'danger',
};

const WEIGHT_LABEL = {
  PENDING: 'Chưa cân',
  PASSED: 'Đạt',
  REVIEW: 'Cần xem lại',
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

  const activeEntries = useMemo(
    () => entries.filter((entry) => entry.status !== RACE_ENTRY_STATUS.SCRATCHED),
    [entries]
  );

  const visibleEntries = useMemo(() => {
    const base = selectedRaceId
      ? activeEntries.filter((entry) => Number(entry.raceId) === Number(selectedRaceId))
      : activeEntries;
    return base
      .filter((entry) => CHECKABLE_STATUSES.has(entry.status) || !entry.status)
      .sort((a, b) => (a.raceName || '').localeCompare(b.raceName || '') || (a.gateNumber ?? 999) - (b.gateNumber ?? 999));
  }, [activeEntries, selectedRaceId]);

  const stats = {
    total: visibleEntries.length,
    pending: visibleEntries.filter((entry) => !entry.actualWeight).length,
    review: visibleEntries.filter((entry) => getWeightStatus(entry.actualWeight, entry.handicapWeight) === 'REVIEW').length,
    ready: visibleEntries.filter((entry) => entry.status === RACE_ENTRY_STATUS.PASSED || entry.weightCheckStatus === 'PASSED').length,
  };

  const refetch = () => load();

  const openWeight = (entry) => {
    setWeightRow(entry);
    setHandicapWeight(entry.handicapWeight ? String(entry.handicapWeight) : '');
    setActualWeight(entry.actualWeight ? String(entry.actualWeight) : '');
    setPreCheckNote(entry.preCheckNote || '');
  };

  const handleSaveWeight = async (e) => {
    e.preventDefault();
    if (!weightRow || !handicapWeight || !actualWeight) return;

    const status = getWeightStatus(actualWeight, handicapWeight);
    setSaving(true);
    try {
      await entryService.preCheck(weightRow.id, {
        handicapWeight: Number(handicapWeight),
        actualWeight: Number(actualWeight),
        weightCheckStatus: status,
        note: preCheckNote,
      });
      setToast({ message: 'Đã lưu kiểm tra cân nặng.', variant: 'success' });
      setWeightRow(null);
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Lưu cân nặng thất bại.'), variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Kiểm tra trước đua</h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
            Referee kiểm tra cân nặng, tình trạng entry và chốt sẵn sàng trước khi race chạy.
          </p>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {[
          ['Entry cần check', stats.total],
          ['Chưa cân', stats.pending],
          ['Cần xem lại', stats.review],
          ['Sẵn sàng', stats.ready],
        ].map(([label, value]) => (
          <div className="col-12 col-sm-6 col-xl-3" key={label}>
            <div className="dash-card" style={{ minHeight: 92 }}>
              <div style={{ color: '#888', fontSize: 12, textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
              <div style={{ color: GOLD, fontSize: 30, fontWeight: 800 }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-card mb-4">
        <Form.Group style={{ maxWidth: 360 }}>
          <Form.Label style={{ color: GOLD }}>Race</Form.Label>
          <Form.Select value={selectedRaceId} onChange={(e) => setSelectedRaceId(e.target.value)}>
            <option value="">Tất cả race được phân công</option>
            {races.map((race) => (
              <option key={race.id} value={race.id}>
                {race.name} ({race.meetingName || 'không có meeting'})
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>

      {visibleEntries.length === 0 ? (
        <EmptyState message="Không có entry nào cần referee kiểm tra." />
      ) : (
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr>
                <th style={{ color: GOLD }}>Race</th>
                <th style={{ color: GOLD }}>Entry</th>
                <th style={{ color: GOLD }}>Cổng</th>
                <th style={{ color: GOLD }}>Handicap</th>
                <th style={{ color: GOLD }}>Cân thực tế</th>
                <th style={{ color: GOLD }}>Check cân</th>
                <th style={{ color: GOLD }}>Trạng thái</th>
                <th style={{ color: GOLD }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {visibleEntries.map((entry) => {
                const weightStatus = entry.weightCheckStatus || getWeightStatus(entry.actualWeight, entry.handicapWeight);
                const race = raceMap.get(Number(entry.raceId));
                return (
                  <tr key={entry.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{entry.raceName || race?.name || `Race #${entry.raceId}`}</div>
                      <small className="text-muted">{formatDate(entry.scheduledTime || race?.raceTime)}</small>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{entry.horseName}</div>
                      <small className="text-muted">{entry.jockeyName || 'Chưa có jockey'}</small>
                    </td>
                    <td>{entry.gateNumber || entry.drawNumber || '—'}</td>
                    <td>{entry.handicapWeight ? `${entry.handicapWeight} kg` : '—'}</td>
                    <td>{entry.actualWeight ? `${entry.actualWeight} kg` : '—'}</td>
                    <td><Badge bg={WEIGHT_BADGE[weightStatus]}>{WEIGHT_LABEL[weightStatus]}</Badge></td>
                    <td><StatusBadge status={entry.status || RACE_ENTRY_STATUS.DECLARED} /></td>
                    <td>
                      <div className="d-flex gap-2 flex-wrap">
                        <Button size="sm" className="btn-gold-sm" onClick={() => openWeight(entry)}>Check cân</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal show={!!weightRow} onHide={() => setWeightRow(null)} centered>
        <Modal.Header closeButton style={{ background: '#1a1a2e', borderColor: '#333' }}>
          <Modal.Title style={{ color: GOLD }}>Kiểm tra cân nặng</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#1a1a2e', color: '#e0d6b0' }}>
          {weightRow && (
            <Form onSubmit={handleSaveWeight} className="d-flex flex-column gap-3">
              <div>
                <div style={{ color: '#888', fontSize: 12 }}>Entry</div>
                <strong>{weightRow.horseName}</strong>
                <div className="text-muted" style={{ fontSize: 13 }}>{weightRow.raceName}</div>
              </div>
              <Form.Group>
                <Form.Label style={{ color: GOLD }}>Handicap weight (kg)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  step="0.1"
                  value={handicapWeight}
                  onChange={(e) => setHandicapWeight(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label style={{ color: GOLD }}>Cân thực tế (kg)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  step="0.1"
                  value={actualWeight}
                  onChange={(e) => setActualWeight(e.target.value)}
                  required
                  autoFocus
                />
                <Form.Text style={{ color: '#aaa' }}>
                  Sai số từ 0.5kg trở xuống được tính đạt theo backend.
                </Form.Text>
              </Form.Group>
              <Form.Group>
                <Form.Label style={{ color: GOLD }}>Ghi chú</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  maxLength={500}
                  value={preCheckNote}
                  onChange={(e) => setPreCheckNote(e.target.value)}
                  placeholder="Ghi chú tình trạng entry nếu cần..."
                />
              </Form.Group>
              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => setWeightRow(null)}>Huỷ</Button>
                <Button type="submit" className="btn-gold-sm" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu kiểm tra'}
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
