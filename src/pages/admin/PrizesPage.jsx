import { useEffect, useMemo, useState } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import {
  CashCoin,
  CheckCircleFill,
  ExclamationTriangleFill,
  PencilSquare,
  PlusCircle,
  Trash3,
  TrophyFill,
} from 'react-bootstrap-icons';
import { prizeService } from '../../services/prizeService';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';
import './prizes-theme.css';

const EMPTY_FORM = { raceId: '', position: '', amount: '', score: '' };
const TOP_POSITIONS = [1, 2, 3];

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('vi-VN');

const rankLabel = (position) => {
  if (position === 1) return 'Vô địch';
  if (position === 2) return 'Á quân';
  if (position === 3) return 'Hạng ba';
  return `Hạng ${position}`;
};

const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);
const formatNumber = (value) => numberFormatter.format(Number(value) || 0);

const normalizePrize = (prize) => ({
  ...prize,
  id: prize.id ?? prize.prizeId,
  raceId: Number(prize.raceId),
  position: Number(prize.position),
  amount: Number(prize.amount ?? prize.prizeAmount ?? 0),
  score: Number(prize.score ?? prize.scoreAwarded ?? 0),
});

const getRaceName = (race, raceId) => race?.name ?? race?.raceName ?? `Race #${raceId}`;

const buildPrizeGroup = (race, raceId, rows) => {
  const sortedRows = [...rows].sort((a, b) => a.position - b.position);
  const positionCounts = sortedRows.reduce((map, prize) => {
    map.set(prize.position, (map.get(prize.position) ?? 0) + 1);
    return map;
  }, new Map());

  const duplicatePositions = [...positionCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([position]) => position);
  const missingTopPositions = TOP_POSITIONS.filter((position) => !positionCounts.has(position));
  const totalAmount = sortedRows.reduce((sum, prize) => sum + prize.amount, 0);
  const totalScore = sortedRows.reduce((sum, prize) => sum + prize.score, 0);

  let status = 'Đủ top 3';
  let statusType = 'complete';
  if (duplicatePositions.length) {
    status = `Trùng hạng ${duplicatePositions.join(', ')}`;
    statusType = 'warning';
  } else if (missingTopPositions.length) {
    status = `Thiếu hạng ${missingTopPositions.join(', ')}`;
    statusType = 'warning';
  }

  return {
    race,
    raceId,
    raceName: getRaceName(race, raceId),
    rows: sortedRows,
    totalAmount,
    totalScore,
    topPrize: sortedRows[0]?.amount ?? 0,
    tierCount: sortedRows.length,
    status,
    statusType,
  };
};

