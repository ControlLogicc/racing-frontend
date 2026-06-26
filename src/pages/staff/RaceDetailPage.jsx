import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tab, Tabs, Button, Badge, Modal } from 'react-bootstrap';
import { raceService } from '../../services/raceService';
import { registrationService } from '../../services/registrationService';
import { entryService } from '../../services/entryService';
import { resultService } from '../../services/resultService';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Toaster from '../../components/common/Toaster';
import RegistrationTable from '../../components/shared/RegistrationTable';
import './staff-theme.css';

export default function StaffRaceDetailPage() {
  const { id } = useParams();
  const [race, setRace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  // Tab Data states
  const [registrations, setRegistrations] = useState([]);
  const [entries, setEntries] = useState([]);
  const [results, setResults] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [tabError, setTabError] = useState('');

  // Result entry state
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultFormData, setResultFormData] = useState({}); // { entryId: { position, finishTime } }

  // Candidates state (for Entry creation)
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [creatingEntryId, setCreatingEntryId] = useState(null);

  const loadRace = () => {
    setLoading(true);
    setError('');
    raceService.getById(Number(id))
      .then(setRace)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được thông tin race.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line
    loadRace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!race) return;
    // eslint-disable-next-line
    setTabLoading(true);
    setTabError('');

    const numericId = Number(id);

    if (activeTab === 'registrations') {
      registrationService.getByRace(numericId)
        .then(setRegistrations)
        .catch((err) => setTabError(getApiErrorMessage(err, 'Không tải được danh sách đăng ký.')))
        .finally(() => setTabLoading(false));
    } else if (activeTab === 'entries') {
      Promise.all([
        entryService.getByRace(numericId),
        entryService.getCandidates(numericId).catch(() => []),
      ])
        .then(([e, c]) => { setEntries(e); setCandidates(c); })
        .catch((err) => setTabError(getApiErrorMessage(err, 'Không tải được danh sách entry.')))
        .finally(() => setTabLoading(false));
    } else if (activeTab === 'results') {
      resultService.getByRace(numericId)
        .then(setResults)
        .catch((err) => setTabError(getApiErrorMessage(err, 'Không tải được kết quả.')))
        .finally(() => setTabLoading(false));
    } else {
      setTabLoading(false);
    }
  }, [activeTab, id, race]);

  const changeRaceStatus = async (newStatus) => {
    try {
      await raceService.setStatus(Number(id), newStatus);
      setToast({ message: `Chuyển trạng thái thành ${newStatus} thành công!`, variant: 'success' });
      loadRace();
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Lỗi chuyển trạng thái.'), variant: 'danger' });
    }
  };

  const handleApproveReg = async (regId) => {
    try {
      await registrationService.approve(regId);
      setToast({ message: 'Duyệt thành công!', variant: 'success' });
      // reload registrations
      const data = await registrationService.getByRace(Number(id));
      setRegistrations(data);
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Lỗi duyệt đăng ký.'), variant: 'danger' });
    }
  };

  const handleRejectReg = async (regId) => {
    if (!window.confirm('Xác nhận từ chối đăng ký này?')) return;
    try {
      await registrationService.reject(regId);
      setToast({ message: 'Đã từ chối.', variant: 'success' });
      const data = await registrationService.getByRace(Number(id));
      setRegistrations(data);
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Lỗi từ chối đăng ký.'), variant: 'danger' });
    }
  };

  const handleRandomGates = async () => {
    if (!window.confirm('Bốc thăm sẽ ghi đè số cổng hiện tại. Tiếp tục?')) return;
    try {
      await entryService.randomizeGates(Number(id));
      setToast({ message: 'Bốc thăm thành công!', variant: 'success' });
      const data = await entryService.getByRace(Number(id));
      setEntries(data);
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Lỗi bốc thăm cổng.'), variant: 'danger' });
    }
  };

  const handleRecalculatePrizes = async () => {
    try {
      await resultService.recalculate(Number(id));
      setToast({ message: 'Tính lại giải thưởng thành công!', variant: 'success' });
      const data = await resultService.getByRace(Number(id));
      setResults(data);
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Lỗi tính toán giải thưởng.'), variant: 'danger' });
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={loadRace} />;
  if (!race) return <EmptyState message="Race không tồn tại." />;

  // Render General Info
  const renderGeneral = () => (
    <div className="staff-card mt-3">
      <div className="staff-card-header d-flex justify-content-between align-items-center mb-0">
        <h4 className="mb-0 text-warning">{race.name}</h4>
        <StatusBadge status={race.status} />
      </div>
      <div className="card-body">
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <p className="mb-2"><span className="info-grid-label d-block">Race No:</span> <span className="info-grid-value">{race.raceNo || '—'}</span></p>
            <p className="mb-2"><span className="info-grid-label d-block">Meeting:</span> <span className="info-grid-value">{race.meetingName || '—'}</span></p>
            <p className="mb-2"><span className="info-grid-label d-block">Ngày đua:</span> <span className="info-grid-value">{formatDate(race.raceTime)}</span></p>
            <p className="mb-2"><span className="info-grid-label d-block">Racecourse:</span> <span className="info-grid-value">{race.racecourseName || '—'}</span></p>
          </div>
          <div className="col-md-6">
            <p className="mb-2"><span className="info-grid-label d-block">Khoảng cách:</span> <span className="info-grid-value">{race.distance ? `${race.distance}m` : '—'}</span></p>
            <p className="mb-2"><span className="info-grid-label d-block">Track Type:</span> <span className="info-grid-value">{race.trackType || '—'}</span></p>
            <p className="mb-2"><span className="info-grid-label d-block">Class Requirement:</span> <span className="info-grid-value">{race.classRequirement || '—'}</span></p>
            <p className="mb-2"><span className="info-grid-label d-block">Referee:</span> <span className="info-grid-value">{race.refereeName || '—'}</span></p>
          </div>
        </div>
        <div className="d-flex gap-3 border-top pt-3" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
          {race.status === 'OPEN_FOR_ENTRY' && (
            <Button variant="warning" onClick={() => changeRaceStatus('CLOSED_FOR_ENTRY')}>Đóng đăng ký</Button>
          )}
          {race.status === 'CLOSED_FOR_ENTRY' && (
            <Button className="staff-btn-pulse staff-btn-gold" onClick={() => changeRaceStatus('RUNNING')}>Bắt đầu đua</Button>
          )}
          {race.status === 'RUNNING' && (
            <Button variant="danger" onClick={() => changeRaceStatus('RESULT_PENDING')}>Kết thúc đua</Button>
          )}
        </div>
      </div>
    </div>
  );

  // Render Registrations
  const renderRegistrations = () => {
    if (tabLoading) return <Loading />;
    if (tabError) return <ErrorState message={tabError} onRetry={() => setActiveTab('general')} />;
    
    const isOpen = race.status === 'OPEN_FOR_ENTRY';
    
    return (
      <div className="mt-3">
        {!isOpen && (
          <div className="alert alert-warning">Đăng ký đã đóng — chỉ xem, không thể duyệt thêm.</div>
        )}
        {registrations.length === 0 ? (
          <EmptyState message="Chưa có owner nào đăng ký race này." />
        ) : (
          <RegistrationTable 
            rows={registrations} 
            onApprove={isOpen ? handleApproveReg : undefined} 
            onReject={isOpen ? handleRejectReg : undefined} 
          />
        )}
      </div>
    );
  };


  const loadCandidates = () => {
    setCandidatesLoading(true);
    entryService.getCandidates(Number(id))
      .then(setCandidates)
      .catch(() => setCandidates([]))
      .finally(() => setCandidatesLoading(false));
  };

  const handleCreateEntry = async (candidate) => {
    setCreatingEntryId(candidate.invitationId);
    try {
      await entryService.create({
        registrationId: candidate.registrationId,
        invitationId: candidate.invitationId,
        jockeyId: candidate.jockeyId,
      });
      setToast({ message: `Tạo Entry thành công cho ${candidate.horseName} + ${candidate.jockeyName}!`, variant: 'success' });
      // Reload both candidates and entries
      loadCandidates();
      entryService.getByRace(Number(id)).then(setEntries).catch(() => {});
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Lỗi tạo Entry.'), variant: 'danger' });
    } finally {
      setCreatingEntryId(null);
    }
  };

  const handleCreateAllEntries = async () => {
    const eligible = candidates.filter(c => c.canCreateEntry);
    if (!eligible.length) return;
    if (!window.confirm(`Tạo Entry cho tất cả ${eligible.length} cặp đủ điều kiện?`)) return;

    for (const candidate of eligible) {
      try {
        await entryService.create({
          registrationId: candidate.registrationId,
          invitationId: candidate.invitationId,
          jockeyId: candidate.jockeyId,
        });
      } catch {
        // continue with others
      }
    }
    setToast({ message: `Đã tạo Entry cho ${eligible.length} cặp!`, variant: 'success' });
    loadCandidates();
    entryService.getByRace(Number(id)).then(setEntries).catch(() => {});
  };

  // Render Entries
  const renderEntries = () => {
    if (tabLoading) return <Loading />;
    if (tabError) return <ErrorState message={tabError} onRetry={() => setActiveTab('general')} />;

    const isOpen = race.status === 'OPEN_FOR_ENTRY';
    const isClosedOrLater = race.status !== 'DRAFT' && race.status !== 'SCHEDULED' && race.status !== 'OPEN_FOR_ENTRY';
    const isGateDrawDone = entries.length > 0 && entries.every(e => e.gateNumber !== null);

    const entryColumns = [
      { key: 'gateNumber', label: 'Số cổng', render: (row) => row.gateNumber ?? '—' },
      { key: 'horseName', label: 'Ngựa' },
      { key: 'jockeyName', label: 'Jockey', render: (row) => row.jockeyName || '—' },
      { key: 'handicapWeight', label: 'Handicap (kg)', render: (row) => row.handicapWeight ?? '—' },
      { key: 'actualWeight', label: 'Weight thực (kg)', render: (row) => row.actualWeight ?? '—' },
      { 
        key: 'weightStatus', 
        label: 'Weight check', 
        render: (row) => {
          if (row.actualWeight === null || row.actualWeight === undefined) {
            return <span className="text-muted">Chưa cân</span>;
          }
          const hW = row.handicapWeight || 0;
          if (row.actualWeight < hW) {
            return <Badge bg="danger">Cần tạ chì: {(hW - row.actualWeight).toFixed(1)} kg</Badge>;
          }
          return <Badge bg="success">✓ Đạt</Badge>;
        }
      },
      { key: 'status', label: 'Trạng thái', render: (row) => <StatusBadge status={row.status} /> }
    ];

    // Candidate columns
    const candidateColumns = [
      { key: 'horseName', label: 'Ngựa', render: (row) => <span style={{ color: '#D4AF37', fontWeight: 600 }}>🐎 {row.horseName}</span> },
      { key: 'ownerName', label: 'Owner' },
      { key: 'jockeyName', label: 'Jockey', render: (row) => <span style={{ fontWeight: 600 }}>{row.jockeyName}</span> },
      { key: 'registrationStatus', label: 'Đăng ký', render: (row) => <StatusBadge status={row.registrationStatus} /> },
      { key: 'invitationStatus', label: 'Lời mời', render: (row) => <StatusBadge status={row.invitationStatus} /> },
      {
        key: 'action', label: '', render: (row) => {
          if (!row.canCreateEntry) {
            return <span style={{ fontSize: '0.75rem', color: '#e57373' }}>{row.reason || 'Chưa đủ ĐK'}</span>;
          }
          return (
            <Button
              size="sm"
              className="staff-btn-gold"
              disabled={creatingEntryId === row.invitationId}
              onClick={() => handleCreateEntry(row)}
            >
              {creatingEntryId === row.invitationId ? '...' : '+ Tạo Entry'}
            </Button>
          );
        }
      },
    ];

    const eligibleCount = candidates.filter(c => c.canCreateEntry).length;

    return (
      <div className="mt-3">
        {/* === PHẦN 1: Candidates — Tạo Entry từ Registration+Invitation ACCEPTED === */}
        <div className="staff-card mb-4">
          <div className="staff-card-header d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0 text-warning">📋 Tạo Entry từ danh sách chờ</h5>
              <small className="text-muted">Chọn các cặp Ngựa + Jockey đã được duyệt & chấp nhận lời mời để tạo Entry</small>
            </div>
            <div className="d-flex gap-2">
              <Button size="sm" variant="outline-light" onClick={loadCandidates} disabled={candidatesLoading}>
                {candidatesLoading ? '...' : '🔄 Tải danh sách'}
              </Button>
              {eligibleCount > 0 && (
                <Button size="sm" className="staff-btn-gold" onClick={handleCreateAllEntries}>
                  ⚡ Tạo tất cả ({eligibleCount})
                </Button>
              )}
            </div>
          </div>
          <div className="card-body">
            {candidatesLoading ? (
              <Loading />
            ) : candidates.length === 0 ? (
              <EmptyState message="Chưa có cặp Ngựa+Jockey nào sẵn sàng. Cần: Owner đăng ký → Staff duyệt → Owner mời Jockey → Jockey chấp nhận." />
            ) : (
              <DataTable columns={candidateColumns} rows={candidates} />
            )}
          </div>
        </div>

        {/* === PHẦN 2: Entries đã tạo + Bốc thăm === */}
        <div className="staff-card">
          <div className="staff-card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0 text-warning">🏇 Entries đã tạo ({entries.length})</h5>
            <div className="d-flex gap-2">
              {isOpen && entries.length > 0 && (
                <Button variant="warning" onClick={() => changeRaceStatus('CLOSED_FOR_ENTRY')}>
                  🔒 Đóng đăng ký
                </Button>
              )}
              <Button 
                className={`staff-btn-gold ${(!isClosedOrLater || isGateDrawDone) ? 'opacity-50' : 'staff-btn-pulse'}`}
                disabled={!isClosedOrLater || isGateDrawDone || entries.length === 0}
                title={isOpen ? 'Phải đóng đăng ký trước' : isGateDrawDone ? 'Đã bốc thăm' : ''}
                onClick={handleRandomGates}
              >
                {isGateDrawDone ? '✓ Đã bốc thăm' : '🎲 Bốc thăm cổng'}
              </Button>
            </div>
          </div>
          <div className="card-body">
            {entries.length === 0 ? (
              <EmptyState message="Chưa có Entry nào. Hãy tạo Entry từ danh sách chờ ở trên." />
            ) : (
              <DataTable columns={entryColumns} rows={entries} />
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Entries

  const openResultModal = () => {
    const initialData = {};
    entries.forEach(e => {
      initialData[e.id] = { position: '', finishTime: '' };
    });
    setResultFormData(initialData);
    setShowResultModal(true);
  };

  const handleResultChange = (entryId, field, value) => {
    setResultFormData(prev => ({
      ...prev,
      [entryId]: { ...prev[entryId], [field]: value }
    }));
  };

  const submitResults = async () => {
    try {
      const payload = {
        results: entries.map(e => ({
          entryId: e.id,
          position: Number(resultFormData[e.id]?.position) || 99,
          finishTime: Number(resultFormData[e.id]?.finishTime) || 0
        }))
      };
      await resultService.createForRace(Number(id), payload);
      setToast({ message: 'Nhập kết quả thành công!', variant: 'success' });
      setShowResultModal(false);
      const data = await resultService.getByRace(Number(id));
      setResults(data);
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Lỗi nhập kết quả.'), variant: 'danger' });
    }
  };

  const renderResults = () => {
    if (tabLoading) return <Loading />;
    if (tabError) return <ErrorState message={tabError} onRetry={() => setActiveTab('general')} />;

    const resultColumns = [
      { key: 'position', label: 'Hạng', render: (row) => row.position || '—' },
      { key: 'horseName', label: 'Ngựa' },
      { key: 'jockeyName', label: 'Jockey', render: (row) => row.jockeyName || '—' },
      { key: 'finishTime', label: 'Thời gian', render: (row) => row.finishTime ? `${row.finishTime}s` : '—' },
      { key: 'prizeAmount', label: 'Giải thưởng', render: (row) => row.prizeAmount ? `$${row.prizeAmount}` : '—' },
      { key: 'scoreAwarded', label: 'Điểm', render: (row) => row.scoreAwarded || '0' }
    ];

    // Sort results by position
    const sortedResults = [...results].sort((a, b) => (a.position || 999) - (b.position || 999));

    return (
      <div className="mt-3">
        <div className="d-flex justify-content-end gap-3 mb-3">
          {results.length === 0 && (
            <Button className="staff-btn-gold staff-btn-pulse" onClick={openResultModal}>Nhập kết quả</Button>
          )}
          <Button className="staff-btn-outline" onClick={handleRecalculatePrizes}>Tính lại giải thưởng</Button>
          {race.status === 'RESULT_PENDING' && (
            <Button variant="success" onClick={() => changeRaceStatus('OFFICIAL')}>Công bố chính thức</Button>
          )}
          {race.status === 'OFFICIAL' && (
            <Button variant="secondary" disabled>✓ Đã công bố chính thức</Button>
          )}
        </div>
        {results.length === 0 ? (
          <EmptyState message="Chưa có kết quả. Bạn có thể nhập kết quả trực tiếp tại đây." />
        ) : (
          <DataTable columns={resultColumns} rows={sortedResults} />
        )}
      </div>
    );
  };

  return (
    <div className="staff-theme-wrapper p-3">
      <div className="page-header mb-4">
        <h2 className="staff-header-title">Chi tiết Cuộc đua</h2>
      </div>
      
      <div className="staff-card p-3">
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4 staff-custom-tabs">
          <Tab eventKey="general" title="Tổng quan">{renderGeneral()}</Tab>
          <Tab eventKey="registrations" title="Đăng ký">{renderRegistrations()}</Tab>
          <Tab eventKey="entries" title="Entries & Bốc thăm">{renderEntries()}</Tab>
          <Tab eventKey="results" title="Kết quả">{renderResults()}</Tab>
        </Tabs>
      </div>

      <Modal show={showResultModal} onHide={() => setShowResultModal(false)} size="lg" className="staff-modal">
        <Modal.Header closeButton>
          <Modal.Title>Nhập kết quả nhanh</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="table-responsive">
            <table className="table table-dark table-hover">
              <thead>
                <tr>
                  <th>Ngựa</th>
                  <th>Jockey</th>
                  <th>Thứ hạng</th>
                  <th>Thời gian (s)</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.id}>
                    <td>{e.horseName}</td>
                    <td>{e.jockeyName}</td>
                    <td>
                      <input 
                        type="number" 
                        className="form-control form-control-sm bg-dark text-light border-secondary" 
                        value={resultFormData[e.id]?.position || ''} 
                        onChange={(ev) => handleResultChange(e.id, 'position', ev.target.value)} 
                        placeholder="VD: 1, 2, 3..."
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        step="0.01"
                        className="form-control form-control-sm bg-dark text-light border-secondary" 
                        value={resultFormData[e.id]?.finishTime || ''} 
                        onChange={(ev) => handleResultChange(e.id, 'finishTime', ev.target.value)} 
                        placeholder="VD: 120.5"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResultModal(false)}>Hủy</Button>
          <Button variant="primary" onClick={submitResults}>Lưu kết quả</Button>
        </Modal.Footer>
      </Modal>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
