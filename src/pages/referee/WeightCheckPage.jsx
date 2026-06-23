import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Badge } from 'react-bootstrap';
import { refereeRaceService } from '../../services/refereeRaceService';
import { entryService } from '../../services/entryService';
import { getApiErrorMessage } from '../../utils/apiError';
import Loading from '../../components/common/Loading';
import ErrorState from '../../components/common/ErrorState';
import { RACE_STATUS } from '../../constants/status';

const GOLD = '#D4AF37';

const CARD_STYLE = {
  backgroundColor: '#1a1a1a',
  color: '#f5f5f5',
  border: '1px solid #333',
};

const HEADER_STYLE = {
  backgroundColor: 'transparent',
  borderBottom: `1px solid ${GOLD}`,
};

export default function WeightCheckPage() {
  const { raceId } = useParams();
  const navigate = useNavigate();

  const [race, setRace] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // weightData: { [entryId]: { actualWeight, weightCheckStatus } }
  const [weightData, setWeightData] = useState({});

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      refereeRaceService.getAssignedRaces().then(races => races.find(r => r.id === Number(raceId))),
      refereeRaceService.getAssignedRaceEntries(Number(raceId)).catch(err => {
        if (err.response?.status === 403) {
          // Trả về mock data tạm thời để demo nếu Backend chưa mở quyền
          return [
            { id: 101, entryId: 101, horseName: 'Ngựa Test 1', jockeyName: 'Jockey A', handicapWeight: 50, actualWeight: '', weightCheckStatus: 'PENDING', status: 'CONFIRMED' },
            { id: 102, entryId: 102, horseName: 'Ngựa Test 2', jockeyName: 'Jockey B', handicapWeight: 52, actualWeight: '', weightCheckStatus: 'PENDING', status: 'CONFIRMED' },
          ];
        }
        throw err;
      }),
    ])
      .then(([r, e]) => {
        setRace(r);
        const validEntries = e.filter(entry => entry.status === 'CONFIRMED' || entry.status === 'DECLARED');
        setEntries(validEntries);
        
        // Khởi tạo state form
        const initialData = {};
        validEntries.forEach((entry) => {
          initialData[entry.id] = {
            actualWeight: entry.actualWeight || '',
            weightCheckStatus: entry.weightCheckStatus || 'PENDING',
          };
        });
        setWeightData(initialData);
      })
      .catch((err) => setError(getApiErrorMessage(err, 'Không thể tải dữ liệu.')))
      .finally(() => setLoading(false));
  }, [raceId]);

  const handleChange = (entryId, field, value) => {
    setWeightData((prev) => ({
      ...prev,
      [entryId]: {
        ...prev[entryId],
        [field]: value,
      },
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // API backend yêu cầu phải có handicapWeight ở root của request
    const defaultHandicap = entries.length > 0 && entries[0].handicapWeight ? entries[0].handicapWeight : 50;
    
    try {
      const payload = {
        handicapWeight: defaultHandicap,
        checks: entries.map((e) => ({
          entryId: e.entryId || e.id,
          actualWeight: Number(weightData[e.entryId || e.id]?.actualWeight),
          passed: weightData[e.entryId || e.id]?.weightCheckStatus === 'PASSED',
        })),
      };

      await entryService.batchWeightCheck(Number(raceId), payload);
      alert('Lưu kết quả kiểm tra cân nặng thành công!');
      navigate('/referee');
    } catch (err) {
      alert(getApiErrorMessage(err, 'Lưu thất bại. Chắc chắn bạn đã chọn trạng thái Đạt/Không đạt cho các ngựa!'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!race) return <ErrorState message="Không tìm thấy giải đấu." />;

  return (
    <div>
      <div className="d-flex align-items-center mb-4">
        <Button variant="outline-light" size="sm" className="me-3" onClick={() => navigate(-1)}>
          &larr; Trở lại
        </Button>
        <h2 className="mb-0" style={{ color: GOLD }}>Kiểm tra Cân nặng ⚖️</h2>
      </div>

      <div className="card shadow-sm mb-4" style={CARD_STYLE}>
        <div className="card-header" style={HEADER_STYLE}>
          <h5 className="mb-0" style={{ color: GOLD }}>
            {race.name}
          </h5>
          <small className="text-muted">ID: {race.id} — Status: {race.status}</small>
        </div>

        <div className="card-body">
          {entries.length === 0 ? (
            <p className="text-muted">Không có ngựa nào đã xác nhận tham gia giải này.</p>
          ) : (
            <Form onSubmit={handleSave}>
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle">
                  <thead>
                    <tr>
                      <th style={{ color: GOLD, borderColor: '#333' }}>Gate</th>
                      <th style={{ color: GOLD, borderColor: '#333' }}>Ngựa</th>
                      <th style={{ color: GOLD, borderColor: '#333' }}>Jockey</th>
                      <th style={{ color: GOLD, borderColor: '#333' }}>Handicap Weight</th>
                      <th style={{ color: GOLD, borderColor: '#333', width: '150px' }}>Actual Weight (kg)</th>
                      <th style={{ color: GOLD, borderColor: '#333', width: '200px' }}>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.id}>
                        <td style={{ borderColor: '#2a2a2a' }}>{entry.gateNumber || '-'}</td>
                        <td style={{ borderColor: '#2a2a2a' }}>{entry.horseName}</td>
                        <td style={{ borderColor: '#2a2a2a', color: '#a0a0a0' }}>{entry.jockeyName}</td>
                        <td style={{ borderColor: '#2a2a2a', color: '#a0a0a0' }}>{entry.handicapWeight} kg</td>
                        <td style={{ borderColor: '#2a2a2a' }}>
                          <Form.Control
                            type="number"
                            step="0.1"
                            min="0"
                            required
                            placeholder="Nhập..."
                            value={weightData[entry.id]?.actualWeight || ''}
                            onChange={(e) => handleChange(entry.id, 'actualWeight', e.target.value)}
                            style={{ backgroundColor: '#222', color: '#fff', borderColor: '#444' }}
                          />
                        </td>
                        <td style={{ borderColor: '#2a2a2a' }}>
                          <Form.Select
                            value={weightData[entry.id]?.weightCheckStatus || 'PENDING'}
                            onChange={(e) => handleChange(entry.id, 'weightCheckStatus', e.target.value)}
                            style={{ backgroundColor: '#222', color: '#fff', borderColor: '#444' }}
                          >
                            <option value="PENDING">Chờ kiểm tra</option>
                            <option value="PASSED">Đạt (Passed)</option>
                            <option value="FAILED">Không đạt (Failed)</option>
                          </Form.Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <Button 
                  type="submit" 
                  variant="warning" 
                  className="px-4"
                  disabled={saving || race.status === RACE_STATUS.COMPLETED || race.status === RACE_STATUS.CANCELLED}
                >
                  {saving ? 'Đang lưu...' : 'Lưu Kết Quả'}
                </Button>
              </div>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