function SummaryTile({ icon, label, value }) {
  return (
    <div className="prize-summary-tile">
      <span className="prize-summary-icon">{icon}</span>
      <span className="prize-summary-label">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PrizeStatus({ type, text }) {
  const Icon = type === 'complete' ? CheckCircleFill : ExclamationTriangleFill;
  return (
    <span className={`prize-status prize-status-${type}`}>
      <Icon size={14} />
      {text}
    </span>
  );
}

function PrizeRaceCard({ group, onAdd, onEdit, onDelete }) {
  const raceMeta = [
    group.race?.meetingName,
    group.race?.distance ? `${group.race.distance}m` : null,
    group.race?.status,
  ].filter(Boolean);

  return (
    <section className="prize-race-card">
      <div className="prize-race-header">
        <div>
          <span className="prize-race-kicker">Race payout</span>
          <h3>{group.raceName}</h3>
          {raceMeta.length > 0 && (
            <div className="prize-race-meta">
              {raceMeta.map((item) => <span key={item}>{item}</span>)}
            </div>
          )}
        </div>

        <div className="prize-race-header-actions">
          <PrizeStatus type={group.statusType} text={group.status} />
          <Button className="btn-outline-gold-sm prize-add-tier" onClick={() => onAdd(group.raceId)}>
            <PlusCircle size={15} />
            Thêm hạng
          </Button>
        </div>
      </div>

      <div className="prize-race-totals">
        <div>
          <span>Tổng quỹ</span>
          <strong>{formatCurrency(group.totalAmount)}</strong>
        </div>
        <div>
          <span>Hạng thưởng</span>
          <strong>{group.tierCount}</strong>
        </div>
        <div>
          <span>Top prize</span>
          <strong>{formatCurrency(group.topPrize)}</strong>
        </div>
        <div>
          <span>Tổng điểm</span>
          <strong>{formatNumber(group.totalScore)}</strong>
        </div>
      </div>

      <div className="prize-ladder" role="table" aria-label={`Cơ cấu thưởng ${group.raceName}`}>
        <div className="prize-ladder-head" role="row">
          <span>Hạng</span>
          <span>Tiền thưởng</span>
          <span>Điểm</span>
          <span>Hành động</span>
        </div>

        {group.rows.map((row) => (
          <div className="prize-ladder-row" role="row" key={row.id}>
            <div className="prize-rank-cell">
              <span className={`prize-rank-badge rank-${Math.min(row.position, 4)}`}>#{row.position}</span>
              <div>
                <strong>{rankLabel(row.position)}</strong>
                <span>Position {row.position}</span>
              </div>
            </div>
            <strong className="prize-money">{formatCurrency(row.amount)}</strong>
            <span className="prize-score">{formatNumber(row.score)}</span>
            <div className="prize-row-actions">
              <button type="button" className="prize-icon-button" title="Sửa hạng thưởng" aria-label="Sửa hạng thưởng" onClick={() => onEdit(row)}>
                <PencilSquare size={16} />
              </button>
              <button type="button" className="prize-icon-button danger" title="Xoá hạng thưởng" aria-label="Xoá hạng thưởng" onClick={() => onDelete(row.id)}>
                <Trash3 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PrizeForm({
  form,
  races,
  selectedRaceName,
  isEdit = false,
  duplicatePosition = false,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <Form onSubmit={onSubmit} className="prize-form">
      {isEdit ? (
        <div className="prize-fixed-race">
          <span>Race</span>
          <strong>{selectedRaceName}</strong>
        </div>
      ) : (
        <Form.Group>
          <Form.Label>Race <span>*</span></Form.Label>
          <Form.Select value={form.raceId} onChange={(e) => onChange({ raceId: e.target.value })} required>
            <option value="">-- Chọn race --</option>
            {races.map((race) => (
              <option key={race.id} value={race.id}>{getRaceName(race, race.id)}</option>
            ))}
          </Form.Select>
        </Form.Group>
      )}

      <div className="prize-form-grid">
        <Form.Group>
          <Form.Label>Hạng <span>*</span></Form.Label>
          <Form.Control
            type="number"
            value={form.position}
            onChange={(e) => onChange({ position: e.target.value })}
            required
            min="1"
            step="1"
            placeholder="1"
          />
          {duplicatePosition && (
            <Form.Text className="prize-form-warning">Race này đã có hạng này.</Form.Text>
          )}
        </Form.Group>

        <Form.Group>
          <Form.Label>Tiền thưởng <span>*</span></Form.Label>
          <Form.Control
            type="number"
            value={form.amount}
            onChange={(e) => onChange({ amount: e.target.value })}
            required
            min="0"
            step="1000"
            placeholder="50000000"
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Điểm</Form.Label>
          <Form.Control
            type="number"
            value={form.score}
            onChange={(e) => onChange({ score: e.target.value })}
            min="0"
            step="0.5"
            placeholder="10"
          />
        </Form.Group>
      </div>

      <div className="prize-form-actions">
        <Button variant="secondary" onClick={onCancel}>Huỷ</Button>
        <Button type="submit" className="btn-gold-sm">{isEdit ? 'Lưu thay đổi' : 'Tạo hạng thưởng'}</Button>
      </div>
    </Form>
  );
}

export default function PrizesPage() {
  const [prizes, setPrizes] = useState([]);
  const [races, setRaces] = useState([]);
  const [filterRaceId, setFilterRaceId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editRow, setEditRow] = useState(null);
  const [editForm, setEditForm] = useState({ position: '', amount: '', score: '' });

  const normalizedPrizes = useMemo(() => prizes.map(normalizePrize), [prizes]);

  const raceMap = useMemo(
    () => new Map(races.map((race) => [Number(race.id), race])),
    [races]
  );

  const displayedPrizes = useMemo(() => {
    if (!filterRaceId) return normalizedPrizes;
    return normalizedPrizes.filter((prize) => prize.raceId === Number(filterRaceId));
  }, [filterRaceId, normalizedPrizes]);

  const prizeGroups = useMemo(() => {
    const grouped = new Map();

    displayedPrizes.forEach((prize) => {
      if (!grouped.has(prize.raceId)) grouped.set(prize.raceId, []);
      grouped.get(prize.raceId).push(prize);
    });

    if (filterRaceId && !grouped.has(Number(filterRaceId))) {
      grouped.set(Number(filterRaceId), []);
    }

    return [...grouped.entries()]
      .map(([raceId, rows]) => buildPrizeGroup(raceMap.get(raceId), raceId, rows))
      .sort((a, b) => {
        const aTime = a.race?.raceTime ?? '';
        const bTime = b.race?.raceTime ?? '';
        return aTime.localeCompare(bTime) || a.raceName.localeCompare(b.raceName);
      });
  }, [displayedPrizes, filterRaceId, raceMap]);

  const selectedRace = filterRaceId ? raceMap.get(Number(filterRaceId)) : null;
  const configuredRaceCount = new Set(normalizedPrizes.map((prize) => prize.raceId)).size;
  const totalPool = displayedPrizes.reduce((sum, prize) => sum + prize.amount, 0);
  const topPrize = displayedPrizes.reduce((max, prize) => Math.max(max, prize.amount), 0);
  const warningCount = prizeGroups.filter((group) => group.statusType !== 'complete').length;

  const load = () => {
    Promise.all([prizeService.getAll(), raceService.getAll()])
      .then(([p, r]) => { setPrizes(p); setRaces(r); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được dữ liệu giải thưởng.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const hasDuplicatePosition = (raceId, position, ignoredId) => (
    normalizedPrizes.some((prize) => (
      prize.raceId === Number(raceId)
      && prize.position === Number(position)
      && prize.id !== ignoredId
    ))
  );

  const createHasDuplicate = form.raceId && form.position
    ? hasDuplicatePosition(form.raceId, form.position)
    : false;
  const editHasDuplicate = editRow && editForm.position
    ? hasDuplicatePosition(editRow.raceId, editForm.position, editRow.id)
    : false;

  const openCreate = (raceId = filterRaceId) => {
    setForm({ ...EMPTY_FORM, raceId: raceId ? String(raceId) : '' });
    setShowCreate(true);
  };

  const closeCreate = () => {
    setShowCreate(false);
    setForm(EMPTY_FORM);
  };

  const updateCreateForm = (patch) => setForm((current) => ({ ...current, ...patch }));
  const updateEditForm = (patch) => setEditForm((current) => ({ ...current, ...patch }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (createHasDuplicate) {
      setToast({ message: 'Race này đã có giải cho hạng đã chọn.', variant: 'warning' });
      return;
    }

    try {
      await prizeService.create({
        raceId: Number(form.raceId),
        position: Number(form.position),
        amount: parseFloat(form.amount),
        score: form.score ? parseFloat(form.score) : 0,
      });
      setToast({ message: 'Tạo giải thưởng thành công.', variant: 'success' });
      closeCreate();
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Tạo thất bại.'), variant: 'danger' });
    }
  };

  const openEdit = (row) => {
    setEditRow(row);
    setEditForm({
      position: String(row.position),
      amount: String(row.amount),
      score: String(row.score ?? 0),
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (editHasDuplicate) {
      setToast({ message: 'Race này đã có giải cho hạng đã chọn.', variant: 'warning' });
      return;
    }

    try {
      await prizeService.update(editRow.id, {
        raceId: editRow.raceId,
        position: Number(editForm.position),
        amount: parseFloat(editForm.amount),
        score: parseFloat(editForm.score) || 0,
      });
      setToast({ message: 'Cập nhật thành công.', variant: 'success' });
      setEditRow(null);
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Cập nhật thất bại.'), variant: 'danger' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xoá giải thưởng này?')) return;
    try {
      await prizeService.remove(id);
      setToast({ message: 'Đã xoá.', variant: 'success' });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Xoá thất bại.'), variant: 'danger' });
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div className="prize-page">
      <div className="prize-hero">
        <div>
          <span className="prize-eyebrow">Quỹ thưởng</span>
          <h2>Cơ cấu giải thưởng</h2>
          <p>{selectedRace ? getRaceName(selectedRace, selectedRace.id) : 'Tất cả race'}</p>
        </div>
        <Button className="btn-gold-sm prize-primary-action" onClick={() => openCreate()}>
          <PlusCircle size={16} />
          Thêm giải thưởng
        </Button>
      </div>

      <div className="prize-summary-grid">
        <SummaryTile icon={<CashCoin size={18} />} label="Quỹ đang xem" value={formatCurrency(totalPool)} />
        <SummaryTile icon={<TrophyFill size={18} />} label="Hạng thưởng" value={formatNumber(displayedPrizes.length)} />
        <SummaryTile icon={<CheckCircleFill size={18} />} label="Race đã cấu hình" value={`${configuredRaceCount}/${races.length}`} />
        <SummaryTile icon={<ExclamationTriangleFill size={18} />} label="Cần kiểm tra" value={formatNumber(warningCount)} />
      </div>

      <div className="prize-toolbar">
        <Form.Group className="prize-filter">
          <Form.Label>Race</Form.Label>
          <Form.Select value={filterRaceId} onChange={(e) => setFilterRaceId(e.target.value)}>
            <option value="">Tất cả race</option>
            {races.map((race) => (
              <option key={race.id} value={race.id}>{getRaceName(race, race.id)}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <div className="prize-toolbar-note">
          <span>Top prize</span>
          <strong>{formatCurrency(topPrize)}</strong>
        </div>
      </div>

      {prizeGroups.length === 0 ? (
        <EmptyState message="Chưa có giải thưởng nào." />
      ) : (
        <div className="prize-group-stack">
          {prizeGroups.map((group) => (
            group.rows.length === 0 ? (
              <div className="prize-empty-race" key={group.raceId}>
                <div>
                  <span>Chưa có cơ cấu thưởng</span>
                  <strong>{group.raceName}</strong>
                </div>
                <Button className="btn-gold-sm" onClick={() => openCreate(group.raceId)}>
                  <PlusCircle size={15} />
                  Thêm hạng đầu tiên
                </Button>
              </div>
            ) : (
              <PrizeRaceCard
                key={group.raceId}
                group={group}
                onAdd={openCreate}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            )
          ))}
        </div>
      )}

      <Modal show={showCreate} onHide={closeCreate} centered size="lg" dialogClassName="prize-modal">
        <Modal.Header closeButton>
          <Modal.Title>Thêm giải thưởng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PrizeForm
            form={form}
            races={races}
            duplicatePosition={createHasDuplicate}
            onChange={updateCreateForm}
            onSubmit={handleCreate}
            onCancel={closeCreate}
          />
        </Modal.Body>
      </Modal>

      <Modal show={!!editRow} onHide={() => setEditRow(null)} centered size="lg" dialogClassName="prize-modal">
        <Modal.Header closeButton>
          <Modal.Title>Sửa giải thưởng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editRow && (
            <PrizeForm
              form={{ ...editForm, raceId: String(editRow.raceId) }}
              races={races}
              selectedRaceName={getRaceName(raceMap.get(editRow.raceId), editRow.raceId)}
              isEdit
              duplicatePosition={editHasDuplicate}
              onChange={updateEditForm}
              onSubmit={handleUpdate}
              onCancel={() => setEditRow(null)}
            />
          )}
        </Modal.Body>
      </Modal>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
