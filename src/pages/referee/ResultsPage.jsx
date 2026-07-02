import { useEffect, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { resultService } from '../../services/resultService';
import { entryService } from '../../services/entryService';
import { raceService } from '../../services/raceService';
import { getApiErrorMessage } from '../../utils/apiError';
import { canEnterResult } from '../../constants/status';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Toaster from '../../components/common/Toaster';
import './referee-theme.css';

export default function RefereeResultsPage() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [entries, setEntries] = useState([]);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editResult, setEditResult] = useState(null);
  const [editPos, setEditPos] = useState('');
  const [editTime, setEditTime] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  // rowInputs: { [entryId]: { position, finishTime, saving } }
  const [rowInputs, setRowInputs] = useState({});

  const load = () => {
    Promise.all([
      resultService.getAll(),
      entryService.getForReferee(user),
      raceService.getAssignedToReferee(user),
    ])
      .then(([res, ent, r]) => { setResults(res); setEntries(ent); setRaces(r); })
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được dữ liệu kết quả.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const refetch = () => { setLoading(true); setError(''); load(); };

  const enterableEntries = entries.filter((e) => {
    const race = races.find((r) => r.id === e.raceId);
    const alreadyHasResult = results.some((res) => res.entryId === e.id);
    return race && canEnterResult(race.status) && !alreadyHasResult;
  });

  const setField = (entryId, field, value) => {
    setRowInputs((prev) => ({
      ...prev,
      [entryId]: { ...prev[entryId], [field]: value },
    }));
  };

  const validateTime = (raceId, position, finishTime, excludeResultId = null) => {
    if (!finishTime) return null;
    const raceResults = results.filter((r) => r.raceId === raceId && r.id !== excludeResultId);
    for (const r of raceResults) {
      if (!r.finishTime) continue;
      if (position > r.position && finishTime <= r.finishTime) {
        return `Thời gian phải chậm hơn (lớn hơn) ngựa hạng ${r.position} (${r.finishTime})`;
      }
      if (position < r.position && finishTime >= r.finishTime) {
        return `Thời gian phải nhanh hơn (nhỏ hơn) ngựa hạng ${r.position} (${r.finishTime})`;
      }
    }
    return null;
  };

  const saveRow = async (entry) => {
    const inp = rowInputs[entry.id] || {};
    if (!inp.position) {
      setToast({ message: 'Nhập số hạng trước khi lưu.', variant: 'warning' });
      return;
    }
    const errObj = validateTime(entry.raceId, Number(inp.position), inp.finishTime);
    if (errObj) {
      setToast({ message: errObj, variant: 'warning' });
      return;
    }
    setField(entry.id, 'saving', true);
    try {
      await resultService.createForRace(entry.raceId, {
        entryId: entry.id,
        position: Number(inp.position),
        finishTime: inp.finishTime || null,
      });
      setToast({ message: `Đã lưu kết quả cho ${entry.horseName}.`, variant: 'success' });
      setRowInputs((prev) => { const n = { ...prev }; delete n[entry.id]; return n; });
      refetch();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Lưu thất bại.'), variant: 'danger' });
      setField(entry.id, 'saving', false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  // Group entries by race
  const byRace = enterableEntries.reduce((acc, e) => {
    const key = e.raceId;
    if (!acc[key]) acc[key] = { raceName: e.raceName, entries: [] };
    acc[key].entries.push(e);
    return acc;
  }, {});

  return (
    <div className="referee-context">
      <div className="referee-hero d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>RACE RESULTS INPUT</h2>
          <p className="mb-0">&gt; SYSTEM: RECORDING OFFICIAL RACE POSITIONS AND TIMES</p>
        </div>
      </div>

      {enterableEntries.length === 0 ? (
        <EmptyState message="Không có entry nào thuộc race RESULT_PENDING đang chờ nhập kết quả." />
      ) : (
        Object.values(byRace).map((group) => (
          <div className="cyber-panel mb-4" key={group.raceName}>
            <h5 className="mb-3 text-info fw-bold" style={{ letterSpacing: '1px' }}>
              🏁 {group.raceName}
            </h5>
            <div className="table-responsive">
              <table className="w-100" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(0,200,255,0.2)' }}>
                    {['NGỰA', 'JOCKEY', 'SỐ CỔNG', 'HANDICAP', 'HẠNG', 'THỜI GIAN', ''].map((h) => (
                      <th key={h} style={{ padding: '8px 12px', fontSize: 11, color: '#00c8ff', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.entries.map((en) => {
                    const inp = rowInputs[en.id] || {};
                    return (
                      <tr key={en.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '10px 12px', color: '#f0e8d0', fontWeight: 700 }}>🐎 {en.horseName}</td>
                        <td style={{ padding: '10px 12px', color: '#aaa' }}>{en.jockeyName}</td>
                        <td style={{ padding: '10px 12px', color: '#D4AF37' }}>{en.gateNumber ?? '—'}</td>
                        <td style={{ padding: '10px 12px', color: '#aaa' }}>{en.handicapWeight != null ? `${en.handicapWeight} kg` : '—'}</td>
                        <td style={{ padding: '10px 12px', width: 90 }}>
                          <input
                            type="number"
                            min={1}
                            value={inp.position ?? ''}
                            onChange={(e) => setField(en.id, 'position', e.target.value)}
                            placeholder="Hạng"
                            style={{
                              width: '100%', background: '#0a0f1a', border: '1px solid #00c8ff44',
                              color: '#fff', borderRadius: 6, padding: '5px 8px', fontSize: 14,
                            }}
                          />
                        </td>
                        <td style={{ padding: '10px 12px', width: 150 }}>
                          <input
                            type="text"
                            value={inp.finishTime ?? ''}
                            onChange={(e) => setField(en.id, 'finishTime', e.target.value)}
                            placeholder="00:01:10.250"
                            style={{
                              width: '100%', background: '#0a0f1a', border: '1px solid #00c8ff44',
                              color: '#fff', borderRadius: 6, padding: '5px 8px', fontSize: 13,
                            }}
                          />
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <button
                            onClick={() => saveRow(en)}
                            disabled={inp.saving}
                            className="btn-cyber btn-cyber-danger"
                            style={{ fontSize: 12, padding: '5px 14px', whiteSpace: 'nowrap' }}
                          >
                            {inp.saving ? '...' : 'LƯU'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      <div className="cyber-panel">
        <h5 className="mb-4 text-info fw-bold" style={{ letterSpacing: '1px' }}>RECORDED RESULTS LOG</h5>
        {results.length === 0 ? (
          <EmptyState message="Chưa có kết quả nào được ghi nhận." />
        ) : (
          <div className="table-responsive">
            <table className="w-100" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,200,255,0.2)' }}>
                  {['Hạng', 'Race', 'Ngựa', 'Jockey', 'Thời gian về đích', ''].map((h) => (
                    <th key={h} style={{ padding: '8px 12px', fontSize: 11, color: '#00c8ff', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '10px 12px', color: '#D4AF37', fontWeight: 700 }}>🏅 {r.position}</td>
                    <td style={{ padding: '10px 12px', color: '#f0e8d0', fontWeight: 600 }}>{r.raceName}</td>
                    <td style={{ padding: '10px 12px', color: '#D4AF37' }}>🐎 {r.horseName}</td>
                    <td style={{ padding: '10px 12px', color: '#aaa' }}>{r.jockeyName}</td>
                    <td style={{ padding: '10px 12px', color: '#c8bea0', fontFamily: 'monospace' }}>{r.finishTime || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      {['PUBLISHED', 'OFFICIAL'].includes(r.resultStatus) ? (
                        <span style={{ fontSize: 11, color: '#4caf7d', fontStyle: 'italic' }}>Đã công bố</span>
                      ) : (
                        <div className="d-flex gap-2">
                          <button className="btn-cyber btn-cyber-sm" style={{ fontSize: 12, padding: '4px 12px' }}
                            onClick={() => { setEditResult(r); setEditPos(r.position ?? ''); setEditTime(r.finishTime ?? ''); }}>
                            Sửa
                          </button>
                          <button className="btn-cyber btn-cyber-danger btn-cyber-sm" style={{ fontSize: 12, padding: '4px 12px' }}
                            onClick={async () => {
                              if (!window.confirm('Xóa kết quả này?')) return;
                              try { await resultService.remove(r.id); setToast({ message: 'Đã xóa.', variant: 'success' }); refetch(); }
                              catch { setToast({ message: 'Xóa thất bại.', variant: 'danger' }); }
                            }}>
                            Xóa
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal sửa kết quả */}
      <Modal show={!!editResult} onHide={() => setEditResult(null)} centered>
        <Modal.Header closeButton style={{ background: '#0a0f1a', borderColor: 'rgba(0,200,255,0.2)' }}>
          <Modal.Title style={{ color: '#00e5ff', fontSize: '1rem' }}>Sửa kết quả — {editResult?.horseName}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: '#0a0f1a' }}>
          <div className="mb-3">
            <Form.Label style={{ color: '#00c8ff', fontSize: 12, textTransform: 'uppercase' }}>Hạng</Form.Label>
            <Form.Control type="number" min={1} className="cyber-input" value={editPos} onChange={(e) => setEditPos(e.target.value)} />
          </div>
          <div>
            <Form.Label style={{ color: '#00c8ff', fontSize: 12, textTransform: 'uppercase' }}>Thời gian về đích</Form.Label>
            <Form.Control type="text" placeholder="00:01:10.250" className="cyber-input" value={editTime} onChange={(e) => setEditTime(e.target.value)} />
          </div>
        </Modal.Body>
        <Modal.Footer style={{ background: '#0a0f1a', borderColor: 'rgba(0,200,255,0.2)' }}>
          <Button className="btn-cyber btn-cyber-sm" onClick={() => setEditResult(null)}>Hủy</Button>
          <Button className="btn-cyber btn-cyber-danger btn-cyber-sm" disabled={savingEdit} onClick={async () => {
            if (!editPos) {
              setToast({ message: 'Nhập số hạng.', variant: 'warning' });
              return;
            }
            const errObj = validateTime(editResult.raceId, Number(editPos), editTime, editResult.id);
            if (errObj) {
              setToast({ message: errObj, variant: 'warning' });
              return;
            }
            setSavingEdit(true);
            try {
              await resultService.update(editResult.id, { position: Number(editPos), finishTime: editTime });
              setToast({ message: 'Đã cập nhật kết quả.', variant: 'success' });
              setEditResult(null); refetch();
            } catch { setToast({ message: 'Lưu thất bại.', variant: 'danger' }); }
            finally { setSavingEdit(false); }
          }}>
            {savingEdit ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
