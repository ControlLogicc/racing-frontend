import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tab, Tabs, Button, Badge } from 'react-bootstrap';
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

  const loadRace = () => {
    setLoading(true);
    setError('');
    raceService.getById(id)
      .then(setRace)
      .catch((err) => setError(getApiErrorMessage(err, 'Không tải được thông tin race.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!race) return;
    setTabLoading(true);
    setTabError('');

    if (activeTab === 'registrations') {
      registrationService.getByRace(id)
        .then(setRegistrations)
        .catch((err) => setTabError(getApiErrorMessage(err, 'Không tải được danh sách đăng ký.')))
        .finally(() => setTabLoading(false));
    } else if (activeTab === 'entries') {
      entryService.getByRace(id)
        .then(setEntries)
        .catch((err) => setTabError(getApiErrorMessage(err, 'Không tải được danh sách entry.')))
        .finally(() => setTabLoading(false));
    } else if (activeTab === 'results') {
      resultService.getByRace(id)
        .then(setResults)
        .catch((err) => setTabError(getApiErrorMessage(err, 'Không tải được kết quả.')))
        .finally(() => setTabLoading(false));
    } else {
      setTabLoading(false);
    }
  }, [activeTab, id, race]);

  const changeRaceStatus = async (newStatus) => {
    try {
      await raceService.setStatus(id, newStatus);
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
      const data = await registrationService.getByRace(id);
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
      const data = await registrationService.getByRace(id);
      setRegistrations(data);
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Lỗi từ chối đăng ký.'), variant: 'danger' });
    }
  };

  const handleRandomGates = async () => {
    if (!window.confirm('Bốc thăm sẽ ghi đè số cổng hiện tại. Tiếp tục?')) return;
    try {
      await entryService.randomizeGates(id);
      setToast({ message: 'Bốc thăm thành công!', variant: 'success' });
      const data = await entryService.getByRace(id);
      setEntries(data);
    } catch (err) {
      setToast({ message: getApiErrorMessage(err, 'Lỗi bốc thăm cổng.'), variant: 'danger' });
    }
  };

  const handleRecalculatePrizes = async () => {
    try {
      await resultService.recalculate(id);
      setToast({ message: 'Tính lại giải thưởng thành công!', variant: 'success' });
      const data = await resultService.getByRace(id);
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
    <div className="card shadow-sm mt-3" style={{ backgroundColor: '#1a1a1a', color: '#f5f5f5', border: '1px solid #333' }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0 text-warning">{race.name}</h4>
          <StatusBadge status={race.status} />
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <p><strong>Race No:</strong> {race.raceNo || '—'}</p>
            <p><strong>Meeting:</strong> {race.meetingName || '—'}</p>
            <p><strong>Ngày đua:</strong> {formatDate(race.raceTime)}</p>
            <p><strong>Racecourse:</strong> {race.racecourseName || '—'}</p>
          </div>
          <div className="col-md-6">
            <p><strong>Khoảng cách:</strong> {race.distance ? `${race.distance}m` : '—'}</p>
            <p><strong>Track Type:</strong> {race.trackType || '—'}</p>
            <p><strong>Class Requirement:</strong> {race.classRequirement || '—'}</p>
            <p><strong>Referee:</strong> {race.refereeName || '—'}</p>
          </div>
        </div>
        <hr style={{ borderColor: '#333' }} />
        <div className="d-flex gap-2">
          {race.status === 'OPEN_FOR_ENTRY' && (
            <Button variant="warning" onClick={() => changeRaceStatus('CLOSED_FOR_ENTRY')}>Đóng đăng ký</Button>
          )}
          {race.status === 'CLOSED_FOR_ENTRY' && (
            <Button variant="success" onClick={() => changeRaceStatus('RUNNING')}>Bắt đầu đua</Button>
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

  // Render Entries
  const renderEntries = () => {
    if (tabLoading) return <Loading />;
    if (tabError) return <ErrorState message={tabError} onRetry={() => setActiveTab('general')} />;

    const isOpen = race.status === 'OPEN_FOR_ENTRY';
    const isClosedOrLater = race.status !== 'DRAFT' && race.status !== 'SCHEDULED' && race.status !== 'OPEN_FOR_ENTRY';
    const isGateDrawDone = entries.length > 0 && entries.every(e => e.gateNumber !== null);

    const entryColumns = [
      { key: 'gateNumber', label: 'Số cổng', render: (val) => val ?? '—' },
      { key: 'horseName', label: 'Ngựa' },
      { key: 'jockeyName', label: 'Jockey', render: (val) => val || '—' },
      { key: 'handicapWeight', label: 'Handicap (kg)', render: (val) => val ?? '—' },
      { key: 'actualWeight', label: 'Weight thực (kg)', render: (val) => val ?? '—' },
      { 
        key: 'weightStatus', 
        label: 'Weight check', 
        render: (_, entry) => {
          if (entry.actualWeight === null || entry.actualWeight === undefined) {
            return <span className="text-muted">Chưa cân</span>;
          }
          const hW = entry.handicapWeight || 0;
          if (entry.actualWeight < hW) {
            return <Badge bg="danger">Cần tạ chì: {(hW - entry.actualWeight).toFixed(1)} kg</Badge>;
          }
          return <Badge bg="success">✓ Đạt</Badge>;
        }
      },
      { key: 'status', label: 'Trạng thái', render: (val) => <StatusBadge status={val} /> }
    ];

    return (
      <div className="mt-3">
        <div className="d-flex justify-content-end mb-3">
          <Button 
            variant="primary" 
            disabled={!isClosedOrLater || isGateDrawDone}
            title={isOpen ? 'Phải đóng đăng ký trước' : isGateDrawDone ? 'Đã bốc thăm' : ''}
            onClick={handleRandomGates}
          >
            {isGateDrawDone ? '✓ Đã bốc thăm' : 'Bốc thăm cổng ngẫu nhiên'}
          </Button>
        </div>
        {entries.length === 0 ? (
          <EmptyState message="Chưa có entry nào. Entry tự tạo khi Jockey chấp nhận lời mời." />
        ) : (
          <DataTable columns={entryColumns} data={entries} />
        )}
      </div>
    );
  };

  // Render Results
  const renderResults = () => {
    if (tabLoading) return <Loading />;
    if (tabError) return <ErrorState message={tabError} onRetry={() => setActiveTab('general')} />;

    const resultColumns = [
      { key: 'position', label: 'Hạng' },
      { key: 'horseName', label: 'Ngựa' },
      { key: 'jockeyName', label: 'Jockey', render: (val) => val || '—' },
      { key: 'finishTime', label: 'Thời gian', render: (val) => val ? `${val}s` : '—' },
      { key: 'prizeAmount', label: 'Giải thưởng', render: (val) => val ? `$${val}` : '—' },
      { key: 'scoreAwarded', label: 'Điểm', render: (val) => val || '0' }
    ];

    // Sort results by position
    const sortedResults = [...results].sort((a, b) => (a.position || 999) - (b.position || 999));

    return (
      <div className="mt-3">
        <div className="d-flex justify-content-end gap-2 mb-3">
          <Button variant="outline-info" onClick={handleRecalculatePrizes}>Tính lại giải thưởng</Button>
          {race.status === 'RESULT_PENDING' && (
            <Button variant="success" onClick={() => changeRaceStatus('OFFICIAL')}>Công bố chính thức</Button>
          )}
          {race.status === 'OFFICIAL' && (
            <Button variant="secondary" disabled>✓ Đã công bố chính thức</Button>
          )}
        </div>
        {results.length === 0 ? (
          <EmptyState message="Chưa có kết quả. Referee cần nhập kết quả trước." />
        ) : (
          <DataTable columns={resultColumns} data={sortedResults} />
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="page-header mb-4">
        <h2>Chi tiết Cuộc đua</h2>
      </div>
      
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3 custom-tabs">
        <Tab eventKey="general" title="Tổng quan">{renderGeneral()}</Tab>
        <Tab eventKey="registrations" title="Đăng ký">{renderRegistrations()}</Tab>
        <Tab eventKey="entries" title="Entries & Bốc thăm">{renderEntries()}</Tab>
        <Tab eventKey="results" title="Kết quả">{renderResults()}</Tab>
      </Tabs>

      <Toaster toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
